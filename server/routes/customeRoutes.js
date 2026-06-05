import express from "express";
import { getCustomers ,getCustomerByID,getCustomersAnalytics } from "../controllers/customerController.js";
import { authenticateAdmin } from "../middleware/authMiddleware.js";
import csrf from "csurf";
const csrfProtection = csrf({ cookie: true });
const router = express.Router();
router.get(
  "/analytics",csrfProtection,authenticateAdmin,
  getCustomersAnalytics
);
router.get("/", csrfProtection,authenticateAdmin, getCustomers);
router.get("/:id", csrfProtection,authenticateAdmin, getCustomerByID);

export default router;