"use client";
import { motion } from "framer-motion";
import { CheckCircle2, Award, Heart, Users } from "lucide-react";
import { SectionHeader } from "../../../components/sectionHeader";
import { FloatingElement } from "../../../components/AnimatedElements";
import { GlassCard } from "../../../components/GlassCard";

export default function AboutValues() {
  const values = [
    {
      icon: Heart,
      title: "Client-Centered Care",
      description: "Your comfort and satisfaction are our top priorities",
    },
    {
      icon: Award,
      title: "Excellence",
      description: "We maintain the highest standards in every service",
    },
    {
      icon: Users,
      title: "Expert Team",
      description: "Licensed professionals with years of experience",
    },
    {
      icon: CheckCircle2,
      title: "Results Driven",
      description: "Proven treatments that deliver visible results",
    },
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#FAF8F5] to-white relative overflow-hidden">
      <FloatingElement delay={0} duration={7}>
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-br from-[#FFD700]/10 to-transparent rounded-full blur-3xl" />
      </FloatingElement>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <SectionHeader
          label="Our Values"
          title="What Drives Us"
          description="The principles that guide everything we do"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard className="text-center">
                <FloatingElement delay={index} duration={3 + index}>
                  <div className="w-16 h-16 bg-gradient-to-br from-[#FFD700] via-[#D4AF7A] to-[#C9A66B] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#D4AF7A]/40">
                    <value.icon className="w-8 h-8 text-white" />
                  </div>
                </FloatingElement>
                
                <h3 
                  className="text-xl mb-3 text-[#2C2C2C]"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  {value.title}
                </h3>
                <p className="text-[#6B6B6B]">{value.description}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
