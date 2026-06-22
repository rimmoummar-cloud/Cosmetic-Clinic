//in this file i put the http the end point for the front end to call it in the fivh in the front end
import express from "express";
import { authenticateAdmin } from "../middleware/authMiddleware.js";
import {
  getAllCategories,
  getCategoriesById,
  createCategories,
  updateCategories,
  deleteCategories
} from "../controllers/categoriesController.js";

import csrf from "csurf";
// import { createUpload } from "../middleware/upload.js";
import cloudUpload from "../middleware/cloudUpload.js";
const router = express.Router();
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: true,
    sameSite: "none"
  }
});
const upload = cloudUpload;


router.get("/", getAllCategories);
router.get("/:id", getCategoriesById);
router.post("/", csrfProtection, authenticateAdmin, upload.single("image"), createCategories);
router.put("/:id", csrfProtection, authenticateAdmin, upload.single("image"), updateCategories);
router.delete("/:id", csrfProtection, authenticateAdmin, deleteCategories);

export default router;
