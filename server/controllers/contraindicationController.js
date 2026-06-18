import ContraindicationModel from "../models/contraindicationModel.js";

export const getByServiceId = async (req, res) => {
  try {
    const { serviceId } = req.params;

    const data = await ContraindicationModel.getByServiceId(serviceId);

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const create = async (req, res) => {
  try {
    const item = await ContraindicationModel.create(req.body);

    res.status(201).json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const update = async (req, res) => {
  try {
    const item = await ContraindicationModel.update(req.params.id, req.body);

    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteItem = async (req, res) => {
  try {
    await ContraindicationModel.delete(req.params.id);

    res.json({ success: true, message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};