import express from "express";
import csrf from "csurf";
import { authenticateAdmin } from "../middleware/authMiddleware.js";
import * as controller from "../controllers/serviceDetailController.js";

const router = express.Router();

const csrfProtection = csrf({
  cookie: true,
});

/*
|--------------------------------------------------------------------------
| Website Routes (Public)
|--------------------------------------------------------------------------
*/

// Get details by service
router.get(
  "/services/:serviceId/details",
  controller.getByServiceId
);

/*
|--------------------------------------------------------------------------
| Admin Routes (Protected)
|--------------------------------------------------------------------------
*/

// Create
router.post(
  "/",
  authenticateAdmin,
  csrfProtection,
  controller.create
);

// Update
router.put(
  "/:id",
  authenticateAdmin,
  csrfProtection,
  controller.update
);

// Delete
router.delete(
  "/:id",
  authenticateAdmin,
  csrfProtection,
  controller.deleteItem
);

export default router;