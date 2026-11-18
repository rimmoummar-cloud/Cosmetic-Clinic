// Run: node --test client/tests/templateActivation.test.cjs
// Real Forms component, mocked hooks/cache/API. No real template updates.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const source = fs.readFileSync(path.join(__dirname, '../src/app/(dashboard)/admin/forms/page.jsx'), 'utf8');
const ast = ts.createSourceFile('forms.jsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JSX);
const names = [];
function visit(node) {
  if (ts.isVariableDeclaration(node) && ts.isArrayBindingPattern(node.name) && node.initializer && ts.isCallExpression(node.initializer) && node.initializer.expression.getText(ast) === 'useState') names.push(node.name.elements[0].getText(ast));
  ts.forEachChild(node, visit);
}
visit(ast);
const jsx = (type, props) => ({ type, props: props || {} });
function nodes(node, all = []) {
  if (Array.isArray(node)) node.forEach((item) => nodes(item, all));
  else if (node && typeof node === 'object' && node.props) { all.push(node); nodes(node.props.children, all); }
  return all;
}
const deferred = () => { let resolve; const promise = new Promise((done) => { resolve = done; }); return { promise, resolve }; };

function harness() {
  const server = [{ id: 1, name: 'Active template', is_active: true }, { id: 2, name: 'Inactive template', is_active: false }];
  let cached = structuredClone(server), cursor = 0, gate = null, failure = null;
  const state = {}, calls = [], invalidations = [], alerts = [], location = { href: '/admin/forms' };
  const mutate = async (method, url, payload) => {
    calls.push({ method, url, payload });
    if (gate) await gate.promise;
    if (failure) throw failure;
    server.find((template) => url.startsWith(`/forms/templates/${template.id}`)).is_active = method === 'put';
    return { data: {} };
  };
  const mocks = {
    react: { useMemo: (fn) => fn(), useState(initial) {
      const key = names[cursor++]; if (!(key in state)) state[key] = typeof initial === 'function' ? initial() : initial;
      return [state[key], (value) => { state[key] = typeof value === 'function' ? value(state[key]) : value; }];
    } },
    'react/jsx-runtime': { jsx, jsxs: jsx }, './completedformviwer.jsx': {},
    '../../../../lib/api.js': { put: (url, payload) => mutate('put', url, payload), patch: (url, payload) => mutate('patch', url, payload) },
    '@tanstack/react-query': {
      useQuery: ({ queryKey }) => ({ data: queryKey[0] === 'forms-templates' ? cached : queryKey[0] === 'forms-completed' ? [] : null, isLoading: false }),
      useQueryClient: () => ({ invalidateQueries: async ({ queryKey }) => {
        invalidations.push(queryKey); if (queryKey[0] === 'forms-templates') cached = structuredClone(server);
      } }),
    },
  };
  const module = { exports: {} };
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText;
  vm.runInNewContext(code, { module, exports: module.exports, require: (name) => { assert(name in mocks, name); return mocks[name]; }, console: { error() {} }, alert: (message) => alerts.push(message), window: { location } });
  return { state, server, calls, invalidations, alerts, location,
    set gate(value) { gate = value; }, set failure(value) { failure = value; },
    render() { cursor = 0; return nodes(module.exports.default()); },
  };
}

test('Admin management list shows inactive templates with Activate and active templates with Deactivate', () => {
  const h = harness(), all = h.render();
  for (const label of ['Inactive template', 'Active template', 'Activate', 'Deactivate']) assert(all.some((node) => node.props.children === label));
});

test('Activate uses the existing PUT with only is_active and refreshes list/details/preview', async () => {
  const h = harness(); await h.render().find((node) => node.type === 'button' && node.props.children === 'Activate').props.onClick();
  assert.equal(h.calls[0].method, 'put'); assert.equal(h.calls[0].url, '/forms/templates/2');
  assert.equal(JSON.stringify(h.calls[0].payload), '{"is_active":true}');
  assert.deepEqual(h.invalidations.map((key) => JSON.parse(JSON.stringify(key))), [['forms-templates'], ['form-template-details', 2], ['form-template-preview', 2]]);
  assert.equal(h.render().filter((node) => node.type === 'button' && node.props.children === 'Deactivate').length, 2);
  assert(!h.render().some((node) => node.props.children === 'Inactive'));
  assert.equal(h.location.href, '/admin/forms');
});

test('Deactivate keeps the existing PATCH endpoint and changes the available action after refetch', async () => {
  const h = harness(); await h.render().find((node) => node.type === 'button' && node.props.children === 'Deactivate').props.onClick();
  assert.equal(h.calls[0].method, 'patch'); assert.equal(h.calls[0].url, '/forms/templates/1/deactivate');
  assert.equal(h.calls[0].payload, undefined);
  assert.equal(h.render().filter((node) => node.type === 'button' && node.props.children === 'Activate').length, 2);
});

test('pending changes show loading, disable competing status actions and prevent another dispatched update', async () => {
  const h = harness(), gate = deferred(); h.gate = gate;
  const pending = h.render().find((node) => node.type === 'button' && node.props.children === 'Activate').props.onClick();
  const all = h.render(), busy = all.find((node) => node.props.children === 'Updating...');
  assert(busy.props.disabled); assert.equal(busy.props['aria-busy'], true);
  const other = all.find((node) => node.props.children === 'Deactivate'); assert(other.props.disabled);
  await other.props.onClick(); assert.equal(h.calls.length, 1);
  gate.resolve(); await pending; assert.equal(h.state.updatingTemplateId, null);
});

test('failure preserves the current status, shows the backend error and clears loading', async () => {
  const h = harness(); h.failure = { response: { data: { error: 'Template update failed' } } };
  await h.render().find((node) => node.type === 'button' && node.props.children === 'Activate').props.onClick();
  assert.deepEqual(h.alerts, ['Template update failed']); assert.equal(h.invalidations.length, 0);
  assert.equal(h.state.updatingTemplateId, null); assert.equal(h.server[1].is_active, false);
  assert(h.render().some((node) => node.type === 'button' && node.props.children === 'Activate' && !node.props.disabled));
});
