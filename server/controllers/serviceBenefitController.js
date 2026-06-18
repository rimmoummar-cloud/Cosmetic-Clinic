import ServiceBenefitModel from "../models/serviceBenefitModel.js";

export const getByServiceId = async (req, res) => {
  try {
    const { serviceId } = req.params;

    const benefits = await ServiceBenefitModel.getByServiceId(serviceId);

    res.json({
      success: true,
      data: benefits,
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
    const benefit = await ServiceBenefitModel.create(req.body);

    res.status(201).json({
      success: true,
      data: benefit,
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

    const benefit = await ServiceBenefitModel.update(id, req.body);

    res.json({
      success: true,
      data: benefit,
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

    await ServiceBenefitModel.delete(id);

    res.json({
      success: true,
      message: "Service benefit deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};