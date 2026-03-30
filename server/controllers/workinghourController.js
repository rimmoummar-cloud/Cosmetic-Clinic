import * as workhour from "../models/workingHoure.js";






export const getAllWorkingHour = async (req, res) => {
  const service = await workhour.getWorkingHours();
  res.json(service);
};

export const createWorkingHour = async (req, res) => {
  const service = await workhour.createWorkTime(req.body);
  res.json(service);
};

export const updateWorkingHour = async (req, res) => {
  const service = await workhour.updateWorkingHoure(
    req.params.id,
    req.body
  );
  res.json(service);
};

export const deleteWorkingHour = async (req, res) => {
  await workhour.deleteWorkingHoure(req.params.id);
  res.json({ message: "service deleted" });
};