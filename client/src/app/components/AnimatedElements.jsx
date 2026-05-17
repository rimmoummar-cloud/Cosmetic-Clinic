"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { ReactNode } from "react";
void motion;

export function FloatingElement({ 
  children, 
  delay = 0, 
  duration = 3,
  yOffset = 20 
}) {
  return (
    <motion.div
      animate={{
        y: [0, -yOffset, 0],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}

export function ParallaxElement({ children, offset = 50 }) {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, offset]);

  return (
    <motion.div style={{ y }}>
      {children}
    </motion.div>
  );
}