// import db from "../config/db.js";

// export async function cleanupRefreshTokens() {

//     await db.query(
//         `
//         DELETE FROM refresh_tokens
//         WHERE expires_at < NOW()
//         `
//     );

//     console.log(
//         "Expired refresh tokens cleaned"
//     );

// }



import db from "../config/db.js";

export async function cleanupRefreshTokens() {
  try {
    const result = await db.query(`
      DELETE FROM refresh_tokens
      WHERE expires_at < NOW()
    `);

    console.log(
      "Expired refresh tokens cleaned:",
      result.rowCount
    );

  } catch (err) {
    console.error("cleanupRefreshTokens failed:", err.message);
  }
}