"use client";

import { services } from "../../../data/services";

export default function AdminReviewsPage() {
  const allReviews = services.flatMap((s) =>
    s.reviews.map((r) => ({ ...r, serviceName: s.name, serviceId: s.id }))
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-[var(--font-heading)]">Reviews</h1>
        <p className="text-gray-500 text-sm mt-1">Manage customer reviews and feedback</p>
      </div>

      <div className="space-y-4">
        {allReviews.map((review, i) => (
          <div
            key={`${review.serviceId}-${i}`}
            className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-all"
          >
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold shrink-0">
                  {review.name[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm">{review.name}</h3>
                    <span className="text-xs text-gray-400">{review.date}</span>
                  </div>
                  <div className="flex gap-0.5 mb-2">
                    {Array.from({ length: review.rating }).map((_, j) => (
                      <span key={j} className="text-amber-400 text-sm">★</span>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{review.text}</p>
                  <span className="text-xs bg-accent text-primary px-2 py-1 rounded-md font-medium">
                    {review.serviceName}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button className="px-3 py-1.5 text-xs bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors">
                  Approve
                </button>
                <button className="px-3 py-1.5 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
