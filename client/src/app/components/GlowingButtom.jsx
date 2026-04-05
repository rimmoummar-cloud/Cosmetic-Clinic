// "use client"
// import { motion } from  "framer-motion";
// import { ReactNode } from "react";
// void motion;

// export function GlowingButton({ 
//   children, 
//   onClick, 
//   variant = "primary", 
//   className = "",
//   type = "button"
// }) {
//   const variants = {
//     primary: "bg-gradient-to-r from-[#FFD700] via-[#D4AF7A] to-[#C9A66B] text-white shadow-lg shadow-[#D4AF7A]/40 hover:shadow-[0_0_30px_rgba(212,175,122,0.6)]",
//     secondary: "bg-gradient-to-r from-[#E8C7C3] to-[#E8DDD0] text-[#2C2C2C] shadow-lg shadow-[#E8C7C3]/30 hover:shadow-[#E8C7C3]/50",
//     outline: "bg-transparent text-[#FFD700] border-2 border-[#FFD700] hover:bg-gradient-to-r hover:from-[#FFD700] hover:via-[#D4AF7A] hover:to-[#C9A66B] hover:text-white hover:shadow-[0_0_30px_rgba(212,175,122,0.6)]",
//   };

//   return (
//     <motion.button
//       type={type}
//       whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(212, 175, 122, 0.6)" }}
//       whileTap={{ scale: 0.95 }}
//       onClick={onClick}
//       className={`px-7 py-3 text-[0.9rem] rounded-full font-medium transition-all duration-300 relative overflow-hidden group hover:-translate-y-[2px] active:translate-y-0 ${variants[variant]} ${className}`}
//     >
//       <span className="relative z-10">{children}</span>

//       {/* Animated glow effect */}
//       <motion.div
//         className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0"
//         animate={{
//           x: ["-200%", "200%"],
//         }}
//         transition={{
//           duration: 3,
//           repeat: Infinity,
//           ease: "linear",
//         }}
//       />
//     </motion.button>
//   );
// }
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
    // primary: "bg-gradient-to-r from-[#FFD700] via-[#D4AF7A] to-[#C9A66B] text-white shadow-lg shadow-[#D4AF7A]/40 hover:shadow-[0_0_30px_rgba(212,175,122,0.6)]",
   primary: "bg-gradient-to-r from-[#D4AF7A] via-[#D4AF7A] to-[#D4AF7A] text-white shadow-lg shadow-[#D4AF7A]/40 hover:shadow-[0_0_30px_rgba(212,175,122,0.6)]",
    secondary: "bg-gradient-to-r from-[#D4AF7A] via-[#C9A66B] to-[#C9A66B] text-white shadow-lg shadow-[#D4AF7A]/30 hover:shadow-[0_0_30px_rgba(212,175,122,0.4)]",
    outline: "bg-transparent text-[#D4AF7A] border-2 border-[#D4AF7A] hover:bg-gradient-to-r hover:from-[#FFD700] hover:via-[#D4AF7A] hover:to-[#C9A66B] hover:text-white hover:shadow-[0_0_30px_rgba(212,175,122,0.6)]",
  };

  return (
    <motion.button
      type={type}
      whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(212, 175, 122, 0.6)" }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`px-7 py-3 text-[0.9rem] rounded-full font-medium transition-all duration-300 relative overflow-hidden group hover:-translate-y-[2px] active:translate-y-0 ${variants[variant]} ${className}`}
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