import express from "express";
import { authenticateAdmin } from "../middleware/authMiddleware.js";
import csrf from "csurf";
import { getCalendarBookingsController } from "../controllers/bookingCalendarController.js";

const router = express.Router();
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: true,
    sameSite: "none"
  }
});

router.get("/calendar", authenticateAdmin, csrfProtection, getCalendarBookingsController);

export default router;
