"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { GlowingButton } from "../../../components/GlowingButtom";
import { ServiceCard } from "../../../feutures/servecies/ServiceCard";
import { SectionHeader } from "../../../components/sectionHeader";

export default function ServicesPreview({ data, categories = []}) {
  const header = {
    label: data?.label || data?.eyebrow,
    title: data?.title || data?.heading,
    description: data?.description || data?.subtitle,
  };

  const servicesSource =
    (Array.isArray(data?.services) && data.services) ||
    (Array.isArray(data?.items) && data.items) ||
    (Array.isArray(data?.cards) && data.cards) ||
    [];

  // const liveServices = Array.isArray(services) ? services : [];
  const liveCategories = Array.isArray(categories) ? categories : [];

  // preference: CMS-provided services > live services > categories fallback
  const cards =liveCategories;

  const ctaText = data?.ctaText || data?.ctaLabel || data?.cta;
  const ctaLink = data?.ctaLink || data?.ctaHref || data?.ctaUrl || "/services";

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-[#FAF8F5] relative">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-[#FFD700]/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-tl from-[#E8C7C3]/10 to-transparent rounded-full blur-3xl" />
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <SectionHeader
          label={header.label}
          title={header.title}
          description={header.description}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cards.map((service, index) => (
            <ServiceCard
              key={service.id || service.slug || index}
              title={service.title || service.name || ""}
              description={service.description || service.summary || ""}
              image={service.image || service.image_url || service.thumbnail}
              link={
                service.link ||
                service.href ||
                (service.slug ? `/services/${service.slug}` : ctaLink)
              }
              ctaLabel={
                service.ctaLabel ||
                service.cta_text ||
                data?.itemCtaLabel ||
                data?.itemCta
              }
              service={service}
              categories={liveCategories}
              // services={liveServices}
              delay={index * 0.2}
            />
          ))}
        </div>

        {ctaText && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="text-center mt-12"
          >
            <Link href={ctaLink}>
              <GlowingButton variant="primary">
                {ctaText}
              </GlowingButton>
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}
