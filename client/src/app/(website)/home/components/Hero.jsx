"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ImageFallBack } from "../../../components/EmageFullBack";
import { GlowingButton } from "../../../components/GlowingButtom";
import { FloatingElement } from "../../../components/AnimatedElements";

export default function Hero({ onBookingClick, data }) {
  console.log("HERO COMPONENT DATA:", data);
  // const badgeText = data?.badge || data?.label || data?.eyebrow;
  // const title = data?.title || data?.heading || "";
  // const highlight = data?.highlight || data?.accent || data?.emphasis || "";
  // const description = data?.description || data?.subtitle || "";
  // const primaryCta =
  //   data?.primaryCta ||
  //   data?.primary_button ||
  //   data?.primaryButtonText ||
  //   data?.ctaPrimary;
  // const secondaryCta =
  //   data?.secondaryCta ||
  //   data?.secondary_button ||
  //   data?.secondaryButtonText ||
  //   data?.ctaSecondary;
  // const secondaryLink = data?.secondaryLink || data?.secondaryHref || "/services";
  // const backgroundImage =
  //   data?.image ||
  //   data?.backgroundImage ||
  //   data?.heroImage ||
  //   "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";


const badgeText = data?.badge;

const title = data?.title;

const highlight = data?.highlight;

const description = data?.description;

const subtitle = data?.subtitle;

const primaryCta = data?.buttonText;

const primaryLink  = data?.buttonLink;

const backgroundImage = data?.image;

const buttonTextBooking = data?.buttonTextBooking;






  return (
    <section className="relative h-[700px] md:h-[800px] flex items-center justify-center overflow-hidden">
      {/* Animated background gradient */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-r from-[#FAF8F5] via-[#FAF8F5]/90 to-transparent z-10"
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
        className="absolute inset-0 w-full h-full object-cover"
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
            className="text-6xl md:text-8xl mb-6 text-[#2C2C2C] leading-tight"
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
            className="text-xl md:text-2xl text-[#6B6B6B] mb-10 leading-relaxed"
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
                className="px-4 sm:px-6 py-2 sm:py-3 w-auto max-w-fit bg-gradient-to-r from-[#FFD700] via-[#D4AF7A] to-[#C9A66B] text-white rounded-full font-medium shadow-lg shadow-[#D4AF7A]/40 hover:shadow-xl relative overflow-hidden group"
              >
                <span className="relative z-10">{buttonTextBooking}</span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-[#C9A66B] to-[#FFD700] opacity-0 group-hover:opacity-100 transition-opacity"
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
