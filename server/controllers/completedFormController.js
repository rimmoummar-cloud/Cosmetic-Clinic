import * as CompletedForm from '../models/completedForm.js';
import * as FormAnswer from '../models/formAnswer.js';

// ============================
// Completed Forms CRUD
// ============================

export const getAllCompletedForms = async (req, res) => {
  try {
    const forms = await CompletedForm.getAllCompletedForms();
    res.json(forms);
  } catch (error) {
    console.error('Get all completed forms error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getCompletedFormById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const form = await CompletedForm.getCompletedFormById(null, id);
    if (!form) {
      return res.status(404).json({ error: 'Completed form not found' });
    }
    
    res.json(form);
  } catch (error) {
    console.error('Get completed form by ID error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getCompletedFormWithDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    const form = await CompletedForm.getCompletedFormWithDetails(null, id);
    if (!form) {
      return res.status(404).json({ error: 'Completed form not found' });
    }
    
    res.json(form);
  } catch (error) {
    console.error('Get completed form with details error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getCompletedFormsByCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;
    
    const forms = await CompletedForm.getCompletedFormsByCustomer(null, customerId);
    res.json(forms);
  } catch (error) {
    console.error('Get completed forms by customer error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getCompletedFormsByAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    
    const forms = await CompletedForm.getCompletedFormsByAppointment(null, appointmentId);
    res.json(forms);
  } catch (error) {
    console.error('Get completed forms by appointment error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const createCompletedForm = async (req, res) => {
  try {
    const { customer_id, appointment_id, form_template_id } = req.body;
    
    const form = await CompletedForm.createCompletedForm(null, {
      customer_id,
      appointment_id,
      form_template_id
    });
    
    res.status(201).json(form);
  } catch (error) {
    console.error('Create completed form error:', error);
    
    if (error.message.includes('Missing required fields') || 
        error.message.includes('does not exist')) {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: error.message });
  }
};

export const updateCompletedFormStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'status is required' });
    }
    
    // Check if form exists
    const existing = await CompletedForm.getCompletedFormById(null, id);
    if (!existing) {
      return res.status(404).json({ error: 'Completed form not found' });
    }
    
    const form = await CompletedForm.updateCompletedFormStatus(null, id, status);
    
    res.json(form);
  } catch (error) {
    console.error('Update completed form status error:', error);
    
    if (error.message.includes('Invalid status')) {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: error.message });
  }
};

export const completeCompletedForm = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if form exists
    const existing = await CompletedForm.getCompletedFormById(null, id);
    if (!existing) {
      return res.status(404).json({ error: 'Completed form not found' });
    }
    
    const form = await CompletedForm.completeCompletedForm(null, id);
    
    res.json({
      message: 'Form marked as completed',
      form
    });
  } catch (error) {
    console.error('Complete form error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteCompletedForm = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if form exists
    const existing = await CompletedForm.getCompletedFormById(null, id);
    if (!existing) {
      return res.status(404).json({ error: 'Completed form not found' });
    }
    
    const form = await CompletedForm.deleteCompletedForm(null, id);
    
    res.json({
      message: 'Completed form deleted',
      form
    });
  } catch (error) {
    console.error('Delete completed form error:', error);
    res.status(500).json({ error: error.message });
  }
};
