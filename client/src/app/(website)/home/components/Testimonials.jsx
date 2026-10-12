"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, X } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

async function fetchPublicGeneralReviews() {
  if (!API_BASE_URL) {
    throw new Error("The reviews service is not configured.");
  }

  const response = await fetch(`${API_BASE_URL}/reviews/approved/general`, {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Unable to load reviews (${response.status}).`);
  }

  const data = await response.json();
  if (!Array.isArray(data)) {
    throw new Error("The reviews service returned an unexpected response.");
  }

  return data.filter((review) => review.service_id === null);
}

function getErrorMessage(error) {
  return error instanceof Error ? error.message : "Unable to load reviews.";
}

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [reviewsError, setReviewsError] = useState("");
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");
  const [form, setForm] = useState({ name: "", comment: "", stars: 0 });

  const loadReviews = useCallback(async () => {
    setLoadingReviews(true);
    setReviewsError("");
    try {
      setTestimonials(await fetchPublicGeneralReviews());
    } catch (error) {
      setReviewsError(getErrorMessage(error));
    } finally {
      setLoadingReviews(false);
    }
  }, []);

  useEffect(() => {
    void loadReviews();
  }, [loadReviews]);

  const submitReview = async () => {
    if (!form.name.trim() || !form.comment.trim() || form.stars < 1) {
      setSubmitError("Enter your name and comment, then select a star rating.");
      return;
    }
    if (!API_BASE_URL) {
      setSubmitError("The reviews service is not configured.");
      return;
    }

    setSubmitError("");
    setSubmitMessage("");
    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          comment: form.comment.trim(),
          stars: form.stars,
          service_id: null,
        }),
      });
      if (!response.ok) {
        throw new Error(`Unable to submit your review (${response.status}).`);
      }

      setForm({ name: "", comment: "", stars: 0 });
      setOpen(false);
      setSubmitMessage("Thank you. Your review has been added.");
      await loadReviews();
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="relative overflow-hidden bg-white px-4 py-24 sm:px-6 lg:px-8">
      <div className="absolute inset-0">
        <div className="absolute left-0 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-gradient-to-r from-[#FFD700]/10 to-transparent blur-3xl" />
        <div className="absolute right-0 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-gradient-to-l from-[#E8C7C3]/10 to-transparent blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <h2
            className="text-3xl font-semibold text-[#2C2C2C]"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Testimonials
          </h2>
          <button
            type="button"
            onClick={() => {
              setSubmitError("");
              setSubmitMessage("");
              setOpen(true);
            }}
            className="rounded-full bg-gradient-to-r from-[#D4AF7A] to-[#C9A66B] px-5 py-2 text-white shadow-md transition hover:scale-105"
          >
            + Add Review
          </button>
        </div>

        {submitMessage && (
          <p role="status" className="mb-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {submitMessage}
          </p>
        )}

        {loadingReviews ? (
          <p className="py-10 text-center text-gray-500">Loading reviews...</p>
        ) : reviewsError ? (
          <div role="alert" className="py-8 text-center text-sm text-red-600">
            <p>{reviewsError}</p>
            <button
              type="button"
              onClick={() => void loadReviews()}
              className="mt-3 font-semibold underline"
            >
              Try again
            </button>
          </div>
        ) : testimonials.length === 0 ? (
          <p className="py-10 text-center text-gray-500">
            No customer reviews yet.
          </p>
        ) : (
          <div className="flex gap-8 overflow-x-auto scroll-smooth px-2 pb-4">
            {testimonials.map((review) => {
              const rating = Math.max(0, Math.min(5, Number(review.stars) || 0));
              return (
                <motion.article
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -6, scale: 1.02 }}
                  className="relative min-w-[320px] rounded-3xl border border-[#D4AF7A]/10 bg-gradient-to-br from-[#FAF8F5] to-[#F5F1ED] p-8 shadow-xl shadow-[#D4AF7A]/10 transition-all hover:shadow-2xl hover:shadow-[#D4AF7A]/20 md:min-w-[350px]"
                >
                  <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-gradient-to-br from-[#FFD700]/20 to-transparent blur-2xl" />
                  <div
                    className="relative z-10 mb-6 flex gap-1"
                    aria-label={`${rating} out of 5 stars`}
                  >
                    {Array.from({ length: 5 }, (_, index) => (
                      <Star
                        key={index}
                        aria-hidden="true"
                        className={`h-5 w-5 ${
                          index < rating
                            ? "fill-[#FFD700] text-[#FFD700]"
                            : "text-[#D4AF7A]/30"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="relative z-10 mb-2 font-bold text-black">
                    {review.name}
                  </p>
                  {review.comment && (
                    <p className="relative z-10 mb-6 font-normal leading-relaxed text-black">
                      {review.comment}
                    </p>
                  )}
                </motion.article>
              );
            })}
          </div>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-review-title"
            className="relative w-full max-w-md rounded-2xl border border-[#D4AF7A]/20 bg-white p-6 shadow-xl"
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close review form"
              className="absolute right-3 top-3 text-[#2C2C2C]"
            >
              <X />
            </button>
            <h3 id="add-review-title" className="mb-4 text-xl font-semibold text-[#2C2C2C]">
              Add Review
            </h3>
            <input
              aria-label="Your name"
              placeholder="Your name"
              className="mb-3 w-full rounded-lg border border-[#D4AF7A]/30 p-2"
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
            />
            <textarea
              aria-label="Your comment"
              placeholder="Your comment"
              className="mb-3 w-full rounded-lg border border-[#D4AF7A]/30 p-2"
              value={form.comment}
              onChange={(event) =>
                setForm((current) => ({ ...current, comment: event.target.value }))
              }
            />
            <div className="mb-3 flex gap-2" aria-label="Select a star rating">
              {Array.from({ length: 5 }, (_, index) => (
                <button
                  key={index}
                  type="button"
                  aria-label={`${index + 1} stars`}
                  aria-pressed={index < form.stars}
                  onClick={() =>
                    setForm((current) => ({ ...current, stars: index + 1 }))
                  }
                >
                  <Star
                    className={`h-6 w-6 ${
                      index < form.stars
                        ? "fill-[#FFD700] text-[#FFD700]"
                        : "text-[#D4AF7A]/30"
                    }`}
                  />
                </button>
              ))}
            </div>
            {submitError && (
              <p role="alert" className="mb-2 text-sm text-red-600">
                {submitError}
              </p>
            )}
            <button
              type="button"
              onClick={() => void submitReview()}
              disabled={submitting}
              className="w-full rounded-lg bg-gradient-to-r from-[#D4AF7A] to-[#C9A66B] py-2 text-white disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
