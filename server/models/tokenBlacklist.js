import db from "../config/db.js";

export async function blacklistToken(token, expiresAt) {

    await db.query(

        `
        INSERT INTO token_blacklist (token, expires_at)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING
        `,

        [token, expiresAt]

    );

}

export async function isTokenBlacklisted(token) {

    const result = await db.query(

        `
        SELECT 1
        FROM token_blacklist
        WHERE token = $1
        `,

        [token]

    );

    return result.rows.length > 0;

}