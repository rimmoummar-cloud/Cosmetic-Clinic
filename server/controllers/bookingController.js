import * as Booking from "../models/booking.js";
import db from "../config/db.js";
import { getWorkingHoursByDay } from "../models/workingHoure.js";
import { DateTime } from "luxon";
const BUSINESS_TIME_ZONE =
  process.env.BUSINESS_TIME_ZONE || "America/Montreal";
   
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

// ==========================
// Create Multi-Service Booking
// ==========================

export const createBooking = async (req, res) => {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const { name, email, phone, serviceIds, booking_datetime, note } = req.body;
console.log("=== CREATE BOOKING DEBUG ===");

console.log("Raw datetime from frontend:");
console.log(booking_datetime);

// const businessTime = DateTime
//   .fromISO(booking_datetime)
//   .setZone(BUSINESS_TIME_ZONE);
const businessTime = DateTime.fromISO(booking_datetime).toUTC();
console.log("Business time interpreted:");
console.log(
  businessTime.toFormat("yyyy-MM-dd HH:mm")
);

console.log("Business zone:");
console.log(BUSINESS_TIME_ZONE);

console.log("============================");
    // Input validation
    if (!name || !email || !phone || !serviceIds || !booking_datetime) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        message: "Missing required fields: name, email, phone, serviceIds, booking_datetime",
      });
    }

    if (!Array.isArray(serviceIds) || serviceIds.length === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        message: "serviceIds must be a non-empty array",
      });
    }

    // Lock bookings table for conflict detection
    await client.query("LOCK TABLE bookings IN SHARE ROW EXCLUSIVE MODE");

    // Find or create customer
    let customer = await Booking.findCustomerByPhone(client, phone);

    if (!customer) {
      customer = await Booking.createCustomer(client, name, email, phone);
    }

    // Create multi-service booking
    // This function includes overlap detection inside the same transaction
    const booking = await Booking.createBookingMulti(
      client,
      customer.id,
      serviceIds,
      booking_datetime,
      note
    );

    await client.query("COMMIT");

    res.status(201).json(booking);
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Booking error:", error.message);

    // Return appropriate error response
    if (
      error.message.includes("already booked") ||
      error.message.includes("conflict")
    ) {
      return res.status(409).json({ message: error.message });
    }

    if (
      error.message.includes("Invalid") ||
      error.message.includes("required")
    ) {
      return res.status(400).json({ message: error.message });
    }

    if (error.message.includes("not found")) {
      return res.status(404).json({ message: error.message });
    }

    res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
};

// ==========================
// Get Available Slots for Multiple Services
// ==========================
export async function getAvailableSlotsMulti(req, res) {

  try {
   
    console.log(">>> getAvailableSlotsMulti HIT");
    let { serviceIds, booking_datetime, timeZone } = req.query;
    const userTimeZone = timeZone || "UTC";

    // Validate input
    if (!serviceIds || !booking_datetime) {
      return res.status(400).json({
        message: "Missing required fields: serviceIds, booking_datetime",
        availableSlots: [],
      });
    }

    // Convert serviceIds to array
    if (typeof serviceIds === "string") {
      serviceIds = serviceIds
        .split(",")
        .map((id) => parseInt(id, 10))
        .filter((id) => !isNaN(id));
    }

    if (!Array.isArray(serviceIds) || serviceIds.length === 0) {
      return res.status(400).json({
        message: "serviceIds must be a non-empty array of valid numbers",
        availableSlots: [],
      });
    }

// const bookingDateTime = DateTime.fromISO(booking_datetime, {
//   zone: "utc"
// }).setZone(BUSINESS_TIME_ZONE);

const bookingDateTime = DateTime.fromISO(booking_datetime, {
  setZone: true
}).setZone(BUSINESS_TIME_ZONE);





    if (!bookingDateTime.isValid) {
      return res.status(400).json({
        message: "Invalid booking_datetime format",
        availableSlots: [],
      });
    }

    // const bookingDate = bookingDateTime.toISODate();
const bookingDate = bookingDateTime
  .setZone(BUSINESS_TIME_ZONE)
  .toISODate();
    // Calculate total duration for all services
    let totalMinutes = 0;
    // for (let id of serviceIds) {
    //   const duration = await Booking.getServiceDuration(null, id);
    //   totalMinutes += duration;
    // }
const servicesRes = await db.query(
  `
  SELECT duration_minutes
  FROM services
  WHERE id = ANY($1)
  `,
  [serviceIds]
);

if (servicesRes.rows.length !== serviceIds.length) {
  return res.status(400).json({
    message: "One or more services not found",
    availableSlots: []
  });
}

for (let s of servicesRes.rows) {
  totalMinutes += Number(s.duration_minutes);
}
    // if (totalMinutes <= 0) {
    //   return res.status(400).json({
    //     message: "Invalid total service duration",
    //     availableSlots: [],
    //   });
    // }

if (totalMinutes <= 0) {
  return res.status(400).json({
    message: "Invalid total service duration",
    availableSlots: [],
  });
}
const CLEANING_BUFFER_MINUTES =
  Number(process.env.CLEANING_BUFFER_MINUTES) || 15;


// add buffer between clients
totalMinutes += CLEANING_BUFFER_MINUTES;



    // const slotDuration = 15;
    const slotDuration =
  Number(process.env.SLOT_DURATION) || 15;
    const slotsNeeded = Math.ceil(totalMinutes / slotDuration);

    // Get bookings for the selected date
    // const bookings = await Booking.getBookingsByDate(
    //   null,
    //   bookingDate,
    //   userTimeZone
    // );


 const bookings = await Booking.getBookingsByDate(
  null,
  bookingDate,
  BUSINESS_TIME_ZONE
);
    // Fetch working hours for the selected day
    const dayOfWeek = bookingDateTime.weekday % 7;
    const workingHours = await getWorkingHoursByDay(null, dayOfWeek);

    if (!workingHours) {
      return res.status(400).json({
        message: "No working hours configured for this day",
        availableSlots: [],
      });
    }

   
const startDateTime = DateTime.fromISO(
  `${bookingDate}T${workingHours.start_time}`,
  { zone: BUSINESS_TIME_ZONE }
);

const endDateTime = DateTime.fromISO(
  `${bookingDate}T${workingHours.end_time}`,
  { zone: BUSINESS_TIME_ZONE }
);


    if (!startDateTime.isValid || !endDateTime.isValid) {
      return res.status(500).json({
        message: "Invalid working hours format",
        availableSlots: [],
      });
    }

    const startMinutes =
      startDateTime.hour * 60 + startDateTime.minute;
    const endMinutes = endDateTime.hour * 60 + endDateTime.minute;

    // Build list of blocked slots
    const blockedSlots = new Set();
    // const now = DateTime.now().setZone(userTimeZone);
    const now = DateTime.now().setZone(BUSINESS_TIME_ZONE);
//   console.log("========= TIME DEBUG =========");

// console.log(
//   "Server NOW:",
//   DateTime.now().toISO()
// );

// console.log(
//   "Server zone:",
//   DateTime.now().zoneName
// );

// console.log(
//   "Business zone:",
//   BUSINESS_TIME_ZONE
// );

// const businessNow = DateTime.now().setZone(BUSINESS_TIME_ZONE);

// console.log(
//   "Business NOW:",
//   businessNow.toISO()
// );

// console.log(
//   "Business HH:mm:",
//   businessNow.toFormat("HH:mm")
// );

// console.log(
//   "Business offset:",
//   businessNow.offset
// );

// console.log("================================");
    const currentDateStr = now.toISODate();
    const currentMinutes = now.hour * 60 + now.minute;

    bookings.forEach((b) => {
  // const bookingStart = DateTime.fromJSDate(b.booking_datetime)
  // .toUTC();
//   const bookingStart =  DateTime.fromJSDate(b.booking_datetime, {
//   zone: "utc"
// }).setZone(BUSINESS_TIME_ZONE);



const bookingStart = DateTime
  .fromJSDate(b.booking_datetime)
  .setZone(BUSINESS_TIME_ZONE);
  
      const startTime = bookingStart.toFormat("HH:mm");
      const start = timeToMinutes(startTime);
      const slots = Math.ceil(b.duration_minutes / slotDuration);


      
      for (let i = 0; i < slots; i++) {
        const slotTime = start + i * slotDuration;

        // Skip past slots on today
        if (bookingDate === currentDateStr && slotTime < currentMinutes) {
          continue;
        }

        blockedSlots.add(minutesToTime(slotTime));
      }
    });

    // Generate all available slots
    const allSlots = [];

    

          for (let m = startMinutes; m + totalMinutes <= endMinutes; m += slotDuration) {
      allSlots.push(minutesToTime(m));
    }

    // Filter slots: keep only those with enough consecutive free slots
    const finalSlots = [];
    allSlots.forEach((slot) => {
      const start = timeToMinutes(slot);
      let canFit = true;

      for (let i = 0; i < slotsNeeded; i++) {
        const checkSlot = minutesToTime(start + i * slotDuration);
        if (blockedSlots.has(checkSlot)) {
          canFit = false;
          break;
        }
      }

      if (canFit) {
        finalSlots.push(slot);
      }
    });




    const convertedSlots = finalSlots.map((slot) => {
  const dt = DateTime.fromISO(
    `${bookingDate}T${slot}`,
    { zone: BUSINESS_TIME_ZONE }
  );

  return dt.toFormat("HH:mm");
});

res.json({ availableSlots: convertedSlots });
  } catch (error) {
    console.error("Available slots error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
}

// Helper function to convert time string to minutes
function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

// Helper function to convert minutes to time string
function minutesToTime(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
export const getBookingWithFullDetails = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        bookings.id,
        bookings.status,
        bookings.note,
        bookings.created_at,
        bookings.booking_datetime,
        bookings.total_amount,

        customers.name AS customer_name,
        customers.email AS customer_email,
        customers.phone AS customer_phone,

        COALESCE(
          json_agg(
            json_build_object(
              'id', services.id,
              'name', services.name,
              'duration', services.duration_minutes,
              'price', services.price
            )
          ) FILTER (WHERE services.id IS NOT NULL),
          '[]'
        ) AS services

      FROM bookings

      JOIN customers
        ON bookings.customer_id = customers.id

      LEFT JOIN booking_services
        ON bookings.id = booking_services.booking_id

      LEFT JOIN services
        ON booking_services.service_id = services.id

      GROUP BY
        bookings.id,
        customers.id

      ORDER BY bookings.created_at DESC
    `);

    res.json(result.rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error fetching bookings"
    });
  }
};