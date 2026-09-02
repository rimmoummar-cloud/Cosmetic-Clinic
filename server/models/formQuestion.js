import db from '../config/db.js';

const ALLOWED_QUESTION_TYPES = ['text', 'yes_no', 'multiple_choice', 'agreement'];

// Validate question type
export const isValidQuestionType = (type) => {
  return ALLOWED_QUESTION_TYPES.includes(type);
};

// Get all questions for a form template
export const getQuestionsByFormTemplate = async (client = null, formTemplateId) => {
  const queryExecutor = client || db;
  
  const result = await queryExecutor.query(
    `SELECT * FROM form_questions 
     WHERE form_template_id = $1 
     ORDER BY sort_order ASC`,
    [formTemplateId]
  );
  
  return result.rows;
};

// Get one question by ID
export const getQuestionById = async (client = null, id) => {
  const queryExecutor = client || db;
  
  const result = await queryExecutor.query(
    `SELECT * FROM form_questions WHERE id = $1`,
    [id]
  );
  
  return result.rows[0];
};

// Get question with its options
export const getQuestionWithOptions = async (client = null, id) => {
  const queryExecutor = client || db;
  
  const questionRes = await queryExecutor.query(
    `SELECT * FROM form_questions WHERE id = $1`,
    [id]
  );
  
  if (!questionRes.rows[0]) {
    return null;
  }
  
  const question = questionRes.rows[0];
  
  const optionsRes = await queryExecutor.query(
    `SELECT * FROM form_question_options 
     WHERE question_id = $1 
     ORDER BY sort_order ASC`,
    [id]
  );
  
  return {
    ...question,
    options: optionsRes.rows
  };
};

// Create a new question
export const createQuestion = async (client = null, data) => {
  const queryExecutor = client || db;
  const { form_template_id, question_text, question_type, required, sort_order } = data;
  
  // Validate required fields
  if (!form_template_id || !question_text || !question_type) {
    throw new Error('Missing required fields: form_template_id, question_text, question_type');
  }
  
  // Validate question type
  if (!isValidQuestionType(question_type)) {
    throw new Error(`Invalid question_type. Allowed types: ${ALLOWED_QUESTION_TYPES.join(', ')}`);
  }
  
  // Check if form template exists
  const templateRes = await queryExecutor.query(
    `SELECT id FROM form_templates WHERE id = $1`,
    [form_template_id]
  );
  
  if (!templateRes.rows[0]) {
    throw new Error(`Form template with id ${form_template_id} does not exist`);
  }
  
  const result = await queryExecutor.query(
    `INSERT INTO form_questions (form_template_id, question_text, question_type, required, sort_order, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
     RETURNING *`,
    [form_template_id, question_text, question_type, required ?? false, sort_order ?? 0]
  );
  
  return result.rows[0];
};

// Update a question
export const updateQuestion = async (client = null, id, data) => {
  const queryExecutor = client || db;
  const { question_text, question_type, required, sort_order } = data;
  
  // If question_type is provided, validate it
  if (question_type && !isValidQuestionType(question_type)) {
    throw new Error(`Invalid question_type. Allowed types: ${ALLOWED_QUESTION_TYPES.join(', ')}`);
  }
  
  const result = await queryExecutor.query(
    `UPDATE form_questions 
     SET question_text = COALESCE($1, question_text),
         question_type = COALESCE($2, question_type),
         required = COALESCE($3, required),
         sort_order = COALESCE($4, sort_order),
         updated_at = NOW()
     WHERE id = $5
     RETURNING *`,
    [question_text, question_type, required, sort_order, id]
  );
  
  return result.rows[0];
};

// Delete a question and its options
export const deleteQuestion = async (client = null, id) => {
  const queryExecutor = client || db;
  
  // Delete options first
  await queryExecutor.query(
    `DELETE FROM form_question_options WHERE question_id = $1`,
    [id]
  );
  
  // Delete question
  const result = await queryExecutor.query(
    `DELETE FROM form_questions WHERE id = $1 RETURNING *`,
    [id]
  );
  
  return result.rows[0];
};
