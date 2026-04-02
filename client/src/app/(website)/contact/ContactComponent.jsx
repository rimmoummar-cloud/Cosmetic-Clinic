"use client";
import ContactHero from "./components/ContactHero";
import ContactInfo from "./components/ContactInfo";
import ContactForm from "./components/ContactForm";
import ContactMap from "./components/ContactMap";

export default function ContactComponent({ data }) {
  const sections = data?.sections || [];

  const findSectionContent = (keys) => {
    const lookups = Array.isArray(keys) ? keys : [keys];
    const match = sections.find((section) => {
      const name = section?.name?.toLowerCase() || "";
      const slug = section?.slug?.toLowerCase() || "";
      return lookups.some((key) => {
        const k = key?.toLowerCase();
        return k && (name.includes(k) || slug.includes(k));
      });
    });
    return match?.content || {};
  };

  const heroData = findSectionContent(["hero", "contact-hero"]);
  const infoData = findSectionContent(["info", "contact-info", "details"]);
  const formData = findSectionContent(["form", "contact-form"]);
  const mapData = findSectionContent(["map", "contact-map", "location"]);

  return (
    <div className="w-full overflow-hidden">
      <ContactHero data={heroData} />
      <ContactInfo data={infoData} />
      <ContactForm data={formData} />
      <ContactMap data={mapData} />
    </div>
  );
}
