import db from "../config/db.js";

// export const saveAcceptance =
//   async (
//     client,
//     bookingId,
//     disclaimerId
//   ) => {
//     const result = await client.query(
//       `
//       INSERT INTO booking_disclaimer_acceptance
//       (
//         booking_id,
//         disclaimer_id,
//         is_accepted,
//         accepted_at
//       )
//       VALUES ($1, $2, true, NOW())

//       RETURNING *
//       `,
//       [bookingId, disclaimerId]
//     );

//     return result.rows[0];
//   };
export const getAcceptedDisclaimersFullDetails = async () => {
  const result = await db.query(`
    SELECT

      -- كل بيانات acceptance
      bda.id,
      bda.booking_id,
      bda.service_id,
      bda.disclaimer_id,
      bda.is_accepted,
      bda.accepted_at,
      bda.created_at,
      bda.signature,
      bda.disclaimer_title,
      bda.disclaimer_description,
      bda.disclaimer_type,

      -- service
      s.name AS service_name,

      -- customer
      c.name AS customer_name

    FROM booking_disclaimer_acceptance bda

    LEFT JOIN services s
      ON bda.service_id = s.id

    LEFT JOIN bookings b
      ON bda.booking_id = b.id

    LEFT JOIN customers c
      ON b.customer_id = c.id

    ORDER BY bda.created_at DESC
  `);

  return result.rows;
};