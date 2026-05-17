import db from "../config/db.js";

export async function cleanupRefreshTokens() {

    await db.query(
        `
        DELETE FROM refresh_tokens
        WHERE expires_at < NOW()
        `
    );

    console.log(
        "Expired refresh tokens cleaned"
    );

}

