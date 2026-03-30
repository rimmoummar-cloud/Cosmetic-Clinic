import express from "express";
import { createBooking, getAvailableSlots } from "../controllers/bookingController.js";

const router = express.Router();

// create booking
router.post("/", createBooking);

// get available time slots
router.get("/available-slots", getAvailableSlots);

export default router;