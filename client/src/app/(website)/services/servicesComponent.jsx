
import ServicesGrid from "./components/ServicesGrid";
import HeroSection from "./components/HeroSection";
import BookingSection from "./components/bookingSection";

async function getCategories() {
  const res = await fetch(
    "http://localhost:5000/api/categorie",
    {
   next: { revalidate: 60 }
    }
  );

  return res.json();
}




export default async  function Services({ data, categories = [] }) {
  const ensureCategories =
    Array.isArray(categories) && categories.length > 0
      ? categories
      : await getCategories();

  const sections = data?.sections || [];

  const findSectionContent = (keys) => {
    const lookups = Array.isArray(keys) ? keys : [keys];
    const match = sections.find((section) => {
      const name = section?.name?.toLowerCase();
      const slug = section?.slug?.toLowerCase();
      return lookups.some(
        (key) => key && (name === key.toLowerCase() || slug === key.toLowerCase())
      );
    });
    return match?.content || {};
  };

  const heroData = findSectionContent(["hero", "services-hero"]);
  const gridData = findSectionContent(["services-grid", "services", "categories"]);
  const bookingData = findSectionContent(["services_intro", "services-intro"]);
console.log("SERVICES PAGE DATA:", bookingData);
  return (
  <>
   <HeroSection data={heroData}/>
  <ServicesGrid  data={gridData} categories={ensureCategories} />
  
<BookingSection data={bookingData}/>
</>
  );
}



