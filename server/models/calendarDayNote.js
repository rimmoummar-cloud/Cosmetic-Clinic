import db from "../config/db.js";

const CalendarDayNote = {
  getByDate: async (date) => {
    const result = await db.query(
      `SELECT id, note_date, title, description
       FROM calendar_day_notes
       WHERE note_date = $1::date
       ORDER BY id`,
      [date]
    );
    return result.rows;
  },

  getByDateRange: async (startDate, endDate) => {
    const result = await db.query(
      `SELECT id, note_date, title, description
       FROM calendar_day_notes
       WHERE note_date BETWEEN $1::date AND $2::date
       ORDER BY note_date, id`,
      [startDate, endDate]
    );
    return result.rows;
  },

  create: async ({ note_date, title, description }) => {
    const result = await db.query(
      `INSERT INTO calendar_day_notes (note_date, title, description)
       VALUES ($1::date, $2, $3)
       RETURNING id, note_date, title, description`,
      [note_date, title, description]
    );
    return result.rows[0];
  },

  update: async (id, { note_date, title, description }) => {
    const result = await db.query(
      `UPDATE calendar_day_notes
       SET note_date = $1::date, title = $2, description = $3
       WHERE id = $4
       RETURNING id, note_date, title, description`,
      [note_date, title, description, id]
    );
    return result.rows[0] ?? null;
  },

  delete: async (id) => {
    const result = await db.query(
      `DELETE FROM calendar_day_notes
       WHERE id = $1
       RETURNING id`,
      [id]
    );
    return result.rows[0] ?? null;
  },
};

export default CalendarDayNote;
