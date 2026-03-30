/**
 * =====================================================
 * SECTION CONTENT ROUTES
 * =====================================================
 * 
 * This file maps URL endpoints to section content controller functions.
 * Section content is the actual data stored in JSON format.
 * 
 * Features:
 * - Version control: Each update creates new version
 * - Content search: Find content by field values
 * - Revert functionality: Restore to previous versions
 * =====================================================
 */

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

const router = express.Router();

/**
 * GET /api/section-content/section/:sectionId/latest
 * Get the latest/current content for a section
 * This is what the frontend should render
 * 
 * Example: GET /api/section-content/section/abc-123/latest
 * Returns: Latest content version with all data
 * 
 * Used by: Frontend website rendering
 */
router.get('/section/:sectionId/latest', getLatestContentBySectionId);

/**
 * GET /api/section-content/section/:sectionId/history
 * Get version history timeline for a section
 * Shows all versions with creation dates
 * 
 * Example: GET /api/section-content/section/abc-123/history
 * Returns: [ { version: 3, created_at }, { version: 2, ... } ]
 * 
 * Used by: Dashboard version history view
 */
router.get('/section/:sectionId/history', getVersionHistory);

/**
 * GET /api/section-content/section/:sectionId
 * Get all content versions for a section
 * Shows complete version history with content
 * 
 * Example: GET /api/section-content/section/abc-123
 * Returns: Array of all content versions (latest first)
 * 
 * Used by: Dashboard version management
 */
router.get('/section/:sectionId', getContentBySectionId);

/**
 * GET /api/section-content/search
 * Search content by a specific JSON field value
 * 
 * Query params:
 * - sectionId: UUID of section to search in (required)
 * - field: JSON field path like "title" (required)
 * - value: Value to search for (required)
 * 
 * Example: GET /api/section-content/search?sectionId=abc&field=title&value=glow
 * Returns: All content versions with title containing "glow"
 * 
 * Used by: Dashboard search/filter functionality
 */
router.get('/search', searchContentByField);

/**
 * GET /api/section-content/:id
 * Get a specific content entry by ID
 * Shows a single version of content
 * 
 * Example: GET /api/section-content/uuid-123
 * Returns: Single content version object
 * 
 * Used by: Dashboard viewing specific version
 */
router.get('/:id', getContentById);

/**
 * POST /api/section-content
 * Create new content for a section
 * Will be version 1 if first content
 * 
 * Body:
 * {
 *   "section_id": "abc-123",           // Required: parent section UUID
 *   "content": {                       // Required: JSON object
 *     "title": "Reveal Your Glow",
 *     "description": "...",
 *     "image": "https://..."
 *   }
 * }
 * 
 * The content field is flexible JSON - store any data structure!
 * 
 * Used by: Dashboard "Create Content" for section
 */
router.post('/', createContent);

/**
 * PUT /api/section-content/:id
 * Update content for a section
 * By default creates new version (versioning)
 * 
 * Query params:
 * - createNewVersion=true (default): Creates new version
 * - createNewVersion=false: Updates in place (not recommended)
 * 
 * Body: Updated content object (same structure as POST)
 * {
 *   "title": "Updated Title",
 *   "description": "Updated...",
 *   ...
 * }
 * 
 * Used by: Dashboard content editor "Save" button
 * 
 * Best practice: Always use createNewVersion=true for audit trail
 */
router.put('/:id', updateContent);

/**
 * DELETE /api/section-content/:id
 * Delete a specific content entry/version
 * 
 * Used by: Dashboard "Delete Version" button
 * (Usually keep history, only delete specific versions)
 */
router.delete('/:id', deleteContent);

/**
 * DELETE /api/section-content/section/:sectionId/all
 * Delete ALL content for a section
 * 
 * ⚠️ WARNING: Deletes entire content history!
 * Only use when permanently removing a section
 * 
 * Used by: When deleting a section
 */
router.delete('/section/:sectionId/all', deleteAllContentBySection);

/**
 * POST /api/section-content/:sectionId/revert/:versionNumber
 * Restore section content to a previous version
 * Creates new version with content from old version
 * 
 * Example: POST /api/section-content/abc-123/revert/2
 * → Creates new version (3) with content from version 2
 * 
 * Used by: Dashboard "Revert to Version" button
 * Useful when accidental changes made and need to undo
 */
router.post('/:sectionId/revert/:versionNumber', revertToPreviousVersion);

export default router;
