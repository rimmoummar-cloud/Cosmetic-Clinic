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

const router = express.Router();

/**
 * GET /api/sections
 * Retrieve all sections from all pages
 * 
 * Used by: Dashboard to view all sections
 */
router.get('/', getAllSections);

/**
 * GET /api/sections/page/:pageId
 * Get all sections for a specific page (including inactive)
 * Ordered by section_order (1, 2, 3...)
 * 
 * Example: GET /api/sections/page/550e8400-e29b-41d4-a716-446655440000
 * Returns: Array of sections ordered by display order
 * 
 * Used by: Dashboard page editor to show all sections
 */
router.get('/page/:pageId', getSectionsByPageId);

/**
 * GET /api/sections/page/:pageId/active
 * Get only active sections for a page
 * 
 * Example: GET /api/sections/page/550e8400-e29b-41d4-a716-446655440000/active
 * Returns: Only published sections
 * 
 * Used by: Frontend to render only active sections
 */
router.get('/page/:pageId/active', getActiveSectionsByPageId);

/**
 * GET /api/sections/:id/with-content
 * Get a section with all its content entries (versions)
 * Shows section metadata + all content versions
 * 
 * Example: GET /api/sections/abc-123/with-content
 * Returns: { section, content: [ { version, content } ] }
 * 
 * Used by: Dashboard section editor with content history
 */
router.get('/:id/with-content', getSectionWithContent);

/**
 * GET /api/sections/:id
 * Get a single section by ID
 * Without content entries
 * 
 * Example: GET /api/sections/abc-123
 * Returns: Single section object
 * 
 * Used by: Dashboard quick section lookup
 */
router.get('/:id', getSectionById);

/**
 * POST /api/sections
 * Create a new section within a page
 * 
 * Body:
 * {
 *   "page_id": "550e8400-e29b-41d4-a716-446655440000",
 *   "name": "hero",                    // Section type
 *   "slug": "hero-section",            // Optional
 *   "section_order": 1,                // Order on page
 *   "is_active": true                  // Published
 * }
 * 
 * Used by: Dashboard "Add Section to Page" button
 */
router.post('/', createSection);

/**
 * PUT /api/sections/:id
 * Update an existing section
 * Can update name, slug, order, or active status
 * 
 * Body: Any fields to update
 * {
 *   "name": "updated_hero",
 *   "section_order": 2,
 *   "is_active": false
 * }
 * 
 * Used by: Dashboard section editor "Save" button
 */
router.put('/:id', updateSection);

/**
 * DELETE /api/sections/:id
 * Delete a section and all its content (CASCADE)
 * 
 * ⚠️ WARNING: Deletes all section_content entries too!
 * 
 * Used by: Dashboard "Delete Section" with confirmation
 */
router.delete('/:id', deleteSection);

/**
 * PATCH /api/sections/:id/reorder
 * Change order position of a section
 * Used for drag-and-drop reordering
 * 
 * Body: { "section_order": 2 }
 * 
 * Used by: Dashboard section reordering (drag-drop)
 */
router.patch('/:id/reorder', reorderSection);

/**
 * PATCH /api/sections/:id/toggle-active
 * Publish or unpublish a section
 * 
 * Body: { "is_active": true/false }
 * 
 * Used by: Dashboard publish/unpublish toggle button
 */
router.patch('/:id/toggle-active', toggleSectionActive);

export default router;
