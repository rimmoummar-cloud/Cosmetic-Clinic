"use client";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { FloatingElement } from "../../../components/AnimatedElements";
import { GlassCard } from "../../../components/GlassCard";

const iconMap = {
  pin: MapPin,
  address: MapPin,
  location: MapPin,
  phone: Phone,
  call: Phone,
  mail: Mail,
  email: Mail,
  clock: Clock,
  hours: Clock,
};

export default function ContactInfo({ data = {} }) {
  const contactInfo =
    (Array.isArray(data?.items) && data.items) ||
    (Array.isArray(data?.info) && data.info) ||
    [];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white relative">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {contactInfo.map((info, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard className="text-center">
                {info?.icon && (
                  <FloatingElement delay={index} duration={3 + index}>
                    <div className="w-14 h-14 bg-gradient-to-br from-[#FFD700] via-[#D4AF7A] to-[#C9A66B] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#D4AF7A]/40">
                      {(iconMap[info.icon?.toLowerCase?.()] || MapPin)({
                        className: "w-7 h-7 text-white",
                      })}
                    </div>
                  </FloatingElement>
                )}
                
                <h3 
                  className="text-lg mb-3 text-[#2C2C2C]"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  {info?.title}
                </h3>
                {Array.isArray(info?.details) &&
                  info.details.map((detail, i) => (
                  <p key={i} className="text-sm text-[#6B6B6B]">
                    {detail}
                  </p>
                  ))}
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
