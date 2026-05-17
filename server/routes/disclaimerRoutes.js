


// import express from "express";

// import {
//   getBookingDisclaimers,
//   createDisclaimer,
// } from "../controllers/disclaimerController.js";

// const router = express.Router();

// router.get(
//   "/booking/:bookingId",
//   getBookingDisclaimers
// );

// router.post(
//   "/",
//   createDisclaimer
// );

// export default router;
import express from "express";

import {
  getBookingDisclaimers,
  createDisclaimer,
  updateDisclaimer,
  toggleDisclaimerStatus,
  getAllDisclaimers,
  getDisclaimerById,
} from "../controllers/disclaimerController.js";

const router = express.Router();

router.get(
  "/",
  getAllDisclaimers
);

router.get(
  "/:id",
  getDisclaimerById
);

router.get(
  "/booking/:bookingId",
  getBookingDisclaimers
);

router.post(
  "/",
  createDisclaimer
);

router.put(
  "/:id",
  updateDisclaimer
);

router.patch(
  "/:id/status",
  toggleDisclaimerStatus
);

export default router;