// import db from "../config/db.js";
// import { DateTime } from "luxon";

// const BUSINESS_TIME_ZONE = process.env.BUSINESS_TIME_ZONE || "America/Montreal";

// export const getCalendarBookings = async ({ view = "month", date }) => {
//   const baseDate = date
//     ? DateTime.fromISO(date, { zone: BUSINESS_TIME_ZONE, setZone: true })
//     : DateTime.now().setZone(BUSINESS_TIME_ZONE);

//   if (!baseDate.isValid) {
//     throw new Error("Invalid calendar date");
//   }

//   let startDateTime;
//   let endDateTime;

//   switch (view) {
//     case "week":
//       startDateTime = baseDate.startOf("week");
//       endDateTime = baseDate.endOf("week");
//       break;
//     case "day":
//       startDateTime = baseDate.startOf("day");
//       endDateTime = baseDate.endOf("day");
//       break;
//     case "month":
//     default:
//       startDateTime = baseDate.startOf("month");
//       endDateTime = baseDate.endOf("month");
//       break;
//   }

//   const startUtc = startDateTime.toUTC().toISO();
//   const endUtc = endDateTime.toUTC().toISO();

//   const result = await db.query(
//     `
//       SELECT
//         b.id AS booking_id,
//         b.booking_datetime,
//         b.duration_minutes AS service_duration,
//         c.name AS customer_name,
//         COALESCE(
//           string_agg(s.name, ', ' ORDER BY s.name),
//           'Service'
//         ) AS service_name
//       FROM bookings b
//       JOIN customers c ON c.id = b.customer_id
//       LEFT JOIN booking_services bs ON bs.booking_id = b.id
//       LEFT JOIN services s ON s.id = bs.service_id
//       WHERE b.booking_datetime >= $1
//         AND b.booking_datetime < $2
//         AND b.status = 'approved'
//       GROUP BY b.id, c.id
//       ORDER BY b.booking_datetime ASC;
//     `,
//     [startUtc, endUtc]
//   );

//   return result.rows.map((row) => {
//     const startLocal = DateTime.fromJSDate(row.booking_datetime, {
//       zone: BUSINESS_TIME_ZONE,
//     });

//     const endLocal = startLocal.plus({
//       minutes: Number(row.service_duration || 0),
//     });

//     return {
//       id: row.booking_id,
//       title: `${row.customer_name} - ${row.service_name}`,
//       customer_name: row.customer_name,
//       service_name: row.service_name,
//       start: startLocal.toFormat("yyyy-MM-dd'T'HH:mm:ss"),
//       end: endLocal.toFormat("yyyy-MM-dd'T'HH:mm:ss"),
//       duration: Number(row.service_duration || 0),
//     };
//   });
// };
import db from "../config/db.js";
import { DateTime } from "luxon";

const BUSINESS_TIME_ZONE =
  process.env.BUSINESS_TIME_ZONE || "America/Montreal";

export const getCalendarBookings = async ({ view = "month", date }) => {
  const baseDate = date
    ? DateTime.fromISO(date, {
        zone: BUSINESS_TIME_ZONE,
        setZone: true,
      })
    : DateTime.now().setZone(BUSINESS_TIME_ZONE);

  if (!baseDate.isValid) {
    throw new Error("Invalid calendar date");
  }

  let startDateTime;
  let endDateTime;

  switch (view) {
    case "week":
      startDateTime = baseDate.startOf("week");
      endDateTime = baseDate.endOf("week");
      break;

    case "day":
      startDateTime = baseDate.startOf("day");
      endDateTime = baseDate.endOf("day");
      break;

    case "month":
    default:
      startDateTime = baseDate.startOf("month");
      endDateTime = baseDate.endOf("month");
      break;
  }

  const startUtc = startDateTime.toUTC().toISO();
  const endUtc = endDateTime.toUTC().toISO();

  const result = await db.query(
    `
      SELECT
        b.id AS booking_id,
        b.booking_datetime,
        b.duration_minutes AS service_duration,
        b.status,
        c.name AS customer_name,
        COALESCE(
          string_agg(s.name, ', ' ORDER BY s.name),
          'Service'
        ) AS service_name
      FROM bookings b
      JOIN customers c ON c.id = b.customer_id
      LEFT JOIN booking_services bs ON bs.booking_id = b.id
      LEFT JOIN services s ON s.id = bs.service_id
      WHERE b.booking_datetime >= $1
        AND b.booking_datetime < $2
      GROUP BY b.id, c.id
      ORDER BY b.booking_datetime ASC;
    `,
    [startUtc, endUtc]
  );

  return result.rows.map((row) => {
    const startLocal = DateTime.fromJSDate(row.booking_datetime, {
      zone: BUSINESS_TIME_ZONE,
    });

    const endLocal = startLocal.plus({
      minutes: Number(row.service_duration || 0),
    });

    return {
      id: row.booking_id,
      title: `${row.customer_name} - ${row.service_name}`,
      customer_name: row.customer_name,
      service_name: row.service_name,

      // Important: send status to frontend
      status: row.status,

      start: startLocal.toFormat("yyyy-MM-dd'T'HH:mm:ss"),
      end: endLocal.toFormat("yyyy-MM-dd'T'HH:mm:ss"),
      duration: Number(row.service_duration || 0),
    };
  });
};