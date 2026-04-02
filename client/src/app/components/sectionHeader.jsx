"use client";
import { motion } from  "framer-motion";
void motion;
export function SectionHeader({ label, title, description }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="text-center mb-16"
    >
      {label && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-gradient-to-r from-[#FFD700]/20 via-[#D4AF7A]/20 to-[#C9A66B]/20 rounded-full backdrop-blur-sm border border-[#D4AF7A]/30"
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="w-2 h-2 rounded-full bg-gradient-to-r from-[#FFD700] to-[#D4AF7A]"
          />

          <span className="text-sm uppercase tracking-wider bg-gradient-to-r from-[#D4AF7A] to-[#C9A66B] bg-clip-text text-transparent font-medium">
            {label}
          </span>
        </motion.div>
      )}
      
      <motion.h2 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className="text-4xl md:text-5xl mb-4 text-[#2C2C2C]"
        style={{ fontFamily: 'var(--font-serif)' }}
      >
        {title}
      </motion.h2>
      
      {description && (
        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-lg text-[#6B6B6B] max-w-2xl mx-auto"
        >
          {description}
        </motion.p>
      )}
    </motion.div>
  );
}
