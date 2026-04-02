"use client";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";

export default function ContactMap({ data = {} }) {
  const title = data?.title || data?.heading || "";
  const description = data?.description || data?.summary || "";
  const mapUrl = data?.mapUrl || data?.map_url || data?.embedUrl || data?.embed_url;

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-[#F5F1ED] to-[#FAF8F5] rounded-3xl overflow-hidden shadow-xl shadow-[#D4AF7A]/10 h-96 flex items-center justify-center"
        >
          {mapUrl ? (
            <iframe
              src={mapUrl}
              title={title || "map"}
              className="w-full h-full border-0"
              loading="lazy"
              allowFullScreen
            />
          ) : (
            <div className="text-center px-4">
              <MapPin className="w-16 h-16 text-[#D4AF7A] mx-auto mb-4" />
              {title && (
                <h3
                  className="text-2xl text-[#2C2C2C] mb-2"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-lg text-[#6B6B6B]">{description}</p>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
