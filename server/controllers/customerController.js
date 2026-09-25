
// import * as Customer from "../models/customers.js";

// export const getCustomers = async (req, res) => {
//   const customers = await Customer.getCustomers();
//   res.json(customers);
// };

// export const getCustomerByID = async (req, res) => {
//   const { id } = req.params;
//   const customer = await Customer.findCustomerByID(id);
//   if (!customer) {
//     return res.status(404).json({ error: "Customer not found" });
//   }
//   res.json(customer);
// };

// export const getCustomersAnalytics = async (
//   req,
//   res
// ) => {
//   try {
//     const data =
//       await Customer.getCustomersAnalytics();

//     res.status(200).json(data);

//   } catch (error) {

//     console.error(error);

//     res.status(500).json({
//       message: "Failed to fetch customers"
//     });
//   }
// };

// // ADDED
// export const addCustomer = async (req, res) => {
//   try {
//     const customer = await Customer.createCustomer(req.body);

//     res.status(201).json(customer);
//   } catch (error) {
//     console.error(error);

//     res.status(500).json({
//       message: "Failed to create customer"
//     });
//   }
// };

// // ADDED
// export const deleteCustomer = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const customer = await Customer.deleteCustomer(id);

//     if (!customer) {
//       return res.status(404).json({
//         error: "Customer not found"
//       });
//     }

//     res.status(200).json({
//       message: "Customer deleted successfully"
//     });
//   } catch (error) {
//     console.error(error);

//     res.status(500).json({
//       message: "Failed to delete customer"
//     });
//   }
// };
import * as Customer from "../models/customers.js";

export const getCustomers = async (req, res) => {
  const customers = await Customer.getCustomers();
  res.json(customers);
};

export const getCustomerByID = async (req, res) => {
  const { id } = req.params;

  const customer = await Customer.findCustomerByID(id);

  if (!customer) {
    return res.status(404).json({
      error: "Customer not found"
    });
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

// ADDED
export const addCustomer = async (req, res) => {
  try {
    const { email } = req.body;

    const existingCustomer =
      await Customer.findCustomerByEmail(email);

    if (existingCustomer) {
      return res.status(409).json({
        message:
          "A customer with this email already exists. Please edit the existing customer instead."
      });
    }

    const customer =
      await Customer.createCustomer(req.body);

    res.status(201).json(customer);

  } catch (error) {
    console.error(error);

    // PostgreSQL unique violation
    if (error.code === "23505") {
      return res.status(409).json({
        message:
          "A customer with this email already exists. Please edit the existing customer instead."
      });
    }

    res.status(500).json({
      message: "Failed to create customer"
    });
  }
};

// ADDED
export const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;

    const existingCustomer =
      await Customer.findCustomerByEmail(email);

    if (
      existingCustomer &&
      Number(existingCustomer.id) !== Number(id)
    ) {
      return res.status(409).json({
        message:
          "This email is already associated with another customer. Please use a different email."
      });
    }

    const customer =
      await Customer.updateCustomer(id, req.body);

    if (!customer) {
      return res.status(404).json({
        error: "Customer not found"
      });
    }

    res.status(200).json(customer);

  } catch (error) {
    console.error(error);

    // PostgreSQL unique violation
    if (error.code === "23505") {
      return res.status(409).json({
        message:
          "This email is already associated with another customer. Please use a different email."
      });
    }

    res.status(500).json({
      message: "Failed to update customer"
    });
  }
};

// ADDED
export const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    const customer =
      await Customer.deleteCustomer(id);

    if (!customer) {
      return res.status(404).json({
        error: "Customer not found"
      });
    }

    res.status(200).json({
      message: "Customer deleted successfully"
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to delete customer"
    });
  }
};