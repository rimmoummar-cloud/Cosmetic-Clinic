// Run: node --experimental-vm-modules --test server/tests/authSession.test.js
// All database operations use isolated fixtures, never the configured database.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'node:crypto';
import csrf from 'csurf';

const source = (file) => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
const password = 'Session-test-password-123';
const passwordHash = bcrypt.hashSync(password, 4);
const accessSecret = 'isolated-access-test-secret';
const refreshSecret = 'isolated-refresh-test-secret';

async function harness() {
  let now = Date.UTC(2026, 10, 18, 12);
  let rows = new Map();
  const blacklist = new Set();
  const locks = new Map();
  const logs = [];
  const calls = [];
  let failInsert = false;
  let unavailable = false;
  let adminExists = true;
  class Clock extends Date {
    constructor(...args) { super(...(args.length ? args : [now])); }
    static now() { return now; }
  }
  const context = vm.createContext({
    Date: Clock, console: { error: (...args) => logs.push(args), log: (...args) => logs.push(args) },
    process: { env: { JWT_SECRET: accessSecret, REFRESH_TOKEN_SECRET: refreshSecret } },
  });
  const db = {
    async connect() {
      if (unavailable) throw new Error('Database unavailable');
      let pending = null;
      let unlock;
      let lockedId;
      const read = () => pending || rows;
      const write = () => pending ||= new Map([...rows].map(([key, value]) => [key, { ...value }]));
      return {
        async query(sql, args = []) {
          if (unavailable) throw new Error('Database unavailable');
          sql = sql.replace(/\s+/g, ' ').trim();
          calls.push(sql);
          if (sql === 'BEGIN') return { rows: [] };
          if (sql === 'COMMIT' || sql === 'ROLLBACK') {
            if (sql === 'COMMIT' && pending) rows = pending;
            pending = null;
            unlock?.(); unlock = null;
            return { rows: [] };
          }
          if (sql.includes('pg_advisory_xact_lock')) {
            if (lockedId !== args[0]) {
              const previous = locks.get(args[0]) || Promise.resolve();
              let release;
              locks.set(args[0], new Promise((resolve) => { release = resolve; }));
              await previous;
              lockedId = args[0]; unlock = release;
            }
            return { rows: [] };
          }
          if (sql.startsWith('SELECT admin_id')) {
            const row = read().get(args[0]);
            return { rows: row ? [{ admin_id: row.admin_id }] : [] };
          }
          if (sql.startsWith('SELECT *')) {
            const row = read().get(args[0]);
            return { rows: row ? [{ ...row }] : [] };
          }
          if (sql.startsWith('INSERT INTO refresh_tokens')) {
            if (failInsert) throw new Error('Insert unavailable');
            assert(!read().has(args[0]), 'Token IDs must be unique');
            write().set(args[0], { token: args[0], admin_id: args[1], expires_at: args[2], user_agent: args[3], used: false });
          } else if (sql.startsWith('UPDATE refresh_tokens')) {
            if (read().has(args[0])) write().get(args[0]).used = true;
          } else if (sql.includes('WHERE admin_id = $1')) {
            for (const [key, row] of read()) if (row.admin_id === args[0]) write().delete(key);
          } else if (sql.startsWith('DELETE FROM refresh_tokens')) {
            write().delete(args[0]);
          } else throw new Error(`Unexpected fixture query: ${sql}`);
          // Standalone model writes commit immediately.
          return { rows: [] };
        },
        commitStandalone() { if (pending) rows = pending; },
        release() { unlock?.(); },
      };
    },
    async query(sql, args) {
      const client = await this.connect();
      try { const result = await client.query(sql, args); client.commitStandalone(); return result; }
      finally { client.release(); }
    },
  };
  const synthetic = (values) => new vm.SyntheticModule(Object.keys(values), function () {
    for (const [key, value] of Object.entries(values)) this.setExport(key, value);
  }, { context });
  async function load(file, dependencies) {
    const module = new vm.SourceTextModule(source(file), { context });
    await module.link((name) => dependencies[name]);
    await module.evaluate();
    return module;
  }
  const jwtMock = { ...jwt, verify: (token, secret, options = {}) => jwt.verify(token, secret, { ...options, clockTimestamp: now / 1000 }) };
  const jwtModule = synthetic({ default: jwtMock });
  const dbModule = synthetic({ default: db });
  const model = await load('models/refreshTokenModel.js', { '../config/db.js': dbModule });
  const adminModel = await load('models/auth.js', { '../config/db.js': dbModule });
  const admin = () => adminExists ? { id: 1, email: 'admin@example.test', name: 'Admin', password: passwordHash } : null;
  const blacklistModule = synthetic({
    blacklistToken: async (token) => blacklist.add(token),
    isTokenBlacklisted: async (token) => { if (unavailable) throw new Error('Unavailable'); return blacklist.has(token); },
  });
  const controllers = await load('controllers/authController.js', {
    '../models/refreshTokenModel.js': model,
    '../config/db.js': dbModule,
    '../validators/authValidation.js': synthetic({ loginSchema: { safeParse: (body) => ({ success: true, data: body }) } }),
    jsonwebtoken: jwtModule, bcrypt: synthetic({ default: bcrypt }), crypto: synthetic({ default: crypto }),
    '../models/auth.js': synthetic({ findAdminByEmail: async () => admin(), findAdminById: async () => admin(), findAdminByIdWithPassword: async () => admin(), updateAdminProfileModle: async () => admin() }),
    '../models/tokenBlacklist.js': blacklistModule,
  });
  const middleware = await load('middleware/authMiddleware.js', { jsonwebtoken: jwtModule, '../models/tokenBlacklist.js': blacklistModule });
  function response() {
    return { statusCode: 200, cookies: {}, cleared: [], body: null,
      status(code) { this.statusCode = code; return this; },
      json(body) { this.body = body; return this; },
      cookie(name, value, options) { this.cookies[name] = { value, options }; return this; },
      clearCookie(name) { this.cleared.push(name); return this; },
    };
  }
  const request = (token) => ({ cookies: { refreshToken: token }, headers: { 'user-agent': 'test-agent' } });
  return {
    controllers: controllers.namespace, middleware: middleware.namespace, model: model.namespace, adminModel: adminModel.namespace,
    response, request, logs, calls, blacklist,
    get now() { return now; }, advance(ms) { now += ms; },
    get rows() { return rows; },
    set failInsert(value) { failInsert = value; }, set unavailable(value) { unavailable = value; }, set adminExists(value) { adminExists = value; },
    async login() { const res = response(); await controllers.namespace.login({ body: { email: 'admin@example.test', password }, headers: { 'user-agent': 'test-agent' } }, res); return res; },
    async refresh(token) { const res = response(); await controllers.namespace.refresh(request(token), res); return res; },
    verify(token) { return jwtMock.verify(token, accessSecret); },
  };
}

test('login creates secure 15-minute access and absolute 72-hour refresh sessions', async () => {
  const h = await harness(), res = await h.login();
  assert.equal(res.statusCode, 200);
  const access = jwt.decode(res.cookies.accessToken.value), refresh = jwt.decode(res.cookies.refreshToken.value);
  assert.equal(access.exp - access.iat, 900);
  assert.equal(refresh.exp - refresh.iat, 72 * 3600);
  assert.equal(refresh.session_expires_at, refresh.exp);
  for (const cookie of Object.values(res.cookies)) {
    assert(cookie.options.httpOnly); assert(cookie.options.secure); assert.equal(cookie.options.sameSite, 'none');
  }
  assert.equal(h.rows.size, 1);
});

test('identical-second rotations have unique IDs and retain the original expiry', async () => {
  const h = await harness(), login = await h.login();
  const original = login.cookies.refreshToken.value;
  const a = await h.refresh(original), b = await h.refresh(a.cookies.refreshToken.value);
  assert.equal(a.statusCode, 200); assert.equal(b.statusCode, 200);
  assert(original !== a.cookies.refreshToken.value && a.cookies.refreshToken.value !== b.cookies.refreshToken.value, 'Rotation must issue distinct tokens');
  assert.equal(jwt.decode(b.cookies.refreshToken.value).exp, jwt.decode(original).exp);
  assert(h.rows.get(original).used);
});

test('expired access is rejected, but its valid refresh session renews access after 16 minutes', async () => {
  const h = await harness(), login = await h.login(); h.advance(16 * 60 * 1000);
  const rejected = h.response(); let allowed = false;
  await h.middleware.authenticateAdmin({ cookies: { accessToken: login.cookies.accessToken.value } }, rejected, () => { allowed = true; });
  assert(!allowed); assert.equal(rejected.statusCode, 401);
  const renewed = await h.refresh(login.cookies.refreshToken.value);
  assert.equal(renewed.statusCode, 200); assert.equal(h.verify(renewed.cookies.accessToken.value).id, 1);
});

test('rotation near hour 72 caps access and refresh at the fixed deadline', async () => {
  const h = await harness(), login = await h.login(); h.advance((72 * 3600 - 60) * 1000);
  const renewed = await h.refresh(login.cookies.refreshToken.value);
  assert.equal(renewed.statusCode, 200);
  assert.equal(renewed.cookies.accessToken.options.maxAge, 60 * 1000);
  assert.equal(jwt.decode(renewed.cookies.accessToken.value).exp, jwt.decode(login.cookies.refreshToken.value).exp);
  h.advance(60 * 1000);
  assert.equal((await h.refresh(renewed.cookies.refreshToken.value)).statusCode, 401);
  assert.throws(() => h.verify(renewed.cookies.accessToken.value), { name: 'TokenExpiredError' });
});

test('legacy seven-day tokens acquire a fixed 72-hour cap from their issue time', async () => {
  const h = await harness(), iat = h.now / 1000;
  const legacy = jwt.sign({ id: 1, iat }, refreshSecret, { expiresIn: '7d' });
  await h.model.saveRefreshToken(legacy, 1, new Date((iat + 7 * 86400) * 1000), 'test-agent');
  h.advance(3600 * 1000);
  const renewed = await h.refresh(legacy);
  assert.equal(jwt.decode(renewed.cookies.refreshToken.value).exp, iat + 72 * 3600);
});

test('reuse revokes renewal and concurrent direct replay cannot consume a token twice', async () => {
  const h = await harness(), login = await h.login(), token = login.cookies.refreshToken.value;
  const results = await Promise.all([h.refresh(token), h.refresh(token)]);
  assert.equal(results.filter((res) => res.statusCode === 200).length, 1);
  assert.equal(results.filter((res) => res.statusCode === 401).length, 1);
  assert.equal(h.rows.size, 0);
  assert(h.calls.some((sql) => sql.includes('FOR UPDATE')));
});

test('failed rotation rolls back consumption and returns recoverable 503', async () => {
  const h = await harness(), login = await h.login(), token = login.cookies.refreshToken.value;
  h.failInsert = true;
  assert.equal((await h.refresh(token)).statusCode, 503);
  assert.equal(h.rows.get(token).used, false);
  h.failInsert = false;
  assert.equal((await h.refresh(token)).statusCode, 200);
  assert(h.calls.includes('ROLLBACK'));
});

test('invalid, expired, missing and revoked refresh tokens cannot renew', async () => {
  const h = await harness(), login = await h.login(), token = login.cookies.refreshToken.value;
  assert.equal((await h.refresh(undefined)).statusCode, 401);
  assert.equal((await h.refresh('invalid-test-token')).statusCode, 401);
  await h.model.deleteAdminRefreshTokens(1);
  assert.equal((await h.refresh(token)).statusCode, 401);
  const next = await h.login(); h.advance(72 * 3600 * 1000);
  assert.equal((await h.refresh(next.cookies.refreshToken.value)).statusCode, 401);
});

test('signature, stored owner and existing device restrictions remain enforced', async () => {
  for (const mode of ['signature', 'owner', 'device', 'deleted-admin']) {
    const h = await harness(), login = await h.login(); let token = login.cookies.refreshToken.value;
    if (mode === 'signature') {
      const invalid = jwt.sign({ id: 1, iat: h.now / 1000 }, 'wrong-secret', { expiresIn: '1h' });
      h.rows.set(invalid, { ...h.rows.get(token), token: invalid }); token = invalid;
    }
    if (mode === 'owner') h.rows.get(token).admin_id = 2;
    if (mode === 'device') h.rows.get(token).user_agent = 'different-device';
    if (mode === 'deleted-admin') h.adminExists = false;
    assert.equal((await h.refresh(token)).statusCode, 401, mode);
  }
});

test('protected requests reject absent, bad-signature and blacklisted access tokens', async () => {
  const h = await harness(), login = await h.login();
  const cases = [undefined, jwt.sign({ id: 1 }, 'wrong-secret'), login.cookies.accessToken.value];
  h.blacklist.add(login.cookies.accessToken.value);
  for (const token of cases) {
    const res = h.response(); let allowed = false;
    await h.middleware.authenticateAdmin({ cookies: { accessToken: token } }, res, () => { allowed = true; });
    assert(!allowed); assert.equal(res.statusCode, 401);
  }
});

test('authentication database failures remain recoverable and disclose no tokens', async () => {
  const h = await harness(), login = await h.login(); h.unavailable = true;
  const res = h.response();
  await h.middleware.authenticateAdmin({ cookies: { accessToken: login.cookies.accessToken.value } }, res, () => assert.fail('Must not authorize'));
  assert.equal(res.statusCode, 503);
  assert.equal((await h.refresh(login.cookies.refreshToken.value)).statusCode, 503);
  const logs = JSON.stringify(h.logs);
  assert(!logs.includes(login.cookies.accessToken.value) && !logs.includes(login.cookies.refreshToken.value), 'Logs must not contain tokens');
});

test('logout invalidates refresh records, blacklists access and clears both cookies', async () => {
  const h = await harness(), login = await h.login();
  const renewed = await h.refresh(login.cookies.refreshToken.value);
  const res = h.response();
  await h.controllers.logout({ admin: { id: 1 }, cookies: { accessToken: renewed.cookies.accessToken.value, refreshToken: renewed.cookies.refreshToken.value } }, res);
  assert.equal(res.statusCode, 200); assert.equal(h.rows.size, 0);
  assert(h.blacklist.has(renewed.cookies.accessToken.value));
  assert.deepEqual(res.cleared.sort(), ['accessToken', 'refreshToken']);
  assert.equal((await h.refresh(renewed.cookies.refreshToken.value)).statusCode, 401);
});

test('revocation waits for in-flight rotation and removes its newly issued token', async () => {
  const h = await harness(), login = await h.login();
  await Promise.all([h.refresh(login.cookies.refreshToken.value), h.model.deleteAdminRefreshTokens(1)]);
  assert.equal(h.rows.size, 0);
});

test('CSRF remains mandatory for refresh and protected writes', async () => {
  const middleware = csrf({ cookie: { httpOnly: true, secure: true, sameSite: 'none' } });
  const res = { headers: {}, getHeader(name) { return this.headers[name]; }, setHeader(name, value) { this.headers[name] = value; } };
  const req = { method: 'POST', headers: {}, cookies: {}, body: {} };
  const error = await new Promise((resolve) => middleware(req, res, resolve));
  assert.equal(error.code, 'EBADCSRFTOKEN');
});

test('account lookup can reuse the refresh transaction instead of waiting for another pool connection', async () => {
  const h = await harness(); let queried = false;
  const client = { query: async () => { queried = true; return { rows: [{ id: 1 }] }; } };
  assert.equal((await h.adminModel.findAdminById(1, client)).id, 1);
  assert(queried);
});

test('logout revokes the session even if the browser lacks its refresh cookie', async () => {
  const h = await harness(), login = await h.login(), res = h.response();
  await h.controllers.logout({ admin: { id: 1 }, cookies: { accessToken: login.cookies.accessToken.value } }, res);
  assert.equal(res.statusCode, 200); assert.equal(h.rows.size, 0);
});

test('failed login replacement rolls back instead of destroying the previous valid session', async () => {
  const h = await harness(), login = await h.login();
  h.failInsert = true;
  assert.equal((await h.login()).statusCode, 500);
  assert.equal(h.rows.size, 1);
  assert(h.rows.has(login.cookies.refreshToken.value));
  assert(h.logs.every((entry) => entry.length === 1 && entry[0] === 'Admin login failed'));
});
