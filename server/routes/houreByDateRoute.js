import express from "express";
import * as ctrl from "../controllers/houreByDateController.js";

const router = express.Router();


// overrides
router.get("/upcoming",ctrl.getUpcomingWorkingHours);
router.get("/:date", ctrl.getOverride);
router.post("/", ctrl.createOverride);
router.put("/:id", ctrl.updateOverride);
router.delete("/:id", ctrl.deleteOverride);
router.get("/date/:date", ctrl.getOverrideByDates);

export default router;