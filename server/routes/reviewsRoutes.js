import express from "express";
import csrf from "csurf";
import { authenticateAdmin } from "../middleware/authMiddleware.js";
import * as reviewsController from "../controllers/reviewsController.js";

const router = express.Router();
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  },
});

router.get(
  "/admin/general",
  authenticateAdmin,
  csrfProtection,
  reviewsController.getGeneralReviewsForAdmin
);
router.put(
  "/admin/general/:id/approval",
  authenticateAdmin,
  csrfProtection,
  reviewsController.approveGeneralReview
);
router.delete(
  "/admin/general/:id",
  authenticateAdmin,
  csrfProtection,
  reviewsController.deleteGeneralReview
);

// Create review
router.post("/", reviewsController.createReview);

// Admin - all reviews
router.get("/", authenticateAdmin, csrfProtection, reviewsController.getAllReviews);

// Service reviews (approved only)
router.get("/service/:serviceId", reviewsController.getServiceReviews);

// General reviews (approved only - already exists)
router.get("/general", reviewsController.getGeneralReviews);

// ⭐ NEW IMPORTANT ROUTE
router.get(
  "/approved/general",
  reviewsController.getApprovedGeneralReviews
);

// Approve / reject
router.put("/:id/approval", authenticateAdmin, csrfProtection, reviewsController.updateApproval);

// Delete
router.delete("/:id", authenticateAdmin, csrfProtection, reviewsController.deleteReview);

export default router;