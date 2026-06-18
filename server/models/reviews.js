// import db from "../config/db.js";

// const Reviews = {
//   create: async ({ service_id, name, comment, stars }) => {
//     const result = await db.query(
//       `INSERT INTO reviews (service_id, name, comment, stars, is_approved, is_public)
//        VALUES ($1, $2, $3, $4, false, false)
//        RETURNING *`,
//       [service_id || null, name, comment, stars]
//     );

//     return result.rows[0];
//   },

//   getAll: async () => {
//     const result = await db.query(
//       `SELECT * FROM reviews ORDER BY created_at DESC`
//     );

//     return result.rows;
//   },

//   getByServiceId: async (service_id) => {
//     const result = await db.query(
//       `SELECT * FROM reviews
//        WHERE service_id = $1 AND is_approved = true
//        ORDER BY created_at DESC`,
//       [service_id]
//     );

//     return result.rows;
//   },

//   getGeneral: async () => {
//     const result = await db.query(
//       `SELECT * FROM reviews
//        WHERE service_id IS NULL AND is_approved = true
//        ORDER BY created_at DESC`
//     );

//     return result.rows;
//   },

//   // ⭐ NEW FUNCTION (IMPORTANT)
//   getApprovedGeneralOnly: async () => {
//     const result = await db.query(
//       `SELECT * FROM reviews
//        WHERE service_id IS NULL
//        AND is_approved = true
//        ORDER BY created_at DESC`
//     );

//     return result.rows;
//   },

//   approve: async (id, is_approved, is_public) => {
//     const result = await db.query(
//       `UPDATE reviews
//        SET is_approved = $1,
//            is_public = $2
//        WHERE id = $3
//        RETURNING *`,
//       [is_approved, is_public, id]
//     );

//     return result.rows[0];
//   },

//   delete: async (id) => {
//     await db.query(`DELETE FROM reviews WHERE id = $1`, [id]);
//   }
// };

// module.exports = Reviews;