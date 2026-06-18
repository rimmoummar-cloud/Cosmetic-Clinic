import express from "express";
import csrf from "csurf";
import { authenticateAdmin } from "../middleware/authMiddleware.js";
import * as controller from "../controllers/beforeAfterImageController.js";
import upload from "../middleware/upload.js";
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

//
// Admin Routes (Protected)
//


router.post(
  "/",
  authenticateAdmin,
  csrfProtection,
  upload.fields([
    {
      name: "before_image",
      maxCount: 1,
    },
    {
      name: "after_image",
      maxCount: 1,
    },
  ]),
  controller.create
);

router.put(
  "/:id",
  authenticateAdmin,
  csrfProtection,
  upload.fields([
    {
      name: "before_image",
      maxCount: 1,
    },
    {
      name: "after_image",
      maxCount: 1,
    },
  ]),
  controller.update
);

router.delete(
  "/:id",
  authenticateAdmin,
  csrfProtection,
  controller.deleteItem
);

export default router;






