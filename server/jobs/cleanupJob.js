import schedule from "node-schedule";
import db from "../config/db.js";
import redis from "../utils/redis.js";

export function startCleanupJob() {
  // schedule.scheduleJob("*/30 * * * *", async () => {
  //   const expired = await db.query(`
  //     UPDATE bookings
  //     SET status = 'completed'
  //     WHERE booking_datetime < NOW()
  //     AND status != 'cancelled'
  //     RETURNING id
  //   `);

  //   for (let b of expired.rows) {
  //     await redis.del(`booking:${b.id}:*`);
  //   }

  //   console.log("Cleanup done ✔️");
  // });

 schedule.scheduleJob("*/30 * * * *", async () => {

  // 1. pending → cancelled (if time passed)
  await db.query(`
    UPDATE bookings
    SET status = 'cancelled'
    WHERE booking_datetime < NOW()
    AND status = 'pending'
  `);

  // 2. approved → completed (if time passed)
  await db.query(`
    UPDATE bookings
    SET status = 'completed'
    WHERE booking_datetime < NOW()
    AND status = 'approved'
  `);

  console.log("Cleanup done ✔️");
});
}