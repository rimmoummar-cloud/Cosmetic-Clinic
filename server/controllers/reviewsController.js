import db from "../config/db.js";
import Reviews from "../models/reviews.js";
import { createNotification } from "../models/notification.js";
// Create review
export const createReview = async (req, res) => {
  try {
    const { service_id, name, comment, stars } = req.body;

    const review = await Reviews.create({
      service_id,
      name,
      comment,
      stars,
    });

    let serviceName = null;

    if (service_id) {
      const serviceResult = await db.query(
        `SELECT name FROM services WHERE id = $1`,
        [service_id]
      );

      serviceName = serviceResult.rows[0]?.name || null;
    }

    let message = service_id && serviceName
      ? `${name} created a review for service: ${serviceName}`
      : `${name} created a general website review`;

    await createNotification({
      recipient_type: "admin",
      recipient_id: 1,
      type: "new-review",
      title: "New Review",
      message,
    });

    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getApprovedGeneralReviews = async (req, res) => {
  try {
    const reviews = await Reviews.getApprovedGeneralOnly();
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getGeneralReviewsForAdmin = async (req, res) => {
  try {
    const reviews = await Reviews.getGeneralForAdmin();
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// Get all reviews (admin dashboard)
export const getAllReviews = async (req, res) => {
  try {
    const reviews = await Reviews.getAll();
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get reviews by service
export const getServiceReviews = async (req, res) => {
  try {
    const { serviceId } = req.params;

    const reviews = await Reviews.getByServiceId(serviceId);
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get general reviews
export const getGeneralReviews = async (req, res) => {
  try {
    const reviews = await Reviews.getGeneral();
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Approve / reject review
export const updateApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_approved, is_public } = req.body;

    const updated = await Reviews.approve(id, is_approved, is_public);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const approveGeneralReview = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: "Invalid review ID" });
  }

  try {
    const updated = await Reviews.approveGeneral(id);
    if (!updated) {
      return res.status(404).json({ message: "General review not found" });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete review
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    await Reviews.delete(id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteGeneralReview = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: "Invalid review ID" });
  }

  try {
    const deleted = await Reviews.deleteGeneral(id);
    if (!deleted) {
      return res.status(404).json({ message: "General review not found" });
    }
    res.json({ message: "General review deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};