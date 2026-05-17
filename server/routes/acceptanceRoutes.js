import express from "express";

import {
  acceptDisclaimers,
} from "../controllers/acceptanceController.js";

const router = express.Router();

router.post(
  "/:bookingId",
  acceptDisclaimers
);

export default router;