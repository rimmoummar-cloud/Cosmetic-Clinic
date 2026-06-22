import express from "express";

import {
  acceptDisclaimers,
  getAcceptedDisclaimers
} from "../controllers/acceptanceController.js";
import csrf from "csurf";
import { authenticateAdmin } from "../middleware/authMiddleware.js";
const router = express.Router();
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: true,
    sameSite: "none"
  }
});

router.post("/confirm", acceptDisclaimers);
router.get(
  "/",
    csrfProtection,authenticateAdmin,
  getAcceptedDisclaimers
);



export default router;