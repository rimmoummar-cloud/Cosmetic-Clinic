"use client";
import { useState } from "react";
import { BookingForm } from "../../../feutures/booking/BookingForm";
import Link from "next/link";
import { motion } from "framer-motion";
import { GlowingButton } from "../../../components/GlowingButtom";
import { FloatingElement } from "../../../components/AnimatedElements";

export default function AboutCTA({ data = {} }) {
  const title = data?.title || data?.heading || "";
  const description = data?.description || data?.summary || "";
  const buttonText = data?.buttonText || data?.ctaText || data?.cta || "";
  const href = data?.href || data?.link || data?.url || "#";
  const [openBooking, setOpenBooking] = useState(false);
  return (
    <>
      <BookingForm 
          isOpen={openBooking} 
          onClose={() => setOpenBooking(false)} 
        />
    
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#FFD700]/20 via-[#E8DDD0]/30 to-[#E8C7C3]/20 relative overflow-hidden">
      <FloatingElement delay={0} duration={6}>
        <div className="absolute top-10 left-10 w-80 h-80 bg-gradient-to-br from-[#FFD700]/30 to-transparent rounded-full blur-3xl" />
      </FloatingElement>
      
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-4xl mx-auto text-center relative z-10"
      >
        {title && (
          <h2
            className="text-5xl md:text-6xl mb-6 text-[#2C2C2C]"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            {title}
          </h2>
        )}
        
        {description && (
          <p className="text-xl text-[#6B6B6B] mb-10 leading-relaxed">
            {description}
          </p>
        )}
        
        <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(212, 175, 122, 0.6)" }}
            whileTap={{ scale: 0.95 }}
         onClick={() => setOpenBooking(true)}
           className="px-4 sm:px-6 py-2 sm:py-3 w-auto max-w-fit bg-gradient-to-r from-[#D4AF7A] via-[#D4AF7A] to-[#D4AF7A] text-white rounded-full font-medium shadow-lg shadow-[#D4AF7A]/40 hover:shadow-xl relative overflow-hidden group"
          >
            <span className="relative z-10">{buttonText}</span>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-[#C9A66B] to-[#FFD700] opacity-0 group-hover:opacity-100 transition-opacity"
              initial={false}
            />
          </motion.button>
      </motion.div>
    </section>
    </>
  );
}
