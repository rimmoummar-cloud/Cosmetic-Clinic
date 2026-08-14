import { getCalendarBookings } from "../models/bookingCalendar.js";

export const getCalendarBookingsController = async (req, res) => {
  try {
    const { view = "month", date } = req.query;

    const bookings = await getCalendarBookings({ view, date });

    res.status(200).json(bookings);
  } catch (error) {
    console.error("Calendar bookings error:", error);
    res.status(400).json({ message: error.message || "Unable to load calendar bookings" });
  }
};
