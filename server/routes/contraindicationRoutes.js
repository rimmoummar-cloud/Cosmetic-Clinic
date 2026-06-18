import express from "express";
import csrf from "csurf";
import { authenticateAdmin } from "../middleware/authMiddleware.js";
import * as controller from "../controllers/contraindicationController.js";

const router = express.Router();

const csrfProtection = csrf({
  cookie: true,
});

//
// PUBLIC
//
router.get(
  "/service/:serviceId",
  controller.getByServiceId
);

//
// ADMIN
//
router.post(
  "/",
  authenticateAdmin,
  csrfProtection,
  controller.create
);

router.put(
  "/:id",
  authenticateAdmin,
  csrfProtection,
  controller.update
);

router.delete(
  "/:id",
  authenticateAdmin,
  csrfProtection,
  controller.deleteItem
);

export default router;