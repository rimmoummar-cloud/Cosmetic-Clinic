import db from "../config/db.js";

export async function getBookingDisclaimers(bookingId) {
      if (!bookingId) throw new Error("bookingId missing");
  const result = await db.query(
    `
    SELECT sd.title, sd.description
    FROM booking_services bs
    JOIN service_disclaimers sd
      ON sd.service_id = bs.service_id
    WHERE bs.booking_id = $1
      AND sd.is_active = true
    `,
    [bookingId]
  );

  return result.rows;
}