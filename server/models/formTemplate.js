import db from '../config/db.js';

// Get all form templates
export const getAllFormTemplates = async (client = null) => {
  const queryExecutor = client || db;
  const result = await queryExecutor.query(
    `SELECT * FROM form_templates 
     ORDER BY created_at DESC`
  );
  return result.rows;
};

// Get active form templates only
export const getActiveFormTemplates = async (client = null) => {
  const queryExecutor = client || db;
  const result = await queryExecutor.query(
    `SELECT * FROM form_templates 
     WHERE is_active = true 
     ORDER BY created_at DESC`
  );
  return result.rows;
};

// Get one form template by ID
export const getFormTemplateById = async (client = null, id) => {
  const queryExecutor = client || db;
  const result = await queryExecutor.query(
    `SELECT * FROM form_templates WHERE id = $1`,
    [id]
  );
  return result.rows[0];
};

// Get form template with all its questions and options
export const getFormTemplateWithDetails = async (client = null, id) => {
  const queryExecutor = client || db;
  
  // Get template
  const templateRes = await queryExecutor.query(
    `SELECT * FROM form_templates WHERE id = $1`,
    [id]
  );
  
  if (!templateRes.rows[0]) {
    return null;
  }
  
  const template = templateRes.rows[0];
  
  // Get questions
  const questionsRes = await queryExecutor.query(
    `SELECT * FROM form_questions 
     WHERE form_template_id = $1 
     ORDER BY sort_order ASC`,
    [id]
  );
  
  // Get options for each question
  const questions = await Promise.all(
    questionsRes.rows.map(async (question) => {
      const optionsRes = await queryExecutor.query(
        `SELECT * FROM form_question_options 
         WHERE question_id = $1 
         ORDER BY sort_order ASC`,
        [question.id]
      );
      return {
        ...question,
        options: optionsRes.rows
      };
    })
  );
  
  return {
    ...template,
    questions
  };
};

// Create a new form template
export const createFormTemplate = async (client = null, data) => {
  const queryExecutor = client || db;
  const { name, description } = data;
  
  const result = await queryExecutor.query(
    `INSERT INTO form_templates (name, description, is_active, created_at, updated_at)
     VALUES ($1, $2, true, NOW(), NOW())
     RETURNING *`,
    [name, description]
  );
  
  return result.rows[0];
};

// Update a form template
export const updateFormTemplate = async (client = null, id, data) => {
  const queryExecutor = client || db;
  const { name, description, is_active } = data;
  
  const result = await queryExecutor.query(
    `UPDATE form_templates 
     SET name = COALESCE($1, name),
         description = COALESCE($2, description),
         is_active = COALESCE($3, is_active),
         updated_at = NOW()
     WHERE id = $4
     RETURNING *`,
    [name, description, is_active, id]
  );
  
  return result.rows[0];
};

// Soft delete: deactivate form template (preserves historical data)
export const deactivateFormTemplate = async (client = null, id) => {
  const queryExecutor = client || db;
  
  const result = await queryExecutor.query(
    `UPDATE form_templates 
     SET is_active = false, updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [id]
  );
  
  return result.rows[0];
};

// Hard delete (only if no completed forms exist)
export const deleteFormTemplate = async (client = null, id) => {
  const queryExecutor = client || db;
  
  // Check if any completed forms reference this template
  const checkRes = await queryExecutor.query(
    `SELECT COUNT(*) as count FROM completed_forms WHERE form_template_id = $1`,
    [id]
  );
  
  if (parseInt(checkRes.rows[0].count) > 0) {
    throw new Error('Cannot delete form template with existing completed forms. Use deactivation instead.');
  }
  
  // Delete options
  await queryExecutor.query(
    `DELETE FROM form_question_options 
     WHERE question_id IN (
       SELECT id FROM form_questions WHERE form_template_id = $1
     )`,
    [id]
  );
  
  // Delete questions
  await queryExecutor.query(
    `DELETE FROM form_questions WHERE form_template_id = $1`,
    [id]
  );
  
  // Delete template
  const result = await queryExecutor.query(
    `DELETE FROM form_templates WHERE id = $1 RETURNING *`,
    [id]
  );
  
  return result.rows[0];
};
