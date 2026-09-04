import db from "../config/db.js";

export const getNotesByCustomerID = async (customerId) => {
  const result = await db.query(
    `SELECT *
     FROM notes
     WHERE customer_id = $1
     ORDER BY created_at DESC`,
    [customerId]
  );

  return result.rows;
};

export const createNote = async (customerId, data) => {
  const { note } = data;

  const result = await db.query(
    `INSERT INTO notes (customer_id, note)
     VALUES ($1, $2)
     RETURNING *`,
    [customerId, note]
  );

  return result.rows[0];
};

export const updateNote = async (id, data) => {
  const { note } = data;

  const result = await db.query(
    `UPDATE notes
     SET note = $1
     WHERE id = $2
     RETURNING *`,
    [note, id]
  );

  return result.rows[0];
};

export const deleteNote = async (id) => {
  const result = await db.query(
    `DELETE FROM notes
     WHERE id = $1
     RETURNING *`,
    [id]
  );

  return result.rows[0];
};