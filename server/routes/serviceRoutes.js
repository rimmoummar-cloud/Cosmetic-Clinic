//in this file i put the http the end point for the front end to call it in the fivh in the front end
import express from "express";
import { authenticateAdmin } from "../middleware/authMiddleware.js";
import {
  getServices,
  getService,
  createService,
  updateService,
  deleteService,
  getServiceByCategory,
  getActiveServices
} from "../controllers/serviceController.js";
import csrf from "csurf";

const router = express.Router();
const csrfProtection = csrf({ cookie: true });


router.get("/", getServices);

router.get("/active", getActiveServices);
router.get("/:id", getService);
router.post("/", csrfProtection,authenticateAdmin, createService);

router.put("/:id", csrfProtection,authenticateAdmin, updateService);
router.delete("/:id", csrfProtection, authenticateAdmin, deleteService);
router.get("/samecategories/:id", getServiceByCategory);

export default router;