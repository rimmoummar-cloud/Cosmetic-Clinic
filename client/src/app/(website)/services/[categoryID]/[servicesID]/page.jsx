import ServiceDetailsComponent from "./ServiceDetailsComponent"
export default async function Page({ params }) {
  const { servicesID } = await params;

  return (
    <div>
    
      <ServiceDetailsComponent  id={servicesID} />
    </div>
  );
}
