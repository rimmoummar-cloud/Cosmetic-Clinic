import * as FormQuestionOption from '../models/formQuestionOption.js';
import * as FormQuestion from '../models/formQuestion.js';

// ============================
// Form Question Options CRUD
// ============================

export const getOptionsByQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    
    // Check if question exists
    const question = await FormQuestion.getQuestionById(null, questionId);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    
    const options = await FormQuestionOption.getOptionsByQuestion(null, questionId);
    res.json(options);
  } catch (error) {
    console.error('Get options by question error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getOptionById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const option = await FormQuestionOption.getOptionById(null, id);
    if (!option) {
      return res.status(404).json({ error: 'Option not found' });
    }
    
    res.json(option);
  } catch (error) {
    console.error('Get option by ID error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getOptionWithQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    
    const option = await FormQuestionOption.getOptionWithQuestion(null, id);
    if (!option) {
      return res.status(404).json({ error: 'Option not found' });
    }
    
    res.json(option);
  } catch (error) {
    console.error('Get option with question error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const createOption = async (req, res) => {
  try {
    const { question_id, option_label, sort_order } = req.body;
    
    const option = await FormQuestionOption.createOption(null, {
      question_id,
      option_label,
      sort_order
    });
    
    res.status(201).json(option);
  } catch (error) {
    console.error('Create option error:', error);
    
    if (error.message.includes('Missing required fields') || 
        error.message.includes('does not exist')) {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: error.message });
  }
};

export const updateOption = async (req, res) => {
  try {
    const { id } = req.params;
    const { option_label, sort_order } = req.body;
    
    // Check if option exists
    const existing = await FormQuestionOption.getOptionById(null, id);
    if (!existing) {
      return res.status(404).json({ error: 'Option not found' });
    }
    
    const option = await FormQuestionOption.updateOption(null, id, {
      option_label,
      sort_order
    });
    
    res.json(option);
  } catch (error) {
    console.error('Update option error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteOption = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if option exists
    const existing = await FormQuestionOption.getOptionById(null, id);
    if (!existing) {
      return res.status(404).json({ error: 'Option not found' });
    }
    
    const option = await FormQuestionOption.deleteOption(null, id);
    
    res.json({
      message: 'Option deleted',
      option
    });
  } catch (error) {
    console.error('Delete option error:', error);
    res.status(500).json({ error: error.message });
  }
};
