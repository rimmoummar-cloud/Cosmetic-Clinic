import ServiceFaqModel from "../models/serviceFaqModel.js";

export const getByServiceId = async (req, res) => {
  try {
    const { serviceId } = req.params;

    const faqs = await ServiceFaqModel.getByServiceId(serviceId);

    res.json({
      success: true,
      data: faqs,
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
    const faq = await ServiceFaqModel.create(req.body);

    res.status(201).json({
      success: true,
      data: faq,
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

    const faq = await ServiceFaqModel.update(id, req.body);

    res.json({
      success: true,
      data: faq,
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

    await ServiceFaqModel.delete(id);

    res.json({
      success: true,
      message: "FAQ deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};