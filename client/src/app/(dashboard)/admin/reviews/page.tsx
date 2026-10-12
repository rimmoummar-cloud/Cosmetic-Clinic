"use client";

import { useCallback, useEffect, useState } from "react";
import api from "../../../../lib/api";

type GeneralReview = {
  id: number;
  name: string;
  comment: string | null;
  stars: number;
  created_at?: string;
};

function getErrorMessage(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof error.response === "object" &&
    error.response !== null &&
    "data" in error.response &&
    typeof error.response.data === "object" &&
    error.response.data !== null &&
    "message" in error.response.data &&
    typeof error.response.data.message === "string"
  ) {
    return error.response.data.message;
  }
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof error.response === "object" &&
    error.response !== null &&
    "data" in error.response &&
    typeof error.response.data === "object" &&
    error.response.data !== null &&
    "error" in error.response.data &&
    typeof error.response.data.error === "string"
  ) {
    return error.response.data.error;
  }
  return error instanceof Error ? error.message : "Unable to load general reviews.";
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<GeneralReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [actionReviewId, setActionReviewId] = useState<number | null>(null);

  const loadReviews = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError("");

    try {
      const response = await api.get("/reviews/admin/general");
      if (!Array.isArray(response.data)) {
        throw new Error("The reviews API returned an unexpected response.");
      }
      setReviews(response.data);
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadReviews();
  }, [loadReviews]);

  const deleteReview = async (reviewId: number) => {
    if (!window.confirm("Delete this general review? This cannot be undone.")) {
      return;
    }

    setActionReviewId(reviewId);
    setError("");
    setMessage("");

    try {
      await api.delete(`/reviews/admin/general/${reviewId}`);
      setMessage("General review deleted.");
      await loadReviews(false);
    } catch (actionError) {
      setError(getErrorMessage(actionError));
    } finally {
      setActionReviewId(null);
    }
  };

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-[#2C2C2C]">General Reviews</h1>
        <p className="mt-1 text-sm text-gray-500">
          Review clinic feedback or delete reviews.
        </p>
      </header>

      {message && (
        <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </p>
      )}
      {error && (
        <div role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          <p>{error}</p>
          <button
            type="button"
            onClick={() => void loadReviews()}
            className="mt-2 font-semibold underline"
          >
            Try again
          </button>
        </div>
      )}

      {loading ? (
        <p className="py-10 text-center text-gray-500">Loading general reviews...</p>
      ) : reviews.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center text-gray-500">
          No general reviews to display.
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <article
              key={review.id}
              className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <h2 className="font-semibold text-[#2C2C2C]">{review.name}</h2>
                    <time className="text-xs text-gray-400">
                      {review.created_at
                        ? new Date(review.created_at).toLocaleString()
                        : "Date unavailable"}
                    </time>
                  </div>
                  <div
                    className="mt-2 flex gap-0.5 text-amber-400"
                    aria-label={`${review.stars} out of 5 stars`}
                  >
                    {Array.from({ length: 5 }, (_, index) => (
                      <span key={index} aria-hidden="true">
                        {index < review.stars ? "★" : "☆"}
                      </span>
                    ))}
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-gray-600">
                    {review.comment || "No written comment."}
                  </p>
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void deleteReview(review.id)}
                    disabled={actionReviewId !== null}
                    className="rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {actionReviewId === review.id ? "Saving..." : "Delete"}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
