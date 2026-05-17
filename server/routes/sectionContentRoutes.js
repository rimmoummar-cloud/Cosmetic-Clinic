

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


router.get('/section/:sectionId/latest', getLatestContentBySectionId);
router.get('/section/:sectionId/history', getVersionHistory);
router.get('/section/:sectionId', getContentBySectionId);
router.get('/search', searchContentByField);
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
