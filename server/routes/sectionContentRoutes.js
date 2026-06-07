

import express from 'express';
import {
  getContentBySectionId,
  getLatestContentBySectionId,
  getContentById,
  createContent,
  updateContent,
  deleteContent,
  deleteAllContentBySection,
  revertToPreviousVersion,
  getVersionHistory,
  searchContentByField
} from '../controllers/sectionContentController.js';

import { authenticateAdmin } from "../middleware/authMiddleware.js";
import csrf from "csurf";

const router = express.Router();
const csrfProtection = csrf({ cookie: true });


router.get('/section/:sectionId/latest', getLatestContentBySectionId);
router.get('/section/:sectionId/history', getVersionHistory);
router.get('/section/:sectionId', getContentBySectionId);
router.get('/search', searchContentByField);
router.get('/:id', getContentById);


router.post('/', authenticateAdmin, csrfProtection, createContent);


 router.put('/:id', authenticateAdmin, csrfProtection, updateContent);


router.delete('/:id', authenticateAdmin, csrfProtection, deleteContent);


router.delete('/section/:sectionId/all', authenticateAdmin, csrfProtection, deleteAllContentBySection);

router.post('/:sectionId/revert/:versionNumber', authenticateAdmin, csrfProtection, revertToPreviousVersion);

export default router;
