import express from "express";
import * as ctrl from "../controllers/BraekHourController.js";
import { authenticateAdmin } from "../middleware/authMiddleware.js";
import csrf from "csurf";

const router = express.Router();
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: true,
    sameSite: "none"
  }
});
router.get("/available-slots-break", ctrl.getAvailableSlotsAdmin);

router.get(
  "/Hours",
  csrfProtection , authenticateAdmin,
  ctrl.getAllWorkingHours
);

router.post(
  "/Hours",
  csrfProtection, authenticateAdmin, ctrl.createWorkingHour
);

router.put(
  "/Hours/:id",
  csrfProtection, authenticateAdmin, ctrl.updateWorkingHour
);

router.delete(
  "/Hours/:id",
  csrfProtection, authenticateAdmin, ctrl.deleteWorkingHour
);

export default router;