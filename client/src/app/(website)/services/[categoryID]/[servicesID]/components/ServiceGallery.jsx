"use client"
import { motion } from "framer-motion";
import { ImageFallBack } from "../../../../../components/EmageFullBack";

const beforeAfterMedia = [
  {
    label: "Before",
    image:
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80",
  },
  {
    label: "After",
    image:
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80&sat=20&exp=10",
  },
];

export default function ServiceGallery() {
  return (
    <section className="max-w-6xl mx-auto px-4 pb-16 md:pb-20">
      <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
        <h3 className="text-2xl md:text-3xl font-semibold" style={{ fontFamily: "var(--font-serif)" }}>
          Before & After
        </h3>
        <span className="text-sm uppercase tracking-[0.15em] text-[#6B6B6B]">Real client journeys</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {beforeAfterMedia.map((item, idx) => (
          <motion.div
            key={item.label}
            className="relative overflow-hidden rounded-2xl border border-white/70 shadow-[0_14px_40px_rgba(0,0,0,0.08)]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.05 }}
            whileHover={{ scale: 1.01 }}
          >
            <ImageFallBack
              src={item.image}
              alt={`${item.label} treatment result`}
              className="w-full h-72 md:h-80 object-cover"
            />
            <div className="absolute top-4 left-4 px-3 py-1 rounded-full backdrop-blur-md bg-white/80 text-sm font-medium text-[#2C2C2C] border border-white/60">
              {item.label}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
