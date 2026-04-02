"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { FloatingElement } from "../../../../components/AnimatedElements";
import ServiceCard from "./ServiceCard";

export default function ServicesGrid({
  categoryId,
  initialServices = [],
  categoryName,
}) {
  const [services, setServices] = useState(initialServices || []);
  const [loading, setLoading] = useState(!initialServices?.length);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(!services.length);
      setError("");
      try {
        const res = await fetch(
          `http://localhost:5000/api/services/samecategories/${categoryId}`,
          { cache: "no-store" }
        );
        if (!res.ok) {
          throw new Error("Request failed");
        }
        const data = await res.json();
        if (!cancelled) {
          setServices(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          setError("We couldn’t load the services right now.");
          setServices([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId]);

  const skeletonItems = useMemo(() => Array.from({ length: 6 }), []);

  const hasServices = services && services.length > 0;

  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-[#FAF8F5]">
      <FloatingElement delay={0.2} duration={7} yOffset={16}>
        <div className="absolute top-6 right-10 w-72 h-72 bg-gradient-to-br from-[#FFD700]/14 to-transparent rounded-full blur-3xl" />
      </FloatingElement>
      <FloatingElement delay={0.8} duration={6} yOffset={20}>
        <div className="absolute -left-10 bottom-6 w-72 h-72 bg-gradient-to-tr from-[#E8C7C3]/14 to-transparent rounded-full blur-3xl" />
      </FloatingElement>

      <div className="max-w-7xl mx-auto relative z-10 space-y-10">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-[#D4AF7A]">
              {categoryName ? `${categoryName} Services` : "Services"}
            </p>
            <h2
              className="text-3xl md:text-4xl text-[#2C2C2C]"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Select a treatment
            </h2>
            <p className="text-[#6B6B6B] mt-2">
              Browse the available treatments in this category and open a card
              to view full details.
            </p>
          </div>
          {hasServices && (
            <div className="text-sm text-[#6B6B6B] md:text-right">
              {services.length} service{services.length === 1 ? "" : "s"} found
            </div>
          )}
        </div>

        {error && (
          <div className="rounded-2xl border border-[#E8C7C3]/60 bg-white/70 p-4 text-[#8B5C55] shadow-sm">
            {error}
          </div>
        )}

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {skeletonItems.map((_, idx) => (
              <div
                key={idx}
                className="h-80 rounded-3xl bg-white/70 border border-[#E8DDD0]/80 shadow animate-pulse"
              >
                <div className="h-40 bg-[#E8DDD0]/70" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-[#E8DDD0]/70 rounded w-3/4" />
                  <div className="h-3 bg-[#E8DDD0]/60 rounded w-full" />
                  <div className="h-3 bg-[#E8DDD0]/60 rounded w-5/6" />
                  <div className="h-3 bg-[#E8DDD0]/60 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !hasServices && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-[#E8C7C3]/60 bg-white/80 px-6 py-10 text-center shadow-lg"
          >
            <p
              className="text-2xl mb-3 text-[#2C2C2C]"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              No services listed yet
            </p>
            <p className="text-[#6B6B6B]">
              We are preparing treatments for this category. Please check back
              soon or explore other categories.
            </p>
          </motion.div>
        )}

        {!loading && hasServices && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-7">
            {services.map((service, idx) => (
              <ServiceCard
                key={service.id || idx}
                service={service}
                categoryId={categoryId}
                index={idx}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
