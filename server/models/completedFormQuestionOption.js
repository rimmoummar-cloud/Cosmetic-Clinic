import db from '../config/db.js';

export const getOptionsByCompletedFormQuestion = async (client = null, completedFormQuestionId) => {
  const queryExecutor = client || db;

  const result = await queryExecutor.query(
    `SELECT * FROM completed_form_question_options
     WHERE completed_form_question_id = $1
     ORDER BY sort_order ASC, id ASC`,
    [completedFormQuestionId]
  );

  return result.rows;
};

export const getOptionById = async (client = null, id) => {
  const queryExecutor = client || db;

  const result = await queryExecutor.query(
    `SELECT * FROM completed_form_question_options WHERE id = $1`,
    [id]
  );

  return result.rows[0];
};

export const createCompletedFormQuestionOption = async (client = null, data) => {
  const queryExecutor = client || db;
  const {
    completed_form_question_id,
    original_option_id,
    option_label,
    sort_order
  } = data;

  if (!completed_form_question_id || !option_label) {
    throw new Error('Missing required fields: completed_form_question_id, option_label');
  }

  const questionRes = await queryExecutor.query(
    `SELECT id FROM completed_form_questions WHERE id = $1`,
    [completed_form_question_id]
  );

  if (!questionRes.rows[0]) {
    throw new Error(`Completed form question with id ${completed_form_question_id} does not exist`);
  }

  const result = await queryExecutor.query(
    `INSERT INTO completed_form_question_options (
      completed_form_question_id,
      original_option_id,
      option_label,
      sort_order,
      created_at
    ) VALUES ($1, $2, $3, $4, NOW())
     RETURNING *`,
    [completed_form_question_id, original_option_id ?? null, option_label, sort_order ?? 0]
  );

  return result.rows[0];
};

export const updateCompletedFormQuestionOption = async (client = null, id, data) => {
  const queryExecutor = client || db;
  const { option_label, sort_order } = data;

  const result = await queryExecutor.query(
    `UPDATE completed_form_question_options
     SET option_label = COALESCE($1, option_label),
         sort_order = COALESCE($2, sort_order)
     WHERE id = $3
     RETURNING *`,
    [option_label, sort_order, id]
  );

  return result.rows[0];
};

export const deleteCompletedFormQuestionOption = async (client = null, id) => {
  const queryExecutor = client || db;

  const result = await queryExecutor.query(
    `DELETE FROM completed_form_question_options WHERE id = $1 RETURNING *`,
    [id]
  );

  return result.rows[0];
};
