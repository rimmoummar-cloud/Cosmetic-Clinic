"use client"
import { CheckCircle2, XCircle } from "lucide-react";

const dos = ["Stay hydrated", "Use broad spectrum SPF", "Follow provided aftercare", "Book maintenance visits"];
const donts = ["No picking or exfoliating", "Avoid tanning beds", "Delay harsh actives for 72 hours", "Skip hot steam same day"];

export default function ServiceDosDonts() {
  return (
    <section className="max-w-6xl mx-auto px-4 pb-16 md:pb-20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-white/70 backdrop-blur-sm border border-white/60 shadow-[0_8px_26px_rgba(0,0,0,0.05)] p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-[#D4AF7A]" />
            <h4 className="text-lg font-semibold" style={{ fontFamily: "var(--font-serif)" }}>
              Do's
            </h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {dos.map((item) => (
              <span key={item} className="px-3 py-1 rounded-full bg-[#F8F3EC] text-sm text-[#4A4A4A]">
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-white/70 backdrop-blur-sm border border-white/60 shadow-[0_8px_26px_rgba(0,0,0,0.05)] p-6">
          <div className="flex items-center gap-2 mb-4">
            <XCircle className="w-5 h-5 text-[#D4AF7A]" />
            <h4 className="text-lg font-semibold" style={{ fontFamily: "var(--font-serif)" }}>
              Don'ts
            </h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {donts.map((item) => (
              <span key={item} className="px-3 py-1 rounded-full bg-[#F8F3EC] text-sm text-[#4A4A4A]">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
