import * as workhour from "../models/workingHoure.js";

export const getAllWorkingHour = async (req, res) => {
  const service = await workhour.getWorkingHours();
  res.json(service);
};

// export const createWorkingHour = async (req, res) => {
//   const service = await workhour.createWorkTime(req.body);
//   res.json(service);
// };

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
  try {
    const { id } = req.params;
    const { start_time, end_time } = req.body;

    if (!start_time || !end_time) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

   const start = new Date(`1970-01-01T${start_time}`);
const end = new Date(`1970-01-01T${end_time}`);

if (end <= start) {
  return res.status(400).json({
    message: "End time must be after start time",
  });
}

    const result = await workhour.updateWorkingHoure(id, {
      start_time,
      end_time,
    });

    if (!result) {
      return res.status(404).json({
        message: "Working hour not found",
      });
    }

    res.status(200).json(result);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// export const deleteWorkingHour = async (req, res) => {
//   await workhour.deleteWorkingHoure(req.params.id);
//   res.json({ message: "service deleted" });
// };