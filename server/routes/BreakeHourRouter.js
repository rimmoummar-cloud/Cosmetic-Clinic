import express from "express";
import * as ctrl from "../controllers/BraekHourController.js";

const router = express.Router();
router.get("/available-slots-break", ctrl.getAvailableSlotsAdmin);

router.get(
  "/Hours",
  ctrl.getAllWorkingHours
);

router.post(
  "/Hours",
  ctrl.createWorkingHour
);

router.put(
  "/Hours/:id",
  ctrl.updateWorkingHour
);

router.delete(
  "/Hours/:id",
  ctrl.deleteWorkingHour
);

export default router;