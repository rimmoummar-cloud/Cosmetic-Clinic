import express from "express";
import { getCustomers ,getCustomerByID } from "../controllers/customerController.js";
import { authenticateAdmin } from "../middleware/authMiddleware.js";
const router = express.Router();

router.get("/", authenticateAdmin, getCustomers);
router.get("/:id", authenticateAdmin, getCustomerByID);

export default router;