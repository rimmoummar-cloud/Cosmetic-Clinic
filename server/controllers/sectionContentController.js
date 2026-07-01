

import * as ContentModel from '../models/sectionContent.js';

const parseContentBody = (body) => {
  if (typeof body.content === 'string') {
    return JSON.parse(body.content);
  }

  if (body.content && typeof body.content === 'object') {
    return body.content;
  }

  return body;
};

const setValueAtPath = (data, path, value) => {
  if (!path.length) return value;

  const [head, ...rest] = path;
  const clone = Array.isArray(data) ? [...data] : { ...data };
  clone[head] = setValueAtPath(clone[head], rest, value);
  return clone;
};


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

// export const updateContent = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { createNewVersion = true } = req.query;

//     // Verify content exists
//     const existingContent = await ContentModel.getContentById(id);
//     if (!existingContent) {
//       return res.status(404).json({
//         success: false,
//         error: 'Content not found'
//       });
//     }

//     let contentPayload = parseContentBody(req.body);

//     if (req.file) {
//    const imagePath = req.file?.path;
//       const imageFieldPath = req.body.image_path
//         ? JSON.parse(req.body.image_path)
//         : ['image'];

//       contentPayload = setValueAtPath(
//         contentPayload,
//         imageFieldPath,
//         imagePath
//       );
//     }

//     const content = await ContentModel.updateContent(
//       id,
//       contentPayload,
//       createNewVersion !== 'false'
//     );

//     res.json({
//       success: true,
//       data: content,
//       message: 'Content updated successfully',
//       newVersion: content.version,
//       versionCreated: createNewVersion !== 'false'
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: error.message,
//       message: 'Error updating content'
//     });
//   }
// };

export const updateContent = async (req, res) => {
  try {
    const { id } = req.params;
    const { createNewVersion = true } = req.query;

    // 1. check existing content
    const existingContent = await ContentModel.getContentById(id);

    if (!existingContent) {
      return res.status(404).json({
        success: false,
        error: "Content not found",
      });
    }

    // 2. parse content safely (FormData OR JSON)
    let contentPayload;

    try {
      if (typeof req.body.content === "string") {
        contentPayload = JSON.parse(req.body.content);
      } else if (req.body.content) {
        contentPayload = req.body.content;
      } else {
        contentPayload = req.body;
      }
    } catch (err) {
      contentPayload = req.body;
    }

    // 3. handle uploaded image (Cloudinary via multer)
    if (req.file) {
      const imagePath = req.file.path;

      let imageFieldPath = ["image"];

      if (req.body.image_path) {
        try {
          imageFieldPath = JSON.parse(req.body.image_path);
        } catch (err) {
          imageFieldPath = ["image"];
        }
      }

      contentPayload = setValueAtPath(
        contentPayload,
        imageFieldPath,
        imagePath
      );
    }

    // 4. create new version or update
    const content = await ContentModel.updateContent(
      id,
      contentPayload,
      createNewVersion !== "false"
    );

    // 5. response
    return res.json({
      success: true,
      data: content,
      message: "Content updated successfully",
      newVersion: content.version,
      versionCreated: createNewVersion !== "false",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      message: "Error updating content",
    });
  }
};

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
