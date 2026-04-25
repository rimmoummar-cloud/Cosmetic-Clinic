import db from "../config/db.js";

// ===== OVERRIDES =====
export const getOverrideByDate = async (date) => {
  const res = await db.query(
    `SELECT * FROM working_hours_overrides WHERE work_date=$1`,
    [date]
  );

  return res.rows[0] || null;
};

export const createOverride = async (data) => {
  const { work_date, start_time, end_time, is_day_off } = data;

  const res = await db.query(
    `INSERT INTO working_hours_overrides
     (work_date, start_time, end_time, is_day_off)
     VALUES ($1,$2,$3,$4)
     RETURNING *`,
    [work_date, start_time, end_time, is_day_off || false]
  );

  return res.rows[0];
};

export const updateOverride = async (id, data) => {
  const { work_date, start_time, end_time, is_day_off } = data;

  const res = await db.query(
    `UPDATE working_hours_overrides
     SET work_date=$1, start_time=$2, end_time=$3, is_day_off=$4
     WHERE id=$5 RETURNING *`,
    [work_date, start_time, end_time, is_day_off, id]
  );

  return res.rows[0];
};

export const deleteOverride = async (id) => {
  await db.query(`DELETE FROM working_hours_overrides WHERE id=$1`, [id]);
};


export const getUpcomingWorkingHours = async () => {
  const query = `
    SELECT *
    FROM working_hours_overrides
    WHERE work_date >= CURRENT_DATE
    ORDER BY work_date ASC
  `;

  const { rows } = await db.query(query);
  return rows;
};

export const checkOverrideDates = async (date) => {
  const res = await db.query(
    `SELECT * FROM working_hours_overrides WHERE work_date=$1`,
    [date]
  );

  return res.rows[0] || null;
};
