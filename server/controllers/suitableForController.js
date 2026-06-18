import SuitableForModel from "../models/suitableForModel.js";

export const getByServiceId = async (req, res) => {
  try {
    const { serviceId } = req.params;

    const items = await SuitableForModel.getByServiceId(serviceId);

    res.json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const create = async (req, res) => {
  try {
    const item = await SuitableForModel.create(req.body);

    res.status(201).json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const update = async (req, res) => {
  try {
    const item = await SuitableForModel.update(req.params.id, req.body);

    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteItem = async (req, res) => {
  try {
    await SuitableForModel.delete(req.params.id);

    res.json({ success: true, message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};