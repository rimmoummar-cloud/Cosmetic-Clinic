"use client"
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { GlowingButton } from "../../../../../components/GlowingButtom";

const service = {
  title: "Signature Skin Rejuvenation",
  category: "Facial Aesthetics",
  description:
    "A luminous, skin-renewing facial that refines texture, boosts radiance, and delivers a calm, hydrated finish with minimal downtime.",
  image:
    "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=80",
};

export default function ServiceHero({servicetitle}) {
  return (
    <>
      {/* Desktop / existing hero layout */}
      <section className="relative hidden md:block w-full overflow-hidden mb-12 md:mb-16">
        <div
          className="absolute inset-0 bg-center bg-cover"
          style={{ backgroundImage: `url(${service.image})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/30 to-black/55 backdrop-blur-[2px]" />

        <div className="relative max-w-5xl mx-auto px-6 md:px-10 py-20 md:py-28 text-center text-white space-y-6">
          <span className="text-sm uppercase tracking-[0.18em] text-white/75">Treatment</span>
          <h1 className="text-4xl md:text-5xl font-semibold leading-tight" style={{ fontFamily: "var(--font-serif)" }}>
            {servicetitle}
          </h1>
          <p className="text-lg md:text-xl text-white/85 leading-relaxed max-w-3xl mx-auto">
            {service.description}
          </p>

          <div className="flex justify-center gap-3 flex-wrap">
            <GlowingButton variant="outline" className="border-[#E8C7C3]/70 text-[#2C2C2C]">
              <Link href="/contact" className="inline-flex items-center gap-2">
                Contact Now
              </Link>
            </GlowingButton>
          </div>
        </div>
      </section>

      {/* Mobile: image and text share the same card for tighter, overflow-safe layout */}
      <section className="md:hidden w-full px-6 py-10">
        <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-5 flex items-center gap-4">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden shrink-0 border border-slate-200">
            <img
              src={service.image}
              alt={service.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 space-y-2">
            <span className="text-xs uppercase tracking-[0.16em] text-slate-500">Treatment</span>
            <h1
              className="text-xl font-semibold leading-snug text-slate-900"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {servicetitle}
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              {service.description}
            </p>

            <div className="pt-1">
              <GlowingButton
                variant="outline"
                className="w-full justify-center border-[#E8C7C3]/80 text-[#2C2C2C]"
              >
                <Link href="/contact" className="inline-flex items-center gap-2">
                  Contact Now
                </Link>
              </GlowingButton>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
