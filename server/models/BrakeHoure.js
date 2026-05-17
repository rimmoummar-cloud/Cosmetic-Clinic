import pool from "../config/db.js";
import { DateTime } from "luxon";
export const getAllWorkingHours = async () => {
  const query = `
    SELECT 
      id,
      work_date,
      start_time,
      end_time
    FROM breaks_houre
    ORDER BY work_date ASC
  `;

  const { rows } = await pool.query(query);
  return rows;
};
export const createWorkingHour = async (
  work_date,
  start_time,
  end_time
) => {
  const query = `
    INSERT INTO breaks_houre
      (work_date, start_time, end_time)
    VALUES
      ($1, $2, $3)
    RETURNING *
  `;

  const values = [work_date, start_time, end_time];

  const { rows } = await pool.query(query, values);
  return rows[0];
};

export const updateWorkingHour = async (
  id,
  work_date,
  start_time,
  end_time
) => {
  const query = `
    UPDATE breaks_houre
    SET
      work_date = $1,
      start_time = $2,
      end_time = $3
    WHERE id = $4
    RETURNING *
  `;

  const values = [
    work_date,
    start_time,
    end_time,
    id,
  ];

  const { rows } = await pool.query(query, values);
  return rows[0];
};

export const deleteWorkingHour = async (id) => {
  const query = `
    DELETE FROM breaks_houre
    WHERE id = $1
    RETURNING *
  `;

  const { rows } = await pool.query(query, [id]);
  return rows[0];
};




