import express from "express";
import * as ctrl from "../controllers/houreByDateController.js";

const router = express.Router();


// overrides
router.get("/:date", ctrl.getOverride);
router.post("/", ctrl.createOverride);
router.put("/:id", ctrl.updateOverride);
router.delete("/:id", ctrl.deleteOverride);

export default router;