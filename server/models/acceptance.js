// import db from "../config/db.js";

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