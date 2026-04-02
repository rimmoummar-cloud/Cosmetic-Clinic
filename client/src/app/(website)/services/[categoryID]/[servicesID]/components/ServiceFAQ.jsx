"use client"
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";

const faqs = [
  {
    question: "How long does the session take?",
    answer:
      "Most treatments take 60–75 minutes including consultation, prep, and post-care guidance tailored to your skin type.",
  },
  {
    question: "When will I see results?",
    answer:
      "You'll notice immediate glow after one visit, with progressive refinement over 2–3 weeks as collagen activity improves.",
  },
  {
    question: "Is there downtime?",
    answer:
      "Only mild warmth or pinkness for a few hours. You can resume daily activities the same day with simple aftercare.",
  },
  {
    question: "How often should I book?",
    answer:
      "For best maintenance, we recommend a series of 3 sessions every 4–6 weeks, then seasonal refreshers.",
  },
];

export default function ServiceFAQ() {
  const [activeFaq, setActiveFaq] = useState(null);

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
        {faqs.map((item, idx) => {
          const open = activeFaq === idx;
          return (
            <div
              key={item.question}
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
                    className="px-5 pb-5 text-[#4A4A4A]"
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
