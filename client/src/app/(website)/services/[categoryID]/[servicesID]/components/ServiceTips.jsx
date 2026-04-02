"use client"
import { Sparkles, ShieldCheck, CheckCircle2 } from "lucide-react";

const tips = {
  before: [
    "Arrive with clean skin (no makeup or heavy products).",
    "Pause active exfoliants (AHA/BHA/retinol) 48 hours prior.",
    "Hydrate well the day before and day of your appointment.",
  ],
  after: [
    "Keep skin moisturized with gentle, fragrance-free products.",
    "Avoid direct sun and use SPF 50 daily for one week.",
    "Skip saunas and intense workouts for 24 hours.",
  ],
};

export default function ServiceTips() {
  return (
    <section className="max-w-6xl mx-auto px-4 pb-16 md:pb-20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-3xl bg-white/70 backdrop-blur-sm border border-white/60 shadow-[0_10px_32px_rgba(0,0,0,0.05)] p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-[#D4AF7A]" />
            <h4 className="text-xl font-semibold" style={{ fontFamily: "var(--font-serif)" }}>
              Before Session
            </h4>
          </div>
          <ul className="space-y-2 text-[#4A4A4A]">
            {tips.before.map((tip) => (
              <li key={tip} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#D4AF7A] mt-1" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl bg-white/70 backdrop-blur-sm border border-white/60 shadow-[0_10px_32px_rgba(0,0,0,0.05)] p-6 space-y-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-[#D4AF7A]" />
            <h4 className="text-xl font-semibold" style={{ fontFamily: "var(--font-serif)" }}>
              After Session
            </h4>
          </div>
          <ul className="space-y-2 text-[#4A4A4A]">
            {tips.after.map((tip) => (
              <li key={tip} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#D4AF7A] mt-1" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
