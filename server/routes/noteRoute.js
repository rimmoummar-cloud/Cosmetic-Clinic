import express from "express";

import {
  getNotesByCustomerID,
  createNote,
  updateNote,
  deleteNote,
} from "../controllers/NoteController.js";

import { authenticateAdmin } from "../middleware/authMiddleware.js";

import csrf from "csurf";

const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  },
});

const router = express.Router();

router.get(
  "/customer/:customerId",
  csrfProtection,
  authenticateAdmin,
  getNotesByCustomerID
);

router.post(
  "/customer/:customerId",
  csrfProtection,
  authenticateAdmin,
  createNote
);

router.put(
  "/:id",
  csrfProtection,
  authenticateAdmin,
  updateNote
);

router.delete(
  "/:id",
  csrfProtection,
  authenticateAdmin,
  deleteNote
);

export default router;