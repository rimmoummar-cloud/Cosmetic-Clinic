import * as Booking from "../models/booking.js";
import db from "../config/db.js";
import { getWorkingHoursByDay } from "../models/workingHoure.js";
import { DateTime } from "luxon";
import { sendBookingEmail , sendBookingApprovedEmail , sendBookingCancelledEmail } from "../utils/sendEmail.js";
import { getBookingDisclaimers } from "../utils/bookingEmailHelper.js";
import { createReminder } from "../models/bookingReminder.js";
  import schedule from "node-schedule";
import {
  checkWaitingListForCancelledBooking
} from "../utils/waitingListMatcher.js";
import { scheduleReminders } from "../jobs/reminderJob.js";
import {
  getWorkingHoursOverrideByDate
} from "../models/workindhourbyDate.js";

import {
  getBreakHoursByDate
} from "../models/BrakeHoure.js";

import {
  createNotification
} from "../models/notification.js";
import crypto from "crypto";

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
    } else {
  // update email in case it changed
  await client.query(
    `UPDATE customers SET email = $1, name = $2 WHERE id = $3`,
    [email, name, customer.id]
  );
}

    // Create multi-service booking
    // This function includes overlap detection inside the same transaction
    const token = crypto.randomUUID();
    const booking = await Booking.createBookingMulti(
      client,
      customer.id,
      serviceIds,
      booking_datetime,
      note,
      token
    );





    await client.query("COMMIT");

await createNotification({
  recipient_type: "admin",
  recipient_id: 1,
  booking_id: booking.id,
  type: "new_booking",
  title: "New Booking",
  message: `${name} created a new booking`
});



const disclaimers =
  await getBookingDisclaimers(booking.id);

if (disclaimers.length === 0) {

  await Booking.updateDisclaimerStatus(
    booking.id,
    "no_disclaimers"
  );
}


    
    const servicesRes = await db.query(
  `SELECT name FROM services WHERE id = ANY($1)`,
  [serviceIds]
);



if (!servicesRes.rows || servicesRes.rows.length === 0) {
  throw new Error("Services not found");
}

const serviceNames = servicesRes.rows
  .map(s => s.name)
  .join(", ");

  
//   const reminderBooking = {
//   id: booking.id,
// booking_datetime: booking.booking_datetime,
//   customer_email: email,
//   customer_name: name,
//   service_name: serviceNames,
// };

// scheduleReminders(reminderBooking);

if (disclaimers.length > 0) {

  // فيه مخاطر → ابعت review email
sendBookingEmail({  
    to: email,
    customerName: name,
    serviceName: serviceNames,
    bookingDate: booking_datetime,
    bookingTime: booking_datetime,
    // bookingId: booking.id,
    acceptanceToken: booking.acceptance_token,
  });

} 


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

 
const bookingDate = bookingDateTime
  .setZone(BUSINESS_TIME_ZONE)
  .toISODate();

const dayOfWeek = bookingDateTime.weekday % 7;
// ==========================
// 1. CHECK OVERRIDE (IMPORTANT)
// ==========================
const override = await getWorkingHoursOverrideByDate(bookingDate);



// 🔥 ADD SAFETY CHECK HERE (IMPORTANT EDGE CASE FIX)
if (override && !override.is_day_off) {
  if (!override.start_time || !override.end_time) {
    return res.status(500).json({
      message: "Invalid override configuration: missing working hours"
    });
  }
}

let startMinutes;
let endMinutes;

if (override) {

  if (override.is_day_off) {
    return res.json({ availableSlots: [] });
  }

  startMinutes = timeToMinutes(override.start_time);
  endMinutes = timeToMinutes(override.end_time);

} else {

  const workingHours = await getWorkingHoursByDay(null, dayOfWeek);

  if (!workingHours) {
    return res.status(400).json({
      message: "No working hours configured for this day",
      availableSlots: [],
    });
  }

  startMinutes = timeToMinutes(workingHours.start_time);
  endMinutes = timeToMinutes(workingHours.end_time);
}









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
    // const dayOfWeek = bookingDateTime.weekday % 7;
//     const workingHours = await getWorkingHoursByDay(null, dayOfWeek);

//     if (!workingHours) {
//       return res.status(400).json({
//         message: "No working hours configured for this day",
//         availableSlots: [],
//       });
//     }

   
// const startDateTime = DateTime.fromISO(
//   `${bookingDate}T${workingHours.start_time}`,
//   { zone: BUSINESS_TIME_ZONE }
// );

// const endDateTime = DateTime.fromISO(
//   `${bookingDate}T${workingHours.end_time}`,
//   { zone: BUSINESS_TIME_ZONE }
// );


//     if (!startDateTime.isValid || !endDateTime.isValid) {
//       return res.status(500).json({
//         message: "Invalid working hours format",
//         availableSlots: [],
//       });
//     }

// startMinutes = startDateTime.hour * 60 + startDateTime.minute;
// endMinutes = endDateTime.hour * 60 + endDateTime.minute;

    // Build list of blocked slots
    const blockedSlots = new Set();



// ==========================
// 2. ADD BREAKS TO BLOCKED SLOTS
// ==========================
const breaks = await getBreakHoursByDate(bookingDate);

breaks.forEach((b) => {
  const start = timeToMinutes(b.start_time);
  const end = timeToMinutes(b.end_time);

  for (let m = start; m < end; m += slotDuration) {
    blockedSlots.add(minutesToTime(m));
  }
});





    // const now = DateTime.now().setZone(userTimeZone);
    const now = DateTime.now().setZone(BUSINESS_TIME_ZONE);
//   console.log("========= TIME DEBUG =========");


// console.log("================================");
    const currentDateStr = now.toISODate();
    const currentMinutes = now.hour * 60 + now.minute;


bookings.forEach((b) => {
  // إذا كان الحجز ملغي أو منتهي → لا نحجز السلوت
if (!["pending", "approved"].includes(b.status)) {
  return;
}

  const bookingStart = DateTime
    .fromJSDate(b.booking_datetime)
    .setZone(BUSINESS_TIME_ZONE);
// const bookingStart = DateTime
//   .fromJSDate(new Date(b.booking_datetime))
//   .setZone(BUSINESS_TIME_ZONE);

  const startTime = bookingStart.toFormat("HH:mm");
  const start = timeToMinutes(startTime);

  const slots = Math.ceil(
    b.duration_minutes / slotDuration
  );

  for (let i = 0; i < slots; i++) {
    const slotTime = start + i * slotDuration;

    // Skip past slots on today
    if (
      bookingDate === currentDateStr &&
      slotTime < currentMinutes
    ) {
      continue;
    }

    blockedSlots.add(
      minutesToTime(slotTime)
    );
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
   console.error("Available slots error FULL:", error);
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

    const bookings =
      await Booking.getBookingWithFullDetailsModel();

    const formattedBookings =
      bookings.map((booking) => ({

        ...booking,

        disclaimer_status:
          booking.disclaimer_status ||
          "no_disclaimers",

      }));

    res.status(200).json(
      formattedBookings
    );

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Error fetching bookings"
    });
  }
};
// export const getBookingWithFullDetails = async (req, res) => {
//   try {

//     const result = await db.query(`
//      SELECT
//   bookings.id,
//   bookings.status,
//   bookings.note,
//   bookings.created_at,
  
//   -- UTC محفوظ + نسخة للعرض
//   bookings.booking_datetime,
//   (bookings.booking_datetime AT TIME ZONE 'UTC' AT TIME ZONE 'America/Montreal') 
//     AS booking_datetime_local,

//   bookings.total_amount,
//   bookings.disclaimer_status,

//   customers.name AS customer_name,
//   customers.email AS customer_email,
//   customers.phone AS customer_phone,

//   COALESCE(
//     json_agg(
//       json_build_object(
//         'id', services.id,
//         'name', services.name,
//         'duration', services.duration_minutes,
//         'price', services.price
//       )
//     ) FILTER (WHERE services.id IS NOT NULL),
//     '[]'
//   ) AS services

// FROM bookings
// JOIN customers ON bookings.customer_id = customers.id
// LEFT JOIN booking_services ON bookings.id = booking_services.booking_id
// LEFT JOIN services ON booking_services.service_id = services.id

// WHERE
//   bookings.status != 'cancel'
//   AND bookings.booking_datetime >= 
//       (NOW() AT TIME ZONE 'America/Montreal') AT TIME ZONE 'UTC'

// GROUP BY bookings.id, customers.id
// ORDER BY bookings.created_at DESC;
//     `);

//     const formattedBookings = result.rows.map((booking) => ({
//       ...booking,
//       disclaimer_status: booking.disclaimer_status || "no_disclaimers",
//     }));

//     res.json(formattedBookings);

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       message: "Error fetching bookings"
//     });
//   }
// };



// export const updateBookingStatus = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status } = req.body;

//     if (!status) {
//       return res.status(400).json({
//         message: "Status is required",
//       });
//     }

//     const updated =
//       await Booking.updateBookingStatus(
//         id,
//         status
//       );

//     if (!updated) {
//       return res.status(404).json({
//         message: "Booking not found",
//       });
//     }

//     res.json(updated);
//   } catch (error) {
//     console.error(
//       "Error updating booking status:",
//       error
//     );

//     res.status(500).json({
//       message: error.message,
//     });
//   }
// };

export const updateBookingStatus =
async (req, res) => {

  try {

    const { id } = req.params;

    const { status } = req.body;
console.log(
  "UPDATE STATUS HIT",
  id,
  status,
  new Date()
);
    if (!status) {
      return res.status(400).json({
        message: "Status is required",
      });
    }

    const updated =
      await Booking.updateBookingStatus(
        id,
        status
      );

    if (!updated) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    // ✅ إذا صار approved
    if (status === "approved") {




      const bookingDetails =
        await Booking.getBookingEmailDetails(
          id
        );




// نجهز الداتا للـ reminders + insert DB
const reminderBooking = {
  id: bookingDetails.id,
  booking_datetime: bookingDetails.booking_datetime,
  customer_email: bookingDetails.customer_email,
  customer_name: bookingDetails.customer_name,
  service_name: bookingDetails.services
    .map((s) => s.name)
    .join(", "),
};



const existing =
await db.query(
`
SELECT id
FROM booking_reminders
WHERE booking_id=$1
AND status='scheduled'
`,
[id]
);
console.log("BEFORE scheduleReminders");
if (existing.rows.length === 0) {
  await scheduleReminders(
    reminderBooking
  );
}

console.log("AFTER scheduleReminders");


// // ⬇️ هون أهم سطر
// await scheduleReminders(reminderBooking);





      if (
        bookingDetails?.customer_email
      ) {

       sendBookingApprovedEmail({

          to:
            bookingDetails.customer_email,

          customerName:
            bookingDetails.customer_name,

          serviceName:
            bookingDetails.services
              .map((s) => s.name)
              .join(", "),

          bookingDate:
            bookingDetails.booking_datetime,

        });

      }

      const bookingDate =
  new Date(
    bookingDetails.booking_datetime
  );

const now = new Date();

const diffHours =
  (bookingDate - now)
  / (1000 * 60 * 60);







    }

if (status === "cancelled") {

  const bookingDetails =
    await Booking.getBookingEmailDetails(
      id
    );

  if (
    bookingDetails?.customer_email
  ) {

  sendBookingCancelledEmail({

      to:
        bookingDetails.customer_email,

      customerName:
        bookingDetails.customer_name,

      serviceName:
        bookingDetails.services
          .map((s) => s.name)
          .join(", "),

      bookingDate:
        bookingDetails.booking_datetime,

    });

  }





schedule.cancelJob(
  `booking:${id}:48`
);

schedule.cancelJob(
  `booking:${id}:24`
);

schedule.cancelJob(
  `booking:${id}:12`
);



  await checkWaitingListForCancelledBooking(
    id
  );
console.log(
    "🔥 checkWaitingListForCancelledBooking called"
   
  );
}



    res.json(updated);

  } catch (error) {

    console.error(
      "Error updating booking status:",
      error
    );

    res.status(500).json({
      message: error.message,
    });

  }
};












export const getAllBookingsWithFullDetails = async (req, res) => {

  try {

    const bookings =
      await Booking.getAllBookingsWithFullDetailsModel();

    const formattedBookings =
      bookings.map((booking) => ({

        ...booking,

        disclaimer_status:
          booking.disclaimer_status ||
          "no_disclaimers",

      }));

    res.json(formattedBookings);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message:
        "Error fetching bookings"
    });
  }
};