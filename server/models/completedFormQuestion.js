import db from '../config/db.js';

const ALLOWED_QUESTION_TYPES = ['text', 'yes_no', 'multiple_choice', 'agreement','confirmation'];

export const isValidQuestionType = (type) => {
  return ALLOWED_QUESTION_TYPES.includes(type);
};

export const getQuestionsByCompletedForm = async (client = null, completedFormId) => {
  const queryExecutor = client || db;

  const result = await queryExecutor.query(
    `SELECT * FROM completed_form_questions
     WHERE completed_form_id = $1
     ORDER BY sort_order ASC, id ASC`,
    [completedFormId]
  );

  return result.rows;
};

export const getQuestionById = async (client = null, id) => {
  const queryExecutor = client || db;

  const result = await queryExecutor.query(
    `SELECT * FROM completed_form_questions WHERE id = $1`,
    [id]
  );

  return result.rows[0];
};

export const getQuestionWithOptions = async (client = null, id) => {
  const queryExecutor = client || db;

  const questionRes = await queryExecutor.query(
    `SELECT * FROM completed_form_questions WHERE id = $1`,
    [id]
  );

  if (!questionRes.rows[0]) {
    return null;
  }

  const question = questionRes.rows[0];

  const optionsRes = await queryExecutor.query(
    `SELECT * FROM completed_form_question_options
     WHERE completed_form_question_id = $1
     ORDER BY sort_order ASC, id ASC`,
    [id]
  );

  return {
    ...question,
    options: optionsRes.rows
  };
};

export const createCompletedFormQuestion = async (client = null, data) => {
  const queryExecutor = client || db;
  const {
    completed_form_id,
    original_question_id,
    question_text,
    question_type,
    required,
    sort_order
  } = data;

  if (!completed_form_id || !question_text || !question_type) {
    throw new Error('Missing required fields: completed_form_id, question_text, question_type');
  }

  if (!isValidQuestionType(question_type)) {
    throw new Error(`Invalid question_type. Allowed types: ${ALLOWED_QUESTION_TYPES.join(', ')}`);
  }

  const formRes = await queryExecutor.query(
    `SELECT id FROM completed_forms WHERE id = $1`,
    [completed_form_id]
  );

  if (!formRes.rows[0]) {
    throw new Error(`Completed form with id ${completed_form_id} does not exist`);
  }

  const result = await queryExecutor.query(
    `INSERT INTO completed_form_questions (
      completed_form_id,
      original_question_id,
      question_text,
      question_type,
      required,
      sort_order,
      created_at
    ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
     RETURNING *`,
    [
      completed_form_id,
      original_question_id ?? null,
      question_text,
      question_type,
      required ?? false,
      sort_order ?? 0
    ]
  );

  return result.rows[0];
};

export const updateCompletedFormQuestion = async (client = null, id, data) => {
  const queryExecutor = client || db;
  const { question_text, question_type, required, sort_order } = data;

  if (question_type && !isValidQuestionType(question_type)) {
    throw new Error(`Invalid question_type. Allowed types: ${ALLOWED_QUESTION_TYPES.join(', ')}`);
  }

  const result = await queryExecutor.query(
    `UPDATE completed_form_questions
     SET question_text = COALESCE($1, question_text),
         question_type = COALESCE($2, question_type),
         required = COALESCE($3, required),
         sort_order = COALESCE($4, sort_order)
     WHERE id = $5
     RETURNING *`,
    [question_text, question_type, required, sort_order, id]
  );

  return result.rows[0];
};

export const deleteCompletedFormQuestion = async (client = null, id) => {
  const queryExecutor = client || db;

  const result = await queryExecutor.query(
    `DELETE FROM completed_form_questions WHERE id = $1 RETURNING *`,
    [id]
  );

  return result.rows[0];
};
