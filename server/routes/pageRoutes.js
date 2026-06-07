/**
 * =====================================================
 * PAGES ROUTES
 * =====================================================
 * 
 * This file maps URL endpoints to page controller functions.
 * Each route defines an HTTP method (GET, POST, PUT, DELETE)
 * and connects it to a controller function.
 * 
 * When frontend makes a request to /api/pages/about,
 * the appropriate controller function is called.
 * =====================================================
 */

import express from 'express';
import {
  getAllPages,
  getActivePages,
  getPageById,
  getPageBySlug,
  createPage,
  updatePage,
  deletePage,
  togglePageActive,
  getPageWithSectionsAndContent
} from '../controllers/pageController.js';

import { authenticateAdmin } from "../middleware/authMiddleware.js";
import csrf from "csurf";

const router = express.Router();
const csrfProtection = csrf({ cookie: true });


router.get('/', getAllPages);

router.get('/active', getActivePages);


router.get('/detailed/:slug', getPageWithSectionsAndContent);


router.get('/slug/:slug', getPageBySlug);


router.get('/:id', getPageById);


router.post('/', authenticateAdmin, csrfProtection, createPage);


router.patch('/:id/toggle-active', authenticateAdmin, csrfProtection, togglePageActive);

export default router;
