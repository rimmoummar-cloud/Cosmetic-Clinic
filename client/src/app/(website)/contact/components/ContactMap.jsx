"use client";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";

export default function ContactMap() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-[#F5F1ED] to-[#FAF8F5] rounded-3xl overflow-hidden shadow-xl shadow-[#D4AF7A]/10 h-96 flex items-center justify-center"
        >
          <div className="text-center">
            <MapPin className="w-16 h-16 text-[#D4AF7A] mx-auto mb-4" />
            <p className="text-lg text-[#6B6B6B]">Interactive map would be displayed here</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
