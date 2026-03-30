/**
 * =====================================================
 * SECTIONS CONTROLLER
 * =====================================================
 * 
 * This file contains all API endpoint handlers for sections.
 * Sections are parts of a page (Hero, Services, Testimonials, etc.)
 * 
 * The controller layer:
 * 1. Receives HTTP requests
 * 2. Validates request parameters
 * 3. Calls model functions for database operations
 * 4. Returns JSON responses with data
 * 
 * Used by: Dashboard section management, frontend rendering
 * =====================================================
 */

import * as SectionModel from '../models/sections.js';

/**
 * API Endpoint: GET /api/sections
 * Get all sections from all pages
 * 
 * Frontend usage: Dashboard view all sections
 */
export const getAllSections = async (req, res) => {
  try {
    const sections = await SectionModel.getAllSections();
    res.json({
      success: true,
      data: sections,
      count: sections.length,
      message: 'All sections retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Error retrieving sections'
    });
  }
};

/**
 * API Endpoint: GET /api/sections/page/:pageId
 * Get all sections belonging to a specific page
 * Returns sections ordered by section_order (1, 2, 3...)
 * 
 * Frontend usage: Dashboard page editor, frontend page rendering
 */
export const getSectionsByPageId = async (req, res) => {
  try {
    const { pageId } = req.params;
    const sections = await SectionModel.getSectionsByPageId(pageId);

    res.json({
      success: true,
      data: sections,
      count: sections.length,
      pageId: pageId,
      message: 'Sections retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Error retrieving sections'
    });
  }
};

/**
 * API Endpoint: GET /api/sections/page/:pageId/active
 * Get only active sections for a page
 * Used by frontend to display only published sections
 * 
 * Frontend usage: Website rendering active sections only
 */
export const getActiveSectionsByPageId = async (req, res) => {
  try {
    const { pageId } = req.params;
    const sections = await SectionModel.getActiveSectionsByPageId(pageId);

    res.json({
      success: true,
      data: sections,
      count: sections.length,
      pageId: pageId,
      message: 'Active sections retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Error retrieving active sections'
    });
  }
};

/**
 * API Endpoint: GET /api/sections/:id
 * Get a single section by ID
 * 
 * Frontend usage: Dashboard section editor
 */
export const getSectionById = async (req, res) => {
  try {
    const { id } = req.params;
    const section = await SectionModel.getSectionById(id);

    if (!section) {
      return res.status(404).json({
        success: false,
        error: 'Section not found'
      });
    }

    res.json({
      success: true,
      data: section
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * API Endpoint: POST /api/sections
 * Create a new section within a page
 * 
 * Required body:
 * {
 *   "page_id": "uuid-of-page",
 *   "name": "hero",                    // Section type
 *   "slug": "hero-section",            // Optional
 *   "section_order": 1,                // Order on page (1, 2, 3...)
 *   "is_active": true                  // Published
 * }
 * 
 * Frontend usage: Dashboard "Add New Section" button
 */
export const createSection = async (req, res) => {
  try {
    const section = await SectionModel.createSection(req.body);

    res.status(201).json({
      success: true,
      data: section,
      message: 'Section created successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
      message: 'Error creating section'
    });
  }
};

/**
 * API Endpoint: PUT /api/sections/:id
 * Update an existing section
 * 
 * Body can include:
 * {
 *   "name": "updated-hero",
 *   "slug": "hero-updated",
 *   "section_order": 2,
 *   "is_active": false
 * }
 * 
 * Frontend usage: Dashboard section editor "Save" button
 */
export const updateSection = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify section exists
    const existingSection = await SectionModel.getSectionById(id);
    if (!existingSection) {
      return res.status(404).json({
        success: false,
        error: 'Section not found'
      });
    }

    const section = await SectionModel.updateSection(id, req.body);

    res.json({
      success: true,
      data: section,
      message: 'Section updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Error updating section'
    });
  }
};

/**
 * API Endpoint: DELETE /api/sections/:id
 * Delete a section and all its content
 * 
 * ⚠️ WARNING: This cascades and deletes all section_content!
 * 
 * Frontend usage: Dashboard "Delete Section" with confirmation
 */
export const deleteSection = async (req, res) => {
  try {
    const { id } = req.params;

    await SectionModel.deleteSection(id);

    res.json({
      success: true,
      message: 'Section deleted successfully',
      deletedSectionId: id
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Error deleting section'
    });
  }
};

/**
 * API Endpoint: PATCH /api/sections/:id/reorder
 * Change the order position of a section within its page
 * Used for drag-and-drop reordering
 * 
 * Body: { "section_order": 2 }
 * 
 * Frontend usage: Dashboard drag-and-drop section ordering
 */
export const reorderSection = async (req, res) => {
  try {
    const { id } = req.params;
    const { section_order } = req.body;

    if (section_order === undefined) {
      return res.status(400).json({
        success: false,
        error: 'section_order is required'
      });
    }

    const section = await SectionModel.reorderSection(id, section_order);

    res.json({
      success: true,
      data: section,
      message: 'Section reordered successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * API Endpoint: PATCH /api/sections/:id/toggle-active
 * Quickly publish or unpublish a section
 * 
 * Body: { "is_active": true/false }
 * 
 * Frontend usage: Dashboard section publish/unpublish toggle
 */
export const toggleSectionActive = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    if (is_active === undefined) {
      return res.status(400).json({
        success: false,
        error: 'is_active parameter is required'
      });
    }

    const section = await SectionModel.toggleSectionActive(id, is_active);

    res.json({
      success: true,
      data: section,
      message: `Section ${is_active ? 'published' : 'unpublished'} successfully`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * API Endpoint: GET /api/sections/:id/with-content
 * Get a section with all its content entries
 * Shows the section structure and all content versions
 * 
 * Frontend usage: Dashboard section editor with content history
 */
export const getSectionWithContent = async (req, res) => {
  try {
    const { id } = req.params;
    const section = await SectionModel.getSectionWithContent(id);

    if (!section) {
      return res.status(404).json({
        success: false,
        error: 'Section not found'
      });
    }

    res.json({
      success: true,
      data: section,
      contentCount: section.content?.length || 0,
      message: 'Section with content retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Error retrieving section'
    });
  }
};
