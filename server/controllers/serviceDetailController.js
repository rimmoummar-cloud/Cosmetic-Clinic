import ServiceDetailModel from "../models/serviceDetailModel.js";

export const getByServiceId = async (req, res) => {
  try {
    const { serviceId } = req.params;

    const detail = await ServiceDetailModel.getByServiceId(serviceId);

    if (!detail) {
      return res.status(404).json({
        success: false,
        message: "Service details not found",
      });
    }

    res.json({
      success: true,
      data: detail,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const create = async (req, res) => {
  try {
    const detail = await ServiceDetailModel.create(req.body);

    res.status(201).json({
      success: true,
      data: detail,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const update = async (req, res) => {
  try {
    const { id } = req.params;

    const detail = await ServiceDetailModel.update(id, req.body);

    res.json({
      success: true,
      data: detail,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;

    await ServiceDetailModel.delete(id);

    res.json({
      success: true,
      message: "Service detail deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};