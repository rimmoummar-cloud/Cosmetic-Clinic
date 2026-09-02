import db from '../config/db.js';

// Get all options for a question
export const getOptionsByQuestion = async (client = null, questionId) => {
  const queryExecutor = client || db;
  
  const result = await queryExecutor.query(
    `SELECT * FROM form_question_options 
     WHERE question_id = $1 
     ORDER BY sort_order ASC`,
    [questionId]
  );
  
  return result.rows;
};

// Get one option by ID
export const getOptionById = async (client = null, id) => {
  const queryExecutor = client || db;
  
  const result = await queryExecutor.query(
    `SELECT * FROM form_question_options WHERE id = $1`,
    [id]
  );
  
  return result.rows[0];
};

// Get option with its question info
export const getOptionWithQuestion = async (client = null, id) => {
  const queryExecutor = client || db;
  
  const result = await queryExecutor.query(
    `SELECT 
       fqo.*,
       fq.question_type,
       fq.form_template_id
     FROM form_question_options fqo
     JOIN form_questions fq ON fq.id = fqo.question_id
     WHERE fqo.id = $1`,
    [id]
  );
  
  return result.rows[0];
};

// Create a new option
export const createOption = async (client = null, data) => {
  const queryExecutor = client || db;
  const { question_id, option_label, sort_order } = data;
  
  // Validate required fields
  if (!question_id || !option_label) {
    throw new Error('Missing required fields: question_id, option_label');
  }
  
  // Check if question exists
  const questionRes = await queryExecutor.query(
    `SELECT id FROM form_questions WHERE id = $1`,
    [question_id]
  );
  
  if (!questionRes.rows[0]) {
    throw new Error(`Question with id ${question_id} does not exist`);
  }
  
  const result = await queryExecutor.query(
    `INSERT INTO form_question_options (question_id, option_label, sort_order, created_at, updated_at)
     VALUES ($1, $2, $3, NOW(), NOW())
     RETURNING *`,
    [question_id, option_label, sort_order ?? 0]
  );
  
  return result.rows[0];
};

// Update an option
export const updateOption = async (client = null, id, data) => {
  const queryExecutor = client || db;
  const { option_label, sort_order } = data;
  
  const result = await queryExecutor.query(
    `UPDATE form_question_options 
     SET option_label = COALESCE($1, option_label),
         sort_order = COALESCE($2, sort_order),
         updated_at = NOW()
     WHERE id = $3
     RETURNING *`,
    [option_label, sort_order, id]
  );
  
  return result.rows[0];
};

// Delete an option
export const deleteOption = async (client = null, id) => {
  const queryExecutor = client || db;
  
  const result = await queryExecutor.query(
    `DELETE FROM form_question_options WHERE id = $1 RETURNING *`,
    [id]
  );
  
  return result.rows[0];
};
