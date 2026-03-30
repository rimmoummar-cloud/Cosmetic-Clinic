/**
 * =====================================================
 * SECTIONS MODEL
 * =====================================================
 * 
 * This file contains all database queries for the SECTIONS table.
 * 
 * A "Section" is a part of a Page (like Hero, Benefits, Testimonials, etc.)
 * Sections are the building blocks that make up a page.
 * 
 * Each section has:
 * - id: Unique identifier (UUID)
 * - page_id: Foreign key linking to the parent page
 * - name: Section type/name (e.g., "hero", "services_preview")
 * - slug: URL-friendly version (used for CSS or targeting)
 * - section_order: Number determining display order on page (1, 2, 3...)
 * - is_active: Boolean to show/hide this section
 * - created_at & updated_at: Timestamps
 * 
 * Hierarchy: Page → Sections → Section Content
 * A page "Home" might have sections: [Hero (order 1), Services (order 2), Testimonials (order 3)]
 * =====================================================
 */

import db from '../config/db.js';

/**
 * GET ALL SECTIONS
 * Retrieve all sections from the database
 * Used by: Dashboard to show all available sections
 */
export const getAllSections = async () => {
  const res = await db.query(
    'SELECT * FROM sections ORDER BY section_order ASC'
  );
  return res.rows;
};

/**
 * GET SECTIONS BY PAGE ID
 * Retrieve all sections belonging to a specific page
 * @param {string} pageId - The page UUID
 * Used by: Dashboard when editing a page, frontend to get page structure
 */
export const getSectionsByPageId = async (pageId) => {
  const res = await db.query(
    `SELECT * FROM sections 
     WHERE page_id = $1 
     ORDER BY section_order ASC`,
    [pageId]
  );
  return res.rows;
};

/**
 * GET ACTIVE SECTIONS BY PAGE ID
 * Retrieve only active sections belonging to a specific page
 * @param {string} pageId - The page UUID
 * Used by: Frontend to display only published sections on website
 */
export const getActiveSectionsByPageId = async (pageId) => {
  const res = await db.query(
    `SELECT * FROM sections 
     WHERE page_id = $1 AND is_active = TRUE
     ORDER BY section_order ASC`,
    [pageId]
  );
  return res.rows;
};

/**
 * GET SECTION BY ID
 * Retrieve a single section by its UUID
 * @param {string} id - The section UUID
 * Used by: Dashboard when editing a specific section
 */
export const getSectionById = async (id) => {
  const result = await db.query(
    'SELECT * FROM sections WHERE id = $1',
    [id]
  );
  return result.rows[0];
};

/**
 * CREATE NEW SECTION
 * Insert a new section into a page
 * @param {object} data - Section data object
 *   - data.page_id: (required) UUID of parent page
 *   - data.name: (required) Section name (e.g., "hero", "testimonials")
 *   - data.slug: (optional) URL-friendly slug
 *   - data.section_order: (optional, default 1) Order number on page
 *   - data.is_active: (optional, default true) Whether section is published
 * Used by: Dashboard "Add Section to Page" button
 */
export const createSection = async (data) => {
  const { page_id, name, slug, section_order = 1, is_active = true } = data;

  if (!page_id || !name) {
    throw new Error('Page ID and section name are required');
  }

  const result = await db.query(
    `INSERT INTO sections (page_id, name, slug, section_order, is_active)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [page_id, name, slug, section_order, is_active]
  );

  return result.rows[0];
};

/**
 * UPDATE SECTION
 * Update an existing section's information
 * @param {string} id - The section UUID to update
 * @param {object} data - Fields to update (name, slug, section_order, is_active)
 * Used by: Dashboard when user saves section changes
 */
export const updateSection = async (id, data) => {
  const { name, slug, section_order, is_active } = data;

  const fields = [];
  const values = [];
  let paramCount = 1;

  if (name !== undefined) {
    fields.push(`name = $${paramCount}`);
    values.push(name);
    paramCount++;
  }
  if (slug !== undefined) {
    fields.push(`slug = $${paramCount}`);
    values.push(slug);
    paramCount++;
  }
  if (section_order !== undefined) {
    fields.push(`section_order = $${paramCount}`);
    values.push(section_order);
    paramCount++;
  }
  if (is_active !== undefined) {
    fields.push(`is_active = $${paramCount}`);
    values.push(is_active);
    paramCount++;
  }

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const query = `UPDATE sections SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;

  const result = await db.query(query, values);
  return result.rows[0];
};

/**
 * DELETE SECTION
 * Remove a section and all its content (CASCADE delete)
 * @param {string} id - The section UUID to delete
 * Used by: Dashboard "Delete Section" button
 * WARNING: This will also delete all section_content for this section
 */
export const deleteSection = async (id) => {
  const result = await db.query(
    'DELETE FROM sections WHERE id = $1 RETURNING id',
    [id]
  );

  if (result.rows.length === 0) {
    throw new Error('Section not found');
  }

  return result.rows[0];
};

/**
 * REORDER SECTIONS
 * Move a section to a different position within its page
 * @param {string} id - The section UUID to move
 * @param {number} newOrder - The new section order number
 * Used by: Dashboard drag-and-drop section reordering
 */
export const reorderSection = async (id, newOrder) => {
  const result = await db.query(
    `UPDATE sections 
     SET section_order = $1, updated_at = NOW() 
     WHERE id = $2 
     RETURNING *`,
    [newOrder, id]
  );

  return result.rows[0];
};

/**
 * TOGGLE SECTION ACTIVE STATUS
 * Quickly publish/unpublish a section
 * @param {string} id - The section UUID
 * @param {boolean} isActive - New active status
 * Used by: Dashboard publish/unpublish toggle
 */
export const toggleSectionActive = async (id, isActive) => {
  const result = await db.query(
    `UPDATE sections 
     SET is_active = $1, updated_at = NOW() 
     WHERE id = $2 
     RETURNING *`,
    [isActive, id]
  );

  return result.rows[0];
};

/**
 * GET SECTION WITH CONTENT
 * Retrieve a section with all its content entries
 * @param {string} id - The section UUID
 * Used by: Dashboard to see section and its content together
 */
export const getSectionWithContent = async (id) => {
  const result = await db.query(
    `SELECT 
       s.id,
       s.page_id,
       s.name,
       s.slug,
       s.section_order,
       s.is_active,
       s.created_at,
       s.updated_at,
       sc.id as content_id,
       sc.content,
       sc.version
     FROM sections s
     LEFT JOIN section_content sc ON s.id = sc.section_id
     WHERE s.id = $1
     ORDER BY sc.version DESC`,
    [id]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const section = {
    id: result.rows[0].id,
    page_id: result.rows[0].page_id,
    name: result.rows[0].name,
    slug: result.rows[0].slug,
    section_order: result.rows[0].section_order,
    is_active: result.rows[0].is_active,
    created_at: result.rows[0].created_at,
    updated_at: result.rows[0].updated_at,
    content: result.rows
      .filter(row => row.content_id)
      .map(row => ({
        id: row.content_id,
        content: row.content,
        version: row.version
      }))
  };

  return section;
};
