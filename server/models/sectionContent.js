/**
 * =====================================================
 * SECTION CONTENT MODEL
 * =====================================================
 * 
 * This file contains all database queries for the SECTION_CONTENT table.
 * 
 * "Section Content" is the actual data/content that fills a section.
 * It stores flexible JSON data that can represent any type of content.
 * 
 * Each section_content has:
 * - id: Unique identifier (UUID)
 * - section_id: Foreign key linking to the parent section
 * - content: JSONB column storing flexible data (title, description, images, etc.)
 * - version: Version number for content versioning/history
 * - created_at & updated_at: Timestamps
 * 
 * Example Hero Section Content (stored as JSON):
 * {
 *   "title": "Reveal Your Natural Glow",
 *   "subtitle": "Premium Beauty Treatments",
 *   "description": "Experience luxury beauty treatments...",
 *   "buttonText": "Book Now",
 *   "image": "https://example.com/image.jpg"
 * }
 * 
 * This flexible JSON approach allows any type of content without schema changes.
 * Hierarchy: Page → Sections → Section Content
 * =====================================================
 */

import db from '../config/db.js';

/**
 * GET CONTENT BY SECTION ID
 * Retrieve all content versions for a specific section
 * @param {string} sectionId - The section UUID
 * Used by: Dashboard to view all content versions for a section
 */
export const getContentBySectionId = async (sectionId) => {
  const res = await db.query(
    `SELECT * FROM section_content 
     WHERE section_id = $1 
     ORDER BY version DESC`,
    [sectionId]
  );
  return res.rows;
};

/**
 * GET LATEST CONTENT BY SECTION ID
 * Retrieve only the latest/current content for a section
 * @param {string} sectionId - The section UUID
 * Used by: Frontend to display current section content
 */
export const getLatestContentBySectionId = async (sectionId) => {
  const result = await db.query(
    `SELECT * FROM section_content 
     WHERE section_id = $1 
     ORDER BY version DESC 
     LIMIT 1`,
    [sectionId]
  );
  return result.rows[0];
};

/**
 * GET CONTENT BY ID
 * Retrieve a specific content entry by its UUID
 * @param {string} id - The content UUID
 * Used by: Dashboard when editing a specific content version
 */
export const getContentById = async (id) => {
  const result = await db.query(
    'SELECT * FROM section_content WHERE id = $1',
    [id]
  );
  return result.rows[0];
};

/**
 * CREATE NEW CONTENT
 * Insert new content for a section
 * The content is stored as JSONB, allowing flexible data structure
 * @param {object} data - Content data object
 *   - data.section_id: (required) UUID of parent section
 *   - data.content: (required) JSON object with content data
 *   - data.version: (optional) Version number (auto-calculated if not provided)
 * 
 * Example usage:
 * createContent({
 *   section_id: "abc-123",
 *   content: {
 *     title: "Reveal Your Natural Glow",
 *     description: "Experience luxury treatments",
 *     image: "https://example.com/img.jpg"
 *   }
 * })
 */
export const createContent = async (data) => {
  const { section_id, content, version } = data;

  if (!section_id || !content) {
    throw new Error('Section ID and content are required');
  }

  // If no version provided, get next version number
  let nextVersion = version;
  if (!nextVersion) {
    const versionResult = await db.query(
      'SELECT MAX(version) as max_version FROM section_content WHERE section_id = $1',
      [section_id]
    );
    nextVersion = (versionResult.rows[0]?.max_version || 0) + 1;
  }

  const result = await db.query(
    `INSERT INTO section_content (section_id, content, version)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [section_id, JSON.stringify(content), nextVersion]
  );

  return result.rows[0];
};

/**
 * UPDATE CONTENT
 * Update an existing content entry
 * Creates a new version instead of modifying the old one (versioning)
 * @param {string} id - The content UUID to update
 * @param {object} contentData - New content object (will be merged or replaced)
 * @param {boolean} createNewVersion - If true, creates new version instead of updating
 * 
 * Used by: Dashboard "Save Content" button
 * Best practice: Always create new version to maintain history
 */
export const updateContent = async (id, contentData, createNewVersion = true) => {
  if (createNewVersion) {
    // Get current content to increment version
    const currentContent = await getContentById(id);
    if (!currentContent) {
      throw new Error('Content not found');
    }

    const nextVersion = currentContent.version + 1;

    const result = await db.query(
      `INSERT INTO section_content (section_id, content, version)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [currentContent.section_id, JSON.stringify(contentData), nextVersion]
    );

    return result.rows[0];
  } else {
    // Update in place (not recommended)
    const result = await db.query(
      `UPDATE section_content 
       SET content = $1, updated_at = NOW()
       WHERE id = $2 
       RETURNING *`,
      [JSON.stringify(contentData), id]
    );

    return result.rows[0];
  }
};

/**
 * DELETE CONTENT
 * Remove a specific content entry
 * @param {string} id - The content UUID to delete
 * Used by: Dashboard "Delete Content Version" feature
 */
export const deleteContent = async (id) => {
  const result = await db.query(
    'DELETE FROM section_content WHERE id = $1 RETURNING id',
    [id]
  );

  if (result.rows.length === 0) {
    throw new Error('Content not found');
  }

  return result.rows[0];
};

/**
 * DELETE ALL CONTENT FOR SECTION
 * Remove all versions of content for a section
 * @param {string} sectionId - The section UUID
 * Used by: When permanently deleting a section
 */
export const deleteAllContentBySection = async (sectionId) => {
  const result = await db.query(
    'DELETE FROM section_content WHERE section_id = $1 RETURNING *',
    [sectionId]
  );

  return result.rows;
};

/**
 * REVERT TO PREVIOUS VERSION
 * Restore content to a previous version
 * Creates new version with same content as old version
 * @param {string} sectionId - The section UUID
 * @param {number} versionNumber - The version to restore to
 * 
 * Used by: Dashboard "Revert to Version" feature
 * Example: Revert hero section to version 1 if latest version is bad
 */
export const revertToPreviousVersion = async (sectionId, versionNumber) => {
  // Get the content from specified version
  const previousContent = await db.query(
    `SELECT * FROM section_content 
     WHERE section_id = $1 AND version = $2`,
    [sectionId, versionNumber]
  );

  if (previousContent.rows.length === 0) {
    throw new Error('Version not found');
  }

  const oldContent = previousContent.rows[0];

  // Get max version to create next version
  const maxVersion = await db.query(
    'SELECT MAX(version) as max_version FROM section_content WHERE section_id = $1',
    [sectionId]
  );

  const nextVersion = (maxVersion.rows[0]?.max_version || 0) + 1;

  // Create new version with old content
  const result = await db.query(
    `INSERT INTO section_content (section_id, content, version)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [sectionId, oldContent.content, nextVersion]
  );

  return result.rows[0];
};

/**
 * SEARCH CONTENT BY JSON FIELD
 * Search for content entries where a JSON field matches a value
 * Example: Find all hero sections with title "Reveal Your Glow"
 * @param {string} sectionId - The section to search in
 * @param {string} fieldPath - JSON path (e.g., "title", "data.description")
 * @param {string} searchValue - Value to search for
 * 
 * Used by: Dashboard search/filter functionality
 */
export const searchContentByField = async (sectionId, fieldPath, searchValue) => {
  const result = await db.query(
    `SELECT * FROM section_content 
     WHERE section_id = $1 
     AND content->>'${fieldPath}' ILIKE $2
     ORDER BY version DESC`,
    [sectionId, `%${searchValue}%`]
  );

  return result.rows;
};

/**
 * GET VERSION HISTORY
 * Retrieve all versions of content for a section with timestamps
 * Used by: Dashboard version history/timeline view
 * @param {string} sectionId - The section UUID
 */
export const getVersionHistory = async (sectionId) => {
  const result = await db.query(
    `SELECT id, version, created_at, updated_at 
     FROM section_content 
     WHERE section_id = $1 
     ORDER BY version DESC`,
    [sectionId]
  );

  return result.rows;
};
