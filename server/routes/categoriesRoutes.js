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

const router = express.Router();
const csrfProtection = csrf({ cookie: true });


router.get("/", getAllCategories);
router.get("/:id", getCategoriesById);
router.post("/", csrfProtection, authenticateAdmin, createCategories);
router.put("/:id", csrfProtection, authenticateAdmin, updateCategories);
router.delete("/:id", csrfProtection, authenticateAdmin, deleteCategories);

export default router;