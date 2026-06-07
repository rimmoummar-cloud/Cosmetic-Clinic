import db from "../config/db.js";

export const createContactMessage = async ({
  name,
  email,
  message,
}) => {
  const result = await db.query(
    `
    INSERT INTO contact_messages (
      name,
      email,
      message
    )
    VALUES ($1, $2, $3)
    RETURNING *
    `,
    [name, email, message]
  );

  return result.rows[0];
};

export const getAllContactMessages = async () => {
  const result = await db.query(
    `
    SELECT *
    FROM contact_messages
    ORDER BY created_at DESC
    `
  );

  return result.rows;
};

export const getContactMessageById = async (id) => {
  const result = await db.query(
    `
    SELECT *
    FROM contact_messages
    WHERE id = $1
    `,
    [id]
  );

  return result.rows[0];
};

export const deleteContactMessage = async (id) => {
  const result = await db.query(
    `
    DELETE FROM contact_messages
    WHERE id = $1
    RETURNING *
    `,
    [id]
  );

  return result.rows[0];
};