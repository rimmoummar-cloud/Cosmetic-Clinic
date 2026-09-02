import db from '../config/db.js';

const normalizeAnswerForQuestionType = (questionType, answerText, selectedOptionId, booleanValue) => {
  switch (questionType) {
    case 'text':
      if (answerText === null || answerText === undefined) {
        throw new Error('Text questions require answer_text');
      }
      return {
        answer_text: answerText,
        selected_option_id: null,
        boolean_value: null
      };

    case 'yes_no':
    case 'agreement':
      if (booleanValue === null || booleanValue === undefined) {
        throw new Error(`${questionType} questions require boolean_value (true/false)`);
      }
      return {
        answer_text: null,
        selected_option_id: null,
        boolean_value: booleanValue
      };

    case 'multiple_choice':
      if (selectedOptionId === null || selectedOptionId === undefined) {
        throw new Error('Multiple choice questions require selected_option_id');
      }
      return {
        answer_text: null,
        selected_option_id: selectedOptionId,
        boolean_value: null
      };

    default:
      throw new Error(`Unknown question type: ${questionType}`);
  }
};

export const getAnswersByCompletedForm = async (client = null, completedFormId) => {
  const queryExecutor = client || db;

  const result = await queryExecutor.query(
    `SELECT * FROM form_answers
     WHERE completed_form_id = $1
     ORDER BY created_at ASC`,
    [completedFormId]
  );

  return result.rows;
};

export const getAnswerById = async (client = null, id) => {
  const queryExecutor = client || db;

  const result = await queryExecutor.query(
    `SELECT * FROM form_answers WHERE id = $1`,
    [id]
  );

  return result.rows[0];
};

export const getAnswerWithQuestion = async (client = null, id) => {
  const queryExecutor = client || db;

  const result = await queryExecutor.query(
    `SELECT
       fa.*,
       cfq.question_type,
       cfq.question_text
     FROM form_answers fa
     JOIN completed_form_questions cfq ON cfq.id = fa.completed_form_question_id
     WHERE fa.id = $1`,
    [id]
  );

  return result.rows[0];
};

export const createAnswer = async (client = null, data) => {
  const queryExecutor = client || db;
  const {
    completed_form_id,
    completed_form_question_id,
    answer_text,
    selected_option_id,
    boolean_value
  } = data;

  if (!completed_form_id || !completed_form_question_id) {
    throw new Error('Missing required fields: completed_form_id, completed_form_question_id');
  }

  const formRes = await queryExecutor.query(
    `SELECT id FROM completed_forms WHERE id = $1`,
    [completed_form_id]
  );

  if (!formRes.rows[0]) {
    throw new Error(`Completed form with id ${completed_form_id} does not exist`);
  }

  const questionRes = await queryExecutor.query(
    `SELECT id, question_type, completed_form_id
     FROM completed_form_questions
     WHERE id = $1 AND completed_form_id = $2`,
    [completed_form_question_id, completed_form_id]
  );

  if (!questionRes.rows[0]) {
    throw new Error(`Question with id ${completed_form_question_id} does not belong to completed form ${completed_form_id}`);
  }

  const questionType = questionRes.rows[0].question_type;
  const normalizedAnswer = normalizeAnswerForQuestionType(
    questionType,
    answer_text,
    selected_option_id,
    boolean_value
  );

  const existingRes = await queryExecutor.query(
    `SELECT id FROM form_answers
     WHERE completed_form_id = $1 AND completed_form_question_id = $2`,
    [completed_form_id, completed_form_question_id]
  );

  if (existingRes.rows[0]) {
    throw new Error('An answer already exists for this completed form question');
  }

  if (normalizedAnswer.selected_option_id !== null) {
    const optionRes = await queryExecutor.query(
      `SELECT id FROM completed_form_question_options
       WHERE id = $1 AND completed_form_question_id = $2`,
      [normalizedAnswer.selected_option_id, completed_form_question_id]
    );

    if (!optionRes.rows[0]) {
      throw new Error(`Option with id ${normalizedAnswer.selected_option_id} does not belong to question ${completed_form_question_id}`);
    }
  }

  const result = await queryExecutor.query(
    `INSERT INTO form_answers (
      completed_form_id,
      completed_form_question_id,
      answer_text,
      selected_option_id,
      boolean_value,
      created_at,
      updated_at
    ) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
     RETURNING *`,
    [
      completed_form_id,
      completed_form_question_id,
      normalizedAnswer.answer_text,
      normalizedAnswer.selected_option_id,
      normalizedAnswer.boolean_value
    ]
  );

  return result.rows[0];
};

export const updateAnswer = async (client = null, id, data) => {
  const queryExecutor = client || db;
  const { answer_text, selected_option_id, boolean_value } = data;

  const answerRes = await queryExecutor.query(
    `SELECT fa.completed_form_question_id, cfq.question_type, cfq.completed_form_id
     FROM form_answers fa
     JOIN completed_form_questions cfq ON cfq.id = fa.completed_form_question_id
     WHERE fa.id = $1`,
    [id]
  );

  if (!answerRes.rows[0]) {
    throw new Error(`Answer with id ${id} does not exist`);
  }

  const { completed_form_question_id, question_type, completed_form_id } = answerRes.rows[0];
  const normalizedAnswer = normalizeAnswerForQuestionType(
    question_type,
    answer_text,
    selected_option_id,
    boolean_value
  );

  if (normalizedAnswer.selected_option_id !== null) {
    const optionRes = await queryExecutor.query(
      `SELECT id FROM completed_form_question_options
       WHERE id = $1 AND completed_form_question_id = $2`,
      [normalizedAnswer.selected_option_id, completed_form_question_id]
    );

    if (!optionRes.rows[0]) {
      throw new Error(`Option with id ${normalizedAnswer.selected_option_id} does not belong to question ${completed_form_question_id}`);
    }
  }

  const result = await queryExecutor.query(
    `UPDATE form_answers
     SET answer_text = $1,
         selected_option_id = $2,
         boolean_value = $3,
         updated_at = NOW()
     WHERE id = $4
     RETURNING *`,
    [
      normalizedAnswer.answer_text,
      normalizedAnswer.selected_option_id,
      normalizedAnswer.boolean_value,
      id
    ]
  );

  return result.rows[0];
};

export const deleteAnswer = async (client = null, id) => {
  const queryExecutor = client || db;

  const result = await queryExecutor.query(
    `DELETE FROM form_answers WHERE id = $1 RETURNING *`,
    [id]
  );

  return result.rows[0];
};

function validateAnswerForQuestionType(questionType, answerText, selectedOptionId, booleanValue) {
  return normalizeAnswerForQuestionType(questionType, answerText, selectedOptionId, booleanValue);
}

export const upsertAnswer = async (client = null, completedFormId, completedFormQuestionId, data) => {
  const queryExecutor = client || db;
  const {
    answer_text,
    selected_option_id,
    boolean_value
  } = data;

  const questionRes = await queryExecutor.query(
    `SELECT question_type
     FROM completed_form_questions
     WHERE id = $1 AND completed_form_id = $2`,
    [completedFormQuestionId, completedFormId]
  );

  if (!questionRes.rows[0]) {
    throw new Error(`Question with id ${completedFormQuestionId} does not belong to completed form ${completedFormId}`);
  }

  const questionType = questionRes.rows[0].question_type;
  const normalizedAnswer = normalizeAnswerForQuestionType(
    questionType,
    answer_text,
    selected_option_id,
    boolean_value
  );

  if (normalizedAnswer.selected_option_id !== null) {
    const optionRes = await queryExecutor.query(
      `SELECT id FROM completed_form_question_options
       WHERE id = $1 AND completed_form_question_id = $2`,
      [normalizedAnswer.selected_option_id, completedFormQuestionId]
    );

    if (!optionRes.rows[0]) {
      throw new Error(`Option with id ${normalizedAnswer.selected_option_id} does not belong to question ${completedFormQuestionId}`);
    }
  }

  const result = await queryExecutor.query(
    `INSERT INTO form_answers (
      completed_form_id,
      completed_form_question_id,
      answer_text,
      selected_option_id,
      boolean_value,
      created_at,
      updated_at
    ) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
     ON CONFLICT (completed_form_id, completed_form_question_id)
     DO UPDATE SET
       answer_text = EXCLUDED.answer_text,
       selected_option_id = EXCLUDED.selected_option_id,
       boolean_value = EXCLUDED.boolean_value,
       updated_at = NOW()
     RETURNING *`,
    [
      completedFormId,
      completedFormQuestionId,
      normalizedAnswer.answer_text,
      normalizedAnswer.selected_option_id,
      normalizedAnswer.boolean_value
    ]
  );

  return result.rows[0];
};
