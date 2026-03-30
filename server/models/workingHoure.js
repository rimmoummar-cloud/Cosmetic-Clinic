// ==========================

import db from "../config/db.js";
// Working Hours functions
// ==========================
export const getWorkingHoursByDay = async ( client = null ,dayOfWeek) => {
    const queryExecutor = client || db;
  const res = await queryExecutor.query(
    "SELECT start_time, end_time FROM working_hours WHERE day_of_week=$1",
    [dayOfWeek]
  );
  return res.rows[0] || null;
};

export const getWorkingHours = async () => {

  const res = await db.query("SELECT * FROM working_hours");
 return res.rows;
};

export const createWorkTime = async (data) => {
  const {day_of_week, start_time, end_time } = data;

  const result = await db.query(
    `INSERT INTO working_hours 
    (day_of_week ,start_time, end_time )
    VALUES ($1,$2,$3)
    RETURNING *`,
    [day_of_week ,start_time, end_time ]
  );

  return result.rows[0];
};



export const updateWorkingHoure = async (id, data) => {
 const {day_of_week, start_time, end_time } = data;

  const result = await db.query(
    `UPDATE working_hours 
     SET day_of_week=$1, start_time=$2, end_time=$3
     WHERE id=$4
     RETURNING *`,
  [day_of_week ,start_time, end_time ,id]
  );

  return result.rows[0];
};

export const deleteWorkingHoure = async (id) => {
  await db.query("DELETE FROM working_hours WHERE id=$1", [id]);
};