import * as workhour from "../models/workingHoure.js";

export const getAllWorkingHour = async (req, res) => {
  const service = await workhour.getWorkingHours();
  res.json(service);
};

export const createWorkingHour = async (req, res) => {
  const service = await workhour.createWorkTime(req.body);
  res.json(service);
};

export const getWorkingHourByDay = async (req, res) => {
  try {
    const dayOfWeek = Number(req.params.dayOfWeek);

    if (Number.isNaN(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) {
      return res.status(400).json({ message: "Invalid dayOfWeek" });
    }

    const workingHours = await workhour.getWorkingHoursByDay(null, dayOfWeek);

    if (!workingHours) {
      return res.status(404).json({ message: "No working hours found" });
    }

    res.status(200).json(workingHours);
  } catch (error) {
    console.error("Error fetching working hours:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateWorkingHour = async (req, res) => {
  const service = await workhour.updateWorkingHoure(req.params.id, req.body);
  res.json(service);
};

export const deleteWorkingHour = async (req, res) => {
  await workhour.deleteWorkingHoure(req.params.id);
  res.json({ message: "service deleted" });
};