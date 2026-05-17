"use client"
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const relatedServices = [
  { title: "Brightening Peel", duration: "45 mins", link: "/services/brightening-peel" },
  { title: "LED Light Therapy", duration: "30 mins", link: "/services/led-therapy" },
  { title: "Dermaplaning Glow", duration: "50 mins", link: "/services/dermaplaning" },
];

export default function ServiceRelated() {
  return (
    <section className="max-w-6xl mx-auto px-4 pb-20">
      <div className="flex items-center justify-between gap-3 flex-wrap mb-6">
        <h3 className="text-2xl md:text-3xl font-semibold" style={{ fontFamily: "var(--font-serif)" }}>
          Related Services
        </h3>
        <Link href="/services" className="text-sm uppercase tracking-[0.15em] text-[#D4AF7A] hover:text-[#FFD700] transition-colors">
          View all
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {relatedServices.map((item, idx) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.05 }}
            className="rounded-2xl bg-white/70 backdrop-blur-sm border border-white/60 shadow-[0_10px_28px_rgba(0,0,0,0.05)] p-5"
          >
            <p className="text-lg font-semibold mb-2" style={{ fontFamily: "var(--font-serif)" }}>
              {item.title}
            </p>
            <p className="text-sm text-[#6B6B6B] mb-4">Duration: {item.duration}</p>
            <Link href={item.link} className="inline-flex items-center gap-1 text-[#D4AF7A] hover:text-[#FFD700] transition-colors font-medium">
              Learn more
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
