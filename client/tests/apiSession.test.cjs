// Run: node --experimental-vm-modules --test client/tests/apiSession.test.cjs
// Exercise the real Axios interceptors against an isolated adapter, without HTTP.
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const axios = require('axios');
const ts = require('typescript');

const apiSource = readFileSync(path.join(__dirname, '../src/lib/api.js'), 'utf8');
const deferred = () => {
  let resolve;
  const promise = new Promise((done) => { resolve = done; });
  return { promise, resolve };
};
const tick = async () => { for (let i = 0; i < 12; i++) await Promise.resolve(); };

function fixture() {
  return {
    accessValid: false, refreshStatus: 200, refreshes: 0, csrfRequests: 0,
    writes: 0, calls: [], meFailure: null, delay: null, csrfFailure: false,
    async adapter(config) {
      this.calls.push(config);
      const response = (status, data) => {
        const result = { status, data, config, headers: {}, statusText: String(status) };
        if (status >= 400) throw new axios.AxiosError('Fixture request failed', 'ERR_BAD_RESPONSE', config, null, result);
        return result;
      };
      if (config.url === '/csrf-token') {
        this.csrfRequests++;
        return response(200, { csrfToken: 'isolated-csrf-fixture' });
      }
      if (config.url === '/me') {
        if (this.meFailure === 'network') throw new axios.AxiosError('Network unavailable', 'ERR_NETWORK', config);
        if (this.meFailure) return response(this.meFailure, { message: 'Unavailable' });
        return this.accessValid ? response(200, { admin: { id: 1 } }) : response(401, { message: 'Invalid token' });
      }
      if (config.url === '/refresh') {
        this.refreshes++;
        assert.equal(config.headers.get('CSRF-Token'), 'isolated-csrf-fixture');
        if (this.refreshStatus === 'network') throw new axios.AxiosError('Network unavailable', 'ERR_NETWORK', config);
        if (this.refreshStatus !== 200) return response(this.refreshStatus, { message: 'Refresh unavailable' });
        this.accessValid = true;
        return response(200, { message: 'Token refreshed' });
      }
      if (config.url === '/login') return response(401, { message: 'Invalid credentials' });
      if (config.url === '/bookings') return response(200, { public: true });
      if (!this.accessValid) {
        if (config.url === '/late' && this.delay) await this.delay.promise;
        return response(401, { message: 'Invalid token' });
      }
      if (config.url === '/verify-password') return response(401, { message: 'Incorrect password' });
      if (config.method !== 'get' && this.csrfFailure) {
        this.csrfFailure = false;
        return response(403, 'invalid csrf token');
      }
      if (config.method !== 'get') this.writes++;
      return response(200, { ok: true });
    },
  };
}

function sharedLocks() {
  let tail = Promise.resolve();
  return { request(_name, callback) {
    const result = tail.then(callback);
    tail = result.catch(() => {});
    return result;
  } };
}

async function client(state, locks) {
  const location = { href: '/admin', pathname: '/admin' };
  const window = { location, navigator: { locks } };
  const context = vm.createContext({ window, process: { env: { NEXT_PUBLIC_API_URL: 'https://fixture.invalid/api' } } });
  const dependency = new vm.SyntheticModule(['default'], function () {
    this.setExport('default', { create: (options) => axios.create({ ...options, adapter: state.adapter.bind(state) }) });
  }, { context });
  const module = new vm.SourceTextModule(apiSource, { context });
  await module.link(() => dependency);
  await module.evaluate();
  return { api: module.namespace.default, location };
}

test('concurrent expired requests share one refresh and each original request completes', async () => {
  const state = fixture(), { api } = await client(state);
  const results = await Promise.all(Array.from({ length: 8 }, (_, i) => api.get(`/protected/${i}`)));
  assert(results.every((res) => res.status === 200));
  assert.equal(state.refreshes, 1);
});

test('late pre-renewal 401 retries with renewed cookies without rotating again', async () => {
  const state = fixture(); state.delay = deferred();
  const { api } = await client(state);
  const delayed = api.get('/late');
  await tick();
  await api.get('/protected');
  state.delay.resolve();
  assert.equal((await delayed).status, 200);
  assert.equal(state.refreshes, 1);
});

test('two tabs coordinate rotating the shared cookie with Web Locks', async () => {
  const state = fixture(), locks = sharedLocks();
  const a = await client(state, locks), b = await client(state, locks);
  await Promise.all([a.api.get('/calendar'), b.api.get('/forms')]);
  assert.equal(state.refreshes, 1);
  assert.equal(a.location.href, '/admin'); assert.equal(b.location.href, '/admin');
});

test('browser reload recovers from an expired access cookie using its refresh session', async () => {
  const state = fixture(), first = await client(state);
  await first.api.get('/me');
  state.accessValid = false;
  const reloaded = await client(state);
  assert.equal((await reloaded.api.get('/me')).status, 200);
  assert.equal(reloaded.location.href, '/admin');
});

test('concurrent writes obtain one CSRF token and execute once after recovery', async () => {
  const state = fixture(), { api } = await client(state);
  await Promise.all([api.post('/flashbook', {}), api.post('/forms/submit', {}), api.put('/workingHours/1', {})]);
  assert.equal(state.refreshes, 1);
  assert.equal(state.writes, 3);
  const mutations = state.calls.filter((c) => c.method !== 'get');
  assert(mutations.every((c) => c.headers.get('CSRF-Token') === 'isolated-csrf-fixture'));
  // Initial writes share one token request; renewal deliberately obtains a fresh one.
  assert.equal(state.csrfRequests, 2);
});

test('temporary refresh network/503/CSRF failures do not redirect or invalidate a session', async () => {
  for (const status of ['network', 503, 403]) {
    const state = fixture(); state.refreshStatus = status;
    const { api, location } = await client(state);
    await assert.rejects(api.get('/protected'));
    assert.equal(location.href, '/admin');
    state.refreshStatus = 200;
    assert.equal((await api.get('/protected')).status, 200);
  }
});

test('temporary protected-request network/server failures do not attempt refresh', async () => {
  for (const failure of ['network', 503]) {
    const state = fixture(); state.meFailure = failure;
    const { api, location } = await client(state);
    await assert.rejects(api.get('/me'));
    assert.equal(state.refreshes, 0); assert.equal(location.href, '/admin');
  }
});

test('genuine refresh rejection redirects without recursively refreshing', async () => {
  const state = fixture(); state.refreshStatus = 401;
  const { api, location } = await client(state);
  await assert.rejects(api.get('/protected'));
  assert.equal(state.refreshes, 1); assert.equal(location.href, '/login');
});

test('failed login and incorrect password do not rotate or log out an existing session', async () => {
  const state = fixture(); state.accessValid = true;
  const { api, location } = await client(state);
  await assert.rejects(api.post('/login', {}));
  await assert.rejects(api.post('/verify-password', {}));
  assert.equal(state.refreshes, 0); assert.equal(location.href, '/admin');
});

test('expired access during password verification still recovers before reporting wrong password', async () => {
  const state = fixture(), { api, location } = await client(state);
  await assert.rejects(api.post('/verify-password', {}), (error) => error.response.data.message === 'Incorrect password');
  assert.equal(state.refreshes, 1); assert.equal(location.href, '/admin');
});

test('public booking keeps its existing CSRF exemption', async () => {
  const state = fixture(), { api } = await client(state);
  const response = await api.post('/bookings', {});
  assert.equal(response.status, 200);
  assert.equal(state.csrfRequests, 0); assert.equal(state.refreshes, 0);
});

test('default HTML/text CSRF rejection clears the cache for the next supported retry', async () => {
  const state = fixture(); state.accessValid = true; state.csrfFailure = true;
  const { api, location } = await client(state);
  await assert.rejects(api.post('/forms/submit', {}));
  assert.equal((await api.post('/forms/submit', {})).status, 200);
  assert.equal(state.csrfRequests, 2); assert.equal(state.writes, 1);
  assert.equal(state.refreshes, 0); assert.equal(location.href, '/admin');
});

test('layout retains its session on a recoverable initial check and offers retry', async () => {
  const source = readFileSync(path.join(__dirname, '../src/app/(dashboard)/admin/layout.js'), 'utf8');
  const ast = ts.createSourceFile('layout.jsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JSX);
  const names = [];
  function visit(node) {
    if (ts.isVariableDeclaration(node) && ts.isArrayBindingPattern(node.name) && node.initializer && ts.isCallExpression(node.initializer) && node.initializer.expression.getText(ast) === 'useState') names.push(node.name.elements[0].getText(ast));
    ts.forEachChild(node, visit);
  }
  visit(ast);
  for (const status of [503, 401]) {
    const state = {}, effects = [];
    let cursor = 0;
    const location = { href: '/admin' };
    const react = {
      useState(initial) { const key = names[cursor++]; if (!(key in state)) state[key] = initial; return [state[key], (value) => { state[key] = typeof value === 'function' ? value(state[key]) : value; }]; },
      useEffect(callback) { effects.push(callback); },
    };
    const module = { exports: {} };
    const mocks = {
      react, 'next/link': {}, 'next/navigation': { useRouter: () => ({}), usePathname: () => '/admin' }, '../globals.css': {},
      '../../../lib/api': { get: async () => { throw { response: { status } }; } },
      'react/jsx-runtime': { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) },
    };
    const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
    vm.runInNewContext(compiled, { module, exports: module.exports, require: (name) => mocks[name], window: { location }, setInterval: () => 1, clearInterval() {}, console: { error() {} } });
    module.exports.default({ children: null });
    const cleanup = effects[0](); await tick(); cleanup();
    assert.equal(location.href, status === 401 ? '/login' : '/admin');
    if (status === 503) { assert(state.authError); assert.equal(state.checkingAuth, true); }
  }
});
