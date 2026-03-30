import db from "../config/db.js";
import { timeToMinutes, minutesToTime } from "../utils/converttime.js";
// ==========================
// Customer functions
// ==========================
export const findCustomerByPhone = async (client = null,phone) => {
    const queryExecutor = client || db;
  const res = await queryExecutor.query("SELECT * FROM customers WHERE phone = $1", [phone]);
  return res.rows[0] || null;
};

export const createCustomer = async (client = null,name, email, phone) => {
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
export const createBooking = async (client = null, customer_id, service_id, booking_date, booking_time) => {
     const queryExecutor = client || db;
  const service = await getServiceDuration(null ,service_id);
  const res = await queryExecutor.query(
    `INSERT INTO bookings (customer_id, service_id, booking_date, booking_time, duration_minutes)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [customer_id, service_id, booking_date, booking_time, service]
  );
  return res.rows[0];
};

export const checkTimeConflict = async (client = null,service_id, booking_date, booking_time) => {
   const queryExecutor = client || db;
  const service = await getServiceDuration(null ,service_id);
  const slotDuration = 15;
  const slotsNeeded = Math.ceil(service / slotDuration);

  const bookingsRes = await queryExecutor.query(
    "SELECT booking_time, duration_minutes FROM bookings WHERE booking_date=$1",
    [booking_date]
  );

  const blockedSlots = [];
  bookingsRes.rows.forEach(b => {
    const start = timeToMinutes(b.booking_time);
    const durationMinutes = b.duration_minutes;
    const slots = Math.ceil(durationMinutes / slotDuration);
    for (let i = 0; i < slots; i++) {
      blockedSlots.push(minutesToTime(start + i * slotDuration));
    }
  });

  // هل الوقت المطلوب متاح؟
  const requestedStart = timeToMinutes(booking_time);
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






export const getBookingsByDate = async (client = null,booking_date) => {
     const queryExecutor = client || db;
  const res = await queryExecutor.query(
    "SELECT booking_time, duration_minutes FROM bookings WHERE booking_date=$1",
    [booking_date]
  );
  return res.rows;
};


