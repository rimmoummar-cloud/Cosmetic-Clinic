import express from "express";
import {
  getUserNotifications,
  addNotification,
  readNotification,
    deleteAllNotification
} from "../controllers/notificationController.js";
import csrf from "csurf";
import { authenticateAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: true,
    sameSite: "none"
  }
});
// جلب notifications (user/admin)
router.get("/:recipient_type/:recipient_id",authenticateAdmin,csrfProtection, getUserNotifications);

// إنشاء notification (ممكن تستخدمه داخليًا أو admin tools)
router.post("/", authenticateAdmin,csrfProtection, addNotification);

// mark as read
router.put("/:id/read", authenticateAdmin,csrfProtection, readNotification);




router.delete(
  "/all",
  authenticateAdmin,
  csrfProtection,
  deleteAllNotification
);

export default router;