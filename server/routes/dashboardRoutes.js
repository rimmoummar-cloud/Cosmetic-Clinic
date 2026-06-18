import express from "express";
import {
authenticateAdmin,
} from "../middleware/authMiddleware.js";

import {
getDashboardStats,
} from "../controllers/dashboardController.js";

const router =
express.Router();

router.get(
"/",
authenticateAdmin,
getDashboardStats
);

export default router;
