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
    userAgent
) {
    await db.query(
        `
        INSERT INTO refresh_tokens
        (token, admin_id, expires_at, user_agent)
        VALUES ($1, $2, $3, $4)
        `,
        [token, adminId, expiresAt, userAgent]
    );
}
export async function findRefreshToken(token) {

    const result = await db.query(

        `
        SELECT *
        FROM refresh_tokens
        WHERE token = $1
        `,

        [token]

    );

    return result.rows[0];

}

export async function deleteRefreshToken(token) {

    await db.query(

        `
        DELETE FROM refresh_tokens
        WHERE token = $1
        `,

        [token]

    );

}

export async function deleteAdminRefreshTokens(adminId) {

    await db.query(

        `
        DELETE FROM refresh_tokens
        WHERE admin_id = $1
        `,

        [adminId]

    );

}
export async function markRefreshTokenAsUsed(token) {
  await db.query(
    "UPDATE refresh_tokens SET used = true WHERE token = $1",
    [token]
  );
}