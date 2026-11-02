import express from "express";
import csrf from "csurf";
import { authenticateAdmin } from "../middleware/authMiddleware.js";
import {
  createCalendarDayNote,
  deleteCalendarDayNote,
  getCalendarDayNotes,
  updateCalendarDayNote,
} from "../controllers/calendarDayNoteController.js";

const router = express.Router();
const csrfProtection = csrf({
  cookie: { httpOnly: true, secure: true, sameSite: "none" },
});

router.get("/", authenticateAdmin, csrfProtection, getCalendarDayNotes);
router.post("/", authenticateAdmin, csrfProtection, createCalendarDayNote);
router.put("/:id", authenticateAdmin, csrfProtection, updateCalendarDayNote);
router.delete("/:id", authenticateAdmin, csrfProtection, deleteCalendarDayNote);

export default router;
