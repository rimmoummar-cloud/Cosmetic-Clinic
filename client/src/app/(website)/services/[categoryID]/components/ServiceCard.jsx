"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { ImageFallBack } from "../../../../components/EmageFullBack";

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1582719478248-54e9f2af439c?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1506617420156-8e4536971650?auto=format&fit=crop&w=1200&q=80",
];

function formatPrice(value) {
  if (!value && value !== 0) return null;
  return `$${Number(value).toFixed(2)}`;
}

export default function ServiceCard({ service, categoryId, index = 0 }) {
  const image =
    service?.image_url ||
    FALLBACK_IMAGES[index % FALLBACK_IMAGES.length] ||
    FALLBACK_IMAGES[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.45 }}
      whileHover={{ y: -10 }}
      className="group h-full bg-white rounded-3xl overflow-hidden shadow-xl shadow-[#D4AF7A]/10 border border-[#D4AF7A]/10 transition-all duration-500"
    >
      <Link href={`/services/${categoryId}/${service?.id || ""}`} className="block h-full">
        <div className="relative h-56 overflow-hidden">
          <motion.div whileHover={{ scale: 1.05 }} className="h-full">
            <ImageFallBack
              src={image}
              alt={service?.name || "Service image"}
              className="w-full h-full object-cover"
            />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/25 to-transparent" />
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{ x: ["-120%", "200%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear", delay: index * 0.2 }}
          />

          {(service?.duration_minutes || service?.price) && (
            <div className="absolute bottom-4 left-4 flex items-center gap-2 text-sm text-white/90 bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20">
              {service?.duration_minutes && (
                <span>{service.duration_minutes} min</span>
              )}
              {service?.duration_minutes && service?.price && (
                <span className="text-white/60">•</span>
              )}
              {service?.price && <span>{formatPrice(service.price)}</span>}
            </div>
          )}
        </div>

        <div className="p-6 relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#FFD700]/10 to-transparent rounded-full blur-2xl" />
          <h3
            className="text-2xl mb-2 text-[#2C2C2C] relative z-10"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {service?.name || "Service"}
          </h3>
          <p className="text-[#6B6B6B] mb-4 leading-relaxed relative z-10 line-clamp-3">
            {service?.description ||
              "Learn more about this tailored treatment designed to help you look and feel your best."}
          </p>

          <div className="relative z-10 flex items-center gap-2 text-[#D4AF7A] font-semibold group-hover:text-[#FFD700] transition-colors">
            <span>View details</span>
            <ArrowRight className="w-4 h-4 translate-x-0 group-hover:translate-x-1 transition-transform duration-200" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
