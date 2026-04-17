import express from "express";
import { createBooking, getAvailableSlotsMulti ,getallbookingss,getBookingWithFullDetails } from "../controllers/bookingController.js";

const router = express.Router();

// create booking
router.post("/", createBooking);

// get available time slots
// router.get("/available-slots", getAvailableSlots);
router.get("/available-slots-multi", getAvailableSlotsMulti);
router.get("/", getallbookingss);
router.get("/WithDetails", getBookingWithFullDetails);



export default router;