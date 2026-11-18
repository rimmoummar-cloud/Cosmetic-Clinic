// Run: node --experimental-vm-modules --test server/tests/templateActivation.test.js
// Exercises existing routes/controllers/models with isolated storage; no real DB writes.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import express from 'express';
import csrf from 'csurf';
import jwt from 'jsonwebtoken';

const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');

async function harness() {
  const templates = [
    { id: 1, name: 'First', description: 'Keep this description', is_active: true },
    { id: 2, name: 'Second', description: 'Inactive template', is_active: false },
  ];
  const history = { forms: [{ id: 7, form_template_id: 1, status: 'completed', signature: 'fixture-signature' }], questions: [{ id: 8, question_type: 'multi_select' }], answers: [{ id: 9, selected_option_ids: [10, 11] }] };
  const queries = [], revoked = new Set();
  const db = { async query(sql, args = []) {
    sql = sql.replace(/\s+/g, ' ').trim(); queries.push(sql);
    const rows = (value) => ({ rows: structuredClone(value) });
    if (sql.startsWith('SELECT COUNT(*)')) return rows([{ count: String(history.forms.filter((form) => form.form_template_id == args[0]).length) }]);
    if (sql.startsWith('SELECT * FROM form_templates')) {
      if (sql.includes('WHERE id = $1')) return rows(templates.filter((t) => t.id == args[0]));
      return rows(sql.includes('WHERE is_active = true') ? templates.filter((t) => t.is_active) : templates);
    }
    if (sql.startsWith('UPDATE form_templates')) {
      const item = templates.find((t) => t.id == args[sql.includes('COALESCE') ? 3 : 0]);
      if (!item) return rows([]);
      if (sql.includes('COALESCE')) {
        item.name = args[0] ?? item.name;
        item.description = args[1] ?? item.description;
        item.is_active = args[2] ?? item.is_active;
      } else item.is_active = false;
      return rows([item]);
    }
    throw new Error(`Unexpected fixture query: ${sql}`);
  } };
  const secret = 'isolated-template-activation-secret';
  const context = vm.createContext({ process: { env: { JWT_SECRET: secret } }, console: { error() {} } });
  const synthetic = (values) => new vm.SyntheticModule(Object.keys(values), function () {
    for (const [name, value] of Object.entries(values)) this.setExport(name, value);
  }, { context });
  async function load(file, imports) {
    const module = new vm.SourceTextModule(read(file), { context });
    await module.link((name) => imports[name]); await module.evaluate(); return module;
  }
  const dbModule = synthetic({ default: db });
  const model = await load('models/formTemplate.js', { '../config/db.js': dbModule });
  const controller = await load('controllers/formTemplateController.js', { '../config/db.js': dbModule, '../models/formTemplate.js': model });
  const auth = await load('middleware/authMiddleware.js', {
    jsonwebtoken: synthetic({ default: jwt }),
    '../models/tokenBlacklist.js': synthetic({ isTokenBlacklisted: async (token) => revoked.has(token) }),
  });
  const imports = { express: synthetic({ default: express }), csurf: synthetic({ default: csrf }), '../middleware/authMiddleware.js': auth, '../controllers/formTemplateController.js': controller };
  for (const name of ['formQuestion', 'formQuestionOption', 'completedForm', 'formAnswer', 'formSubmission']) {
    const stub = {};
    for (const match of read(`controllers/${name}Controller.js`).matchAll(/^export const (\w+)/gm)) stub[match[1]] = (_req, res) => res.json([]);
    imports[`../controllers/${name}Controller.js`] = synthetic(stub);
  }
  const router = (await load('routes/formsRoutes.js', imports)).namespace.default;
  const token = jwt.sign({ id: 1 }, secret, { expiresIn: '1h' });
  const response = (resolve) => ({ statusCode: 200, headers: {},
    status(code) { this.statusCode = code; return this; },
    json(body) { resolve({ status: this.statusCode, body: JSON.parse(JSON.stringify(body)) }); return this; },
    getHeader(name) { return this.headers[name.toLowerCase()]; }, setHeader(name, value) { this.headers[name.toLowerCase()] = value; },
  });
  const request = { method: 'GET', headers: {}, cookies: {} }, res = response(() => {});
  await new Promise((resolve, reject) => csrf({ cookie: { httpOnly: true, secure: true, sameSite: 'none' } })(request, res, (error) => error ? reject(error) : resolve()));
  const cookies = { accessToken: token, _csrf: decodeURIComponent(res.getHeader('set-cookie')[0].split(';')[0].split('=')[1]) };
  const headers = { 'csrf-token': request.csrfToken() };
  return { templates, history, queries, revoked, token,
    send: (method, url, body = {}, suppliedCookies = cookies, suppliedHeaders = headers) => new Promise((resolve) => router.handle({ method, url, body, cookies: suppliedCookies, headers: suppliedHeaders }, response(resolve), (error) => resolve({ status: error?.status || 404, body: { error: error?.code || 'No route' } }))),
  };
}

test('deactivate/reactivate reuse existing endpoints and creation selector reflects each state', async () => {
  const h = await harness();
  assert.deepEqual((await h.send('GET', '/templates')).body.map((t) => t.id), [1, 2]);
  assert.deepEqual((await h.send('GET', '/templates/active')).body.map((t) => t.id), [1]);
  assert.equal((await h.send('PATCH', '/templates/1/deactivate')).status, 200);
  assert.equal((await h.send('GET', '/templates/active')).body.length, 0);
  const activated = await h.send('PUT', '/templates/1', { is_active: true });
  assert.equal(activated.status, 200); assert.equal(activated.body.is_active, true);
  assert.deepEqual((await h.send('GET', '/templates/active')).body.map((t) => t.id), [1]);
  assert.equal((await h.send('PUT', '/templates/2', { is_active: true })).status, 200);
  assert.deepEqual((await h.send('GET', '/templates/active')).body.map((t) => t.id), [1, 2]);
});

test('repeated requests are idempotent, preserve template identity/content and leave history unchanged', async () => {
  const h = await harness(), before = structuredClone(h.history);
  for (let i = 0; i < 2; i++) assert.equal((await h.send('PUT', '/templates/2', { is_active: true })).status, 200);
  assert.equal(h.templates[1].is_active, true);
  for (let i = 0; i < 2; i++) assert.equal((await h.send('PATCH', '/templates/2/deactivate')).status, 200);
  assert.equal(h.templates[1].is_active, false); assert.equal(h.templates.length, 2);
  assert.equal(h.templates[1].name, 'Second'); assert.equal(h.templates[1].description, 'Inactive template');
  assert.deepEqual(h.history, before);
  assert(!h.queries.some((sql) => /^(INSERT|DELETE)/.test(sql)));
});

test('invalid IDs and invalid status values are rejected, missing IDs return 404', async () => {
  const h = await harness();
  for (const id of ['bad', '-1', '0', '1.5', '2147483648']) {
    assert.equal((await h.send('PUT', `/templates/${id}`, { is_active: true })).status, 400);
    assert.equal((await h.send('PATCH', `/templates/${id}/deactivate`)).status, 400);
  }
  for (const value of ['true', 1, null, {}, []]) assert.equal((await h.send('PUT', '/templates/2', { is_active: value })).status, 400);
  assert.equal((await h.send('PUT', '/templates/999', { is_active: true })).status, 404);
  assert.equal((await h.send('PATCH', '/templates/999/deactivate')).status, 404);
  assert.equal(h.templates[1].is_active, false);
});

test('unauthenticated, forged and revoked tokens cannot activate templates', async () => {
  const h = await harness();
  for (const cookies of [{}, { accessToken: 'invalid' }, { accessToken: jwt.sign({ id: 1 }, 'wrong-secret') }]) {
    assert.equal((await h.send('PUT', '/templates/2', { is_active: true }, cookies)).status, 401);
  }
  h.revoked.add(h.token);
  assert.equal((await h.send('PUT', '/templates/2', { is_active: true })).status, 401);
  assert.equal(h.templates[1].is_active, false);
});

test('activation and deactivation require valid CSRF protection', async () => {
  const h = await harness();
  assert.equal((await h.send('PUT', '/templates/2', { is_active: true }, { accessToken: h.token }, {})).status, 403);
  assert.equal((await h.send('PATCH', '/templates/1/deactivate', {}, { accessToken: h.token }, {})).status, 403);
  assert.equal(h.templates[0].is_active, true); assert.equal(h.templates[1].is_active, false);
});

test('template deletion protection remains effective after deactivation and reactivation', async () => {
  const h = await harness(), before = structuredClone(h.history);
  for (const active of [false, true]) {
    assert.equal((await h.send('PUT', '/templates/1', { is_active: active })).status, 200);
    const deleted = await h.send('DELETE', '/templates/1');
    assert.equal(deleted.status, 409); assert.match(deleted.body.error, /Cannot delete/);
  }
  assert.deepEqual(h.history, before); assert.equal(h.templates.length, 2);
});
