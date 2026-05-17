import express from "express";
import {
  getAllWorkingHour,
  createWorkingHour,
  updateWorkingHour,
  deleteWorkingHour,
  getWorkingHourByDay
} from "../controllers/workinghourController.js";
import { authenticateAdmin } from "../middleware/authMiddleware.js";
import csrf from "csurf";

const router = express.Router();
const csrfProtection = csrf({ cookie: true });


router.get("/", getAllWorkingHour);
router.get("/day/:dayOfWeek", getWorkingHourByDay);
router.post("/", csrfProtection, createWorkingHour);
router.put("/:id", csrfProtection, updateWorkingHour);
router.delete("/:id", csrfProtection, deleteWorkingHour);

export default router;