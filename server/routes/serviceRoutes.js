//in this file i put the http the end point for the front end to call it in the fivh in the front end
import express from "express";
import {
  getServices,
  getService,
  createService,
  updateService,
  deleteService,
  getServiceByCategory,
  getActiveServices
} from "../controllers/serviceController.js";

const router = express.Router();

router.get("/", getServices);

router.get("/active", getActiveServices);
router.get("/:id", getService);
router.post("/", createService);

router.put("/:id", updateService);
router.delete("/:id", deleteService);
router.get("/samecategories/:id", getServiceByCategory);

export default router;