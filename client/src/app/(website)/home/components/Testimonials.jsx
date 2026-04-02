"use client";
import { motion } from "framer-motion";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import { SectionHeader } from "../../../components/sectionHeader";

export default function Testimonials({ data }) {
  const sliderRef = useRef(null);
  
  const label = data?.label || data?.eyebrow;
  const title = data?.title || data?.heading;
  const testimonials =
    (Array.isArray(data?.testimonials) && data.testimonials) ||
    (Array.isArray(data?.items) && data.items) ||
    [];

  const scrollLeft = () => {
    sliderRef.current?.scrollBy({
      left: -350,
      behavior: "smooth",
    });
  };

  const scrollRight = () => {
    sliderRef.current?.scrollBy({
      left: 350,
      behavior: "smooth",
    });
  };

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-gradient-to-r from-[#FFD700]/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-gradient-to-l from-[#E8C7C3]/10 to-transparent rounded-full blur-3xl" />
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <SectionHeader
          label={label}
          title={title}
        />

        <div className="relative">
          {/* Left Arrow */}
          <button
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white shadow-lg rounded-full p-3 hover:scale-110 transition"
            aria-label="Previous testimonials"
          >
            <ChevronLeft className="w-5 h-5 text-[#D4AF7A]" />
          </button>

          {/* Right Arrow */}
          <button
            onClick={scrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white shadow-lg rounded-full p-3 hover:scale-110 transition"
            aria-label="Next testimonials"
          >
            <ChevronRight className="w-5 h-5 text-[#D4AF7A]" />
          </button>

          <div
            ref={sliderRef}
            className="flex gap-8 overflow-x-auto scrollbar-hide scroll-smooth px-10"
          >
            {testimonials.map((testimonial, index) => {
              const rating = Number(
                testimonial.rating ?? testimonial.stars ?? testimonial.score ?? 0
              );
              return (
                <motion.div
                  key={testimonial.id || testimonial.name || index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="min-w-[320px] md:min-w-[350px] bg-gradient-to-br from-[#FAF8F5] to-[#F5F1ED] rounded-3xl p-8 shadow-xl shadow-[#D4AF7A]/10 hover:shadow-2xl hover:shadow-[#D4AF7A]/20 transition-all relative overflow-hidden border border-[#D4AF7A]/10"
                >
                  {/* Decorative glow */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#FFD700]/20 to-transparent rounded-full blur-2xl" />
                  
                  <div className="flex gap-1 mb-6 relative z-10">
                    {Array.from({ length: rating }).map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.2 + i * 0.1 }}
                      >
                        <Star className="w-5 h-5 fill-[#FFD700] text-[#FFD700]" />
                      </motion.div>
                    ))}
                  </div>
                  
                  <p className="text-[#2C2C2C] mb-6 leading-relaxed relative z-10">
                    "{testimonial.text || testimonial.quote || ""}"
                  </p>
                  
                  <p className="bg-gradient-to-r from-[#D4AF7A] to-[#C9A66B] bg-clip-text text-transparent font-medium relative z-10">
                    {testimonial.name || testimonial.author || ""}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
