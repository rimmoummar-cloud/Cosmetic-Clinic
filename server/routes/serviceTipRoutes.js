import express from "express";
import csrf from "csurf";
import { authenticateAdmin } from "../middleware/authMiddleware.js";
import * as controller from "../controllers/serviceTipController.js";

const router = express.Router();

const csrfProtection = csrf({
  cookie: true,
});

//
// Website Routes (Public)
//

router.get(
  "/service/:serviceId",
  controller.getByServiceId
);

router.get(
  "/service/:serviceId/type/:type",
  controller.getByType
);

//
// Admin Routes (Protected)
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