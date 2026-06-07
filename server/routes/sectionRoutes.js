/**
 * =====================================================
 * SECTIONS ROUTES
 * =====================================================
 * 
 * This file maps URL endpoints to section controller functions.
 * Sections are parts of pages (Hero, Services, Testimonials, etc.)
 * 
 * Routes:
 * - GET all sections
 * - GET sections for a specific page
 * - GET single section details
 * - POST create new section
 * - PUT update section
 * - DELETE remove section
 * - PATCH publish/unpublish section
 * =====================================================
 */

import express from 'express';
import {
  getAllSections,
  getSectionsByPageId,
  getActiveSectionsByPageId,
  getSectionById,
  createSection,
  updateSection,
  deleteSection,
  reorderSection,
  toggleSectionActive,
  getSectionWithContent
} from '../controllers/sectionController.js';

import { authenticateAdmin } from "../middleware/authMiddleware.js";
import csrf from "csurf";

const router = express.Router();
const csrfProtection = csrf({ cookie: true });

router.get('/', getAllSections);


router.get('/page/:pageId', getSectionsByPageId);

router.get('/page/:pageId/active', getActiveSectionsByPageId);


router.get('/:id/with-content', getSectionWithContent);


router.get('/:id', getSectionById);

router.post('/',  authenticateAdmin, csrfProtection, createSection);


router.put('/:id', authenticateAdmin, csrfProtection,  updateSection);


router.delete('/:id', authenticateAdmin, csrfProtection,  deleteSection);


router.patch('/:id/reorder', authenticateAdmin, csrfProtection,  reorderSection);


router.patch('/:id/toggle-active',  authenticateAdmin, csrfProtection, toggleSectionActive);

export default router;
