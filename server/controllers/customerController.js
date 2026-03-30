import * as Customer from "../models/customers.js";

export const getCustomers = async (req, res) => {
  const customers = await Customer.getCustomers();
  res.json(customers);
};