import * as model from "../models/workindhourbyDate.js";


// ===== OVERRIDES =====
export const getOverride = async (req, res) => {
  const data = await model.getOverrideByDate(req.params.date);
  res.json(data);
};

export const createOverride = async (req, res) => {
  const data = await model.createOverride(req.body);
  res.json(data);
};

export const updateOverride = async (req, res) => {
  const data = await model.updateOverride(req.params.id, req.body);
  res.json(data);
};

export const deleteOverride = async (req, res) => {
  await model.deleteOverride(req.params.id);
  res.json({ message: "deleted" });
};