"use client";
import { motion } from "framer-motion";
import { ImageFallBack } from "../../../components/EmageFullBack";
import { FloatingElement } from "../../../components/AnimatedElements";

export default function AboutStory({ data = {} }) {

  const title = data?.title || data?.heading || "";
  const paragraphs = Array.isArray(data?.paragraphs)
    ? data.paragraphs
    : typeof data?.body === "string"
      ? [data.body]
      : typeof data?.description === "string"
        ? [data.description]
        : [];
  const image =
    data?.image ||
    data?.image_url ||
    data?.imageUrl ||
    data?.media ||
    "";
  const imageAlt = data?.imageAlt || data?.title || "";

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            {title && (
              <h2
                className="text-5xl mb-6 text-[#2C2C2C]"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {title}
              </h2>
            )}
            {paragraphs.length > 0 && (
              <div className="space-y-4 text-lg text-[#6B6B6B] leading-relaxed">
                {paragraphs.map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="rounded-3xl overflow-hidden shadow-2xl shadow-[#D4AF7A]/20">
              {image && (
                <ImageFallBack
                  src={image}
                  alt={imageAlt}
                  className="w-full h-[500px] object-cover"
                />
              )}
            </div>
            
            <FloatingElement delay={1} duration={4}>
              <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-gradient-to-br from-[#FFD700]/40 to-[#D4AF7A]/40 rounded-full blur-3xl" />
            </FloatingElement>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
