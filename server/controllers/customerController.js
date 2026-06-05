import * as Customer from "../models/customers.js";

export const getCustomers = async (req, res) => {
  const customers = await Customer.getCustomers();
  res.json(customers);
};
export const getCustomerByID = async (req, res) => {
  const { id } = req.params;
  const customer = await Customer.findCustomerByID(id);
  if (!customer) {
    return res.status(404).json({ error: "Customer not found" });
  }
  res.json(customer);
};


export const getCustomersAnalytics = async (
  req,
  res
) => {
  try {

    const data =
      await Customer.getCustomersAnalytics();

    res.status(200).json(data);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Failed to fetch customers"
    });
  }
};