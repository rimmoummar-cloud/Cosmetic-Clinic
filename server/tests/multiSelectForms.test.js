// Run: node --experimental-vm-modules --test server/tests/multiSelectForms.test.js
// Isolated storage only: this test never imports the configured database.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

async function harness() {
  let state = {
    customers: [{ id: 1 }, { id: 2 }], bookings: [{ id: 100, customer_id: 1 }, { id: 200, customer_id: 2 }],
    templates: [{ id: 10, name: 'Fixture template', description: '', is_active: true }],
    templateQuestions: ['multi_select', 'multi_select', 'multiple_choice', 'text', 'yes_no', 'agreement', 'confirmation'].map((question_type, i) => ({ id: i + 1, form_template_id: 10, question_type, question_text: `Question ${i + 1}`, required: i === 0 || i === 2, sort_order: i })),
    templateOptions: [11, 12, 13, 21, 22, 31, 32].map((id) => ({ id, question_id: Math.floor(id / 10), option_label: `Option ${id}`, sort_order: id % 10 })),
    forms: [], questions: [], options: [], answers: [], selections: [],
  };
  let failSelectionInsert = false;
  const queries = [];
  const nextId = (rows, minimum = 1) => Math.max(minimum - 1, ...rows.map((row) => row.id)) + 1;
  async function query(client, sql, args = []) {
    sql = sql.replace(/\s+/g, ' ').trim(); queries.push(sql);
    if (sql === 'BEGIN') { client.pending = structuredClone(state); return { rows: [] }; }
    if (sql === 'ROLLBACK') { client.pending = null; return { rows: [] }; }
    if (sql === 'COMMIT') { if (client.pending) state = client.pending; client.pending = null; return { rows: [] }; }
    const s = client.pending || state;
    const result = (rows = []) => ({ rows: structuredClone(rows), rowCount: rows.length });
    if (sql.startsWith('SELECT id FROM customers')) return result(s.customers.filter((row) => row.id == args[0]));
    if (sql.startsWith('SELECT id, customer_id FROM bookings')) return result(s.bookings.filter((row) => row.id == args[0]));
    if (sql.startsWith('SELECT id, booking_datetime, status FROM bookings')) return result(s.bookings.filter((row) => row.id == args[0]));
    if (sql.includes('FROM form_templates')) return result(s.templates.filter((row) => row.id == args[0]));
    if (sql.startsWith('INSERT INTO form_questions')) {
      const row = { id: nextId(s.templateQuestions), form_template_id: args[0], question_text: args[1], question_type: args[2], required: args[3], sort_order: args[4] };
      s.templateQuestions.push(row); return result([row]);
    }
    if (sql.startsWith('UPDATE form_questions')) {
      const row = s.templateQuestions.find((row) => row.id == args[4]);
      for (const [index, key] of ['question_text', 'question_type', 'required', 'sort_order'].entries()) if (args[index] != null) row[key] = args[index];
      return result([row]);
    }
    if (sql.includes('FROM form_questions')) return result(s.templateQuestions.filter((row) => sql.includes('form_template_id = $1') ? row.form_template_id == args[0] : row.id == args[0]));
    if (sql.startsWith('INSERT INTO form_question_options')) {
      const row = { id: nextId(s.templateOptions), question_id: args[0], option_label: args[1], sort_order: args[2] };
      s.templateOptions.push(row); return result([row]);
    }
    if (sql.includes('FROM form_question_options')) return result(s.templateOptions.filter((row) => row.question_id == args[0]).sort((a, b) => a.sort_order - b.sort_order));
    if (sql.startsWith('INSERT INTO completed_forms')) {
      const row = { id: nextId(s.forms), customer_id: args[0], appointment_id: args[1], form_template_id: args[2], form_name: args[3], status: args[4], signature: null };
      s.forms.push(row); return result([row]);
    }
    if (sql.includes('FROM completed_forms cf')) {
      return result(s.forms.filter((row) => sql.includes('WHERE cf.customer_id') ? row.customer_id == args[0] : row.id == args[0]));
    }
    if (sql.startsWith('SELECT') && sql.includes('FROM completed_forms')) return result(s.forms.filter((row) => row.id == args[0]));
    if (sql.startsWith('INSERT INTO completed_form_questions')) {
      const row = { id: nextId(s.questions, 101), completed_form_id: args[0], original_question_id: args[1], question_text: args[2], question_type: args[3], required: args[4], sort_order: args[5] };
      s.questions.push(row); return result([row]);
    }
    if (sql.includes('FROM completed_form_questions')) {
      return result(s.questions.filter((row) => sql.includes('WHERE id = $1') ? row.id == args[0] && (args.length < 2 || row.completed_form_id == args[1]) : row.completed_form_id == args[0]));
    }
    if (sql.startsWith('INSERT INTO completed_form_question_options')) {
      const row = { id: nextId(s.options, 1001), completed_form_question_id: args[0], original_option_id: args[1], option_label: args[2], sort_order: args[3] };
      s.options.push(row); return result([row]);
    }
    if (sql.includes('FROM completed_form_question_options')) {
      if (sql.includes('ANY')) return result(s.options.filter((row) => row.completed_form_question_id == args[0] && args[1].includes(row.id)));
      if (sql.includes('WHERE id = $1')) return result(s.options.filter((row) => row.id == args[0] && row.completed_form_question_id == args[1]));
      return result(s.options.filter((row) => row.completed_form_question_id == args[0]).sort((a, b) => a.sort_order - b.sort_order));
    }
    if (sql.startsWith('SELECT fa.id AS form_answer_id')) {
      const rows = [];
      for (const answer of s.answers.filter((row) => args[0].includes(row.id))) {
        if (s.questions.find((q) => q.id === answer.completed_form_question_id)?.question_type !== 'multi_select') continue;
        const ids = s.selections.filter((row) => row.form_answer_id === answer.id);
        rows.push(...(ids.length ? ids : [{ form_answer_id: answer.id, selected_option_id: null }]));
      }
      return result(rows);
    }
    if (sql.startsWith('SELECT') && sql.includes('FROM form_answers')) {
      let rows = s.answers.filter((row) => /WHERE (fa\.)?id = \$1/.test(sql)
        ? row.id == args[0] : row.completed_form_id == args[0] && (args.length < 2 || row.completed_form_question_id == args[1]));
      if (sql.includes('JOIN completed_form_questions')) rows = rows.map((row) => ({ ...row, question_type: s.questions.find((q) => q.id === row.completed_form_question_id).question_type }));
      return result(rows);
    }
    if (sql.startsWith('INSERT INTO form_answers')) {
      let row = s.answers.find((row) => row.completed_form_id == args[0] && row.completed_form_question_id == args[1]);
      if (row && !sql.includes('ON CONFLICT')) throw new Error('unique_completed_form_question');
      if (!row) { row = { id: nextId(s.answers), completed_form_id: args[0], completed_form_question_id: args[1] }; s.answers.push(row); }
      Object.assign(row, { answer_text: args[2] ?? null, selected_option_id: args[3] ?? null, boolean_value: args[4] ?? null });
      return result([row]);
    }
    if (sql.startsWith('UPDATE form_answers')) {
      const row = s.answers.find((row) => row.id == (sql.includes('SET answer_text = $1') ? args[3] : args[0]));
      Object.assign(row, sql.includes('SET answer_text = $1')
        ? { answer_text: args[0], selected_option_id: args[1], boolean_value: args[2] }
        : { answer_text: args[2], selected_option_id: args[3], boolean_value: args[4] });
      return result([row]);
    }
    if (sql.startsWith('DELETE FROM form_answer_selected_options')) {
      s.selections = s.selections.filter((row) => row.form_answer_id != args[0]); return result();
    }
    if (sql.startsWith('INSERT INTO form_answer_selected_options')) {
      if (failSelectionInsert) throw new Error('Injected selection insert failure');
      for (const id of args[1]) {
        assert(s.options.some((row) => row.id === id), 'Snapshot option FK');
        assert(!s.selections.some((row) => row.form_answer_id === args[0] && row.selected_option_id === id), 'Selection primary key');
        s.selections.push({ form_answer_id: args[0], selected_option_id: id });
      }
      return result();
    }
    if (sql.startsWith('UPDATE completed_forms')) {
      const row = s.forms.find((row) => row.id == args[1]);
      if (sql.includes('SET signature')) { row.signature = args[0]; if (sql.includes("status = 'completed'")) row.status = 'completed'; }
      else row.status = args[0];
      return result([row]);
    }
    throw new Error(`Unhandled fixture SQL: ${sql}`);
  }
  const db = { query: (sql, args) => query({}, sql, args), connect: async () => ({ pending: null, query(sql, args) { return query(this, sql, args); }, release() {} }) };
  const context = vm.createContext({ console: { error() {} } });
  const cache = new Map();
  const dbModule = new vm.SyntheticModule(['default'], function () { this.setExport('default', db); }, { context });
  async function load(file) {
    if (cache.has(file)) return cache.get(file);
    const url = new URL(`../${file}`, import.meta.url);
    const module = new vm.SourceTextModule(readFileSync(url, 'utf8'), { context, identifier: url.href });
    cache.set(file, module);
    await module.link(async (specifier) => {
      if (specifier.endsWith('/config/db.js')) return dbModule;
      const target = new URL(specifier, url);
      return load(target.pathname.split('/server/')[1]);
    });
    return module;
  }
  const modules = {};
  for (const [name, file] of Object.entries({ helper: 'models/multiSelectAnswer.js', forms: 'models/completedForm.js', answers: 'models/formAnswer.js', questions: 'models/formQuestion.js', options: 'models/formQuestionOption.js', snapshots: 'models/completedFormQuestion.js', submission: 'controllers/formSubmissionController.js', answerController: 'controllers/formAnswerController.js' })) {
    const module = await load(file); if (module.status !== 'evaluated') await module.evaluate(); modules[name] = module.namespace;
  }
  const response = () => ({ statusCode: 200, body: null, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } });
  return {
    ...modules, response, queries, get state() { return state; }, set failSelectionInsert(value) { failSelectionInsert = value; },
    create: (appointment_id = null, customer_id = 1) => modules.forms.createCompletedForm(null, { customer_id, appointment_id, form_template_id: 10 }),
    async save(form, answers, submit = false) {
      const res = response();
      await modules.submission[submit ? 'submitForm' : 'saveDraft']({ body: { completed_form_id: form.id, customer_id: form.customer_id, appointment_id: form.appointment_id, answers, ...(submit ? { signature: 'fixture-signature' } : {}) } }, res);
      return res;
    },
    snapshot(form, type, occurrence = 0) { return state.questions.filter((q) => q.completed_form_id === form.id && q.question_type === type)[occurrence]; },
    ids(question) { return state.options.filter((option) => option.completed_form_question_id === question.id).map((option) => option.id); },
  };
}

const plain = (value) => JSON.parse(JSON.stringify(value));

test('multi-select type, template options and ordering are accepted without changing legacy types', async () => {
  const h = await harness();
  const question = await h.questions.createQuestion(null, { form_template_id: 10, question_text: 'New choices', question_type: 'multi_select', required: false, sort_order: 8 });
  assert.equal(question.question_type, 'multi_select'); assert(h.snapshots.isValidQuestionType('multi_select'));
  await h.options.createOption(null, { question_id: question.id, option_label: 'Last', sort_order: 2 });
  await h.options.createOption(null, { question_id: question.id, option_label: 'First', sort_order: 1 });
  assert.deepEqual((await h.options.getOptionsByQuestion(null, question.id)).map((o) => o.option_label), ['First', 'Last']);
  const edited = await h.questions.updateQuestion(null, question.id, { question_text: 'Edited', question_type: 'multi_select' });
  assert.equal(edited.question_type, 'multi_select'); assert(h.questions.isValidQuestionType('multiple_choice'));
});

test('appointment and client-only creation retain associations and snapshot the new type', async () => {
  const h = await harness();
  for (const appointment of [100, null]) {
    const form = await h.create(appointment), question = h.snapshot(form, 'multi_select');
    assert.equal(form.appointment_id, appointment); assert.equal(form.customer_id, 1);
    assert.equal(h.ids(question).length, 3);
    assert.equal(h.state.options.find((o) => o.completed_form_question_id === question.id).original_option_id, 11);
  }
});

test('draft save, retrieval and replacement retain all choices and remove deselected options', async () => {
  const h = await harness(), form = await h.create(), question = h.snapshot(form, 'multi_select'), ids = h.ids(question);
  assert.equal((await h.save(form, [{ completed_form_question_id: question.id, selected_option_ids: ids }])).statusCode, 201);
  let details = await h.forms.getCompletedFormWithDetails(null, form.id);
  assert.deepEqual(plain(details.questions[0].answer.selected_option_ids), ids);
  assert.equal(h.state.answers.length, 1); assert.equal(h.state.selections.length, 3);
  assert.equal((await h.save(form, [{ completed_form_question_id: question.id, selected_option_ids: [ids[1]] }])).statusCode, 201);
  details = await h.forms.getCompletedFormWithDetails(null, form.id);
  assert.deepEqual(plain(details.questions[0].answer.selected_option_ids), [ids[1]]);
  assert.equal(h.state.answers.length, 1); assert.equal(h.state.selections.length, 1);
});

test('required empty choices reject, optional empty choices clear all previous associations', async () => {
  const h = await harness(), form = await h.create(), required = h.snapshot(form, 'multi_select'), optional = h.snapshot(form, 'multi_select', 1);
  assert.equal((await h.save(form, [{ completed_form_question_id: required.id, selected_option_ids: [] }])).statusCode, 400);
  await h.save(form, [{ completed_form_question_id: optional.id, selected_option_ids: h.ids(optional) }]);
  assert.equal((await h.save(form, [{ completed_form_question_id: optional.id, selected_option_ids: [] }])).statusCode, 201);
  assert.equal(h.state.selections.length, 0);
  assert.deepEqual(plain((await h.forms.getCompletedFormWithDetails(null, form.id)).questions[1].answer.selected_option_ids), []);
});

test('submission persists multiple selections and preserves signature/required checks', async () => {
  const h = await harness(), form = await h.create(100), multi = h.snapshot(form, 'multi_select'), single = h.snapshot(form, 'multiple_choice');
  const answers = [{ completed_form_question_id: multi.id, selected_option_ids: h.ids(multi).slice(0, 2) }, { completed_form_question_id: single.id, selected_option_id: h.ids(single)[0] }];
  const noSignature = h.response(); await h.submission.submitForm({ body: { completed_form_id: form.id, answers } }, noSignature);
  assert.equal(noSignature.statusCode, 400);
  assert.equal((await h.save(form, answers.slice(1), true)).statusCode, 400);
  const saved = await h.save(form, answers, true); assert.equal(saved.statusCode, 201);
  assert.equal(saved.body.form.status, 'completed'); assert.equal(saved.body.form.signature, 'fixture-signature');
  assert.equal(saved.body.form.appointment_id, 100); assert.equal(saved.body.form.questions[0].answer.selected_option_ids.length, 2);
});

test('invalid IDs and cross-question/cross-form snapshot injection reject without partial writes', async () => {
  const h = await harness(), form = await h.create(), other = await h.create(null, 2);
  const question = h.snapshot(form, 'multi_select'), optional = h.snapshot(form, 'multi_select', 1), foreign = h.snapshot(other, 'multi_select');
  for (const ids of [[999999], h.ids(optional), h.ids(foreign), [-1], [1.5], [null], [{}], ['1.5'], 'not-an-array']) {
    assert.equal((await h.save(form, [{ completed_form_question_id: question.id, selected_option_ids: ids }])).statusCode, 400);
    assert.equal(h.state.answers.length, 0); assert.equal(h.state.selections.length, 0);
  }
  assert.equal((await h.save(form, [{ completed_form_question_id: foreign.id, selected_option_ids: h.ids(foreign) }])).statusCode, 400);
});

test('duplicate IDs are normalized and mixed scalar/array selections are rejected', async () => {
  const h = await harness(), form = await h.create(), q = h.snapshot(form, 'multi_select'), [id] = h.ids(q);
  const saved = await h.save(form, [{ completed_form_question_id: q.id, selected_option_ids: [id, String(id), id] }]);
  assert.equal(saved.statusCode, 201); assert.equal(h.state.selections.length, 1);
  assert.equal((await h.save(form, [{ completed_form_question_id: q.id, selected_option_ids: [id], selected_option_id: id }])).statusCode, 400);
});

test('selection insertion failure rolls back replacement and every earlier answer in the request', async () => {
  const h = await harness(), form = await h.create(), q = h.snapshot(form, 'multi_select'), text = h.snapshot(form, 'text'), ids = h.ids(q);
  await h.save(form, [{ completed_form_question_id: q.id, selected_option_ids: [ids[0]] }]);
  const before = plain(h.state);
  h.failSelectionInsert = true;
  const failed = await h.save(form, [{ completed_form_question_id: text.id, answer_text: 'Must roll back' }, { completed_form_question_id: q.id, selected_option_ids: [ids[1]] }]);
  assert.equal(failed.statusCode, 500); assert.deepEqual(plain(h.state), before);
});

test('answer create/update/upsert and every answer reader support selection arrays', async () => {
  const h = await harness(), form = await h.create(), q = h.snapshot(form, 'multi_select'), ids = h.ids(q);
  const created = await h.answers.createAnswer(null, { completed_form_id: form.id, completed_form_question_id: q.id, selected_option_ids: ids });
  await assert.rejects(h.answers.createAnswer(null, { completed_form_id: form.id, completed_form_question_id: q.id, selected_option_ids: ids }), /already exists/);
  await h.answers.updateAnswer(null, created.id, { selected_option_ids: [ids[1]] });
  for (const read of [() => h.answers.getAnswerById(null, created.id), () => h.answers.getAnswerWithQuestion(null, created.id)]) assert.deepEqual(plain((await read()).selected_option_ids), [ids[1]]);
  assert.deepEqual(plain((await h.answers.getAnswersByCompletedForm(null, form.id))[0].selected_option_ids), [ids[1]]);
  const upserted = await h.answers.upsertAnswer(null, form.id, q.id, { selected_option_ids: [ids[0], ids[2]] });
  assert.equal(upserted.id, created.id); assert.equal(h.state.answers.length, 1);
  h.failSelectionInsert = true;
  await assert.rejects(h.answers.updateAnswer(null, created.id, { selected_option_ids: [ids[1]] }), /Injected/);
  assert.deepEqual(plain((await h.answers.getAnswerById(null, created.id)).selected_option_ids), [ids[0], ids[2]]);
});

test('single-choice, text and boolean answers preserve their scalar representation', async () => {
  const h = await harness(), form = await h.create();
  const single = h.snapshot(form, 'multiple_choice'), text = h.snapshot(form, 'text'), yes = h.snapshot(form, 'yes_no');
  await h.save(form, [{ completed_form_question_id: single.id, selected_option_id: h.ids(single)[0] }, { completed_form_question_id: text.id, answer_text: 'Historical text' }, { completed_form_question_id: yes.id, boolean_value: false }]);
  const before = plain(h.state.answers);
  const multi = h.snapshot(form, 'multi_select'); await h.save(form, [{ completed_form_question_id: multi.id, selected_option_ids: h.ids(multi) }]);
  assert.deepEqual(plain(h.state.answers.slice(0, before.length)), before);
  const details = await h.forms.getCompletedFormWithDetails(null, form.id);
  const singleAnswer = details.questions.find((q) => q.id === single.id).answer;
  assert.equal(singleAnswer.selected_option_id, h.ids(single)[0]); assert(!('selected_option_ids' in singleAnswer));
  assert.equal(details.questions.find((q) => q.id === text.id).answer.answer_text, 'Historical text');
  assert.equal(details.questions.find((q) => q.id === yes.id).answer.boolean_value, false);
});

test('controller answer mutations forward selection arrays and return validation failures as 400', async () => {
  const h = await harness(), form = await h.create(), q = h.snapshot(form, 'multi_select');
  const res = h.response();
  await h.answerController.createAnswer({ body: { completed_form_id: form.id, completed_form_question_id: q.id, selected_option_ids: h.ids(q) } }, res);
  assert.equal(res.statusCode, 201); assert.equal(res.body.selected_option_ids.length, 3);
  const bad = h.response(); await h.answerController.updateAnswer({ params: { id: res.body.id }, body: { selected_option_ids: [999] } }, bad);
  assert.equal(bad.statusCode, 400);
});
