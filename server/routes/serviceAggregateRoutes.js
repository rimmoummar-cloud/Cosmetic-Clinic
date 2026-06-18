import express from "express";
import * as controller from "../controllers/serviceAggregateController.js";

const router = express.Router();

router.get(
  "/:serviceId/full",
  controller.getFullService
);

export default router;