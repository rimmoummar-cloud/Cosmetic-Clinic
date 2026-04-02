
import ServiceHero from "./components/ServiceHero";
import ServiceOverview from "./components/ServiceOverview";
import ServiceGallery from "./components/ServiceGallery";
import ServiceStats from "./components/ServiceStats";
import ServiceTips from "./components/ServiceTips";
import ServiceDosDonts from "./components/ServiceDosDonts";
import ServiceFAQ from "./components/ServiceFAQ";
import ServiceReviews from "./components/ServiceReviews";
import ServiceRelated from "./components/ServiceRelated";
import ServiceCTA from "./components/ServiceCTA";





async function getservices(id) {
  const res = await fetch(

     `http://localhost:5000/api/services/${id}`,
    {
     next: { revalidate: 60 }
    }
  );

  return res.json();
}







export default async function ServiceDetailsComponent({id}) {
    const service = await getservices(id);
  
  return (
    <div className="bg-gradient-to-b from-[#FAF8F5] via-white to-[#FAF8F5] text-[#2C2C2C]">
 
      <ServiceHero servicetitle={service.name} />
      <ServiceOverview />
      <ServiceGallery />
      <ServiceStats />
      <ServiceTips />
      <ServiceDosDonts />
      <ServiceFAQ />
      <ServiceReviews />
      <ServiceRelated />
      <ServiceCTA />
    </div>
  );
}
