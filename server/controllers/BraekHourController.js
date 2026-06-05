import * as model from "../models/BrakeHoure.js";
import { getBookingsByDate } from "../models/booking.js";
import { DateTime } from "luxon";
import { getWorkingHoursByDay } from "../models/workingHoure.js";
import {
  getWorkingHoursOverrideByDate
} from "../models/workindhourbyDate.js";

import {
  getBreakHoursByDate
} from "../models/BrakeHoure.js";

const BUSINESS_TIME_ZONE =
  process.env.BUSINESS_TIME_ZONE || "America/Montreal";

export const getAllWorkingHours = async (req, res) => {
  try {
    const data = await model.getAllWorkingHours();
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching working hours:", error);
    res.status(500).json({
      message: "Failed to fetch working hours",
    });
  }
};

export const createWorkingHour = async (req, res) => {
  try {

    const {
      work_date,
      start_time,
      end_time,
    } = req.body;

    if (!work_date || !start_time || !end_time) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    if (end_time <= start_time) {
      return res.status(400).json({
        message: "End time must be after start time",
      });
    }

    const SLOT_DURATION =
      Number(process.env.SLOT_DURATION) || 15;

    const requestedSlots = [];

    const startMinutes = timeToMinutes(start_time);
    const endMinutes = timeToMinutes(end_time);

    if (startMinutes >= endMinutes) {
      return res.status(500).json({
        message: "Invalid working hour range",
      });
    }

    for (let m = startMinutes; m < endMinutes; m += SLOT_DURATION) {
      requestedSlots.push(minutesToTime(m));
    }

    const bookingDateTime = DateTime.fromISO(
      `${work_date}T12:00:00`,
      { zone: BUSINESS_TIME_ZONE }
    );

    const bookingDate = bookingDateTime.toISODate();

    const bookings =
      await getBookingsByDate(null, bookingDate);

    const dayOfWeek =
      bookingDateTime.weekday % 7;

    const workingHours =
      await getWorkingHoursByDay(null, dayOfWeek);

    if (!workingHours) {
      return res.status(400).json({
        message: "No working hours configured for this day",
      });
    }

    const blockedSlots = new Set();

    bookings.forEach((b) => {

      if (!["pending", "approved"].includes(b.status)) return;

      const bookingStart =
        DateTime.fromJSDate(b.booking_datetime)
          .setZone(BUSINESS_TIME_ZONE);

      const start =
        timeToMinutes(bookingStart.toFormat("HH:mm"));

      const slots =
        Math.ceil(b.duration_minutes / SLOT_DURATION);

      for (let i = 0; i < slots; i++) {
        const slot = minutesToTime(start + i * SLOT_DURATION);
        if (!blockedSlots.has(slot)) {
          blockedSlots.add(slot);
        }
      }
    });

    const invalidSlot =
      requestedSlots.find(slot => blockedSlots.has(slot));

    if (invalidSlot) {
      return res.status(400).json({
        message: `Selected range is no longer available. Slot ${invalidSlot} is already booked.`,
      });
    }

    const result =
      await model.createWorkingHour(
        work_date,
        start_time,
        end_time
      );

    res.status(201).json(result);

  } catch (error) {
    console.error("Error creating working hour:", error);
    res.status(500).json({
      message: "Failed to create working hour",
    });
  }
};

export const updateWorkingHour = async (req, res) => {
  try {

    const { id } = req.params;
    const { work_date, start_time, end_time } = req.body;

    if (!work_date || !start_time || !end_time) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    if (end_time <= start_time) {
      return res.status(400).json({
        message: "End time must be after start time",
      });
    }

    const result =
      await model.updateWorkingHour(
        id,
        work_date,
        start_time,
        end_time
      );

    if (!result) {
      return res.status(404).json({
        message: "Working hour not found",
      });
    }

    res.status(200).json(result);

  } catch (error) {
    console.error("Error updating working hour:", error);
    res.status(500).json({
      message: "Failed to update working hour",
    });
  }
};

export const deleteWorkingHour = async (req, res) => {
  try {

    const { id } = req.params;

    const result =
      await model.deleteWorkingHour(id);

    if (!result) {
      return res.status(404).json({
        message: "Working hour not found",
      });
    }

    res.status(200).json({
      message: "Working hour deleted successfully",
    });

  } catch (error) {
    console.error("Error deleting working hour:", error);
    res.status(500).json({
      message: "Failed to delete working hour",
    });
  }
};

// ==========================
// Helpers
// ==========================
function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

// ==========================
// AVAILABLE SLOTS (FIXED)
// ==========================
export async function getAvailableSlotsAdmin(req, res) {

  try {

    let { booking_datetime } = req.query;

    if (!booking_datetime) {
      return res.status(400).json({
        message: "Missing required field: booking_datetime",
        availableSlots: [],
      });
    }

    const bookingDateTime = DateTime.fromISO(
      booking_datetime,
      { setZone: true }
    ).setZone(BUSINESS_TIME_ZONE);

    if (!bookingDateTime.isValid) {
      return res.status(400).json({
        message: "Invalid booking_datetime format",
        availableSlots: [],
      });
    }

    const bookingDate = bookingDateTime.toISODate();

    const dayOfWeek = bookingDateTime.weekday % 7;

    const override =
      await getWorkingHoursOverrideByDate(bookingDate);

    let startMinutes;
    let endMinutes;

    if (override) {

      if (override.is_day_off) {
        return res.json({ availableSlots: [] });
      }

      if (!override.start_time || !override.end_time) {
        return res.status(500).json({
          message: "Invalid override configuration",
          availableSlots: [],
        });
      }

      startMinutes = timeToMinutes(override.start_time);
      endMinutes = timeToMinutes(override.end_time);

    } else {

      const workingHours =
        await getWorkingHoursByDay(null, dayOfWeek);

      if (!workingHours) {
        return res.status(400).json({
          message: "No working hours configured for this day",
          availableSlots: [],
        });
      }

      startMinutes = timeToMinutes(workingHours.start_time);
      endMinutes = timeToMinutes(workingHours.end_time);

      if (startMinutes >= endMinutes) {
        return res.status(500).json({
          message: "Invalid working hours range",
          availableSlots: [],
        });
      }
    }

    const slotDuration =
      Number(process.env.SLOT_DURATION) || 15;

    const bookings =
      await getBookingsByDate(null, bookingDate);

    const breaks =
      await getBreakHoursByDate(bookingDate);

    const blockedSlots = new Set();

    const addSlot = (slot) => blockedSlots.add(slot);

    breaks.forEach((b) => {

      const start = timeToMinutes(b.start_time);
      const end = timeToMinutes(b.end_time);

      if (start >= end) return;

      if (end <= startMinutes || start >= endMinutes) return;

      for (let m = start; m < end; m += slotDuration) {
        addSlot(minutesToTime(m));
      }
    });

    const now = DateTime.now().setZone(BUSINESS_TIME_ZONE);

    const currentDateStr = now.toISODate();
    const currentMinutes = now.hour * 60 + now.minute;

    bookings.forEach((b) => {

      if (!["pending", "approved"].includes(b.status)) return;

      const bookingStart =
        DateTime.fromJSDate(b.booking_datetime)
          .setZone(BUSINESS_TIME_ZONE);

      const start = timeToMinutes(
        bookingStart.toFormat("HH:mm")
      );

      const slots =
        Math.ceil(b.duration_minutes / slotDuration);

      for (let i = 0; i < slots; i++) {

        const slotTime = start + i * slotDuration;

        if (
          bookingDate === currentDateStr &&
          slotTime < currentMinutes
        ) continue;

        addSlot(minutesToTime(slotTime));
      }
    });

    const allSlots = [];

    for (let m = startMinutes; m < endMinutes; m += slotDuration) {
      allSlots.push(minutesToTime(m));
    }

    const finalSlots =
      allSlots.filter(slot => !blockedSlots.has(slot));

    const convertedSlots =
      finalSlots.map(slot =>
        DateTime.fromISO(`${bookingDate}T${slot}`, {
          zone: BUSINESS_TIME_ZONE,
        }).toFormat("HH:mm")
      );

    return res.json({
      availableSlots: convertedSlots,
    });

  } catch (error) {
    console.error("Available slots error:", error.message);
    return res.status(500).json({
      message: "Server error",
    });
  }
}

export const fetchBreaks = async (req, res) => {
  const { date } = req.params;

  const data = await model.getBreakHoursByDate(date);

  res.json(data);
};