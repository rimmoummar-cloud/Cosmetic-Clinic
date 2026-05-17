/**
 * =====================================================
 * SECTION CONTENT CONTROLLER
 * =====================================================
 * 
 * This file contains all API endpoint handlers for section content.
 * Section content is the actual data stored in JSON format.
 * 
 * Examples of section content:
 * - Hero: { title, description, image, buttonText }
 * - Services: { services: [ { name, price, image } ] }
 * - Contact: { phone, email, address }
 * 
 * Features:
 * - Version control: Each update creates a new version
 * - Versioning history: Can revert to previous versions
 * - Flexible JSON storage: Any data structure
 * 
 * Used by: Dashboard content editor, frontend content rendering
 * =====================================================
 */

import * as ContentModel from '../models/sectionContent.js';

/**
 * API Endpoint: GET /api/section-content/section/:sectionId
 * Get all content versions for a section
 * Shows complete version history
 * 
 * Frontend usage: Dashboard version history view
 */
export const getContentBySectionId = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const content = await ContentModel.getContentBySectionId(sectionId);

    res.json({
      success: true,
      data: content,
      count: content.length,
      message: 'All content versions retrieved'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Error retrieving content'
    });
  }
};

/**
 * API Endpoint: GET /api/section-content/section/:sectionId/latest
 * Get only the latest/current content for a section
 * This is what the frontend should render
 * 
 * Frontend usage: Website rendering current section content
 */
export const getLatestContentBySectionId = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const content = await ContentModel.getLatestContentBySectionId(sectionId);

    if (!content) {
      return res.status(404).json({
        success: false,
        error: 'No content found for this section'
      });
    }

    res.json({
      success: true,
      data: content,
      message: 'Latest content retrieved'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * API Endpoint: GET /api/section-content/:id
 * Get a specific content entry by ID
 * Useful for viewing a specific version
 * 
 * Frontend usage: Dashboard content version view
 */
export const getContentById = async (req, res) => {
  try {
    const { id } = req.params;
    const content = await ContentModel.getContentById(id);

    if (!content) {
      return res.status(404).json({
        success: false,
        error: 'Content not found'
      });
    }

    res.json({
      success: true,
      data: content
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * API Endpoint: POST /api/section-content
 * Create new content for a section
 * Automatically creates version 1 if no version specified
 * 
 * Required body:
 * {
 *   "section_id": "uuid-of-section",
 *   "content": {                       // JSON object with any structure
 *     "title": "Reveal Your Glow",
 *     "description": "Experience luxury...",
 *     "buttonText": "Book Now",
 *     "image": "https://example.com/img.jpg"
 *   }
 * }
 * 
 * The "content" field is flexible JSON - can store any data!
 * 
 * Frontend usage: Dashboard "Create Section Content" button
 */
export const createContent = async (req, res) => {
  try {
    const content = await ContentModel.createContent(req.body);

    res.status(201).json({
      success: true,
      data: content,
      message: 'Content created successfully',
      version: content.version
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
      message: 'Error creating content'
    });
  }
};

/**
 * API Endpoint: PUT /api/section-content/:id
 * Update content for a section
 * By default, creates a new version (versioning)
 * 
 * Body: Updated content JSON object
 * {
 *   "title": "Updated Title",
 *   "description": "Updated description",
 *   ...
 * }
 * 
 * Query params:
 * - ?createNewVersion=true (default) → Creates new version
 * - ?createNewVersion=false → Updates in place (not recommended)
 * 
 * Frontend usage: Dashboard content editor "Save" button
 * 
 * Best practice: Always use createNewVersion=true for audit trail
 */
export const updateContent = async (req, res) => {
  try {
    const { id } = req.params;
    const { createNewVersion = true } = req.query;

    // Verify content exists
    const existingContent = await ContentModel.getContentById(id);
    if (!existingContent) {
      return res.status(404).json({
        success: false,
        error: 'Content not found'
      });
    }

    const content = await ContentModel.updateContent(
      id,
      req.body,
      createNewVersion !== 'false'
    );

    res.json({
      success: true,
      data: content,
      message: 'Content updated successfully',
      newVersion: content.version,
      versionCreated: createNewVersion !== 'false'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Error updating content'
    });
  }
};

/**
 * API Endpoint: DELETE /api/section-content/:id
 * Delete a specific content entry
 * 
 * Frontend usage: Dashboard "Delete Content Version" button
 * (Usually keep history, so only delete specific versions)
 */
export const deleteContent = async (req, res) => {
  try {
    const { id } = req.params;

    await ContentModel.deleteContent(id);

    res.json({
      success: true,
      message: 'Content deleted successfully',
      deletedContentId: id
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Error deleting content'
    });
  }
};

/**
 * API Endpoint: DELETE /api/section-content/section/:sectionId/all
 * Delete ALL content for a section
 * 
 * ⚠️ WARNING: Deletes entire content history!
 * Only use when permanently removing a section
 * 
 * Frontend usage: When deleting a section
 */
export const deleteAllContentBySection = async (req, res) => {
  try {
    const { sectionId } = req.params;

    const result = await ContentModel.deleteAllContentBySection(sectionId);

    res.json({
      success: true,
      message: 'All content deleted successfully',
      deletedCount: result.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Error deleting content'
    });
  }
};

/**
 * API Endpoint: POST /api/section-content/:sectionId/revert/:versionNumber
 * Restore section content to a previous version
 * Creates new version with old content
 * 
 * Frontend usage: Dashboard "Revert to Version" button
 * 
 * Example:
 * POST /api/section-content/abc-123/revert/2
 * → Creates new version with content from version 2
 */
export const revertToPreviousVersion = async (req, res) => {
  try {
    const { sectionId, versionNumber } = req.params;

    const content = await ContentModel.revertToPreviousVersion(
      sectionId,
      parseInt(versionNumber)
    );

    res.json({
      success: true,
      data: content,
      message: `Reverted to version ${versionNumber}`,
      newVersion: content.version
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Error reverting to version'
    });
  }
};

/**
 * API Endpoint: GET /api/section-content/section/:sectionId/history
 * Get version history timeline for a section
 * Shows all versions with timestamps
 * 
 * Used by: Dashboard version history view, timeline component
 * 
 * Returns:
 * [
 *   { version: 3, created_at: "2024-01-15", updated_at: "2024-01-15" },
 *   { version: 2, created_at: "2024-01-14", updated_at: "2024-01-14" },
 *   { version: 1, created_at: "2024-01-13", updated_at: "2024-01-13" }
 * ]
 */
export const getVersionHistory = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const history = await ContentModel.getVersionHistory(sectionId);

    res.json({
      success: true,
      data: history,
      count: history.length,
      message: 'Version history retrieved'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Error retrieving version history'
    });
  }
};

/**
 * API Endpoint: GET /api/section-content/search
 * Search content by a specific JSON field value
 * Useful for finding content with specific values
 * 
 * Query params:
 * - sectionId: UUID of section to search in
 * - field: JSON field path (e.g., "title", "hero.subtitle")
 * - value: Value to search for
 * 
 * Example:
 * GET /api/section-content/search?sectionId=abc&field=title&value=glow
 * → Finds all versions with title containing "glow"
 * 
 * Frontend usage: Dashboard search/filter functionality
 */
export const searchContentByField = async (req, res) => {
  try {
    const { sectionId, field, value } = req.query;

    if (!sectionId || !field || !value) {
      return res.status(400).json({
        success: false,
        error: 'sectionId, field, and value parameters are required'
      });
    }

    const results = await ContentModel.searchContentByField(sectionId, field, value);

    res.json({
      success: true,
      data: results,
      count: results.length,
      searchParams: { sectionId, field, value },
      message: 'Search results retrieved'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Error searching content'
    });
  }
};
