"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ImageFallBack } from "../../../components/EmageFullBack";
import { GlowingButton } from "../../../components/GlowingButtom";
import { FloatingElement } from "../../../components/AnimatedElements";

export default function Hero({ onBookingClick, data }) {
const badgeText = data?.content?.badge;

const title = data?.content?.title;

const highlight = data?.content?.highlight;

const description = data?.content?.description;

const subtitle = data?.content?.subtitle;

const primaryCta = data?.content?.buttonText;

const primaryLink  = data?.content?.buttonLink;

const backgroundImage = data?.content?.image; 

const buttonTextBooking = data?.content?.buttonTextBooking;



  return (
    <section className="relative min-h-screen h-[700px] md:h-[800px] flex items-center justify-center overflow-hidden pt-0 mt-0">
      {/* Animated background gradient */}
      <motion.div 
        className="absolute inset-0 z-10"
        style={{
          background: "linear-gradient(135deg, rgba(255, 255, 255, 0.92) 0%, rgba(245, 239, 230, 0.85) 50%, rgba(255, 255, 255, 0.7) 100%)"
        }}
  
        animate={{
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      
      <ImageFallBack
        src={backgroundImage}
        alt={title || "Hero background"}
        className="absolute inset-0 w-full h-full object-cover object-center"
      />
      
      {/* Floating decorative elements */}
      <FloatingElement delay={0} duration={4}>
        <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-[#FFD700]/30 to-[#D4AF7A]/30 rounded-full blur-3xl" />
      </FloatingElement>
      
      <FloatingElement delay={1} duration={5}>
        <div className="absolute bottom-32 left-32 w-40 h-40 bg-gradient-to-br from-[#E8C7C3]/30 to-[#D4AF7A]/30 rounded-full blur-3xl" />
      </FloatingElement>
      
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-block mb-6"
          >
            {badgeText && (
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="px-6 py-3 bg-white/95 backdrop-blur-xl rounded-full shadow-lg shadow-[#D4AF7A]/20 border border-[#D4AF7A]/20"
              >
                <span className="text-sm bg-gradient-to-r from-[#D4AF7A] to-[#C9A66B] bg-clip-text text-transparent font-medium">
                  {badgeText}
                </span>
              </motion.div>
            )}
          </motion.div>
          

   <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
           className="text-xl md:text-1xl text-[#D4AF7A] mb-10 leading-relaxed"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            {subtitle}
            {highlight && (
              <>
                <br />
                <span className="bg-gradient-to-r from-[#FFD700] via-[#D4AF7A] to-[#C9A66B] bg-clip-text text-transparent">
                  {highlight}
                </span>
              </>
            )}
          </motion.h1>


          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl italic md:text-8xl mb-6 text-[#2C2C2C] leading-tight"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            {title}
            {highlight && (
              <>
                <br />
                <span className="bg-gradient-to-r from-[#FFD700] via-[#D4AF7A] to-[#C9A66B] bg-clip-text text-transparent">
                  {highlight}
                </span>
              </>
            )}
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl md:text-1xl text-[#6B6B6B] mb-10 leading-relaxed"
          >
            {description}
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4"
          >
         {primaryCta && (
  <motion.button
    whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(212, 175, 122, 0.6)" }}
    whileTap={{ scale: 0.95 }}
    onClick={() => onBookingClick(true)}
    className="px-4 sm:px-6 py-2 sm:py-3 w-auto max-w-fit bg-gradient-to-r from-[#D4AF7A] via-[#D4AF7A] to-[#D4AF7A] text-white rounded-full font-medium shadow-lg shadow-[#D4AF7A]/40 hover:shadow-xl relative overflow-hidden group"
  >
    <span className="relative z-10">{buttonTextBooking}</span>

    <motion.div
      className="absolute inset-0 bg-gradient-to-r from-[#D4AF7A] via-[#D4AF7A] to-[#D4AF7A] opacity-0 group-hover:opacity-100 transition-opacity"
      initial={false}
    />
  </motion.button>
)}

           {primaryCta && (
  <Link href={primaryLink || "#"}>
    <GlowingButton variant="outline">
      {primaryCta}
    </GlowingButton>
  </Link>
)}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
