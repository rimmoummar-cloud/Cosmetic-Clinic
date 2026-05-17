"use client";
import { motion } from "framer-motion";
import { CheckCircle2, Award, Heart, Users } from "lucide-react";
import { SectionHeader } from "../../../components/sectionHeader";
import { FloatingElement } from "../../../components/AnimatedElements";
import { GlassCard } from "../../../components/GlassCard";

const iconMap = {
  check: CheckCircle2,
  award: Award,
  heart: Heart,
  users: Users,
};

export default function AboutValues({ data = {} }) {

 const source = data?.value || data;

const values = Array.isArray(source?.values)
  ? source.values
  : Array.isArray(source?.items)
    ? source.items
    : [];

const title =
  source?.title ||
  source?.heading ||
  "";

const label =
  source?.label ||
  source?.eyebrow ||
  "";

const description =
  source?.description ||
  source?.summary ||
  "";

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#FAF8F5] to-white relative overflow-hidden">
      
      <FloatingElement delay={0} duration={7}>
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-br from-[#FFD700]/10 to-transparent rounded-full blur-3xl" />
      </FloatingElement>

      <div className="max-w-7xl mx-auto relative z-10">

        <SectionHeader
          label={label}
          title={title}
          description={description}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

          {values.map((value, index) => {

            const iconKey =
              typeof value?.icon === "string"
                ? value.icon.toLowerCase()
                : undefined;

            const IconComponent =
              iconMap[iconKey] || null;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassCard className="text-center">

                  {IconComponent && (
                    <FloatingElement delay={index} duration={3 + index}>
                      <div className="w-16 h-16 bg-gradient-to-br from-[#FFD700] via-[#D4AF7A] to-[#C9A66B] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#D4AF7A]/40">
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                    </FloatingElement>
                  )}

                  <h3
                    className="text-xl mb-3 text-[#2C2C2C]"
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    {value?.label || value?.title || value?.heading}
                  </h3>

                  <p className="text-[#6B6B6B]">
                    {value?.detail || value?.description || value?.text}
                  </p>

                </GlassCard>
              </motion.div>
            );
          })}

        </div>
      </div>
    </section>
  );
}