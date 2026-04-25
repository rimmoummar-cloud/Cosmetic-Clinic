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

const router = express.Router();

router.get("/", getAllCategories);
router.get("/:id", getCategoriesById);
router.post("/",authenticateAdmin, createCategories);
router.put("/:id", authenticateAdmin, updateCategories);
router.delete("/:id", authenticateAdmin, deleteCategories);

export default router;