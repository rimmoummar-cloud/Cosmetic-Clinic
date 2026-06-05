import * as model from "../models/workindhourbyDate.js";

import { getBookingsByDate } from "../models/booking.js";
import { DateTime } from "luxon";

const BUSINESS_TIME_ZONE =
  process.env.BUSINESS_TIME_ZONE || "America/Montreal";

function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}



const validateBookingsAgainstOverride = async (
  work_date,
  start_time,
  end_time,
  is_day_off
) => {

  const bookings =
    await getBookingsByDate(
      null,
      work_date
    );

  // ===== DAY OFF CHECK =====
  if (is_day_off) {

    const booking =
      bookings.find(b =>
        ["pending", "approved"]
        .includes(b.status)
      );

    if (booking) {

      const bookingStart =
        DateTime.fromJSDate(
          booking.booking_datetime
        ).setZone(BUSINESS_TIME_ZONE);

      throw new Error(
        `Cannot mark day off. Booking exists at ${bookingStart.toFormat("HH:mm")}`
      );
    }

    return;
  }

  const startMinutes =
    timeToMinutes(start_time);

  const endMinutes =
    timeToMinutes(end_time);

  for (const booking of bookings) {

    if (
      !["pending", "approved"]
      .includes(booking.status)
    ) {
      continue;
    }

    const bookingStart =
      DateTime.fromJSDate(
        booking.booking_datetime
      ).setZone(BUSINESS_TIME_ZONE);

    const bookingStartMinutes =
      bookingStart.hour * 60 +
      bookingStart.minute;

    const bookingEndMinutes =
      bookingStartMinutes +
      booking.duration_minutes;

    if (
      bookingStartMinutes < startMinutes ||
      bookingEndMinutes > endMinutes
    ) {
      throw new Error(
        `Booking at ${bookingStart.toFormat("HH:mm")} falls outside new working hours`
      );
    }
  }
};

// ===== OVERRIDES =====
export const getOverride = async (req, res) => {
  const data = await model.getOverrideByDate(req.params.date);
  res.json(data);
};

export const createOverride = async (req, res) => {
  try {

    await validateBookingsAgainstOverride(
      req.body.work_date,
      req.body.start_time,
      req.body.end_time,
      req.body.is_day_off
    );

    const data =
      await model.createOverride(req.body);

    res.status(200).json(data);

  } catch (error) {

    console.error(error);

    res.status(400).json({
      message: error.message
    });
  }
};

export const updateOverride = async (req, res) => {
  try {

    await validateBookingsAgainstOverride(
      req.body.work_date,
      req.body.start_time,
      req.body.end_time,
      req.body.is_day_off
    );

    const data =
      await model.updateOverride(
        req.params.id,
        req.body
      );

    res.status(200).json(data);

  } catch (error) {

    console.error(error);

    res.status(400).json({
      message: error.message
    });
  }
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



export const fetchOverride = async (req, res) => {
  const { date } = req.params;

  const data = await model.getWorkingHoursOverrideByDate(date);

  res.json(data);
};
