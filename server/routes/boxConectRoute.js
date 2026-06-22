

import express from "express";
import { authenticateAdmin } from "../middleware/authMiddleware.js";
import csrf from "csurf";
import {
  createMessage,
  getMessages,
  getMessage,
  removeMessage,
    replyToMessage,
} from "../controllers/boxConectController.js";
const router = express.Router();
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: true,
    sameSite: "none"
  }
});

router.post("/",createMessage);

router.get("/",authenticateAdmin,csrfProtection, getMessages);

router.get("/:id",authenticateAdmin,csrfProtection, getMessage);

router.delete("/:id", authenticateAdmin, csrfProtection, removeMessage);

router.post("/reply", authenticateAdmin, csrfProtection, replyToMessage);

export default router;