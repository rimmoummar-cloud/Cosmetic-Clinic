import express from "express";

import {
  acceptDisclaimers,
  getAcceptedDisclaimers
} from "../controllers/acceptanceController.js";

const router = express.Router();

router.post(
  "/:bookingId",
  acceptDisclaimers
);
router.get(
  "/",
  getAcceptedDisclaimers
);



export default router;