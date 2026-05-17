"use client";

import { SectionHeader } from "../../../../components/sectionHeader";
import { FloatingElement } from "../../../../components/AnimatedElements";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1508387026001-268e4f0e4748?auto=format&fit=crop&w=1600&q=80";

export default function CategoryHeader({ category }) {
  const title = category?.name || "Our Services";
  const description =
    category?.description ||
    "Discover treatments tailored to this category, crafted to deliver the best results for you.";
  const background = category?.image_url || FALLBACK_IMAGE;

  return (
    <section className="relative py-24 md:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div
        className="absolute inset-0 bg-center bg-cover"
        style={{ backgroundImage: `url(${background})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-white/85 via-[#FAF8F5]/92 to-white/80 backdrop-blur-[1px]" />

      <FloatingElement delay={0.4} duration={6} yOffset={14}>
        <div className="absolute -left-24 top-6 w-72 h-72 bg-gradient-to-br from-[#FFD700]/25 to-transparent rounded-full blur-3xl" />
      </FloatingElement>
      <FloatingElement delay={1} duration={7} yOffset={18}>
        <div className="absolute right-0 bottom-6 w-80 h-80 bg-gradient-to-tl from-[#E8C7C3]/25 to-transparent rounded-full blur-3xl" />
      </FloatingElement>

      <div className="relative max-w-6xl mx-auto text-center">
        <SectionHeader
          label="Category"
          title={title}
          description={description}
        />
      </div>
    </section>
  );
}
