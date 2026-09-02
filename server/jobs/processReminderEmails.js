import db from "../config/db.js";
import { sendReminderEmail } from "../utils/sendEmail.js";

const getReminderBaseUrl = () => {
  const configuredBaseUrl =
    process.env.BACKEND_URL ||
    process.env.FRONTEND_URL ||
    process.env.APP_URL ||
    "http://localhost:5000";

  return configuredBaseUrl.replace(/\/+$/, "");
};

export async function processReminderEmails() {
  console.log("======================================");
  console.log("🔔 REMINDER CRON STARTED");
  console.log("TIME:", new Date());
  console.log("======================================");

  const client = await db.connect();

  let locked = false;

  try {
    // ======================================
    // 🔒 Prevent overlapping cron executions
    // ======================================

    const lockResult = await client.query(
      `
      SELECT pg_try_advisory_lock($1) AS locked
      `,
      [987654321]
    );

    locked = lockResult.rows[0]?.locked;

    if (!locked) {
      console.log(
        "⏳ Another reminder worker is already running."
      );

      return;
    }

    // ======================================
    // Find due reminders
    // ======================================

    const result = await client.query(`
      SELECT
        br.id AS reminder_id,
        br.booking_id,
        br.reminder_type,
        br.scheduled_at,

        b.booking_datetime,
        b.status AS booking_status,

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
        AND br.scheduled_at <= NOW()

      GROUP BY
        br.id,
        b.id,
        c.id

      ORDER BY
        br.scheduled_at ASC
    `);

    console.log(
      `📋 Due reminders found: ${result.rows.length}`
    );

    // ======================================
    // Process each reminder
    // ======================================

    for (const reminder of result.rows) {
      console.log("--------------------------------------");

      console.log(
        "PROCESSING REMINDER:",
        reminder.reminder_id
      );

      console.log(
        "BOOKING ID:",
        reminder.booking_id
      );

      console.log(
        "REMINDER TYPE:",
        reminder.reminder_type
      );

      console.log(
        "SCHEDULED AT:",
        reminder.scheduled_at
      );

      // ======================================
      // Check booking status
      // ======================================

      const bookingCheck = await client.query(
        `
        SELECT status
        FROM bookings
        WHERE id = $1
        `,
        [reminder.booking_id]
      );

      const latestStatus =
        bookingCheck.rows[0]?.status;

      // ======================================
      // Booking no longer approved
      // ======================================

      if (latestStatus !== "approved") {
        console.log(
          `⛔ Reminder skipped - booking status is ${latestStatus}`
        );

        await client.query(
          `
          UPDATE booking_reminders
          SET status = 'cancelled'
          WHERE id = $1
          AND status = 'scheduled'
          `,
          [reminder.reminder_id]
        );

        continue;
      }

      // ======================================
      // Check if booking time has passed
      // ======================================

      const bookingDate =
        new Date(reminder.booking_datetime);

      const now = new Date();

      if (now >= bookingDate) {
        console.log(
          "⛔ Reminder skipped - booking already completed"
        );

        await client.query(
          `
          UPDATE booking_reminders
          SET status = 'skipped'
          WHERE id = $1
          AND status = 'scheduled'
          `,
          [reminder.reminder_id]
        );

        continue;
      }

      // ======================================
      // Build service name
      // ======================================

      const serviceName =
        Array.isArray(reminder.services)
          ? reminder.services
              .map((service) => service.name)
              .filter(Boolean)
              .join(", ")
          : "Your Service";

      // ======================================
      // Build confirmation/cancellation URLs
      // ======================================

      const baseUrl =
        getReminderBaseUrl();

      const confirmUrl =
        new URL(
          `/api/booking-reminders/confirm/${reminder.booking_id}/${reminder.reminder_id}`,
          baseUrl
        ).toString();

      const cancelUrl =
        new URL(
          `/api/booking-reminders/cancel/${reminder.booking_id}/${reminder.reminder_id}`,
          baseUrl
        ).toString();

      console.log(
        "CONFIRM URL:",
        confirmUrl
      );

      console.log(
        "CANCEL URL:",
        cancelUrl
      );

      // ======================================
      // Send reminder email
      // ======================================

      const emailResult =
        await sendReminderEmail({
          to: reminder.customer_email,
          customerName: reminder.customer_name,
          bookingDate: reminder.booking_datetime,
          serviceName,
          confirmUrl,
          cancelUrl,
        });

      // ======================================
      // IMPORTANT:
      // Only mark as sent if email succeeded
      // ======================================

      if (!emailResult) {
        console.log(
          "❌ Reminder email failed."
        );

        console.log(
          "Reminder remains scheduled for retry."
        );

        continue;
      }

      // ======================================
      // Mark reminder as sent
      // ======================================

      await client.query(
        `
        UPDATE booking_reminders
        SET
          status = 'sent',
          sent_at = NOW()
        WHERE id = $1
        AND status = 'scheduled'
        `,
        [reminder.reminder_id]
      );

      console.log(
        `✅ Reminder sent successfully: ${reminder.reminder_type}`
      );
    }

    console.log("======================================");
    console.log(
      "✅ REMINDER CRON FINISHED SUCCESSFULLY"
    );
    console.log("======================================");

  } catch (error) {
    console.error(
      "❌ REMINDER CRON FATAL ERROR:"
    );

    console.error(error);

  } finally {
    // ======================================
    // Release PostgreSQL advisory lock
    // ======================================

    if (locked) {
      try {
        await client.query(
          `
          SELECT pg_advisory_unlock($1)
          `,
          [987654321]
        );

        console.log(
          "🔓 PostgreSQL advisory lock released."
        );
      } catch (unlockError) {
        console.error(
          "❌ Failed to release PostgreSQL advisory lock:"
        );

        console.error(unlockError);
      }
    }

    client.release();
  }
}

// ======================================
// Run worker
// ======================================

