import {
  createServiceSection,
  updateServiceSection,
  getServiceSections,
} from "../models/serviceSections.js";

export const createServiceSectionController = async (req, res) => {
  try {
    const { service_id, section_key, is_enabled } = req.body;

    if (!service_id || !section_key) {
      return res.status(400).json({
        message: "service_id and section_key are required",
      });
    }

    const section = await createServiceSection({
      serviceId: service_id,
      sectionKey: section_key,
      isEnabled:
        typeof is_enabled === "boolean"
          ? is_enabled
          : true,
    });

    return res.status(201).json({
      message: "Service section created successfully",
      data: section,
    });
  } catch (error) {
    console.error("Create service section error:", error);

    return res.status(400).json({
      message: error.message || "Unable to create service section",
    });
  }
};

export const updateServiceSectionController = async (req, res) => {
  try {
    const { service_id, section_key } = req.params;
    const { is_enabled } = req.body;

    if (typeof is_enabled !== "boolean") {
      return res.status(400).json({
        message: "is_enabled must be a boolean",
      });
    }

    const section = await updateServiceSection({
      serviceId: service_id,
      sectionKey: section_key,
      isEnabled: is_enabled,
    });

    return res.status(200).json({
      message: "Service section updated successfully",
      data: section,
    });
  } catch (error) {
    console.error("Update service section error:", error);

    return res.status(400).json({
      message: error.message || "Unable to update service section",
    });
  }
};

export const getServiceSectionsController = async (req, res) => {
  try {
    const { service_id } = req.params;

    const sections = await getServiceSections(service_id);

    return res.status(200).json({
      data: sections,
    });
  } catch (error) {
    console.error("Get service sections error:", error);

    return res.status(400).json({
      message: error.message || "Unable to load service sections",
    });
  }
};