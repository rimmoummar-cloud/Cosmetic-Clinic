import db from '../config/db.js';

const invalid = (message) => Object.assign(new Error(message), { statusCode: 400 });

export function normalizeSelectedOptionIds(value, required = false) {
  if (!Array.isArray(value)) throw invalid('multi_select requires a selected_option_ids array');
  const ids = value.map((id) => {
    if ((typeof id !== 'number' && typeof id !== 'string') || !/^\d+$/.test(String(id))) {
      throw invalid('selected_option_ids must contain valid positive integer IDs');
    }
    const number = Number(id);
    if (!Number.isSafeInteger(number) || number <= 0 || number > 2147483647) {
      throw invalid('selected_option_ids must contain valid positive integer IDs');
    }
    return number;
  });
  const unique = [...new Set(ids)];
  if (required && unique.length === 0) throw invalid('Required multi-select question needs at least one selected option');
  return unique;
}

// Preserve the scalar response for historical types; arrays belong only to multi_select.
export async function attachSelectedOptionIds(client, answers) {
  if (!answers.length) return answers;
  const result = await (client || db).query(
    `SELECT fa.id AS form_answer_id, selection.selected_option_id
     FROM form_answers fa
     JOIN completed_form_questions question ON question.id = fa.completed_form_question_id
     LEFT JOIN form_answer_selected_options selection ON selection.form_answer_id = fa.id
     WHERE fa.id = ANY($1::integer[]) AND question.question_type = 'multi_select'
     ORDER BY fa.id, selection.selected_option_id`,
    [answers.map((answer) => answer.id)]
  );
  const selections = new Map();
  for (const row of result.rows) {
    if (!selections.has(row.form_answer_id)) selections.set(row.form_answer_id, []);
    if (row.selected_option_id !== null) selections.get(row.form_answer_id).push(row.selected_option_id);
  }
  return answers.map((answer) => selections.has(answer.id)
    ? { ...answer, selected_option_ids: selections.get(answer.id) }
    : answer);
}

export async function saveMultiSelectAnswer(client, completedFormId, questionId, data, { mode = 'upsert', answerId = null } = {}) {
  const transaction = client || await db.connect();
  try {
    if (!client) await transaction.query('BEGIN');
    const form = await transaction.query('SELECT id FROM completed_forms WHERE id = $1 FOR UPDATE', [completedFormId]);
    if (!form.rows[0]) throw invalid('Completed form does not exist');
    const question = await transaction.query(
      `SELECT id, question_type, required FROM completed_form_questions
       WHERE id = $1 AND completed_form_id = $2`, [questionId, completedFormId]
    );
    if (!question.rows[0] || question.rows[0].question_type !== 'multi_select') {
      throw invalid(`Question ${questionId} does not belong to this form as a multi-select question`);
    }
    if (data.selected_option_id != null) throw invalid('multi_select requires selected_option_ids, not selected_option_id');
    const ids = normalizeSelectedOptionIds(data.selected_option_ids, question.rows[0].required);
    const options = await transaction.query(
      `SELECT id FROM completed_form_question_options
       WHERE completed_form_question_id = $1 AND id = ANY($2::integer[])`, [questionId, ids]
    );
    if (options.rows.length !== ids.length) throw invalid(`Selected options do not belong to snapshot question ${questionId}`);
    const existing = await transaction.query(
      `SELECT id FROM form_answers WHERE completed_form_id = $1 AND completed_form_question_id = $2 FOR UPDATE`,
      [completedFormId, questionId]
    );
    if (mode === 'create' && existing.rows[0]) throw invalid('An answer already exists for this completed form question');
    if (mode === 'update' && String(existing.rows[0]?.id) !== String(answerId)) throw invalid('Answer does not belong to this completed form question');
    const saved = await transaction.query(
      `INSERT INTO form_answers (completed_form_id, completed_form_question_id, answer_text, selected_option_id, boolean_value, created_at, updated_at)
       VALUES ($1, $2, NULL, NULL, NULL, NOW(), NOW())
       ON CONFLICT (completed_form_id, completed_form_question_id)
       DO UPDATE SET answer_text = NULL, selected_option_id = NULL, boolean_value = NULL, updated_at = NOW()
       RETURNING *`, [completedFormId, questionId]
    );
    const answer = saved.rows[0];
    await transaction.query('DELETE FROM form_answer_selected_options WHERE form_answer_id = $1', [answer.id]);
    if (ids.length) {
      await transaction.query(
        `INSERT INTO form_answer_selected_options (form_answer_id, selected_option_id)
         SELECT $1, unnest($2::integer[])`, [answer.id, ids]
      );
    }
    if (!client) await transaction.query('COMMIT');
    return { ...answer, selected_option_ids: ids };
  } catch (error) {
    if (!client) await transaction.query('ROLLBACK');
    throw error;
  } finally {
    if (!client) transaction.release();
  }
}
