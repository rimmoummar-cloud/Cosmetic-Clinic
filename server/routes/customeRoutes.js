import express from "express";
import { getCustomers ,getCustomerByID } from "../controllers/customerController.js";

const router = express.Router();

router.get("/", getCustomers);
router.get("/:id", getCustomerByID);

export default router;