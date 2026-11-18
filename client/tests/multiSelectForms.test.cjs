// Run: node --test client/tests/multiSelectForms.test.cjs
// Real components/functions, mocked React hooks and API; no browser or database writes.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const root = path.join(__dirname, '..');
const managerFile = 'src/app/(dashboard)/admin/forms/CustomerFormsManager.jsx';
const builderFile = 'src/app/(dashboard)/admin/forms/page.jsx';
const viewerFile = 'src/app/(dashboard)/admin/forms/completedformviwer.jsx';
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const jsx = (type, props, key) => ({ type, props: props || {}, key });
const runtime = { jsx, jsxs: jsx, Fragment: 'fragment' };
const quiet = { error() {}, log() {} };
function compile(source, mocks = {}) {
  const module = { exports: {} };
  const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText;
  vm.runInNewContext(js, { module, exports: module.exports, require: (name) => {
    if (name in mocks) return mocks[name];
    throw new Error(`Unexpected import: ${name}`);
  }, console: quiet, alert: mocks.alert || (() => {}), window: { confirm: () => true }, Date, Map, Set });
  return module.exports;
}
const selections = compile(read('src/lib/formSelections.js'));
function ast(file) { return ts.createSourceFile(file, read(file), ts.ScriptTarget.Latest, true, ts.ScriptKind.JSX); }
function expression(file, name, declaration = false) {
  const source = ast(file); let result;
  function visit(node) {
    if (!declaration && ts.isVariableDeclaration(node) && node.name.getText(source) === name) result = node.initializer.getText(source);
    if (declaration && ts.isFunctionDeclaration(node) && node.name.text === name) result = node.getText(source);
    ts.forEachChild(node, visit);
  }
  visit(source); assert(result, name); return result;
}
function bind(text, context) {
  const js = ts.transpileModule(`module.exports = ${text}`, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  const module = { exports: {} };
  new Function('context', 'module', 'exports', 'require', `with (context) { ${js} }`)(context, module, module.exports, () => runtime);
  return module.exports;
}
function nodes(node, result = []) {
  if (Array.isArray(node)) node.forEach((item) => nodes(item, result));
  else if (node && typeof node === 'object' && node.props) { result.push(node); nodes(node.props.children, result); }
  return result;
}
const textContent = (node) => typeof node === 'string' || typeof node === 'number' ? String(node)
  : Array.isArray(node) ? node.map(textContent).join(' ') : node?.props ? textContent(node.props.children) : '';
const plain = (value) => JSON.parse(JSON.stringify(value));
function fixture(status = 'draft') {
  return { id: 50, customer_id: 1, appointment_id: 100, form_template_id: 10, form_name: 'Consent', status,
    questions: [
      { id: 101, original_question_id: 1, question_type: 'multi_select', question_text: 'Treatments?', required: true,
        options: [{ id: 201, original_option_id: 11, option_label: 'Facial' }, { id: 202, original_option_id: 12, option_label: 'Laser' }, { id: 203, original_option_id: 13, option_label: 'Peeling' }],
        answer: { selected_option_ids: [201, 203] } },
      { id: 102, original_question_id: 2, question_type: 'multiple_choice', question_text: 'One choice', required: false,
        options: [{ id: 301, original_option_id: 21, option_label: 'Legacy first' }, { id: 302, original_option_id: 22, option_label: 'Legacy second' }], answer: { selected_option_id: 301 } },
    ] };
}
function manager(form = fixture(), extra = {}, booking = { id: 100, customer_id: 1 }) {
  const source = ast(managerFile), names = [];
  function visit(node) {
    if (ts.isVariableDeclaration(node) && ts.isArrayBindingPattern(node.name) && node.initializer && ts.isCallExpression(node.initializer) && node.initializer.expression.getText(source) === 'useState') names.push(node.name.elements[0].getText(source));
    ts.forEachChild(node, visit);
  }
  visit(source);
  const state = { selectedCompletedForm: form, selectedCompletedFormId: form.id, formsLoading: false, templateLoading: false, completedForms: [form], ...extra };
  const calls = [], alerts = []; let cursor = 0, closed = 0;
  let duplicated = { ...fixture(), id: 88, questions: fixture().questions.map((q) => ({ ...q, id: q.id + 400, answer: null, options: q.options.map((o) => ({ ...o, id: o.id + 600 })) })) };
  const api = {
    async post(url, payload) { calls.push([url, payload]); return { data: url === '/forms/completed-forms' ? { id: 88 } : {} }; },
    async get(url) { return { data: url.includes('/customers/') ? [form] : duplicated }; },
  };
  const react = { useMemo: (fn) => fn(), useEffect() {}, useRef: () => ({ current: null }), useState(initial) {
    const name = names[cursor++]; assert(name); if (!(name in state)) state[name] = typeof initial === 'function' ? initial() : initial;
    return [state[name], (value) => { state[name] = typeof value === 'function' ? value(state[name]) : value; }];
  } };
  const Component = compile(read(managerFile), {
    react, 'react/jsx-runtime': runtime, 'react-signature-canvas': {}, '../../../../lib/api.js': api,
    '../../../../lib/formSelections': selections,
    '../../../../lib/signatureUtils': { getSignatureFromRef: () => 'fixture-signature', clearSignatureRef() {}, isSignaturePadEmpty: () => false },
    alert: (value) => alerts.push(value),
  }).default;
  return { state, calls, alerts, get closed() { return closed; },
    render() { cursor = 0; return nodes(Component({ customer: { id: 1, name: 'Fixture' }, booking, onClose: () => { closed++; } })); },
  };
}

test('draft reopening restores every checked option; toggling adds/removes without overwriting', () => {
  const h = manager(); h.render().find((node) => node.props.children === 'Continue draft').props.onClick();
  let inputs = h.render().filter((node) => node.type === 'input' && node.props.type === 'checkbox');
  assert.deepEqual(inputs.map((node) => node.props.checked), [true, false, true]);
  inputs[1].props.onChange();
  assert.deepEqual(plain(h.state.answers[101].selected_option_ids), [201, 203, 202]);
  inputs = h.render().filter((node) => node.type === 'input' && node.props.type === 'checkbox');
  inputs[0].props.onChange();
  assert.deepEqual(plain(h.state.answers[101].selected_option_ids), [203, 202]);
});

test('updated draft submits the full replacement set and final submission uses the same array contract', async () => {
  for (const label of ['Save draft', 'Submit form']) {
    const h = manager(); h.render().find((node) => node.props.children === 'Continue draft').props.onClick();
    h.render().filter((node) => node.type === 'input' && node.props.type === 'checkbox')[0].props.onChange();
    await h.render().find((node) => node.props.children === label).props.onClick();
    const [endpoint, payload] = h.calls[0];
    assert.equal(endpoint, label === 'Save draft' ? '/forms/save-draft' : '/forms/submit');
    assert.equal(payload.completed_form_id, 50); assert.equal(payload.customer_id, 1); assert.equal(payload.appointment_id, 100);
    assert.deepEqual(plain(payload.answers.find((a) => a.completed_form_question_id === 101).selected_option_ids), [203]);
    assert.equal(h.closed, 1);
  }
});

test('required selection validation blocks an empty group; optional empty array is sent to clear saved choices', async () => {
  for (const required of [true, false]) {
    const form = fixture(); form.questions[0].required = required; form.questions[0].answer.selected_option_ids = [];
    const h = manager(form); h.render().find((node) => node.props.children === 'Continue draft').props.onClick();
    await h.render().find((node) => node.props.children === 'Save draft').props.onClick();
    assert.equal(h.calls.length, required ? 0 : 1);
    if (required) assert(h.alerts[0].includes('at least one'));
    else assert.deepEqual(plain(h.calls[0][1].answers[0].selected_option_ids), []);
  }
});

test('legacy single-choice remains radio-based and selecting another option replaces its scalar ID', () => {
  const h = manager(); h.render().find((node) => node.props.children === 'Continue draft').props.onClick();
  const radios = h.render().filter((node) => node.type === 'input' && node.props.type === 'radio');
  assert.deepEqual(radios.map((node) => node.props.checked), [true, false]);
  radios[1].props.onChange(); assert.equal(h.state.answers[102].selected_option_id, 302);
  assert.equal(h.state.answers[102].selected_option_ids, undefined);
});

test('manager details display every selected snapshot label and retain historical single labels', () => {
  const h = manager(fixture('completed'));
  const all = h.render(); assert(all.some((node) => node.props.children === 'Facial, Peeling'));
  assert(all.some((node) => node.props.children === 'Legacy first'));
  assert(!all.some((node) => node.props.children === 'Continue draft'));
});

test('shared completed-form viewer displays all selections for customer and Admin viewing', () => {
  const form = fixture('completed');
  const Viewer = compile(read(viewerFile), {
    react: { useMemo: (fn) => fn() }, 'react/jsx-runtime': runtime,
    '@tanstack/react-query': { useQuery: () => ({ data: form, isLoading: false }) },
    '../../../../lib/api.js': {}, '../../../../lib/formSelections': selections,
  }).default;
  const all = nodes(Viewer({ completedFormId: form.id, expectedCustomerId: 1 }));
  assert(all.some((node) => node.props.children === 'Facial, Peeling'));
  assert(all.some((node) => node.props.children === 'Legacy first'));
});

test('duplication maps every selected option to the new snapshot IDs', async () => {
  const h = manager(fixture('completed'));
  await h.render().find((node) => node.props.children === 'Duplicate').props.onClick();
  assert.equal(h.state.draftFormId, 88);
  assert.deepEqual(plain(h.state.answers[501].selected_option_ids), [801, 803]);
  assert.equal(h.state.answers[502].selected_option_id, 901);
  assert.equal(h.calls[0][1].appointment_id, 100);
});

test('multi-select duplication matches original question IDs even after question ordering changes', () => {
  const original = fixture().questions;
  const replacement = [{ id: 501, original_question_id: 1, question_type: 'multi_select', options: [{ id: 801, original_option_id: 11 }, { id: 803, original_option_id: 13 }] }];
  const fn = bind(expression(managerFile, 'buildDuplicatedAnswerMap'), { getSelectedOptionIds: selections.getSelectedOptionIds, normalizeBoolean: (v) => v ?? null });
  assert.deepEqual(plain(fn([...original].reverse(), replacement)[501].selected_option_ids), [801, 803]);
});

test('preview uses checkboxes only for multi-select and preserves legacy radio options', () => {
  const Preview = bind(expression(builderFile, 'TemplatePreview', true), {});
  const all = nodes(Preview({ template: { name: 'Preview' }, details: { questions: fixture().questions }, loading: false, onClose() {} }));
  assert.equal(all.filter((node) => node.type === 'input' && node.props.type === 'checkbox').length, 3);
  assert.equal(all.filter((node) => node.type === 'input' && node.props.type === 'radio').length, 2);
});

test('builder exposes the explicit type, preserves options when switching option-based types, and saves option order', async () => {
  const types = bind(expression(builderFile, 'questionTypes'), {});
  assert(types.some((type) => type.value === 'multi_select' && type.label === 'Multiple Choice / Multi-select'));
  const calls = [], context = {
    builderMode: 'create', builderTemplate: { name: 'New', description: '' },
    builderQuestions: [{ question_text: 'Treatments', question_type: 'multiple_choice', required: false, options: [{ option_label: 'Facial' }, { option_label: 'Laser' }] }],
    selectedTemplateId: null, removedQuestionIds: [], removedOptionIds: [], emptyTemplateForm: { name: '', description: '' },
    setBuilderOpen() {}, setBuilderTemplate() {}, setBuilderQuestions: (value) => { context.builderQuestions = typeof value === 'function' ? value(context.builderQuestions) : value; },
    api: { post: async (url, payload) => { calls.push([url, payload]); return { data: { id: url === '/forms/templates' ? 10 : 100 } }; } },
    queryClient: { invalidateQueries: async () => {} }, alert: (value) => assert.fail(value), console: quiet,
  };
  bind(expression(builderFile, 'handleQuestionChange'), context)(0, 'question_type', 'multi_select');
  assert.equal(context.builderQuestions[0].options.length, 2);
  await bind(expression(builderFile, 'saveTemplateBuilder'), context)();
  assert.equal(calls.find(([url]) => url === '/forms/questions')[1].question_type, 'multi_select');
  assert.deepEqual(calls.filter(([url]) => url === '/forms/options').map(([, payload]) => payload.sort_order), [0, 1]);
});

test('checkboxes retain native labels for keyboard/screen-reader access', () => {
  const h = manager(); h.render().find((node) => node.props.children === 'Continue draft').props.onClick();
  const labels = h.render().filter((node) => node.type === 'label' && nodes(node).some((item) => item.type === 'input' && item.props.type === 'checkbox'));
  assert.equal(labels.length, 3); assert(labels.every((label) => textContent(label).trim().length > 0));
});

test('customer-only forms save selections without introducing an appointment association', async () => {
  const form = fixture(); form.appointment_id = null;
  const h = manager(form, {}, null);
  h.render().find((node) => node.props.children === 'Continue draft').props.onClick();
  await h.render().find((node) => node.props.children === 'Save draft').props.onClick();
  assert.equal(h.calls[0][1].customer_id, 1); assert.equal(h.calls[0][1].appointment_id, null);
  assert.deepEqual(plain(h.calls[0][1].answers[0].selected_option_ids), [201, 203]);
});
