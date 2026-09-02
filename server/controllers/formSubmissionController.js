import * as CompletedForm from '../models/completedForm.js';
import * as CompletedFormQuestion from '../models/completedFormQuestion.js';
import db from '../config/db.js';

const resolveSnapshotQuestionId = (answers, questions, answer) => {
  if (answer.completed_form_question_id) {
    return answer.completed_form_question_id;
  }

  if (answer.question_id) {
    const matchingQuestion = questions.find((question) => question.original_question_id === answer.question_id);
    return matchingQuestion ? matchingQuestion.id : null;
  }

  return null;
};

const normalizeSignature = (signature) => {
  if (typeof signature !== 'string') return null;
  const trimmed = signature.trim();
  return trimmed || null;
};

export const submitForm = async (req, res) => {
  const client = await db.connect();

  try {
    await client.query('BEGIN');

    const { completed_form_id, customer_id, appointment_id, form_template_id, answers, signature } = req.body;
    const signatureValue = normalizeSignature(signature);

    if (!Array.isArray(answers)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'answers must be an array' });
    }

    if (!signatureValue) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Please add your customer signature before submitting the form.' });
    }

    let completedForm;

    if (completed_form_id) {
      completedForm = await CompletedForm.getCompletedFormById(client, completed_form_id);
      if (!completedForm) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Completed form not found' });
      }
    } else {
      if (!customer_id || !form_template_id) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Missing required fields: customer_id, form_template_id' });
      }

      completedForm = await CompletedForm.createCompletedForm(client, {
        customer_id,
        appointment_id,
        form_template_id
      });
    }

    const questions = await CompletedFormQuestion.getQuestionsByCompletedForm(client, completedForm.id);
    const questionLookup = new Map(questions.map((question) => [question.id, question]));

    for (const answer of answers) {
      const completedFormQuestionId = resolveSnapshotQuestionId(answers, questions, answer);

      if (!completedFormQuestionId) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Each answer must include completed_form_question_id or a valid question_id' });
      }

      const snapshotQuestion = questionLookup.get(Number(completedFormQuestionId));
      if (!snapshotQuestion) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: `Question ${completedFormQuestionId} does not belong to completed form ${completedForm.id}` });
      }

      validateAnswerForQuestionType(
        snapshotQuestion.question_type,
        answer.answer_text,
        answer.selected_option_id,
        answer.boolean_value
      );

      if (answer.selected_option_id) {
        const optionRes = await client.query(
          `SELECT id FROM completed_form_question_options
           WHERE id = $1 AND completed_form_question_id = $2`,
          [answer.selected_option_id, completedFormQuestionId]
        );

        if (!optionRes.rows[0]) {
          await client.query('ROLLBACK');
          return res.status(400).json({ error: `Option ${answer.selected_option_id} does not belong to question ${completedFormQuestionId}` });
        }
      }

      const existingAnswerRes = await client.query(
        `SELECT id FROM form_answers
         WHERE completed_form_id = $1 AND completed_form_question_id = $2`,
        [completedForm.id, completedFormQuestionId]
      );

      if (existingAnswerRes.rows[0]) {
        await client.query(
          `UPDATE form_answers
           SET answer_text = $3,
               selected_option_id = $4,
               boolean_value = $5,
               updated_at = NOW()
           WHERE id = $1 AND completed_form_id = $2`,
          [existingAnswerRes.rows[0].id, completedForm.id, answer.answer_text ?? null, answer.selected_option_id ?? null, answer.boolean_value ?? null]
        );
      } else {
        await client.query(
          `INSERT INTO form_answers (
            completed_form_id,
            completed_form_question_id,
            answer_text,
            selected_option_id,
            boolean_value,
            created_at,
            updated_at
          ) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
          [
            completedForm.id,
            completedFormQuestionId,
            answer.answer_text ?? null,
            answer.selected_option_id ?? null,
            answer.boolean_value ?? null
          ]
        );
      }
    }

    const missingRequired = questions.filter((question) => question.required && !answers.some((answer) => {
      const id = resolveSnapshotQuestionId(answers, questions, answer);
      return id && Number(id) === question.id;
    }));

    if (missingRequired.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: `Required question ${missingRequired[0].id} has no answer` });
    }

    await client.query(
      `UPDATE completed_forms
       SET signature = $1,
           signed_at = NOW(),
           status = 'completed',
           completed_at = NOW(),
           updated_at = NOW()
       WHERE id = $2`,
      [signatureValue, completedForm.id]
    );

    await client.query('COMMIT');

    const fullForm = await CompletedForm.getCompletedFormWithDetails(null, completedForm.id);

    return res.status(201).json({
      message: 'Form submitted successfully',
      form: fullForm
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Form submission error:', error);
    return res.status(500).json({ message: 'Server error while submitting form', error: error.message });
  } finally {
    client.release();
  }
};

export const saveDraft = async (req, res) => {
  const client = await db.connect();

  try {
    await client.query('BEGIN');

    const { completed_form_id, customer_id, appointment_id, form_template_id, answers, signature } = req.body;
    const signatureValue = normalizeSignature(signature);

    if (!Array.isArray(answers)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'answers must be an array' });
    }

    let completedForm;

    if (completed_form_id) {
      completedForm = await CompletedForm.getCompletedFormById(client, completed_form_id);
      if (!completedForm) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Completed form not found' });
      }
    } else {
      if (!customer_id || !form_template_id) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Missing required fields: customer_id, form_template_id' });
      }

      completedForm = await CompletedForm.createCompletedForm(client, {
        customer_id,
        appointment_id,
        form_template_id
      });
    }

    const questions = await CompletedFormQuestion.getQuestionsByCompletedForm(client, completedForm.id);
    const questionLookup = new Map(questions.map((question) => [question.id, question]));

    for (const answer of answers) {
      const completedFormQuestionId = resolveSnapshotQuestionId(answers, questions, answer);

      if (!completedFormQuestionId) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Each answer must include completed_form_question_id or a valid question_id' });
      }

      const snapshotQuestion = questionLookup.get(Number(completedFormQuestionId));
      if (!snapshotQuestion) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: `Question ${completedFormQuestionId} does not belong to completed form ${completedForm.id}` });
      }

      validateAnswerForQuestionType(
        snapshotQuestion.question_type,
        answer.answer_text,
        answer.selected_option_id,
        answer.boolean_value
      );

      if (answer.selected_option_id) {
        const optionRes = await client.query(
          `SELECT id FROM completed_form_question_options
           WHERE id = $1 AND completed_form_question_id = $2`,
          [answer.selected_option_id, completedFormQuestionId]
        );

        if (!optionRes.rows[0]) {
          await client.query('ROLLBACK');
          return res.status(400).json({ error: `Option ${answer.selected_option_id} does not belong to question ${completedFormQuestionId}` });
        }
      }

      const existingAnswerRes = await client.query(
        `SELECT id FROM form_answers
         WHERE completed_form_id = $1 AND completed_form_question_id = $2`,
        [completedForm.id, completedFormQuestionId]
      );

      if (existingAnswerRes.rows[0]) {
        await client.query(
          `UPDATE form_answers
           SET answer_text = $3,
               selected_option_id = $4,
               boolean_value = $5,
               updated_at = NOW()
           WHERE id = $1 AND completed_form_id = $2`,
          [existingAnswerRes.rows[0].id, completedForm.id, answer.answer_text ?? null, answer.selected_option_id ?? null, answer.boolean_value ?? null]
        );
      } else {
        await client.query(
          `INSERT INTO form_answers (
            completed_form_id,
            completed_form_question_id,
            answer_text,
            selected_option_id,
            boolean_value,
            created_at,
            updated_at
          ) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
          [
            completedForm.id,
            completedFormQuestionId,
            answer.answer_text ?? null,
            answer.selected_option_id ?? null,
            answer.boolean_value ?? null
          ]
        );
      }
    }

    if (signatureValue) {
      await client.query(
        `UPDATE completed_forms
         SET signature = $1,
             updated_at = NOW()
         WHERE id = $2`,
        [signatureValue, completedForm.id]
      );
    }

    await CompletedForm.updateCompletedFormStatus(client, completedForm.id, 'draft');
    await client.query('COMMIT');

    const fullForm = await CompletedForm.getCompletedFormWithDetails(null, completedForm.id);

    return res.status(201).json({
      message: 'Form saved as draft successfully',
      form: fullForm
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Save draft error:', error);
    return res.status(500).json({ message: 'Server error while saving draft', error: error.message });
  } finally {
    client.release();
  }
};

function validateAnswerForQuestionType(questionType, answerText, selectedOptionId, booleanValue) {
  switch (questionType) {
    case 'text':
      if (answerText === null || answerText === undefined) {
        throw new Error('Text questions require answer_text');
      }
      break;
    case 'yes_no':
    case 'agreement':
      if (booleanValue === null || booleanValue === undefined) {
        throw new Error(`${questionType} questions require boolean_value (true/false)`);
      }
      break;
    case 'multiple_choice':
      if (!selectedOptionId) {
        throw new Error('Multiple choice questions require selected_option_id');
      }
      break;
    default:
      throw new Error(`Unknown question type: ${questionType}`);
  }
}
