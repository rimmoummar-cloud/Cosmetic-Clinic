import db from "../config/db.js";
import { timeToMinutes, minutesToTime } from "../utils/converttime.js";
import { DateTime } from "luxon";

// ==========================
// Customer functions
// ==========================
export const findCustomerByPhone = async (client = null, phone) => {
  const queryExecutor = client || db;
  const res = await queryExecutor.query(
    "SELECT * FROM customers WHERE phone = $1",
    [phone]
  );
  return res.rows[0] || null;
};

export const getallbookings = async () => {
  const res = await db.query("SELECT * FROM bookings");
  return res.rows;
};

export const createCustomer = async (client = null, name, email, phone) => {
  const queryExecutor = client || db;
  const res = await queryExecutor.query(
    "INSERT INTO customers (name, email, phone) VALUES ($1, $2, $3) RETURNING *",
    [name, email, phone]
  );
  return res.rows[0];
};

// ==========================
// Booking functions
// ==========================
export const createBookingMulti = async (
  client = null,
  customer_id,
  serviceIds = [],
  booking_datetime
) => {
  const queryExecutor = client || db;

  // 1️⃣ حساب مدة كل الخدمات والسعر الإجمالي
  let totalDuration = 0;
  let totalAmount = 0;
  const servicesData = [];

  for (let serviceId of serviceIds) {
    const duration = await getServiceDuration(client, serviceId); // duration بالدقائق
    if (!duration || duration <= 0) {
      throw new Error(`Invalid duration for service ${serviceId}`);
    }
    const priceRes = await queryExecutor.query(
      "SELECT price FROM services WHERE id=$1",
      [serviceId]
    );
    if (priceRes.rows.length === 0) {
      throw new Error(`Service not found: ${serviceId}`);
    }
    const price = priceRes.rows[0]?.price || 0;

    totalDuration += Number(duration);
    totalAmount += Number(price);

    servicesData.push({ serviceId, duration, price });
  }

  const bookingDateTimeUTC = DateTime.fromISO(booking_datetime, {
    setZone: true,
  }).toUTC();

  if (!bookingDateTimeUTC.isValid) {
    throw new Error("Invalid booking_datetime: must be a valid ISO string");
  }

  // Guard against exact timestamp conflicts (extra safety in addition to outer checks)
  const conflictRes = await queryExecutor.query(
    "SELECT 1 FROM bookings WHERE booking_datetime = $1",
    [bookingDateTimeUTC.toISO()]
  );
  if (conflictRes.rowCount > 0) {
    throw new Error("This time is already booked");
  }

  // 2️⃣ إنشاء الـ booking الرئيسي
  const bookingRes = await queryExecutor.query(
    `INSERT INTO bookings (customer_id, booking_datetime, duration_minutes, total_amount)
         VALUES ($1, $2, $3, $4) RETURNING *`,
    [customer_id, bookingDateTimeUTC.toISO(), totalDuration, totalAmount]
  );

  const booking = bookingRes.rows[0];

  // 3️⃣ إدخال كل خدمة في جدول booking_services
  for (let s of servicesData) {
    await queryExecutor.query(
      `INSERT INTO booking_services (booking_id, service_id, duration_minutes, price)
             VALUES ($1, $2, $3, $4)`,
      [booking.id, s.serviceId, Number(s.duration), Number(s.price)]
    );
  }

  return booking;
};

export const checkTimeConflictMulti = async (
  client = null,
  serviceIds = [],
  booking_datetime
) => {
  // مجموع مدة كل الخدمات
  let totalMinutes = 0;
  for (let id of serviceIds) {
    totalMinutes += await getServiceDuration(client, id);
  }

  const slotDuration = 15;
  const slotsNeeded = Math.ceil(totalMinutes / slotDuration);

  const queryExecutor = client || db;

  const bookingDateUTC = DateTime.fromISO(booking_datetime, {
    setZone: true,
  }).toUTC();

  // First guard: exact same start timestamp
  const exactConflict = await queryExecutor.query(
    "SELECT 1 FROM bookings WHERE booking_datetime = $1 FOR UPDATE",
    [bookingDateUTC.toISO()]
  );
  if (exactConflict.rowCount > 0) {
    return true;
  }

  // Fetch all bookings that start within the same UTC day (no DATE() cast)
  const dayStartUtc = bookingDateUTC.startOf("day");
  const dayEndUtc = dayStartUtc.plus({ days: 1 });

  const bookingsRes = await queryExecutor.query(
    `SELECT booking_datetime, duration_minutes
       FROM bookings
      WHERE booking_datetime >= $1
        AND booking_datetime < $2
      FOR UPDATE`,
    [dayStartUtc.toISO(), dayEndUtc.toISO()]
  );

  const blockedSlots = [];
  bookingsRes.rows.forEach((b) => {
    const start = timeToMinutes(
      DateTime.fromJSDate(b.booking_datetime).toUTC().toFormat("HH:mm")
    );
    const slots = Math.ceil(b.duration_minutes / slotDuration);
    for (let i = 0; i < slots; i++) {
      blockedSlots.push(minutesToTime(start + i * slotDuration));
    }
  });

  const requestedStart = timeToMinutes(bookingDateUTC.toFormat("HH:mm"));
  for (let i = 0; i < slotsNeeded; i++) {
    if (blockedSlots.includes(minutesToTime(requestedStart + i * slotDuration))) {
      return true; // محجوز
    }
  }
  return false; // متاح
};

// ==========================
// Service functions
// ==========================

export const getServiceDuration = async (client = null, service_id) => {
  const queryExecutor = client || db;

  const res = await queryExecutor.query(
    "SELECT duration_minutes FROM services WHERE id=$1",
    [service_id]
  );

  if (res.rows.length === 0) {
    throw new Error("Service not found");
  }

  return res.rows[0].duration_minutes;
};

export const getBookingsByDate = async (
  client = null,
  bookingDate,
  timeZone = "UTC"
) => {
  const queryExecutor = client || db;

  const dayStart = DateTime.fromISO(bookingDate, { zone: timeZone, setZone: true })
    .startOf("day")
    .toUTC();
  const dayEnd = dayStart.plus({ days: 1 });

  const res = await queryExecutor.query(
    `SELECT booking_datetime, duration_minutes
       FROM bookings
      WHERE booking_datetime >= $1
        AND booking_datetime < $2
        AND status IN ('confirmed', 'pending')`,
    [dayStart.toISO(), dayEnd.toISO()]
  );
  return res.rows;
};
