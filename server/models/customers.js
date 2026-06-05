import db from '../config/db.js';

export const getCustomers = async () => {
  const result = await db.query("SELECT * FROM customers");
  return result.rows;
};

export const createCustomer = async (data) => {
  const { name, phone, email } = data;

  const result = await db.query(
    `INSERT INTO customers (name, phone, email)
     VALUES ($1,$2,$3)
     RETURNING *`,
    [name, phone, email]
  );

  return result.rows[0];
};

export const findCustomerByPhone = async (phone) => {
  const result = await db.query(
    "SELECT * FROM customers WHERE phone=$1",
    [phone]
  );
  return result.rows[0];
};




export const findCustomerByID = async (id) => {
  const result = await db.query(
    "SELECT * FROM customers WHERE id=$1",
    [id]
  );
  return result.rows[0];
};





export const getCustomersAnalytics = async () => {

  const result = await db.query(`
    SELECT
      c.id,
      c.name,
      c.phone,
      c.email,

      COUNT(DISTINCT b.id) AS total_bookings,

      COALESCE(
        SUM(
          CASE
            WHEN b.status IN ('approved','pending')
            THEN b.total_amount
            ELSE 0
          END
        ),
        0
      ) AS total_spent,

      MAX(b.booking_datetime) AS last_booking,

      (
        SELECT s.name
        FROM bookings b2
        JOIN booking_services bs
          ON bs.booking_id = b2.id
        JOIN services s
          ON s.id = bs.service_id
        WHERE b2.customer_id = c.id
        GROUP BY s.id, s.name
        ORDER BY COUNT(*) DESC
        LIMIT 1
      ) AS favorite_service

    FROM customers c

    LEFT JOIN bookings b
      ON b.customer_id = c.id

    GROUP BY
      c.id,
      c.name,
      c.phone,
      c.email

    ORDER BY total_bookings DESC
  `);

  return result.rows;
};