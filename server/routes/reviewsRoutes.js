// const express = require("express");
// const router = express.Router();

// import { authenticateAdmin } from "../middleware/authMiddleware.js";
// import csrf from "csurf";



// const reviewsController = require("../controllers/reviewsController");

// // Create review
// router.post("/", reviewsController.createReview);

// // Admin - all reviews
// router.get("/", authenticateAdmin, csrfProtection, reviewsController.getAllReviews);

// // Service reviews (approved only)
// router.get("/service/:serviceId", reviewsController.getServiceReviews);

// // General reviews (approved only - already exists)
// router.get("/general", reviewsController.getGeneralReviews);

// // ⭐ NEW IMPORTANT ROUTE
// router.get(
//   "/approved/general",
//   reviewsController.getApprovedGeneralReviews
// );

// // Approve / reject
// router.put("/:id/approval", authenticateAdmin, csrfProtection, reviewsController.updateApproval);

// // Delete
// router.delete("/:id", authenticateAdmin, csrfProtection, reviewsController.deleteReview);

// module.exports = router;