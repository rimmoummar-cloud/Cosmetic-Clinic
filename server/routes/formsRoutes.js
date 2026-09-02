import express from 'express';
import { authenticateAdmin } from '../middleware/authMiddleware.js';
import csrf from 'csurf';

import * as FormTemplateController from '../controllers/formTemplateController.js';
import * as FormQuestionController from '../controllers/formQuestionController.js';
import * as FormQuestionOptionController from '../controllers/formQuestionOptionController.js';
import * as CompletedFormController from '../controllers/completedFormController.js';
import * as FormAnswerController from '../controllers/formAnswerController.js';
import * as FormSubmissionController from '../controllers/formSubmissionController.js';

const router = express.Router();

const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: true,
    sameSite: 'none'
  }
});

router.get('/templates', authenticateAdmin, csrfProtection, FormTemplateController.getAllFormTemplates);
router.get('/templates/active', authenticateAdmin, csrfProtection, FormTemplateController.getActiveFormTemplates);
router.get('/templates/:id', authenticateAdmin, csrfProtection, FormTemplateController.getFormTemplateById);
router.get('/templates/:id/with-details', authenticateAdmin, csrfProtection, FormTemplateController.getFormTemplateWithDetails);
router.post('/templates', authenticateAdmin, csrfProtection, FormTemplateController.createFormTemplate);
router.put('/templates/:id', authenticateAdmin, csrfProtection, FormTemplateController.updateFormTemplate);
router.patch('/templates/:id/deactivate', authenticateAdmin, csrfProtection, FormTemplateController.deactivateFormTemplate);
router.delete('/templates/:id', authenticateAdmin, csrfProtection, FormTemplateController.deleteFormTemplate);

router.get('/templates/:formTemplateId/questions', authenticateAdmin, csrfProtection, FormQuestionController.getQuestionsByFormTemplate);
router.get('/questions/:id', authenticateAdmin, csrfProtection, FormQuestionController.getQuestionById);
router.get('/questions/:id/with-options', authenticateAdmin, csrfProtection, FormQuestionController.getQuestionWithOptions);
router.post('/questions', authenticateAdmin, csrfProtection, FormQuestionController.createQuestion);
router.put('/questions/:id', authenticateAdmin, csrfProtection, FormQuestionController.updateQuestion);
router.delete('/questions/:id', authenticateAdmin, csrfProtection, FormQuestionController.deleteQuestion);

router.get('/questions/:questionId/options', authenticateAdmin, csrfProtection, FormQuestionOptionController.getOptionsByQuestion);
router.get('/options/:id', authenticateAdmin, csrfProtection, FormQuestionOptionController.getOptionById);
router.get('/options/:id/with-question', authenticateAdmin, csrfProtection, FormQuestionOptionController.getOptionWithQuestion);
router.post('/options', authenticateAdmin, csrfProtection, FormQuestionOptionController.createOption);
router.put('/options/:id', authenticateAdmin, csrfProtection, FormQuestionOptionController.updateOption);
router.delete('/options/:id', authenticateAdmin, csrfProtection, FormQuestionOptionController.deleteOption);

router.get('/completed-forms', authenticateAdmin, csrfProtection, CompletedFormController.getAllCompletedForms);
router.get('/completed-forms/:id', authenticateAdmin, csrfProtection, CompletedFormController.getCompletedFormById);
router.get('/completed-forms/:id/with-details', authenticateAdmin, csrfProtection, CompletedFormController.getCompletedFormWithDetails);
router.get('/customers/:customerId/forms', authenticateAdmin, csrfProtection, CompletedFormController.getCompletedFormsByCustomer);
router.get('/appointments/:appointmentId/forms', authenticateAdmin, csrfProtection, CompletedFormController.getCompletedFormsByAppointment);
router.post('/completed-forms', authenticateAdmin, csrfProtection, CompletedFormController.createCompletedForm);
router.put('/completed-forms/:id/status', authenticateAdmin, csrfProtection, CompletedFormController.updateCompletedFormStatus);
router.patch('/completed-forms/:id/complete', authenticateAdmin, csrfProtection, CompletedFormController.completeCompletedForm);
router.delete('/completed-forms/:id', authenticateAdmin, csrfProtection, CompletedFormController.deleteCompletedForm);

router.get('/completed-forms/:completedFormId/answers', authenticateAdmin, csrfProtection, FormAnswerController.getAnswersByCompletedForm);
router.get('/answers/:id', authenticateAdmin, csrfProtection, FormAnswerController.getAnswerById);
router.get('/answers/:id/with-question', authenticateAdmin, csrfProtection, FormAnswerController.getAnswerWithQuestion);
router.post('/answers', authenticateAdmin, csrfProtection, FormAnswerController.createAnswer);
router.put('/answers/:id', authenticateAdmin, csrfProtection, FormAnswerController.updateAnswer);
router.delete('/answers/:id', authenticateAdmin, csrfProtection, FormAnswerController.deleteAnswer);
router.post('/completed-forms/:completedFormId/answers/upsert', authenticateAdmin, csrfProtection, FormAnswerController.upsertAnswer);

router.post('/submit', authenticateAdmin, csrfProtection, FormSubmissionController.submitForm);
router.post('/save-draft', authenticateAdmin, csrfProtection, FormSubmissionController.saveDraft);

export default router;
