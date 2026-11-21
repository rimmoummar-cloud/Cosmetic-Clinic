import { DateTime } from "luxon";
import * as Reminder from "../models/bookingReminder.js";
import db from "../config/db.js";
import { getBookingEmailDetails } from "../models/booking.js";
import {
  createNotification
} from "../models/notification.js";
export async function getBookingReminders(req, res) {

  try {

    const { bookingId } = req.params;

    const reminders =
      await Reminder.getRemindersByBookingId(
        bookingId
      );

    res.json(reminders);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Error fetching reminders"
    });

  }
}






// ==========================
// Confirm Booking From Email
// ==========================

export async function confirmBookingFromReminder(
  req,
  res
) {

  try {

    const {
      bookingId,
      reminderId
    } = req.params;

    // =========================
    // CHECK IF ALREADY USED
    // =========================

    const reminderCheck = await db.query(
      `
      SELECT * FROM booking_reminders
      WHERE id = $1
      `,
      [reminderId]
    );

    const reminder =
      reminderCheck.rows[0];

    if (!reminder) {

      return res.send(`
        <div style="
          font-family:Arial;
          text-align:center;
          padding-top:80px;
        ">
          <h2>
            Reminder not found
          </h2>
        </div>
      `);

    }

    // =========================
    // ALREADY CLICKED
    // =========================

    if (
      reminder.status === "confirmed" ||
      reminder.status === "cancelled"
    ) {

      return res.send(`
        <div style="
          font-family:Arial;
          text-align:center;
          padding-top:80px;
        ">
          <h2>
            This reminder was already used ✨
          </h2>
        </div>
      `);

    }

    // =========================
    // UPDATE BOOKING
    // =========================

    // await db.query(
    //   `
    //   UPDATE bookings
    //   SET status = 'confirmed'
    //   WHERE id = $1
    //   `,
    //   [bookingId]
    // );

    // =========================
    // UPDATE REMINDER
    // =========================

    await Reminder.updateReminderStatus(
      reminderId,
      "confirmed"
    );

    let message = `Customer confirmed booking #${bookingId} from reminder email`;
    if (String(reminder.booking_id) === bookingId) {
      try {
        const booking = await getBookingEmailDetails(reminder.booking_id);
        const appointment = DateTime.fromJSDate(booking?.booking_datetime, {
          zone: "America/Montreal"
        });
        const services = booking?.services.map(({ name }) => name).filter(Boolean).join(", ");

        if (booking?.customer_name && services && appointment.isValid) {
          const dateTime = appointment.toFormat("yyyy-LL-dd 'at' HH:mm");
          message = `${booking.customer_name} confirmed booking #${bookingId} for ${dateTime} (Montreal time). Services: ${services}.`;
        }
      } catch {
        console.warn("Unable to load booking details for the reminder confirmation notification.");
      }
    }

    await createNotification({
      recipient_type: "admin",
      recipient_id: 1,
      booking_id: bookingId,
      type: "booking_reminder_confirmed",
      title: "Booking Confirmed",
      message
    });
    // =========================
    // SUCCESS PAGE
    // =========================

    res.send(`
      <div style="
        font-family:Arial;
        text-align:center;
        padding-top:80px;
      ">
        <h2>
          ✅ Booking confirmed successfully
        </h2>

        <p>
          Thank you 💖
        </p>
      </div>
    `);

  } catch (error) {

    console.error(error);

    res.status(500).send(
      "Error confirming booking"
    );

  }
}






// ==========================
// Cancel Booking From Email
// ==========================
export async function cancelBookingFromReminder(
  req,
  res
) {

  try {

    const {
      bookingId,
      reminderId
    } = req.params;

    // =========================
    // CHECK IF ALREADY USED
    // =========================

    const reminderCheck = await db.query(
      `
      SELECT * FROM booking_reminders
      WHERE id = $1
      `,
      [reminderId]
    );

    const reminder =
      reminderCheck.rows[0];

    if (!reminder) {

      return res.send(`
        <div style="
          font-family:Arial;
          text-align:center;
          padding-top:80px;
        ">
          <h2>
            Reminder not found
          </h2>
        </div>
      `);

    }

    // =========================
    // ALREADY CLICKED
    // =========================

    if (
      reminder.status === "confirmed" ||
      reminder.status === "cancelled"
    ) {

      return res.send(`
        <div style="
          font-family:Arial;
          text-align:center;
          padding-top:80px;
        ">
          <h2>
            This reminder was already used ✨
          </h2>
        </div>
      `);

    }

    // =========================
    // UPDATE BOOKING
    // =========================

    await db.query(
      `
      UPDATE bookings
      SET status = 'cancelled'
      WHERE id = $1
      `,
      [bookingId]
    );

    // =========================
    // UPDATE REMINDER
    // =========================

    await Reminder.updateReminderStatus(
      reminderId,
      "cancelled"
    );
await createNotification({
  recipient_type: "admin",
  recipient_id: 1,
  booking_id: bookingId,
  type: "booking_reminder_cancelled",
  title: "Booking Cancelled",
  message:
    `Customer cancelled booking #${bookingId} from reminder email`
});
    // =========================
    // SUCCESS PAGE
    // =========================

    res.send(`
      <div style="
        font-family:Arial;
        text-align:center;
        padding-top:80px;
      ">
        <h2>
          ❌ Booking cancelled
        </h2>

        <p>
          Your appointment has been cancelled.
        </p>
      </div>
    `);

  } catch (error) {

    console.error(error);

    res.status(500).send(
      "Error cancelling booking"
    );

  }
}
