"use client";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { FloatingElement } from "../../../components/AnimatedElements";
import { GlassCard } from "../../../components/GlassCard";

export default function ContactInfo() {
  const contactInfo = [
    {
      icon: MapPin,
      title: "Visit Us",
      details: ["123 Beauty Lane", "New York, NY 10001"],
    },
    {
      icon: Phone,
      title: "Call Us",
      details: ["(555) 123-4567", "Mon-Fri: 9am-6pm"],
    },
    {
      icon: Mail,
      title: "Email Us",
      details: ["hello@shinyskin.com", "We reply within 24hrs"],
    },
    {
      icon: Clock,
      title: "Working Hours",
      details: ["Mon-Fri: 9am-8pm", "Sat-Sun: 10am-6pm"],
    },
  ];

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
                <FloatingElement delay={index} duration={3 + index}>
                  <div className="w-14 h-14 bg-gradient-to-br from-[#FFD700] via-[#D4AF7A] to-[#C9A66B] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#D4AF7A]/40">
                    <info.icon className="w-7 h-7 text-white" />
                  </div>
                </FloatingElement>
                
                <h3 
                  className="text-lg mb-3 text-[#2C2C2C]"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  {info.title}
                </h3>
                {info.details.map((detail, i) => (
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
