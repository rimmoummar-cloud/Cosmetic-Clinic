


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
  deleteDisclaimer,
  getBookingDisclaimersToken
} from "../controllers/disclaimerController.js";

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

router.get(
  "/",
   authenticateAdmin, csrfProtection, 
  getAllDisclaimers
);

router.get(
  "/:id",
   authenticateAdmin, csrfProtection, 
  getDisclaimerById
);

// router.get(
//   "/booking/:bookingId",
//   getBookingDisclaimers
// );
router.get(
  "/booking/:token",
  getBookingDisclaimersToken
);


router.post(
  "/",
   authenticateAdmin, csrfProtection, 
  createDisclaimer
);

router.put(
  "/:id",
   authenticateAdmin, csrfProtection, 
  updateDisclaimer
);

router.patch(
  "/:id/status",
    authenticateAdmin, csrfProtection,
  toggleDisclaimerStatus
);


// router.delete(
//   "/:id",
//   csrfProtection,
//   authenticateAdmin,
//   deleteDisclaimer
// );

export default router;