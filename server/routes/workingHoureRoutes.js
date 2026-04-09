import express from "express";
import {
  getAllWorkingHour,
  createWorkingHour,
  updateWorkingHour,
  deleteWorkingHour,
  getWorkingHourByDay
} from "../controllers/workinghourController.js";

const router = express.Router();

router.get("/", getAllWorkingHour);
router.get("/day/:dayOfWeek", getWorkingHourByDay);
router.post("/", createWorkingHour);
router.put("/:id", updateWorkingHour);
router.delete("/:id", deleteWorkingHour);

export default router;