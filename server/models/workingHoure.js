// ==========================

import db from "../config/db.js";


// export const getWorkingHoursByDay = async (
//   client = null,
//   dayOfWeek
// ) => {
//   const queryExecutor = client || db;

//   const res = await queryExecutor.query(
//     `
//     SELECT
//       start_time,
//       end_time
//     FROM working_hours
//     WHERE day_of_week = $1
//     `,
//     [dayOfWeek]
//   );

//   return res.rows[0] || null;
// };
export const getWorkingHoursByDay = async (
  client = null,
  dayOfWeek
) => {
  const queryExecutor = client || db;

  const res = await queryExecutor.query(
    `
    SELECT
      start_time,
      end_time,
      is_day_off
    FROM working_hours
    WHERE day_of_week = $1
    `,
    [dayOfWeek]
  );

  return res.rows[0] || null;
};

export const getWorkingHours = async () => {

  const res = await db.query("SELECT * FROM working_hours");
 return res.rows;
};

export const updateWorkingHoure = async (id, data) => {
  const { start_time, end_time, is_day_off } = data;

  const result = await db.query(
    `
    UPDATE working_hours
    SET
      start_time = $1,
      end_time = $2,
      is_day_off = $3
    WHERE id = $4
    RETURNING *
    `,
    [start_time, end_time, is_day_off, id]
  );

  return result.rows[0];
};
// export const updateWorkingHoure = async (id, data) => {
//  const { start_time, end_time } = data;

//   const result = await db.query(
//     `UPDATE working_hours 
//      SET start_time=$1, end_time=$2
//      WHERE id=$3
//      RETURNING *`,
//     [start_time, end_time, id]
//   );

//   return result.rows[0];
// };
