"use client";
import { motion } from "framer-motion";
import { SectionHeader } from "../../../components/sectionHeader";
import { FloatingElement } from "../../../components/AnimatedElements";

export default function ContactHero({ data = {} }) {
  const label = data?.label || data?.eyebrow || "";
  const title = data?.title || data?.heading || "";
  const description = data?.description || data?.summary || "";

  return (
    <section className="relative py-28 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#FFD700]/20 via-[#E8DDD0]/30 to-[#E8C7C3]/20 overflow-hidden">
      <FloatingElement delay={0} duration={6}>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#FFD700]/30 to-transparent rounded-full blur-3xl" />
      </FloatingElement>
      
      <FloatingElement delay={2} duration={7}>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tl from-[#E8C7C3]/30 to-transparent rounded-full blur-3xl" />
      </FloatingElement>
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto text-center relative z-10"
      >
        <SectionHeader
          label={label}
          title={title}
          description={description}
        />
      </motion.div>
    </section>
  );
}
