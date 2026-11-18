import db from "../config/db.js";

// export async function saveRefreshToken(
//     token,
//     adminId,
//     expiresAt
// ) {

//     await db.query(

//         `
//         INSERT INTO refresh_tokens
//        (token, admin_id, expires_at, user_agent)

//         VALUES ($1, $2, $3, $4)
//         `,

//         [token, adminId, expiresAt, req.headers["user-agent"]]

//     );

// }
export async function saveRefreshToken(
    token,
    adminId,
    expiresAt,
    userAgent,
    client = null
) {
    await (client || db).query(
        `
        INSERT INTO refresh_tokens
        (token, admin_id, expires_at, user_agent)
        VALUES ($1, $2, $3, $4)
        `,
        [token, adminId, expiresAt, userAgent]
    );
}
export async function findRefreshToken(token, client = null) {
    if (client) {
        const owner = await client.query("SELECT admin_id FROM refresh_tokens WHERE token = $1", [token]);
        if (!owner.rows[0]) return undefined;
        // Serialize rotation and account-wide revocation before locking any rows.
        await client.query("SELECT pg_advisory_xact_lock(701173, $1::integer)", [owner.rows[0].admin_id]);
    }

    const result = await (client || db).query(

        `
        SELECT *
        FROM refresh_tokens
        WHERE token = $1
        ${client ? "FOR UPDATE" : ""}
        `,

        [token]

    );

    return result.rows[0];

}

export async function deleteRefreshToken(token, client = null) {

    await (client || db).query(

        `
        DELETE FROM refresh_tokens
        WHERE token = $1
        `,

        [token]

    );

}

export async function deleteAdminRefreshTokens(adminId, client = null) {
    const transaction = client || await db.connect();
    try {
        if (!client) await transaction.query("BEGIN");
        await transaction.query("SELECT pg_advisory_xact_lock(701173, $1::integer)", [adminId]);
        await transaction.query(

        `
        DELETE FROM refresh_tokens
        WHERE admin_id = $1
        `,

        [adminId]

    );
        if (!client) await transaction.query("COMMIT");
    } catch (error) {
        if (!client) await transaction.query("ROLLBACK");
        throw error;
    } finally {
        if (!client) transaction.release();
    }
}
export async function markRefreshTokenAsUsed(token, client = null) {
  await (client || db).query(
    "UPDATE refresh_tokens SET used = true WHERE token = $1",
    [token]
  );
}
