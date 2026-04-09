import db from "../config/db.js";
import { timeToMinutes, minutesToTime } from "../utils/converttime.js";
import { DateTime } from "luxon";
// ==========================
// Customer functions
// ==========================
export const findCustomerByPhone = async (client = null,phone) => {
    const queryExecutor = client || db;
  const res = await queryExecutor.query("SELECT * FROM customers WHERE phone = $1", [phone]);
  return res.rows[0] || null;
};

export const getallbookings = async () => {

  const res = await db.query("SELECT * FROM bookings");
  return res.rows;
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
// export const createBooking = async (client = null, customer_id, service_id, booking_date, booking_time) => {
//      const queryExecutor = client || db;
//   const service = await getServiceDuration(null ,service_id);
//   const res = await queryExecutor.query(
//     `INSERT INTO bookings (customer_id, service_id, booking_date, booking_time, duration_minutes)
//      VALUES ($1, $2, $3, $4, $5) RETURNING *`,
//     [customer_id, service_id, booking_date, booking_time, service]
//   );
//   return res.rows[0];
// };

export const createBookingMulti = async (client = null, customer_id, serviceIds = [], booking_date, booking_time) => {
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
        const priceRes = await queryExecutor.query("SELECT price FROM services WHERE id=$1", [serviceId]);
        if (priceRes.rows.length === 0) {
    throw new Error(`Service not found: ${serviceId}`);
}
        const price = priceRes.rows[0]?.price || 0;

        totalDuration += Number(duration);
        totalAmount += Number(price);

        servicesData.push({ serviceId, duration, price });
    }
// const formattedDate = booking_date;
const formattedDate = DateTime.fromISO(booking_date).toISODate();
    // 2️⃣ إنشاء الـ booking الرئيسي
    const bookingRes = await queryExecutor.query(
        `INSERT INTO bookings (customer_id, booking_date, booking_time, duration_minutes, total_amount)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [customer_id, formattedDate, booking_time, totalDuration, totalAmount]
    );

    const booking = bookingRes.rows[0];

    // 3️⃣ إدخال كل خدمة في جدول booking_services
    for (let s of servicesData) {
        await queryExecutor.query(
            `INSERT INTO booking_services (booking_id, service_id, duration_minutes, price)
             VALUES ($1, $2, $3, $4)`,
            [booking.id, s.serviceId, s.duration, s.price]
        );
    }

    return booking;
};









// export const checkTimeConflict = async (client = null,service_id, booking_date, booking_time) => {
//    const queryExecutor = client || db;
//   const service = await getServiceDuration(null ,service_id);
//   const slotDuration = 15;
//   const slotsNeeded = Math.ceil(service / slotDuration);

//   const bookingsRes = await queryExecutor.query(
//     "SELECT booking_time, duration_minutes FROM bookings WHERE booking_date=$1",
//     [booking_date]
//   );

//   const blockedSlots = [];
//   bookingsRes.rows.forEach(b => {
//     const start = timeToMinutes(b.booking_time);
//     const durationMinutes = b.duration_minutes;
//     const slots = Math.ceil(durationMinutes / slotDuration);
//     for (let i = 0; i < slots; i++) {
//       blockedSlots.push(minutesToTime(start + i * slotDuration));
//     }
//   });

//   // هل الوقت المطلوب متاح؟
//   const requestedStart = timeToMinutes(booking_time);
//   for (let i = 0; i < slotsNeeded; i++) {
//     if (blockedSlots.includes(minutesToTime(requestedStart + i * slotDuration))) {
//       return true; // محجوز
//     }
//   }
//   return false; // متاح
// };




export const checkTimeConflictMulti = async (client = null, serviceIds = [], booking_date, booking_time) => {

    // مجموع مدة كل الخدمات
    let totalMinutes = 0;
    for (let id of serviceIds) {
        totalMinutes += await getServiceDuration(client, id);
    }

    const slotDuration = 15;
    const slotsNeeded = Math.ceil(totalMinutes / slotDuration);

  const queryExecutor = client || db;

const bookingsRes = await queryExecutor.query(
        "SELECT booking_time, duration_minutes FROM bookings WHERE booking_date=$1 FOR UPDATE",
        [DateTime.fromISO(booking_date).toISODate()]
    );

    const blockedSlots = [];
    bookingsRes.rows.forEach(b => {
        const start = timeToMinutes(b.booking_time);
        const slots = Math.ceil(b.duration_minutes / slotDuration);
        for (let i = 0; i < slots; i++) {
            blockedSlots.push(minutesToTime(start + i * slotDuration));
        }
    });

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
    "SELECT booking_time, duration_minutes FROM bookings WHERE booking_date=$1 AND status IN ('confirmed', 'pending')",
   [DateTime.fromISO(booking_date).toISODate()]
  );
  return res.rows;
};
// -------------------------------------------------------------------------
// to swetch the booking that is time more than 24 hour pending to cancel
// -------------------------------------------------------------------------

// export const cancelExpiredPendingBookings = async () => {
//   try {
//     // الوقت الحالي UTC
//     const nowUTC = DateTime.utc().toISO();

//     const res = await db.query(`
//       UPDATE bookings
//       SET status = 'cancel'
//       WHERE status = 'pending'
//       AND created_at + interval '48 hours' <= $1
//     `, [nowUTC]);

//     return res.rowCount;
//   } catch (error) {
//     console.error("Cancel pending error:", error);
//   }
// };