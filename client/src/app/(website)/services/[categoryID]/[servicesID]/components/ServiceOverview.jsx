"use client"
import { CheckCircle2 } from "lucide-react";

export default function ServiceOverview() {
  return (
    <section className="max-w-5xl mx-auto px-4 pb-16 md:pb-20">
      <div className="rounded-3xl bg-white/70 backdrop-blur-sm border border-white/60 shadow-[0_12px_45px_rgba(0,0,0,0.05)] p-8 md:p-10 space-y-6">
        <h3 className="text-2xl md:text-3xl font-semibold" style={{ fontFamily: "var(--font-serif)" }}>
          What to Expect
        </h3>
        <p className="text-lg text-[#4A4A4A] leading-relaxed">
          Each session blends gentle exfoliation, deep hydration, and calming LED therapy to smooth texture and brighten tone. You'll leave with skin that feels balanced, plump, and quietly radiant.
        </p>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[#4A4A4A]">
          {[
            "Personalized cleanse and enzyme prep",
            "Targeted resurfacing to refine pores",
            "Hydrating infusion with antioxidants",
            "LED calm phase to reduce redness",
          ].map((item) => (
            <li key={item} className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#D4AF7A] mt-0.5" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
