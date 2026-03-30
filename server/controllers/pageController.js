

import * as PageModel from '../models/pages.js';



export const getAllPages = async (req, res) => {
  try {
    const pages = await PageModel.getAllPages();
    res.json(pages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


/**
 * API Endpoint: GET /api/pages/active
 * Get only active/published pages (frontend)
 * Returns only pages with is_active = TRUE
 * 
 * Frontend usage: Website navigation, sitemap generation
 */
export const getActivePages = async (req, res) => {
  try {
    const pages = await PageModel.getActivePages();
    res.json({
      success: true,
      data: pages,
      message: 'Active pages retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Error retrieving active pages'
    });
  }
};

/**
 * API Endpoint: GET /api/pages/:id
 * Get a single page by ID
 * Used when admin wants to edit a page
 * 
 * Frontend usage: Dashboard page editor
 */
export const getPageById = async (req, res) => {
  try {
    const { id } = req.params;
    const page = await PageModel.getPageById(id);

    if (!page) {
      return res.status(404).json({
        success: false,
        error: 'Page not found'
      });
    }

    res.json({
      success: true,
      data: page
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * API Endpoint: GET /api/pages/slug/:slug
 * Get a page by its URL slug (most important for frontend)
 * This is how Next.js fetches page data by route
 * 
 * Example: /api/pages/slug/about → Returns about page data
 * 
 * Frontend usage: Next.js dynamic routes, website pages
 */
export const getPageBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const page = await PageModel.getPageBySlug(slug);

    if (!page) {
      return res.status(404).json({
        success: false,
        error: 'Page not found',
        slug: slug
      });
    }

    res.json({
      success: true,
      data: page
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * API Endpoint: POST /api/pages
 * Create a new page
 * 
 * Required body parameters:
 * {
 *   "name": "Home",           // Page display name
 *   "slug": "home",           // URL slug (must be unique)
 *   "description": "Home page",
 *   "is_active": true         // Published or draft
 * }
 * 
 * Frontend usage: Dashboard "Create New Page" button
 */
export const createPage = async (req, res) => {
  try {
    const page = await PageModel.createPage(req.body);

    res.status(201).json({
      success: true,
      data: page,
      message: 'Page created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Error creating page'
    });
  }
};

/**
 * API Endpoint: PUT /api/pages/:id
 * Update an existing page
 * 
 * Body can include any of these fields:
 * {
 *   "name": "New Name",
 *   "slug": "new-slug",
 *   "description": "Updated description",
 *   "is_active": false  // Unpublish page
 * }
 * 
 * Frontend usage: Dashboard page editor "Save" button
 */
export const updatePage = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if page exists first
    const existingPage = await PageModel.getPageById(id);
    if (!existingPage) {
      return res.status(404).json({
        success: false,
        error: 'Page not found'
      });
    }

    const page = await PageModel.updatePage(id, req.body);

    res.json({
      success: true,
      data: page,
      message: 'Page updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Error updating page'
    });
  }
};

/**
 * API Endpoint: DELETE /api/pages/:id
 * Delete a page and all its sections/content
 * 
 * ⚠️ WARNING: This cascades and deletes all sections and section_content!
 * 
 * Frontend usage: Dashboard "Delete Page" button with confirmation
 */
export const deletePage = async (req, res) => {
  try {
    const { id } = req.params;

    await PageModel.deletePage(id);

    res.json({
      success: true,
      message: 'Page deleted successfully',
      deletedPageId: id
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Error deleting page'
    });
  }
};

/**
 * API Endpoint: PATCH /api/pages/:id/toggle-active
 * Quickly publish or unpublish a page
 * 
 * Body: { "is_active": true/false }
 * 
 * Frontend usage: Dashboard publish/unpublish toggle button
 */
export const togglePageActive = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    if (is_active === undefined) {
      return res.status(400).json({
        success: false,
        error: 'is_active parameter is required'
      });
    }

    const page = await PageModel.togglePageActive(id, is_active);

    res.json({
      success: true,
      data: page,
      message: `Page ${is_active ? 'published' : 'unpublished'} successfully`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * API Endpoint: GET /api/pages/detailed/:slug
 * Get complete page with all sections and content
 * This is the MOST IMPORTANT endpoint for the frontend!
 * 
 * Returns:
 * {
 *   id: "uuid",
 *   name: "Home",
 *   slug: "home",
 *   sections: [
 *     {
 *       id: "uuid",
 *       name: "hero",
 *       order: 1,
 *       content: [{ content: { title: "...", ... } }]
 *     }
 *   ]
 * }
 * 
 * Frontend usage: Next.js pages fetch complete page structure
 * Example: /api/pages/detailed/home → Returns entire home page data
 */
export const getPageWithSectionsAndContent = async (req, res) => {
  try {
    const { slug } = req.params;
    const page = await PageModel.getPageWithSectionsAndContent(slug);

    if (!page) {
      return res.status(404).json({
        success: false,
        error: 'Page not found',
        slug: slug
      });
    }

    res.json({
      success: true,
      data: page,
      message: 'Page with sections and content retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Error retrieving page data'
    });
  }
};
