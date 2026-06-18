import db from "../config/db.js";

class DashboardModel {
static async getStats() {
const [
todayBookings,
todayRevenue,
totalCustomers,
newCustomersToday,
totalServices,
pendingBookings,
approvedBookings,
revenueThisMonth,
completionRate,
mostRequested,
leastRequested,
notifications,
] = await Promise.all([


  // Today's Bookings
  db.query(`
    SELECT COUNT(*)::int AS total
    FROM bookings
    WHERE DATE(booking_datetime) = CURRENT_DATE
  `),

  // Today's Revenue
  db.query(`
    SELECT
      COALESCE(
        SUM(total_amount),
        0
      )::numeric AS total
    FROM bookings
    WHERE DATE(booking_datetime) = CURRENT_DATE
  `),

  // Total Customers
  db.query(`
    SELECT COUNT(*)::int AS total
    FROM customers
  `),

  // New Customers Today
  db.query(`
    SELECT COUNT(*)::int AS total
    FROM customers
    WHERE DATE(created_at)=CURRENT_DATE
  `),

  // Total Services
  db.query(`
    SELECT COUNT(*)::int AS total
    FROM services
  `),

  // Pending Bookings
  db.query(`
    SELECT COUNT(*)::int AS total
    FROM bookings
    WHERE status='pending'
  `),

  // Approved Bookings
  db.query(`
    SELECT COUNT(*)::int AS total
    FROM bookings
    WHERE status='approved'
  `),

  // Revenue This Month
  db.query(`
    SELECT
      COALESCE(
        SUM(total_amount),
        0
      )::numeric AS total
    FROM bookings
    WHERE DATE_TRUNC(
      'month',
      booking_datetime
    ) =
    DATE_TRUNC(
      'month',
      NOW()
    )
  `),

  // Completion Rate
  db.query(`
    SELECT
      CASE
        WHEN COUNT(*) = 0
        THEN 0
        ELSE ROUND(
          (
            COUNT(*)
            FILTER (
              WHERE status='completed'
            )::numeric
            /
            COUNT(*)
          ) * 100,
          2
        )
      END
      AS rate
    FROM bookings
  `),

  // Most Requested Service
  db.query(`
    SELECT
      s.id,
      s.name,
      COUNT(*)::int AS total
    FROM booking_services bs
    JOIN services s
      ON s.id = bs.service_id
    GROUP BY
      s.id,
      s.name
    ORDER BY total DESC
    LIMIT 1
  `),

  // Least Requested Service
  db.query(`
    SELECT
      s.id,
      s.name,
      COUNT(
        bs.service_id
      )::int AS total
    FROM services s
    LEFT JOIN booking_services bs
      ON bs.service_id = s.id
    GROUP BY
      s.id,
      s.name
    ORDER BY total ASC
    LIMIT 1
  `),

  // Unread Notifications
  db.query(`
    SELECT *
    FROM notifications
    WHERE is_read=false
    ORDER BY created_at DESC
    LIMIT 10
  `),
]);

return {
  todayBookings:
    todayBookings.rows[0].total,

  todayRevenue:
    todayRevenue.rows[0].total,

  totalCustomers:
    totalCustomers.rows[0].total,

  newCustomersToday:
    newCustomersToday.rows[0].total,

  totalServices:
    totalServices.rows[0].total,

  pendingBookings:
    pendingBookings.rows[0].total,

  approvedBookings:
    approvedBookings.rows[0].total,

  revenueThisMonth:
    revenueThisMonth.rows[0].total,

  completionRate:
    completionRate.rows[0].rate,

  mostRequestedService:
    mostRequested.rows[0] || null,

  leastRequestedService:
    leastRequested.rows[0] || null,

  unreadNotifications:
    notifications.rows,
};


}
}

export default DashboardModel;
