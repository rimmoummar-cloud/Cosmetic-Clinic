"use client";
import { motion } from "framer-motion";
import { Sparkles, CheckCircle2 } from "lucide-react";
import { ImageFallBack } from "../../../components/EmageFullBack";
import { FloatingElement } from "../../../components/AnimatedElements";

export default function Benefits({ data }) {
  const label = data?.label || data?.eyebrow;
  const title = data?.title || data?.heading || "";
  const description = data?.description || data?.subtitle || "";
  const benefits =
    (Array.isArray(data?.benefits) && data.benefits) ||
    (Array.isArray(data?.items) && data.items) ||
    [];
  const imageSrc =
    data?.image ||
    data?.media ||
    data?.photo ||
    "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#F5F1ED] to-[#FAF8F5] relative overflow-hidden">
      {/* Animated decorative elements */}
      <FloatingElement delay={0} duration={6}>
        <div className="absolute top-20 right-10 w-64 h-64 bg-gradient-to-br from-[#FFD700]/20 to-transparent rounded-full blur-3xl" />
      </FloatingElement>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {label && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-gradient-to-r from-[#FFD700]/20 to-[#D4AF7A]/20 rounded-full backdrop-blur-sm border border-[#D4AF7A]/30"
              >
                <Sparkles className="w-5 h-5 text-[#D4AF7A]" />
                <span className="text-sm uppercase tracking-wider text-[#D4AF7A] font-medium">
                  {label}
                </span>
              </motion.div>
            )}
            
            <h2 
              className="text-5xl md:text-6xl mb-6 text-[#2C2C2C]"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              {title}
            </h2>
            
            <p className="text-lg text-[#6B6B6B] mb-10 leading-relaxed">
              {description}
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <motion.div 
                  key={benefit.id || benefit.slug || index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ x: 5 }}
                  className="flex items-start gap-3 p-4 rounded-2xl hover:bg-white/50 transition-colors"
                >
                  <CheckCircle2 className="w-6 h-6 text-[#FFD700] mt-0.5 flex-shrink-0" />
                  <span className="text-[#2C2C2C]">
                    {benefit?.title || benefit?.text || benefit}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-[#D4AF7A]/20">
              <ImageFallBack
                src={imageSrc}
                alt={title || "Benefits"}
                className="w-full h-[600px] object-cover"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#D4AF7A]/20 to-transparent" />
            </div>
            
            {/* Floating glow effects */}
            <FloatingElement delay={1} duration={4}>
              <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-gradient-to-br from-[#FFD700]/40 to-[#D4AF7A]/40 rounded-full blur-3xl" />
            </FloatingElement>
            
            <FloatingElement delay={2} duration={5}>
              <div className="absolute -top-8 -left-8 w-40 h-40 bg-gradient-to-br from-[#E8C7C3]/40 to-[#D4AF7A]/40 rounded-full blur-3xl" />
            </FloatingElement>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
