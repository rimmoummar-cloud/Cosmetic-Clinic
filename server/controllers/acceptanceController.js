import db from "../config/db.js";
import * as Booking from "../models/booking.js";

export const acceptDisclaimers = async (req, res) => {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const { bookingId } = req.params;
    const { disclaimerIds, signature } = req.body;

    if (!Array.isArray(disclaimerIds) || disclaimerIds.length === 0) {
      return res.status(400).json({
        message: "disclaimerIds must be a non-empty array",
      });
    }

    const servicesRes = await client.query(
      `SELECT service_id FROM booking_services WHERE booking_id = $1`,
      [bookingId]
    );

    const serviceIds = servicesRes.rows.map((s) => s.service_id);

    for (const serviceId of serviceIds) {
      for (const id of disclaimerIds) {
        const { rows } = await client.query(
          `SELECT title, description, type FROM service_disclaimers WHERE id = $1`,
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

    await Booking.updateDisclaimerStatus(bookingId, "accepted");

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