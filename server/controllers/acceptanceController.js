
import db from "../config/db.js";
import * as Booking from "../models/booking.js";
import * as Accepted from "../models/acceptance.js";
import {
  createNotification
} from "../models/notification.js";
export const acceptDisclaimers = async (req, res) => {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    // 1. Extract body FIRST
    const { token, disclaimerIds, signature } = req.body;

    // 2. Validate input
    if (!token) {
      return res.status(400).json({
        message: "token is required",
      });
    }

    if (!Array.isArray(disclaimerIds) || disclaimerIds.length === 0) {
      return res.status(400).json({
        message: "disclaimerIds must be a non-empty array",
      });
    }

    // 3. Get bookingId from token
    const bookingRes = await client.query(
      `SELECT id FROM bookings WHERE acceptance_token = $1`,
      [token]
    );

    const bookingId = bookingRes.rows[0]?.id;

    if (!bookingId) {
      return res.status(404).json({
        message: "Invalid token",
      });
    }

    // 4. Get services linked to booking
    const servicesRes = await client.query(
      `SELECT service_id FROM booking_services WHERE booking_id = $1`,
      [bookingId]
    );

    const serviceIds = servicesRes.rows.map((s) => s.service_id);

    if (serviceIds.length === 0) {
      return res.status(404).json({
        message: "No services found for this booking",
      });
    }
const booking = await client.query(
  `SELECT disclaimer_status FROM bookings WHERE id = $1`,
  [bookingId]
);

if (!booking.rows.length) {
  return res.status(404).json({ message: "Booking not found" });
}

const status = booking.rows[0].disclaimer_status;

if (status === "accepted") {
  return res.status(409).json({
    message: "Already accepted before"
  });
}

if (status === "cancelled") {
  return res.status(403).json({
    message: "Booking is cancelled"
  });
}
    // 5. Loop services + disclaimers
    for (const serviceId of serviceIds) {
      for (const id of disclaimerIds) {

        const { rows } = await client.query(
          `SELECT title, description, type 
           FROM service_disclaimers 
           WHERE id = $1`,
          [id]
        );

        const disclaimer = rows[0];
        if (!disclaimer) continue;




        
        await client.query(
          `
          INSERT INTO booking_disclaimer_acceptance
          (
            booking_id,
            service_id,
            disclaimer_id,
            disclaimer_title,
            disclaimer_description,
            disclaimer_type,
            is_accepted,
            accepted_at,
            signature
          )
          SELECT $1,$2,$3,$4,$5,$6,TRUE,NOW(),$7
          WHERE NOT EXISTS (
            SELECT 1
            FROM booking_disclaimer_acceptance
            WHERE booking_id = $1
              AND service_id = $2
              AND disclaimer_id = $3
          )
          `,
          [
            bookingId,
            serviceId,
            id,
            disclaimer.title,
            disclaimer.description,
            disclaimer.type,
            signature || null,
          ]
        );
      }
    }

    // 6. Update booking status
    await Booking.updateDisclaimerStatus(bookingId, "accepted");
    await createNotification({
  recipient_type: "admin",
  recipient_id: 1,
  booking_id: bookingId,
  type: "disclaimer_accepted",
  title: "Disclaimer Accepted",
  message:
    `Booking #${bookingId} accepted all treatment disclaimers`
});

    await client.query("COMMIT");

    return res.status(200).json({
      success: true,
      message: "Disclaimers accepted successfully",
    });

  } catch (error) {
    await client.query("ROLLBACK");

    console.error("ACCEPT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while accepting disclaimers",
    });

  } finally {
    client.release();
  }
};

export const getAcceptedDisclaimers = async (req, res) => {
  try {
    const data =
      await Accepted.getAcceptedDisclaimersFullDetails();

    return res.status(200).json(data);

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Error fetching accepted disclaimers",
    });
  }
};