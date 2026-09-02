import * as FormAnswer from '../models/formAnswer.js';
import * as CompletedForm from '../models/completedForm.js';

export const getAnswersByCompletedForm = async (req, res) => {
  try {
    const { completedFormId } = req.params;

    const form = await CompletedForm.getCompletedFormById(null, completedFormId);
    if (!form) {
      return res.status(404).json({ error: 'Completed form not found' });
    }

    const answers = await FormAnswer.getAnswersByCompletedForm(null, completedFormId);
    res.json(answers);
  } catch (error) {
    console.error('Get answers by completed form error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getAnswerById = async (req, res) => {
  try {
    const { id } = req.params;

    const answer = await FormAnswer.getAnswerById(null, id);
    if (!answer) {
      return res.status(404).json({ error: 'Answer not found' });
    }

    res.json(answer);
  } catch (error) {
    console.error('Get answer by ID error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getAnswerWithQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    const answer = await FormAnswer.getAnswerWithQuestion(null, id);
    if (!answer) {
      return res.status(404).json({ error: 'Answer not found' });
    }

    res.json(answer);
  } catch (error) {
    console.error('Get answer with question error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const createAnswer = async (req, res) => {
  try {
    const { completed_form_id, completed_form_question_id, answer_text, selected_option_id, boolean_value } = req.body;

    const answer = await FormAnswer.createAnswer(null, {
      completed_form_id,
      completed_form_question_id,
      answer_text,
      selected_option_id,
      boolean_value
    });

    res.status(201).json(answer);
  } catch (error) {
    console.error('Create answer error:', error);

    if (error.message.includes('Missing required fields') ||
        error.message.includes('does not exist') ||
        error.message.includes('does not belong') ||
        error.message.includes('require') ||
        error.message.includes('already exists')) {
      return res.status(400).json({ error: error.message });
    }

    res.status(500).json({ error: error.message });
  }
};

export const updateAnswer = async (req, res) => {
  try {
    const { id } = req.params;
    const { answer_text, selected_option_id, boolean_value } = req.body;

    const existing = await FormAnswer.getAnswerById(null, id);
    if (!existing) {
      return res.status(404).json({ error: 'Answer not found' });
    }

    const answer = await FormAnswer.updateAnswer(null, id, {
      answer_text,
      selected_option_id,
      boolean_value
    });

    res.json(answer);
  } catch (error) {
    console.error('Update answer error:', error);

    if (error.message.includes('does not exist') ||
        error.message.includes('does not belong') ||
        error.message.includes('require')) {
      return res.status(400).json({ error: error.message });
    }

    res.status(500).json({ error: error.message });
  }
};

export const deleteAnswer = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await FormAnswer.getAnswerById(null, id);
    if (!existing) {
      return res.status(404).json({ error: 'Answer not found' });
    }

    const answer = await FormAnswer.deleteAnswer(null, id);

    res.json({
      message: 'Answer deleted',
      answer
    });
  } catch (error) {
    console.error('Delete answer error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const upsertAnswer = async (req, res) => {
  try {
    const { completedFormId } = req.params;
    const { completed_form_question_id, answer_text, selected_option_id, boolean_value } = req.body;

    if (!completed_form_question_id) {
      return res.status(400).json({ error: 'completed_form_question_id is required' });
    }

    const form = await CompletedForm.getCompletedFormById(null, completedFormId);
    if (!form) {
      return res.status(404).json({ error: 'Completed form not found' });
    }

    const answer = await FormAnswer.upsertAnswer(null, completedFormId, completed_form_question_id, {
      answer_text,
      selected_option_id,
      boolean_value
    });

    res.status(201).json(answer);
  } catch (error) {
    console.error('Upsert answer error:', error);

    if (error.message.includes('does not exist') ||
        error.message.includes('does not belong') ||
        error.message.includes('require') ||
        error.message.includes('already exists')) {
      return res.status(400).json({ error: error.message });
    }

    res.status(500).json({ error: error.message });
  }
};
