"use client"
import { motion } from "framer-motion";
import { ArrowRight, Clock, Sparkles, Users } from "lucide-react";

const stats = [
  { label: "Price", value: "$180", icon: ArrowRight },
  { label: "Duration", value: "70 mins", icon: Clock },
  { label: "Ideal Frequency", value: "Every 4–6 weeks", icon: Sparkles },
  { label: "Happy Guests", value: "1,240+", icon: Users },
];

export default function ServiceStats() {
  return (
    <section className="max-w-6xl mx-auto px-4 pb-16 md:pb-20">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((item, idx) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.05 }}
            className="rounded-2xl bg-white/70 backdrop-blur-sm border border-white/60 shadow-[0_10px_30px_rgba(0,0,0,0.05)] p-4 flex flex-col gap-2"
          >
            <div className="flex items-center gap-2 text-[#D4AF7A]">
              <item.icon className="w-4 h-4" />
              <span className="text-sm uppercase tracking-[0.12em] text-[#6B6B6B]">{item.label}</span>
            </div>
            <p className="text-xl font-semibold" style={{ fontFamily: "var(--font-serif)" }}>
              {item.value}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
