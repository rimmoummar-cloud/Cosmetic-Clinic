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