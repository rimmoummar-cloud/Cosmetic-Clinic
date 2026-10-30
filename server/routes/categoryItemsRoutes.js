import express from "express";
import csrf from "csurf";
import { authenticateAdmin } from "../middleware/authMiddleware.js";
import {
  getAllCategoryItems,
  getCategoryItemById,
  createCategoryItem,
  updateCategoryItem,
  deleteCategoryItem,
} from "../controllers/categoryItemsController.js";

const router = express.Router();
const csrfProtection = csrf({
  cookie: { httpOnly: true, secure: true, sameSite: "none" },
});

router.get("/", getAllCategoryItems);
router.get("/:id", getCategoryItemById);
router.post("/", csrfProtection, authenticateAdmin, createCategoryItem);
router.put("/:id", csrfProtection, authenticateAdmin, updateCategoryItem);
router.delete("/:id", csrfProtection, authenticateAdmin, deleteCategoryItem);

export default router;
