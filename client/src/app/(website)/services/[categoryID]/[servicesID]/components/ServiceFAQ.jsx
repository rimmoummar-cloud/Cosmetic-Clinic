"use client"
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function ServiceFAQ({ faqs = [] }) {
  const [activeFaq, setActiveFaq] = useState(null);
  const items = Array.isArray(faqs) ? faqs : [];

  const toggleFaq = (index) => {
    setActiveFaq((prev) => (prev === index ? null : index));
  };

  return (
    <section className="max-w-5xl mx-auto px-4 pb-16 md:pb-20">
      <div className="flex items-center justify-between gap-3 flex-wrap mb-6">
        <h3 className="text-2xl md:text-3xl font-semibold" style={{ fontFamily: "var(--font-serif)" }}>
          Frequently Asked Questions
        </h3>
        <p className="text-sm uppercase tracking-[0.14em] text-[#6B6B6B]">Tap to expand</p>
      </div>

      <div className="space-y-3">
        {items.length === 0 && (
          <div className="rounded-2xl bg-white/70 backdrop-blur-sm border border-white/60 shadow-[0_8px_28px_rgba(0,0,0,0.05)] px-5 py-6 text-[#6B6B6B]">
            No FAQs available.
          </div>
        )}

        {items.map((item, idx) => {
          const open = activeFaq === idx;
          return (
            <div
              key={item.id || item.question || idx}
              className="rounded-2xl bg-white/70 backdrop-blur-sm border border-white/60 shadow-[0_8px_28px_rgba(0,0,0,0.05)]"
            >
              <button
                type="button"
                onClick={() => toggleFaq(idx)}
                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <span className="text-base md:text-lg font-semibold" style={{ fontFamily: "var(--font-serif)" }}>
                  {item.question}
                </span>
                <motion.span animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.25 }}>
                  <ArrowRight className="w-4 h-4 text-[#D4AF7A]" />
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {open && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35 }}
                    className="overflow-hidden px-5 pb-5 text-[#4A4A4A]"
                  >
                    {item.answer}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
