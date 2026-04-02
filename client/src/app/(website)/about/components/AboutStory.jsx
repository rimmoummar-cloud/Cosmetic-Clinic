"use client";
import { motion } from "framer-motion";
import { ImageFallBack } from "../../../components/EmageFullBack";
import { FloatingElement } from "../../../components/AnimatedElements";

export default function AboutStory() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 
              className="text-5xl mb-6 text-[#2C2C2C]"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Our Story
            </h2>
            <div className="space-y-4 text-lg text-[#6B6B6B] leading-relaxed">
              <p>
                Founded in 2018, Shiny Skin Aesthetic & Beauty Clinic was born from a passion for helping people feel confident and beautiful in their own skin.
              </p>
              <p>
                We believe that everyone deserves access to premium beauty treatments in a luxurious, welcoming environment. Our team of licensed professionals combines years of experience with the latest techniques to deliver exceptional results.
              </p>
              <p>
                Today, we're proud to be one of the most trusted beauty clinics, serving hundreds of satisfied clients who trust us with their beauty needs.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="rounded-3xl overflow-hidden shadow-2xl shadow-[#D4AF7A]/20">
              <ImageFallBack
                src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800"
                alt="Clinic interior"
                className="w-full h-[500px] object-cover"
              />
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
