//in this file i put the http the end point for the front end to call it in the fivh in the front end
import express from "express";
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
router.post("/", createCategories);
router.put("/:id", updateCategories);
router.delete("/:id", deleteCategories);

export default router;