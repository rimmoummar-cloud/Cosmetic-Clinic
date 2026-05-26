import express from "express";
import {
  getUserNotifications,
  addNotification,
  readNotification
} from "../controllers/notificationController.js";

import { authenticateAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// جلب notifications (user/admin)
router.get("/:recipient_type/:recipient_id", getUserNotifications);

// إنشاء notification (ممكن تستخدمه داخليًا أو admin tools)
router.post("/", authenticateAdmin, addNotification);

// mark as read
router.put("/:id/read", authenticateAdmin, readNotification);

export default router;