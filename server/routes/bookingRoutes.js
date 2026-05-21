import express from "express";
import { createBooking, getAvailableSlotsMulti ,getallbookingss,getBookingWithFullDetails,updateBookingStatus,getAllBookingsWithFullDetails } from "../controllers/bookingController.js";
import { authenticateAdmin } from "../middleware/authMiddleware.js";
import csrf from "csurf";

const router = express.Router();
const csrfProtection = csrf({ cookie: true });
// create booking
router.post("/", createBooking);

// get available time slots
// router.get("/available-slots", getAvailableSlots);
router.get("/available-slots-multi", getAvailableSlotsMulti);
router.get("/", csrfProtection , authenticateAdmin,getallbookingss);
router.get("/WithDetails",csrfProtection, authenticateAdmin, getBookingWithFullDetails);
router.get(
  "/all/full-details",
  getAllBookingsWithFullDetails
);
router.put(
  "/:id/status",
  csrfProtection,
  updateBookingStatus
);


export default router;