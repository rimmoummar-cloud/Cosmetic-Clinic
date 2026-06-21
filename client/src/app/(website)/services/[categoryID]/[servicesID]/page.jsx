import ServiceDetailsComponent from "./ServiceDetailsComponent"
export default async function Page({ params }) {
  const { categoryID, servicesID } = await params;

  return (
    <div>
    
      <ServiceDetailsComponent id={servicesID} categoryId={categoryID} />
    </div>
  );
}
