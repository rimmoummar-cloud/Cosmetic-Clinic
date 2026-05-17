import db from "../config/db.js";
import { DateTime } from "luxon";
// booking.js السطر الأخير

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
// export const createBookingMulti = async (
//   client = null,
//   customer_id,
//   serviceIds = [],
//   booking_datetime
// ) => {
//   const queryExecutor = client || db;

//   // Input validation
//   if (!customer_id) {
//     throw new Error("customer_id is required");
//   }
//   if (!Array.isArray(serviceIds) || serviceIds.length === 0) {
//     throw new Error("serviceIds must be a non-empty array");
//   }
//   if (!booking_datetime) {
//     throw new Error("booking_datetime is required");
//   }

//   // 1️⃣ Calculate total duration and total amount for all services
//   let totalDuration = 0;
//   let totalAmount = 0;
//   const servicesData = [];


//   const servicesRes = await queryExecutor.query(
//   `
//   SELECT id, duration_minutes, price
//   FROM services
//   WHERE id = ANY($1)
//   `,
//   [serviceIds]
// );

// if (servicesRes.rows.length !== serviceIds.length) {
//   throw new Error("One or more services not found");
// }

// for (let s of servicesRes.rows) {
//   totalDuration += Number(s.duration_minutes);
//   totalAmount += Number(s.price);

//   servicesData.push({
//     serviceId: s.id,
//     duration: s.duration_minutes,
//     price: s.price
//   });
// }

//   // if (totalDuration <= 0) {
//   //   throw new Error("Total duration must be greater than 0");
//   // }
//   if (totalDuration <= 0) {
//   throw new Error("Total duration must be greater than 0");
// }

// const CLEANING_BUFFER_MINUTES =
//   Number(process.env.CLEANING_BUFFER_MINUTES) || 15;

// // add buffer between clients
// totalDuration += CLEANING_BUFFER_MINUTES;

//   // 2️⃣ Validate and convert booking datetime to UTC
//   // const bookingDateTimeUTC = DateTime.fromISO(booking_datetime, {
//   //   setZone: true,
//   // }).toUTC();
// const bookingDateTimeUTC = DateTime.fromISO(booking_datetime).toUTC();


//   if (!bookingDateTimeUTC.isValid) {
//     throw new Error("Invalid booking_datetime: must be a valid ISO string");
//   }

//   // 3️⃣ Check for time overlaps using proper overlap detection
//   // existing_start < new_end AND existing_end > new_start
//   const newStart = bookingDateTimeUTC.toISO();
//   const newEnd = bookingDateTimeUTC
//     .plus({ minutes: totalDuration })
//     .toISO();

//   const conflictRes = await queryExecutor.query(
//     `SELECT 1
//      FROM bookings
//      WHERE booking_datetime < $2
//        AND (booking_datetime + (duration_minutes * interval '1 minute')) > $1
//        AND status NOT IN ('cancelled')
//      FOR UPDATE`,
//     [newStart, newEnd]
//   );

//   if (conflictRes.rowCount > 0) {
//     throw new Error("This time is already booked");
//   }

//   // 4️⃣ Create the main booking record
//   const bookingRes = await queryExecutor.query(
//     `INSERT INTO bookings (customer_id, booking_datetime, duration_minutes, total_amount, status)
//      VALUES ($1, $2, $3, $4, 'pending')
//      RETURNING *`,
//     [customer_id, newStart, totalDuration, totalAmount]
//   );

//   const booking = bookingRes.rows[0];

//   // 5️⃣ Insert each service into booking_services table
//   for (let s of servicesData) {
//     await queryExecutor.query(
//       `INSERT INTO booking_services (booking_id, service_id, duration_minutes, price)
//        VALUES ($1, $2, $3, $4)`,
//       [booking.id, s.serviceId, Number(s.duration), Number(s.price)]
//     );
//   }

//   return booking;
// };
export const createBookingMulti = async (
  client = null,
  customer_id,
  serviceIds = [],
  booking_datetime,
  note = ""
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

  const servicesRes = await queryExecutor.query(
    `
    SELECT id, duration_minutes, price
    FROM services
    WHERE id = ANY($1)
    `,
    [serviceIds]
  );

  if (servicesRes.rows.length !== serviceIds.length) {
    throw new Error("One or more services not found");
  }

  for (let s of servicesRes.rows) {
    totalDuration += Number(s.duration_minutes);
    totalAmount += Number(s.price);

    servicesData.push({
      serviceId: s.id,
      duration: s.duration_minutes,
      price: s.price
    });
  }

  if (totalDuration <= 0) {
    throw new Error("Total duration must be greater than 0");
  }

  const CLEANING_BUFFER_MINUTES =
    Number(process.env.CLEANING_BUFFER_MINUTES) || 15;

  // add buffer between clients
  totalDuration += CLEANING_BUFFER_MINUTES;

  // 2️⃣ Validate and convert booking datetime to UTC
  // ✅ FIX: treat incoming value correctly as UTC ISO
  // const bookingDateTimeUTC = DateTime.fromISO(booking_datetime, {
  //   zone: "utc"
  // });
const bookingDateTimeUTC = DateTime.fromISO(booking_datetime);
  if (!bookingDateTimeUTC.isValid) {
    throw new Error("Invalid booking_datetime: must be a valid ISO string");
  }

  // 3️⃣ Check for time overlaps using proper overlap detection
  const newStart = bookingDateTimeUTC.toISO();
  const newEnd = bookingDateTimeUTC
    .plus({ minutes: totalDuration })
    .toISO();

  const conflictRes = await queryExecutor.query(
    `SELECT 1
     FROM bookings
     WHERE booking_datetime < $2
       AND (booking_datetime + (duration_minutes * interval '1 minute')) > $1
      AND status NOT IN ('cancelled', 'completed')
     FOR UPDATE`,
    [newStart, newEnd]
  );

  if (conflictRes.rowCount > 0) {
    throw new Error("This time is already booked");
  }

  // 4️⃣ Create the main booking record
  const bookingRes = await queryExecutor.query(
    `INSERT INTO bookings (customer_id, booking_datetime, duration_minutes, total_amount, status, note)
     VALUES ($1, $2, $3, $4, 'pending', $5)
     RETURNING *`,
    [customer_id, newStart, totalDuration, totalAmount, note]
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
  // timeZone = "UTC"
) => {
  const BUSINESS_TIME_ZONE = process.env.BUSINESS_TIME_ZONE || "America/Montreal";

  const queryExecutor = client || db;

  const dayStart = DateTime.fromISO(bookingDate, { zone: BUSINESS_TIME_ZONE, setZone: true })
    .startOf("day")
    .toUTC();
  const dayEnd = dayStart.plus({ days: 1 });

const res = await queryExecutor.query(
  `
  SELECT
    booking_datetime,
    duration_minutes,
    status
  FROM bookings
  WHERE booking_datetime >= $1
    AND booking_datetime < $2
    AND status IN ('approved', 'pending')
  `,
  [dayStart.toISO(), dayEnd.toISO()]
);
  return res.rows;
};





export const updateBookingStatus = async (bookingId, newStatus) => {
  // statuses المسموحة حسب جدولك
  const validStatuses = [
    "pending",
    "approved",
    "cancelled",
    "completed",
  ];

  if (!validStatuses.includes(newStatus)) {
    throw new Error("Invalid status value");
  }

  const res = await db.query(
    `
    UPDATE bookings
    SET status = $1
    WHERE id = $2
    RETURNING *
    `,
    [newStatus, bookingId]
  );

  return res.rows[0];
};
