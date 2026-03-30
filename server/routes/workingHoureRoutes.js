import express from "express";
import {
  getAllWorkingHour,
  createWorkingHour,
  updateWorkingHour,
  deleteWorkingHour
} from "../controllers/workinghourController.js";

const router = express.Router();

router.get("/", getAllWorkingHour);
router.post("/", createWorkingHour);
router.put("/:id", updateWorkingHour);
router.delete("/:id", deleteWorkingHour);

export default router;