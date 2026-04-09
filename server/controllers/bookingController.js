import * as Booking from "../models/booking.js";
import db from "../config/db.js"; // نحتاج db لعمل transaction
import { timeToMinutes, minutesToTime } from "../utils/converttime.js";
import { getWorkingHoursByDay } from "../models/workingHoure.js";
import { DateTime } from "luxon";
import { check } from "zod";

// ==========================
// Get All Bookings
// ==========================
export const getallbookingss = async (req, res) => {
  try {
    const bookings = await Booking.getallbookings();
    res.status(200).json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// -------------- create mult booking ---------------
export const createBooking = async (req, res) => {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const { name, email, phone, serviceIds, booking_datetime } = req.body;
    await client.query("LOCK TABLE bookings IN SHARE ROW EXCLUSIVE MODE");

    // 1️⃣ Check conflict (يمكنك تعديل checkTimeConflict ليأخذ array من services)
    const isBooked = await Booking.checkTimeConflictMulti(
      client,
      serviceIds,
      booking_datetime
    );

    if (isBooked) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "This time is already booked" });
    }

    // 2️⃣ Find customer
    let customer = await Booking.findCustomerByPhone(client, phone);

    if (!customer) {
      customer = await Booking.createCustomer(client, name, email, phone);
    }

    // 3️⃣ Create multi-service booking
    const booking = await Booking.createBookingMulti(
      client,
      customer.id,
      serviceIds,
      booking_datetime
    );

    await client.query("COMMIT");

    res.status(201).json(booking);
  // } catch (error) {
  //   await client.query("ROLLBACK");
  //   console.error(error);
  //   res.status(500).json({ message: "Server error" });
  // } 
  } catch (error) {
  await client.query("ROLLBACK");

  console.error("❌ REAL ERROR:", error);
  console.error("❌ STACK:", error.stack);

  res.status(500).json({
    message: error.message,
  });
}
  finally {
    client.release();
  }
};




export async function getAvailableSlotsMulti(req, res) {
  try {
    let { serviceIds, booking_datetime, timeZone } = req.query;
    const userTimeZone = timeZone || "UTC";

    // =========================
    // FIX 1 — Convert to array
    // =========================
    if (!serviceIds || !booking_datetime) {
      return res.json({ availableSlots: [] });
    }

    if (typeof serviceIds === "string") {
      serviceIds = serviceIds
        .split(",")
        .map((id) => parseInt(id))
        .filter((id) => !isNaN(id));
    }

    // safety
    if (!Array.isArray(serviceIds) || serviceIds.length === 0) {
      return res.json({ availableSlots: [] });
    }

    const bookingDateTime = DateTime.fromISO(booking_datetime, {
      setZone: true,
    }).setZone(userTimeZone);
    const bookingDate = bookingDateTime.toISODate();

    // =========================
    // حساب مجموع المدة
    // =========================
    let totalMinutes = 0;
    for (let id of serviceIds) {
      const duration = await Booking.getServiceDuration(null, id);
      totalMinutes += duration;
    }

    const slotDuration = 15;
    const slotsNeeded = Math.ceil(totalMinutes / slotDuration);

    const bookings = await Booking.getBookingsByDate(
      null,
      bookingDate,
      userTimeZone
    );

    // =========================
    // working hours
    // =========================
    const dayOfWeek = bookingDateTime.weekday % 7;
    const workingHours = await getWorkingHoursByDay(null, dayOfWeek);

    if (!workingHours) {
      return res.json({ availableSlots: [] });
    }

    // Interpret working hours in the user's timezone so comparisons match displayed slots
    const startDateTime = DateTime.fromISO(
      `${bookingDate}T${workingHours.start_time}`,
      { zone: userTimeZone }
    );
    const endDateTime = DateTime.fromISO(
      `${bookingDate}T${workingHours.end_time}`,
      { zone: userTimeZone }
    );

    const startMinutes = startDateTime.hour * 60 + startDateTime.minute;
    const endMinutes = endDateTime.hour * 60 + endDateTime.minute;

    // =========================
    // blocked slots with same-day filtering
    // =========================
    const blockedSlots = [];
    const now = DateTime.now().setZone(userTimeZone);

    const currentDateStr = now.toISODate(); // YYYY-MM-DD
    const currentMinutes = now.hour * 60 + now.minute;

    bookings.forEach((b) => {
      const startTime = DateTime.fromJSDate(b.booking_datetime)
        .setZone(userTimeZone)
        .toFormat("HH:mm");
      const start = timeToMinutes(startTime);
      const slots = Math.ceil(b.duration_minutes / slotDuration);

      for (let i = 0; i < slots; i++) {
        const slotTime = start + i * slotDuration;

        // =========================
        // same-day past filtering
        // =========================
        if (bookingDate === currentDateStr && slotTime < currentMinutes) {
          continue; // تجاهل أي وقت مضى اليوم
        }

        blockedSlots.push(minutesToTime(slotTime));
      }
    });

    // =========================
    // generate all slots
    // =========================
    const allSlots = [];
    for (let m = startMinutes; m <= endMinutes - slotDuration; m += slotDuration) {
      allSlots.push(minutesToTime(m));
    }

    // =========================
    // filter consecutive slots
    // =========================
    const finalSlots = [];
    allSlots.forEach((slot) => {
      const start = timeToMinutes(slot);
      let canFit = true;

      for (let i = 0; i < slotsNeeded; i++) {
        const checkSlot = minutesToTime(start + i * slotDuration);
        if (blockedSlots.includes(checkSlot)) {
          canFit = false;
          break;
        }
      }

      if (canFit) {
        finalSlots.push(slot);
      }
    });

    res.json({ availableSlots: finalSlots });
  } catch (error) {
    console.error("Slots error:", error);
    res.status(500).json({ message: "Server error" });
  }
}
