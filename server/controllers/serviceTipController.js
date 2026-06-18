import ServiceTipModel from "../models/serviceTipModel.js";

export const getByServiceId = async (req, res) => {
  try {
    const { serviceId } = req.params;

    const tips = await ServiceTipModel.getByServiceId(serviceId);

    res.json({
      success: true,
      data: tips,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getByType = async (req, res) => {
  try {
    const { serviceId, type } = req.params;

    const tips = await ServiceTipModel.getByType(serviceId, type);

    res.json({
      success: true,
      data: tips,
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
    const tip = await ServiceTipModel.create(req.body);

    res.status(201).json({
      success: true,
      data: tip,
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

    const tip = await ServiceTipModel.update(id, req.body);

    res.json({
      success: true,
      data: tip,
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

    await ServiceTipModel.delete(id);

    res.json({
      success: true,
      message: "Service tip deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};