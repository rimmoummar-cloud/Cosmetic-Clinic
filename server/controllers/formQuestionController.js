import * as FormQuestion from '../models/formQuestion.js';
import * as FormTemplate from '../models/formTemplate.js';

// ============================
// Form Questions CRUD
// ============================

export const getQuestionsByFormTemplate = async (req, res) => {
  try {
    const { formTemplateId } = req.params;
    
    // Check if form template exists
    const template = await FormTemplate.getFormTemplateById(null, formTemplateId);
    if (!template) {
      return res.status(404).json({ error: 'Form template not found' });
    }
    
    const questions = await FormQuestion.getQuestionsByFormTemplate(null, formTemplateId);
    res.json(questions);
  } catch (error) {
    console.error('Get questions by form template error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getQuestionById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const question = await FormQuestion.getQuestionById(null, id);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    
    res.json(question);
  } catch (error) {
    console.error('Get question by ID error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getQuestionWithOptions = async (req, res) => {
  try {
    const { id } = req.params;
    
    const question = await FormQuestion.getQuestionWithOptions(null, id);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    
    res.json(question);
  } catch (error) {
    console.error('Get question with options error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const createQuestion = async (req, res) => {
  try {
    const { form_template_id, question_text, question_type, required, sort_order } = req.body;
    
    const question = await FormQuestion.createQuestion(null, {
      form_template_id,
      question_text,
      question_type,
      required,
      sort_order
    });
    
    res.status(201).json(question);
  } catch (error) {
    console.error('Create question error:', error);
    
    if (error.message.includes('Missing required fields') || 
        error.message.includes('Invalid question_type') ||
        error.message.includes('does not exist')) {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: error.message });
  }
};

export const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { question_text, question_type, required, sort_order } = req.body;
    
    // Check if question exists
    const existing = await FormQuestion.getQuestionById(null, id);
    if (!existing) {
      return res.status(404).json({ error: 'Question not found' });
    }
    
    const question = await FormQuestion.updateQuestion(null, id, {
      question_text,
      question_type,
      required,
      sort_order
    });
    
    res.json(question);
  } catch (error) {
    console.error('Update question error:', error);
    
    if (error.message.includes('Invalid question_type')) {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: error.message });
  }
};

export const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if question exists
    const existing = await FormQuestion.getQuestionById(null, id);
    if (!existing) {
      return res.status(404).json({ error: 'Question not found' });
    }
    
    const question = await FormQuestion.deleteQuestion(null, id);
    
    res.json({
      message: 'Question deleted',
      question
    });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({ error: error.message });
  }
};
