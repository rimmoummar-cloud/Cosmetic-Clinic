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


export const getUpcomingWorkingHours = async (req, res) => {
  try {
    const data = await model.getUpcomingWorkingHours();

    res.status(200).json(data);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch upcoming working hours",
    });
  }
};

export const getOverrideByDates = async (req, res) => {
  try {
    const data = await model.checkOverrideDates(req.params.date);    
    res.status(200).json(data);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch working hours override for the date",
    });
  }
};

