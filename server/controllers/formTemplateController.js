import * as FormTemplate from '../models/formTemplate.js';
import db from '../config/db.js';

const isValidTemplateId = (id) => /^\d+$/.test(String(id)) && Number(id) > 0 && Number(id) <= 2147483647;

// ============================
// Form Templates CRUD
// ============================

export const getAllFormTemplates = async (req, res) => {
  try {
    const templates = await FormTemplate.getAllFormTemplates();
    res.json(templates);
  } catch (error) {
    console.error('Get all form templates error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getActiveFormTemplates = async (req, res) => {
  try {
    const templates = await FormTemplate.getActiveFormTemplates();
    res.json(templates);
  } catch (error) {
    console.error('Get active form templates error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getFormTemplateById = async (req, res) => {
  try {
    const { id } = req.params;
    const template = await FormTemplate.getFormTemplateById(null, id);
    
    if (!template) {
      return res.status(404).json({ error: 'Form template not found' });
    }
    
    res.json(template);
  } catch (error) {
    console.error('Get form template by ID error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getFormTemplateWithDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const template = await FormTemplate.getFormTemplateWithDetails(null, id);
    
    if (!template) {
      return res.status(404).json({ error: 'Form template not found' });
    }
    
    res.json(template);
  } catch (error) {
    console.error('Get form template with details error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const createFormTemplate = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'name is required' });
    }
    
    const template = await FormTemplate.createFormTemplate(null, {
      name,
      description: description || ''
    });
    
    res.status(201).json(template);
  } catch (error) {
    console.error('Create form template error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const updateFormTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidTemplateId(id)) return res.status(400).json({ error: 'Invalid template ID' });
    const { name, description, is_active } = req.body || {};
    if (is_active !== undefined && typeof is_active !== 'boolean') {
      return res.status(400).json({ error: 'is_active must be a boolean' });
    }
    
    // Check if template exists
    const existing = await FormTemplate.getFormTemplateById(null, id);
    if (!existing) {
      return res.status(404).json({ error: 'Form template not found' });
    }
    
    const template = await FormTemplate.updateFormTemplate(null, id, {
      name,
      description,
      is_active
    });
    
    res.json(template);
  } catch (error) {
    console.error('Update form template error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const deactivateFormTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidTemplateId(id)) return res.status(400).json({ error: 'Invalid template ID' });
    
    // Check if template exists
    const existing = await FormTemplate.getFormTemplateById(null, id);
    if (!existing) {
      return res.status(404).json({ error: 'Form template not found' });
    }
    
    const template = await FormTemplate.deactivateFormTemplate(null, id);
    
    res.json({
      message: 'Form template deactivated',
      template
    });
  } catch (error) {
    console.error('Deactivate form template error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteFormTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if template exists
    const existing = await FormTemplate.getFormTemplateById(null, id);
    if (!existing) {
      return res.status(404).json({ error: 'Form template not found' });
    }
    
    const template = await FormTemplate.deleteFormTemplate(null, id);
    
    res.json({
      message: 'Form template deleted',
      template
    });
  } catch (error) {
    if (error.message.includes('Cannot delete')) {
      return res.status(409).json({ error: error.message });
    }
    console.error('Delete form template error:', error);
    res.status(500).json({ error: error.message });
  }
};
