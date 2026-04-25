import express from "express";
import { createBooking, getAvailableSlotsMulti ,getallbookingss,getBookingWithFullDetails,updateBookingStatus } from "../controllers/bookingController.js";
import { authenticateAdmin } from "../middleware/authMiddleware.js";


const router = express.Router();

// create booking
router.post("/", createBooking);

// get available time slots
// router.get("/available-slots", getAvailableSlots);
router.get("/available-slots-multi", getAvailableSlotsMulti);
router.get("/",  authenticateAdmin, getallbookingss);
router.get("/WithDetails",authenticateAdmin, getBookingWithFullDetails);
router.put(
  "/:id/status",
  updateBookingStatus
);


export default router;