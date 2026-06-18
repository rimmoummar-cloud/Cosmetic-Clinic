import RelatedServiceModel from "../models/relatedServiceModel.js";

export const getByServiceId = async (req, res) => {
  try {
    const { serviceId } = req.params;

    const data = await RelatedServiceModel.getByServiceId(serviceId);

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const create = async (req, res) => {
  try {
    const item = await RelatedServiceModel.create(req.body);

    res.status(201).json({
      success: true,
      data: item,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const deleteItem = async (req, res) => {
  try {
    const { serviceId, relatedId } = req.params;

    await RelatedServiceModel.delete(serviceId, relatedId);

    res.json({
      success: true,
      message: "Deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};