"use client"
import { motion } from  "framer-motion";
import { ReactNode } from "react";
void motion;

export function GlowingButton({ 
  children, 
  onClick, 
  variant = "primary", 
  className = "",
  type = "button"
}) {
  const variants = {
    primary: "bg-gradient-to-r from-[#FFD700] via-[#D4AF7A] to-[#C9A66B] text-white shadow-lg shadow-[#D4AF7A]/40 hover:shadow-[#D4AF7A]/60",
    secondary: "bg-gradient-to-r from-[#E8C7C3] to-[#E8DDD0] text-[#2C2C2C] shadow-lg shadow-[#E8C7C3]/30 hover:shadow-[#E8C7C3]/50",
    outline: "bg-white/90 backdrop-blur-sm text-[#2C2C2C] border-2 border-[#D4AF7A]/30 hover:border-[#D4AF7A] shadow-lg hover:shadow-[#D4AF7A]/20",
  };

  return (
    <motion.button
      type={type}
      whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(212, 175, 122, 0.6)" }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`px-8 py-4 rounded-full font-medium transition-all duration-300 relative overflow-hidden group ${variants[variant]} ${className}`}
    >
      <span className="relative z-10">{children}</span>

      {/* Animated glow effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0"
        animate={{
          x: ["-200%", "200%"],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </motion.button>
  );
}