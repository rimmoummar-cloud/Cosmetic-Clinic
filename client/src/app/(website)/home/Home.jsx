"use client";
import { useState } from "react";
import { BookingForm } from "../../feutures/booking/BookingForm";
import Hero from "./components/Hero";
import ServicesPreview from "./components/ServicesPreview";
import Benefits from "./components/Benefits";
import Testimonials from "./components/Testimonials";
import CTA from "./components/CTA";

export default function Home({ data, categories = []}) {
  const [openBooking, setOpenBooking] = useState(false);

  const sections = data?.sections || [];

  // const findSectionContent = (keys) => {
  //   const lookups = Array.isArray(keys) ? keys : [keys];
  //   const match = sections.find((section) => {
  //     const name = section?.name?.toLowerCase();
  //     const slug = section?.slug?.toLowerCase();
  //     return lookups.some(
  //       (key) => key && (name === key.toLowerCase() || slug === key.toLowerCase())
  //     );
  //   });

  //   return match?.content || {};
  // };


const findSectionContent = (keys) => {
  const lookups = Array.isArray(keys) ? keys : [keys];

  const match = sections.find((section) => {
    const name = section?.name?.toLowerCase() || "";
    const slug = section?.slug?.toLowerCase() || "";

    return lookups.some((key) => {
      const k = key?.toLowerCase();
      return (
        name.includes(k) ||
        slug.includes(k)
      );
    });
  });

  return match?.content || {};
};



  const heroData = findSectionContent(["hero"]);
  const servicesData = findSectionContent(["services", "services-preview", "service"]);
  const benefitsData = findSectionContent(["benefits", "why-us", "why choose us"]);
  const testimonialsData = findSectionContent(["testimonials", "reviews"]);
  const ctaData = findSectionContent(["cta", "call-to-action", "cta-section"]);

  return (
    <>
      <BookingForm 
        isOpen={openBooking} 
        onClose={() => setOpenBooking(false)} 
      />
      <div className="w-full overflow-hidden">
   
        <Hero data={heroData} onBookingClick={setOpenBooking} />
        <ServicesPreview
          data={servicesData}
          categories={categories}
          // services={services}
        />
        <Benefits data={benefitsData} />
        <Testimonials data={testimonialsData} />
        <CTA data={ctaData} onBookingClick={setOpenBooking} />
      </div>
    </>
  );
}
