import schedule from "node-schedule";
import db from "../config/db.js";
import { sendReminderEmail } from "../utils/sendEmail.js";
const BASE_URL =
  process.env.FRONTEND_URL ||
  "http://localhost:3000";
export async function restoreReminderJobs() {

  console.log("🔄 Restoring reminder jobs...");

  const result = await db.query(`
    SELECT
      br.id AS reminder_id,
      br.booking_id,
      br.reminder_type,
      br.scheduled_at,

      b.booking_datetime,
      b.status,

      c.name AS customer_name,
      c.email AS customer_email,

      COALESCE(
        json_agg(
          json_build_object(
            'name', s.name
          )
        ) FILTER (
          WHERE s.id IS NOT NULL
        ),
        '[]'
      ) AS services

    FROM booking_reminders br

    JOIN bookings b
      ON b.id = br.booking_id

    JOIN customers c
      ON c.id = b.customer_id

    LEFT JOIN booking_services bs
      ON bs.booking_id = b.id

    LEFT JOIN services s
      ON s.id = bs.service_id

    WHERE
      br.status = 'scheduled'
    

    GROUP BY
      br.id,
      b.id,
      c.id
  `);

  for (const reminder of result.rows) {

    const runAt = new Date(reminder.scheduled_at);

    const jobId =
      `booking:${reminder.booking_id}:${reminder.reminder_type}`;

    schedule.scheduleJob(jobId, runAt, async () => {

      try {

        // re-check booking status
        const check = await db.query(
          `SELECT status FROM bookings WHERE id = $1`,
          [reminder.booking_id]
        );

        const latestStatus = check.rows[0]?.status;

        if (latestStatus !== "approved") {
          console.log(
            `⛔ Reminder skipped - booking not approved`
          );
          return;
        }

const confirmUrl =
`${BASE_URL}/api/booking-reminders/confirm/${reminder.booking_id}/${reminder.reminder_id}`;

const cancelUrl =
`${BASE_URL}/api/booking-reminders/cancel/${reminder.booking_id}/${reminder.reminder_id}`;


 await sendReminderEmail({
  to: reminder.customer_email,
  customerName:
    reminder.customer_name,
  bookingDate:
    reminder.booking_datetime,
  serviceName:
    reminder.services
      .map(s => s.name)
      .join(", "),
  confirmUrl,
  cancelUrl
});

        // mark as sent
        await db.query(
          `
          UPDATE booking_reminders
          SET status = 'sent'
          WHERE id = $1
          `,
          [reminder.reminder_id]
        );

        console.log(
          `✅ Reminder restored & sent`
        );

      } catch (error) {

        console.log(
          "RESTORE REMINDER ERROR ❌",
          error.message
        );

      }
    });

    console.log(
      `✅ Restored job ${jobId}`
    );
  }
}