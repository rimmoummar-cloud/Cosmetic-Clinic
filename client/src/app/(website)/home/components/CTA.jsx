"use client";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { FloatingElement } from "../../../components/AnimatedElements";

export default function CTA({ onBookingClick, data }) {
  const title = data?.title || data?.heading || "";
  const description = data?.description || data?.subtitle || "";
  const buttonText =
    data?.buttonText ||
    data?.ctaText ||
    data?.primaryCta ||
    data?.primary_button;

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#FFD700]/20 via-[#E8DDD0]/30 to-[#E8C7C3]/20 relative overflow-hidden">
      {/* Animated background elements */}
      <FloatingElement delay={0} duration={6}>
        <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-br from-[#FFD700]/30 to-transparent rounded-full blur-3xl" />
      </FloatingElement>
      
      <FloatingElement delay={2} duration={7}>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-gradient-to-tl from-[#E8C7C3]/30 to-transparent rounded-full blur-3xl" />
      </FloatingElement>
      
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-4xl mx-auto text-center relative z-10"
      >
        <FloatingElement delay={1} duration={3}>
          <Sparkles className="w-16 h-16 mx-auto mb-6 text-[#D4AF7A]" />
        </FloatingElement>
        
        <h2 
          className="text-5xl md:text-6xl mb-6 text-[#2C2C2C]"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          {title}
        </h2>
        
        <p className="text-xl text-[#6B6B6B] mb-10 leading-relaxed">
          {description}
        </p>
        
        {buttonText && (
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(212, 175, 122, 0.6)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onBookingClick(true)}
            className="px-4 sm:px-6 py-2 sm:py-3 w-auto max-w-fit bg-gradient-to-r from-[#FFD700] via-[#D4AF7A] to-[#C9A66B] text-white rounded-full font-medium shadow-lg shadow-[#D4AF7A]/40 hover:shadow-xl relative overflow-hidden group"
          >
            <span className="relative z-10">{buttonText}</span>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-[#C9A66B] to-[#FFD700] opacity-0 group-hover:opacity-100 transition-opacity"
              initial={false}
            />
          </motion.button>
        )}
      </motion.div>
    </section>
  );
}
