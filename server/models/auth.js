import db from "../config/db.js";



export async function findAdminByEmail(email) {

    const result = await db.query(
        `
       SELECT id, email, password
FROM admins
WHERE email = $1
        `,
        [email]
    );

    return result.rows[0];

}

export async function findAdminById(id) {
    const result = await db.query(
        `
        SELECT id, email
        FROM admins
        WHERE id = $1
        `,
        [id]
    );

    return result.rows[0];
}
// export async function createAdmin(email, hashedPassword) {

//     const result = await db.query(
//         `
//         INSERT INTO admins
//         (email, password)
//         VALUES ($1, $2)
//         RETURNING id, email, created_at
//         `,
//         [email, hashedPassword]
//     );

//     return result.rows[0];

// }