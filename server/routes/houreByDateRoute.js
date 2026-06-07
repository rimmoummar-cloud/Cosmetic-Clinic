import express from "express";
import * as ctrl from "../controllers/houreByDateController.js";

import { authenticateAdmin } from "../middleware/authMiddleware.js";
import csrf from "csurf";

const router = express.Router();
const csrfProtection = csrf({ cookie: true });


// overrides
router.get("/upcoming",authenticateAdmin, csrfProtection,ctrl.getUpcomingWorkingHours);
router.get("/:date",authenticateAdmin, csrfProtection, ctrl.getOverride);
router.post("/",authenticateAdmin, csrfProtection, ctrl.createOverride);
router.put("/:id", authenticateAdmin, csrfProtection,ctrl.updateOverride);
router.delete("/:id", authenticateAdmin, csrfProtection,ctrl.deleteOverride);
router.get("/date/:date",authenticateAdmin, csrfProtection, ctrl.getOverrideByDates);

export default router;