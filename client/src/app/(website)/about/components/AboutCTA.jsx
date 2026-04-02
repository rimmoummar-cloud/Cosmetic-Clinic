"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { GlowingButton } from "../../../components/GlowingButtom";
import { FloatingElement } from "../../../components/AnimatedElements";

export default function AboutCTA() {
  return (
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
        <h2
          className="text-5xl md:text-6xl mb-6 text-[#2C2C2C]"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          Ready to Start Your Beauty Journey?
        </h2>
        
        <p className="text-xl text-[#6B6B6B] mb-10 leading-relaxed">
          Book your consultation today and discover what makes Shiny Skin special
        </p>
        
        <Link href ="">
          <GlowingButton variant="primary">
            Book Your Appointment
          </GlowingButton>
        </Link>
      </motion.div>
    </section>
  );
}
