import express from "express";
import csrf from "csurf";

import {
  createBooking,
  getAvailableSlotsMulti
} from "../controllers/bookingController.js";
import { authenticateAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: true,
    sameSite: "none"
  }
});

router.get(
  "/available-slots-multi",
  authenticateAdmin,
  getAvailableSlotsMulti
);

router.post(
  "/",
  authenticateAdmin,
  csrfProtection,
  createBooking
);

export default router;
