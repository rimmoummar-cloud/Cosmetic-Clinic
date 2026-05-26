import db from "../config/db.js";

export async function createReminder(data) {
  const result = await db.query(
    `
    INSERT INTO booking_reminders
    (booking_id, reminder_type, channel, status, scheduled_at)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
    `,
    [
      data.booking_id,
      data.reminder_type,
      data.channel || "email",
      data.status || "scheduled",
      data.scheduled_at,
    ]
  );

  return result.rows[0];
}

export async function getRemindersByBookingId(bookingId) {
  const result = await db.query(
    `
    SELECT * FROM booking_reminders
    WHERE booking_id = $1
    ORDER BY scheduled_at ASC
    `,
    [bookingId]
  );

  return result.rows;
}

export async function updateReminderStatus(id, status) {
  const result = await db.query(
    `
    UPDATE booking_reminders
    SET status = $1,
        sent_at = CASE WHEN $1 = 'sent' THEN NOW() ELSE sent_at END
    WHERE id = $2
    RETURNING *
    `,
    [status, id]
  );

  return result.rows[0];
}