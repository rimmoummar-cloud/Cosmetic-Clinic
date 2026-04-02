"use client"
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { GlowingButton } from "../../../../../components/GlowingButtom";

const reviews = [
  {
    name: "Amelia R.",
    rating: 5,
    comment: "My skin felt glassy and calm the same day. The team explained every step and aftercare clearly.",
    date: "Feb 2026",
  },
  {
    name: "Lana K.",
    rating: 4,
    comment: "Noticeable brightness after one visit. Loved the soothing finish and zero downtime.",
    date: "Jan 2026",
  },
  {
    name: "Jess M.",
    rating: 5,
    comment: "A luxurious experience with results that lasted weeks. Booking my maintenance sessions now!",
    date: "Dec 2025",
  },
];

export default function ServiceReviews() {
  return (
    <section className="max-w-6xl mx-auto px-4 pb-16 md:pb-20">
      <div className="flex items-center justify-between gap-3 flex-wrap mb-6">
        <h3 className="text-2xl md:text-3xl font-semibold" style={{ fontFamily: "var(--font-serif)" }}>
          Guest Reviews
        </h3>
        <GlowingButton variant="outline" className="border-[#E8C7C3]/70 text-[#2C2C2C]">
          Write a Review
        </GlowingButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {reviews.map((review, idx) => (
          <motion.div
            key={review.name}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.05 }}
            className="rounded-2xl bg-white/70 backdrop-blur-sm border border-white/60 shadow-[0_10px_28px_rgba(0,0,0,0.05)] p-5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <p className="font-semibold" style={{ fontFamily: "var(--font-serif)" }}>
                {review.name}
              </p>
              <span className="text-xs uppercase tracking-[0.12em] text-[#6B6B6B]">{review.date}</span>
            </div>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, starIdx) => (
                <Star
                  key={starIdx}
                  className="w-4 h-4"
                  fill={starIdx < review.rating ? "#D4AF7A" : "transparent"}
                  stroke={starIdx < review.rating ? "#D4AF7A" : "#CFCFCF"}
                />
              ))}
            </div>
            <p className="text-sm text-[#4A4A4A] leading-relaxed">{review.comment}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
