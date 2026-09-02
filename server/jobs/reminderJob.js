// import schedule from "node-schedule";
// import redis from "../utils/redis.js";
// import db from "../config/db.js";
// import { sendReminderEmail } from "../utils/sendEmail.js";
// import { DateTime } from "luxon";
// import { createReminder } from "../models/bookingReminder.js";
// const TZ =
//   process.env.BUSINESS_TIME_ZONE ||
//   "America/Montreal";

// const getReminderBaseUrl = () => {
//   const configuredBaseUrl =
//     process.env.BACKEND_URL ||
//     process.env.FRONTEND_URL ||
//     process.env.APP_URL ||
//     "http://localhost:5000";

//   return configuredBaseUrl.replace(/\/+$/, "");
// };

// export async function scheduleReminders(booking) {
//   console.log("SCHEDULE REMINDERS HIT");
//   // =========================
//   // 🔥 1. CHECK STATUS FIRST (IMPORTANT)
//   // =========================
//   const statusRes = await db.query(
//     `SELECT status FROM bookings WHERE id = $1`,
//     [booking.id]
//   );

//   const currentStatus = statusRes.rows[0]?.status;

//   if (currentStatus !== "approved") {
//     console.log(
//       `⛔ Reminders blocked - status is ${currentStatus}`
//     );
//     return;
//   }

// const bookingTime =
// DateTime
// .fromJSDate(
//   new Date(booking.booking_datetime)
// )
// .setZone(TZ);
// console.log("BOOKING TIME (UTC)", bookingTime.toISO());



//   const now = DateTime.now().setZone(TZ);

//   const diffHours =
//     bookingTime.diff(now, "hours").hours;

//   const reminders = [];

//   // =========================
//   // CASE 1 -> MORE THAN 48h
//   // =========================
// if (diffHours >= 48){
//     reminders.push(48, 24);
//   }

//   // =========================
//   // CASE 2 -> BETWEEN 24h & 48h
//   // =========================
//  else if (diffHours >= 24) {
//     reminders.push(24);
//   }

//   // =========================
//   // CASE 3 -> LESS THAN 24h
//   // =========================
// else if (diffHours >= 12) {
//     reminders.push(12);
//   }



// const reminderMap = {};

// for (let hours of reminders) {

//   console.log("INSERTING REMINDER", hours);

//   const scheduledAt = bookingTime
//     .minus({ hours })
//     .toJSDate();

//   const reminder = await createReminder({
//     booking_id: booking.id,
//     reminder_type: `${hours}_hours_before`,
//     channel: "email",
//     status: "scheduled",
//     scheduled_at: scheduledAt,
//   });

//   reminderMap[hours] = reminder;
// }

//   // reminders.forEach((hours) => {

//   //   const runAt = bookingTime
//   //     .minus({ hours })
//   //     .toJSDate();

// reminders.forEach((hours) => {

//     const runAt = bookingTime
//       .minus({ hours })
//       .toJSDate();

//     console.log("RUN AT:", runAt);

//     if (runAt <= new Date()) {
//       console.log(
//         `Skipping reminder ${hours} for booking ${booking.id} because it is already due or in the past.`
//       );
//       return;
//     }

//     const jobId = `booking:${booking.id}:${hours}`;

//     redis.set(
//       jobId,
//       JSON.stringify(booking),
//       "EX",
//       60 * 60 * 72
//     );
//     console.log("BOOKING TIME", booking.booking_datetime);
//     console.log("NOW:", new Date());
//     console.log("RUN AT:", runAt);
//     console.log("DIFF(ms):", runAt - new Date());

//     schedule.scheduleJob(jobId, runAt, async () => {

//       try {
//   console.log("🔥 JOB STARTED");

//     const check = await db.query(
//       `SELECT status FROM bookings WHERE id = $1`,
//       [booking.id]
//     );

//     const latestStatus = check.rows[0]?.status;

//     const now = DateTime.now().setZone(TZ);

//     const bookingDate = DateTime
//       .fromJSDate(
//         new Date(booking.booking_datetime)
//       )
//       .setZone(TZ);

//     // if (latestStatus !== "approved") {
//     //   console.log(
//     //     `⛔ Reminder skipped - status changed to ${latestStatus}`
//     //   );
//     //   return;
//     // }
//     if (latestStatus !== "approved") {

//   console.log(
//     `⛔ Reminder skipped - status changed to ${latestStatus}`
//   );

//   await db.query(
//     `
//     UPDATE booking_reminders
//     SET status = 'cancelled'
//     WHERE booking_id = $1
//     AND status = 'scheduled'
//     `,
//     [booking.id]
//   );

//   return;
// }

//    if (now >= bookingDate) {
//       console.log(
//         `⛔ Reminder skipped - booking already completed`
//       );
// await db.query(
//   `
//   UPDATE booking_reminders
//   SET status = 'skipped'
//   WHERE booking_id = $1
//   AND status = 'scheduled'
//   `,
//   [booking.id]
// );
//       return;
//     }






//   const reminderRes = await db.query(
//   `SELECT id FROM booking_reminders
//    WHERE booking_id = $1
//    AND reminder_type = $2`,
//   [booking.id, `${hours}_hours_before`]
// );

// const reminder = reminderRes.rows[0];

// if (!reminder) {
//   console.log("Reminder not found in DB");
//   return;
// }


// const baseUrl = getReminderBaseUrl();
// const confirmUrl = new URL(
//   `/api/booking-reminders/confirm/${booking.id}/${reminder.id}`,
//   baseUrl
// ).toString();

// const cancelUrl = new URL(
//   `/api/booking-reminders/cancel/${booking.id}/${reminder.id}`,
//   baseUrl
// ).toString();

//        await sendReminderEmail({
//           to: booking.customer_email,
//           customerName: booking.customer_name,
//           bookingDate: booking.booking_datetime,
//           serviceName: booking.service_name || "Your Service",
//           confirmUrl,
//           cancelUrl,
//         });
// await db.query(
// `
// UPDATE booking_reminders
// SET status='sent',
//     sent_at=NOW()
// WHERE id=$1
// `,
// [reminder.id]
// );
//         console.log(`Reminder ${hours}h sent ✔️`);

//         await redis.del(jobId);

//       }catch (error) {
//   console.error("REMINDER JOB FAILED ❌", error);
// }
//     });
//   });
// }
import db from "../config/db.js";
import { DateTime } from "luxon";
import { createReminder } from "../models/bookingReminder.js";

const TZ =
  process.env.BUSINESS_TIME_ZONE ||
  "America/Montreal";

export async function scheduleReminders(booking) {
  console.log("SCHEDULE REMINDERS HIT");

  // =========================
  // 🔥 1. CHECK STATUS FIRST
  // =========================

  const statusRes = await db.query(
    `SELECT status FROM bookings WHERE id = $1`,
    [booking.id]
  );

  const currentStatus = statusRes.rows[0]?.status;

  if (currentStatus !== "approved") {
    console.log(
      `⛔ Reminders blocked - status is ${currentStatus}`
    );
    return;
  }

  // =========================
  // 🔥 2. GET BOOKING TIME
  // =========================

  const bookingTime =
    DateTime
      .fromJSDate(
        new Date(booking.booking_datetime)
      )
      .setZone(TZ);

  console.log(
    "BOOKING TIME (UTC)",
    bookingTime.toISO()
  );

  const now =
    DateTime.now().setZone(TZ);

  const diffHours =
    bookingTime.diff(now, "hours").hours;

  const reminders = [];

  // =========================
  // CASE 1 -> MORE THAN 48h
  // =========================

  if (diffHours >= 48) {
    reminders.push(48, 24);
  }

  // =========================
  // CASE 2 -> BETWEEN 24h & 48h
  // =========================

  else if (diffHours >= 24) {
    reminders.push(24);
  }

  // =========================
  // CASE 3 -> BETWEEN 12h & 24h
  // =========================

  else if (diffHours >= 12) {
    reminders.push(12);
  }

  // =========================
  // 🔥 3. CREATE DB REMINDERS
  // =========================

  for (const hours of reminders) {
    console.log(
      "INSERTING REMINDER",
      hours
    );

    const scheduledAt =
      bookingTime
        .minus({ hours })
        .toJSDate();

    await createReminder({
      booking_id: booking.id,
      reminder_type: `${hours}_hours_before`,
      channel: "email",
      status: "scheduled",
      scheduled_at: scheduledAt,
    });

    console.log(
      `✅ Reminder ${hours}h saved in database`
    );

    console.log(
      "SCHEDULED AT:",
      scheduledAt
    );
  }

  console.log(
    `✅ Reminder scheduling completed for booking ${booking.id}`
  );
}