import db from "../config/db.js";
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

  // Input validation
  if (!customer_id) {
    throw new Error("customer_id is required");
  }
  if (!Array.isArray(serviceIds) || serviceIds.length === 0) {
    throw new Error("serviceIds must be a non-empty array");
  }
  if (!booking_datetime) {
    throw new Error("booking_datetime is required");
  }

  // 1️⃣ Calculate total duration and total amount for all services
  let totalDuration = 0;
  let totalAmount = 0;
  const servicesData = [];

  for (let serviceId of serviceIds) {
    if (!serviceId || isNaN(serviceId)) {
      throw new Error(`Invalid service ID: ${serviceId}`);
    }

    const duration = await getServiceDuration(client, serviceId);
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

  if (totalDuration <= 0) {
    throw new Error("Total duration must be greater than 0");
  }

  // 2️⃣ Validate and convert booking datetime to UTC
  const bookingDateTimeUTC = DateTime.fromISO(booking_datetime, {
    setZone: true,
  }).toUTC();

  if (!bookingDateTimeUTC.isValid) {
    throw new Error("Invalid booking_datetime: must be a valid ISO string");
  }

  // 3️⃣ Check for time overlaps using proper overlap detection
  // existing_start < new_end AND existing_end > new_start
  const newStart = bookingDateTimeUTC.toISO();
  const newEnd = bookingDateTimeUTC
    .plus({ minutes: totalDuration })
    .toISO();

  const conflictRes = await queryExecutor.query(
    `SELECT 1
     FROM bookings
     WHERE booking_datetime < $2
       AND (booking_datetime + (duration_minutes * interval '1 minute')) > $1
       AND status NOT IN ('cancelled')
     FOR UPDATE`,
    [newStart, newEnd]
  );

  if (conflictRes.rowCount > 0) {
    throw new Error("This time is already booked");
  }

  // 4️⃣ Create the main booking record
  const bookingRes = await queryExecutor.query(
    `INSERT INTO bookings (customer_id, booking_datetime, duration_minutes, total_amount, status)
     VALUES ($1, $2, $3, $4, 'pending')
     RETURNING *`,
    [customer_id, newStart, totalDuration, totalAmount]
  );

  const booking = bookingRes.rows[0];

  // 5️⃣ Insert each service into booking_services table
  for (let s of servicesData) {
    await queryExecutor.query(
      `INSERT INTO booking_services (booking_id, service_id, duration_minutes, price)
       VALUES ($1, $2, $3, $4)`,
      [booking.id, s.serviceId, Number(s.duration), Number(s.price)]
    );
  }

  return booking;
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
