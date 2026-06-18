import express from "express";
import csrf from "csurf";
import { authenticateAdmin } from "../middleware/authMiddleware.js";
import * as controller from "../controllers/relatedServiceController.js";

const router = express.Router();

const csrfProtection = csrf({
  cookie: true,
});

//
// 🌐 PUBLIC (Website)
//
router.get(
  "/service/:serviceId",
  controller.getByServiceId
);

//
// 🔐 ADMIN (Dashboard)
//
router.post(
  "/",
  authenticateAdmin,
  csrfProtection,
  controller.create
);

// Delete relation between two services
router.delete(
  "/:serviceId/:relatedId",
  authenticateAdmin,
  csrfProtection,
  controller.deleteItem
);

export default router;