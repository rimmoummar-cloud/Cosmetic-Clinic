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

const router = express.Router();

/**
 * GET /api/pages
 * Retrieve all pages (admin dashboard)
 * Used by: Dashboard to show all pages
 */
router.get('/', getAllPages);

/**
 * GET /api/pages/active
 * Retrieve only active/published pages
 * Used by: Frontend website navigation
 */
router.get('/active', getActivePages);

/**
 * GET /api/pages/detailed/:slug
 * Get complete page with all sections and content in one request
 * THIS IS THE MAIN ENDPOINT FOR FRONTEND
 * 
 * Example: GET /api/pages/detailed/home
 * Returns: { page, sections: [ { section, content } ] }
 * 
 * Used by: Next.js pages to render complete page
 */
router.get('/detailed/:slug', getPageWithSectionsAndContent);

/**
 * GET /api/pages/slug/:slug
 * Get page by URL slug (alternative to detailed)
 * 
 * Example: GET /api/pages/slug/about
 * Returns: Single page object without sections
 * 
 * Used by: Frontend metadata, dashboard search
 */
router.get('/slug/:slug', getPageBySlug);

/**
 * GET /api/pages/:id
 * Get page by UUID
 * 
 * Example: GET /api/pages/550e8400-e29b-41d4-a716-446655440000
 * Returns: Single page object
 * 
 * Used by: Dashboard page editor
 */
router.get('/:id', getPageById);

/**
 * POST /api/pages
 * Create a new page
 * 
 * Body:
 * {
 *   "name": "Services",
 *   "slug": "services",
 *   "description": "Our premium services",
 *   "is_active": true
 * }
 * 
 * Used by: Dashboard "Create New Page" button
 */
router.post('/', createPage);

/**
 * PUT /api/pages/:id
 * Update an existing page
 * 
 * Body: Any of the page fields to update
 * {
 *   "name": "Updated Name",
 *   "is_active": false
 * }
 * 
 * Used by: Dashboard page editor
 */
router.put('/:id', updatePage);

/**
 * DELETE /api/pages/:id
 * Delete a page and all its sections/content
 * 
 * ⚠️ CASCADE: All sections and content deleted too!
 * 
 * Used by: Dashboard "Delete Page" with confirmation
 */
router.delete('/:id', deletePage);

/**
 * PATCH /api/pages/:id/toggle-active
 * Publish/unpublish a page
 * 
 * Body: { "is_active": true/false }
 * 
 * Used by: Dashboard publish/unpublish toggle
 */
router.patch('/:id/toggle-active', togglePageActive);

export default router;
