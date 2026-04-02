"use client";
import ContactHero from "./components/ContactHero";
import ContactInfo from "./components/ContactInfo";
import ContactForm from "./components/ContactForm";
import ContactMap from "./components/ContactMap";

export default function ContactComponent() {
  return (
    <div className="w-full overflow-hidden">
      <ContactHero />
      <ContactInfo />
      <ContactForm />
      <ContactMap />
    </div>
  );
}
