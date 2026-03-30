

import db from '../config/db.js';

/**
 * GET ALL PAGES
 * Retrieve all pages from the database, both active and inactive
 * Used by: Dashboard to show all available pages for editing
 */
export const getAllPages = async () => {
  const res = await db.query('SELECT * FROM pages ORDER BY created_at DESC');
  return res.rows;
};

/**
 * GET ACTIVE PAGES ONLY
 * Retrieve only pages that are marked as active (is_active = TRUE)
 * Used by: Frontend website to display only published pages
 */
export const getActivePages = async () => {
  const res = await db.query(
    'SELECT * FROM pages WHERE is_active = TRUE ORDER BY created_at DESC'
  );
  return res.rows;
};

/**
 * GET PAGE BY ID
 * Retrieve a single page by its UUID
 * @param {string} id - The page UUID
 * Used by: Dashboard when editing a specific page
 */
export const getPageById = async (id) => {
  const result = await db.query(
    'SELECT * FROM pages WHERE id = $1',
    [id]
  );
  return result.rows[0];
};

/**
 * GET PAGE BY SLUG
 * Retrieve a single page by its URL slug (most common used by frontend)
 * @param {string} slug - The page slug (e.g., "home", "about")
 * Used by: Frontend Next.js pages to fetch page data dynamically
 * Example: /about → fetch page with slug "about"
 */
export const getPageBySlug = async (slug) => {
  const result = await db.query(
    'SELECT * FROM pages WHERE slug = $1',
    [slug]
  );
  return result.rows[0];
};

/**
 * CREATE NEW PAGE
 * Insert a new page into the database
 * @param {object} data - Page data object
 *   - data.name: (required) Page name (e.g., "Home")
 *   - data.slug: (required) URL slug (e.g., "home")
 *   - data.description: (optional) Page metadata/description
 *   - data.is_active: (optional, default true) Whether page is published
 * Used by: Dashboard "Create New Page" button
 */
export const createPage = async (data) => {
  const { name, slug, description, is_active = true } = data;

  // Validate required fields
  if (!name || !slug) {
    throw new Error('Page name and slug are required');
  }

  const result = await db.query(
    `INSERT INTO pages (name, slug, description, is_active)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [name, slug, description, is_active]
  );

  return result.rows[0];
};

/**
 * UPDATE PAGE
 * Update an existing page's information
 * @param {string} id - The page UUID to update
 * @param {object} data - Fields to update (name, slug, description, is_active)
 * Used by: Dashboard when user saves changes to a page
 */
export const updatePage = async (id, data) => {
  const { name, slug, description, is_active } = data;

  // Build dynamic query to only update provided fields
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
  if (description !== undefined) {
    fields.push(`description = $${paramCount}`);
    values.push(description);
    paramCount++;
  }
  if (is_active !== undefined) {
    fields.push(`is_active = $${paramCount}`);
    values.push(is_active);
    paramCount++;
  }

  // Always update the updated_at timestamp
  fields.push(`updated_at = NOW()`);

  // Add id to values at the end
  values.push(id);

  const query = `UPDATE pages SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;

  const result = await db.query(query, values);
  return result.rows[0];
};

/**
 * DELETE PAGE
 * Remove a page and all its sections/content (CASCADE delete)
 * @param {string} id - The page UUID to delete
 * Used by: Dashboard "Delete Page" button
 * WARNING: This will also delete all sections and section_content for this page
 */
export const deletePage = async (id) => {
  const result = await db.query(
    'DELETE FROM pages WHERE id = $1 RETURNING id',
    [id]
  );

  if (result.rows.length === 0) {
    throw new Error('Page not found');
  }

  return result.rows[0];
};

/**
 * TOGGLE PAGE ACTIVE STATUS
 * Quickly publish/unpublish a page without changing other data
 * @param {string} id - The page UUID
 * @param {boolean} isActive - New active status
 * Used by: Dashboard publish/unpublish toggle button
 */
export const togglePageActive = async (id, isActive) => {
  const result = await db.query(
    `UPDATE pages SET is_active = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
    [isActive, id]
  );

  return result.rows[0];
};

/**
 * GET PAGE WITH ALL SECTIONS AND CONTENT
 * Complex query that retrieves a complete page with all its sections and content
 * This is the most important function for the frontend
 * @param {string} slug - The page slug
 * Used by: Frontend to fetch entire page structure in one query
 * Returns: { page, sections: [ { section, content } ] }
 */
export const getPageWithSectionsAndContent = async (slug) => {
  const result = await db.query(
    `SELECT 
       p.id as page_id,
       p.name as page_name,
       p.slug,
       p.description as page_description,
       p.is_active,
       p.created_at,
       p.updated_at,
       s.id as section_id,
       s.name as section_name,
       s.slug as section_slug,
       s.section_order,
       sc.id as content_id,
       sc.content,
       sc.version
     FROM pages p
     LEFT JOIN sections s ON p.id = s.page_id AND s.is_active = TRUE
     LEFT JOIN section_content sc ON s.id = sc.section_id
     WHERE p.slug = $1 AND p.is_active = TRUE
     ORDER BY s.section_order ASC`,
    [slug]
  );

  if (result.rows.length === 0) {
    return null;
  }

  // Transform flat result into nested structure
  const page = {
    id: result.rows[0].page_id,
    name: result.rows[0].page_name,
    slug: result.rows[0].slug,
    description: result.rows[0].page_description,
    is_active: result.rows[0].is_active,
    created_at: result.rows[0].created_at,
    updated_at: result.rows[0].updated_at,
    sections: []
  };

  const sections = {};

  // Group sections and content
  result.rows.forEach(row => {
    if (row.section_id && !sections[row.section_id]) {
      sections[row.section_id] = {
        id: row.section_id,
        name: row.section_name,
        slug: row.section_slug,
        order: row.section_order,
        content: []
      };
    }

    if (row.section_id && row.content_id) {
      sections[row.section_id].content.push({
        id: row.content_id,
        content: row.content,
        version: row.version
      });
    }
  });

  page.sections = Object.values(sections).sort((a, b) => a.order - b.order);

  return page;
};
