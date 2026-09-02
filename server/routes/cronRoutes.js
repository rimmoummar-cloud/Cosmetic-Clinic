import express from "express";
import { processReminders } from "../controllers/cronController.js";

const router = express.Router();

router.get("/process-reminders", processReminders);

export default router;