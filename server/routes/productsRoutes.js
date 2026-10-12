import express from "express";
import csrf from "csurf";
import { authenticateAdmin } from "../middleware/authMiddleware.js";
import upload from "../middleware/cloudUpload.js";
import * as productsController from "../controllers/productsController.js";

const router = express.Router();
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  },
});

router.get("/", productsController.getActiveProducts);
router.get(
  "/admin",
  authenticateAdmin,
  csrfProtection,
  productsController.getAllProductsForAdmin
);
router.post(
  "/",
  csrfProtection,
  authenticateAdmin,
  upload.single("image"),
  productsController.createProduct
);
router.put(
  "/:id",
  csrfProtection,
  authenticateAdmin,
  upload.single("image"),
  productsController.updateProduct
);
router.delete(
  "/:id",
  csrfProtection,
  authenticateAdmin,
  productsController.deleteProduct
);

export default router;
