import express from "express";
import { getBookingReminders ,confirmBookingFromReminder,cancelBookingFromReminder } from "../controllers/bookingReminderController.js";

const router = express.Router();
router.get(
  "/confirm/:bookingId/:reminderId",
  confirmBookingFromReminder
);

router.get(
  "/cancel/:bookingId/:reminderId",
  cancelBookingFromReminder
);

router.get("/:bookingId", getBookingReminders);
export default router;