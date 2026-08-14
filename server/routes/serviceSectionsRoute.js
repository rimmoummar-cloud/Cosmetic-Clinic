import express from "express";

import {
  createServiceSectionController,
  updateServiceSectionController,
  getServiceSectionsController,
} from "../controllers/serviceSectionsController.js";

const router = express.Router();

router.get(
  "/:service_id",
  getServiceSectionsController
);

router.post(
  "/",
  createServiceSectionController
);

router.patch(
  "/:service_id/:section_key",
  updateServiceSectionController
);

export default router;