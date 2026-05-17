"use client"
import { motion } from   "framer-motion";
void motion;
import { ReactNode } from "react";

// src/components/Cards.js
import React from "react";

/* -------------------------------- GlassCard -------------------------------- */
export function GlassCard({ children, className = "", hover = true }) {
  return (
    <motion.div
      whileHover={hover ? { y: -8, scale: 1.02 } : {}}
      className={`bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-[#D4AF7A]/20 shadow-xl shadow-[#D4AF7A]/5 transition-all ${className}`}
    >
      {children}
    </motion.div>
  );
}
