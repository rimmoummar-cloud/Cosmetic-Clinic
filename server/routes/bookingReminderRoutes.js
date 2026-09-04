// import express from "express";
// import { getBookingReminders ,confirmBookingFromReminder,cancelBookingFromReminder } from "../controllers/bookingReminderController.js";

// const router = express.Router();
// router.get(
//   "/confirm/:bookingId/:reminderId",
//   confirmBookingFromReminder
// );

// router.get(
//   "/cancel/:bookingId/:reminderId",
//   cancelBookingFromReminder
// );

// router.get("/:bookingId", getBookingReminders);
// export default router;
import express from "express";

import {
  getBookingReminders,
  confirmBookingFromReminder,
  cancelBookingFromReminder
} from "../controllers/bookingReminderController.js";

const router = express.Router();

router.get(
  "/confirm/:bookingId/:reminderId",
  (req, res, next) => {
    console.log(
      "🔥 CONFIRM ROUTE HIT:",
      req.params
    );

    next();
  },
  confirmBookingFromReminder
);

router.get(
  "/cancel/:bookingId/:reminderId",
  (req, res, next) => {
    console.log(
      "🔥 CANCEL ROUTE HIT:",
      req.params
    );

    next();
  },
  cancelBookingFromReminder
);

router.get("/:bookingId", getBookingReminders);

export default router;