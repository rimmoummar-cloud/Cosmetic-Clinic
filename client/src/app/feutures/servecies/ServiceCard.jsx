import { motion } from "framer-motion";
import React from "react";

export function ServiceCard({
  title,
  description,
  image,
  link,
  ctaLabel,
  service,
  category,
  categories,
  services,
  delay = 0,
}) {
  const source = service || category || {};
  const resolvedTitle = title ?? source.title ?? source.name ?? "";
  const resolvedDescription =
    description ?? source.description ?? source.summary ?? "";
  const resolvedImage =
    image ??
    source.image ??
    source.image_url ??
    source.thumbnail ??
    "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
  const resolvedLink =
    link ??
    source.link ??
    source.href ??
    (source.slug ? `/services/${source.slug}` : undefined) ??
    (source.id ? `/services/${source.id}` : undefined);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -12 }}
      className="group relative bg-white rounded-3xl overflow-hidden shadow-xl shadow-[#D4AF7A]/10 hover:shadow-2xl hover:shadow-[#D4AF7A]/20 transition-all duration-500 border border-[#D4AF7A]/10"
    >
      {/* Image with overlay */}
      <div className="relative h-64 overflow-hidden">
        <motion.img
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.6 }}
          src={resolvedImage}
          alt={resolvedTitle}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Floating shine effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          animate={{ x: ["-100%", "200%"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear", delay }}
        />
      </div>

      {/* Content */}
      <div className="p-6 relative">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#FFD700]/10 to-transparent rounded-full blur-2xl" />

        <h3
          className="text-2xl mb-2 text-[#2C2C2C] relative z-10"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {resolvedTitle}
        </h3>
        <p className="text-[#6B6B6B] mb-4 relative z-10">
          {resolvedDescription}
        </p>

        {ctaLabel && (
          <motion.a
            href={resolvedLink}
            whileHover={{ x: 5 }}
            className="inline-flex items-center gap-2 text-[#D4AF7A] hover:text-[#FFD700] transition-colors relative z-10 font-medium"
          >
            {ctaLabel}
            <motion.span
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              -&gt;
            </motion.span>
          </motion.a>
        )}
      </div>
    </motion.div>
  );
}
