import ServicesPage from "./services"

async function getservices() {
  const res = await fetch(

     `${process.env.NEXT_PUBLIC_API_URL}/services`,
    {
    cache: "no-store"
    }
  );

  return res.json();
}

async function getCategories() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/categorie`,
    {
  cache: "no-store"
    }
  );

  return res.json();
}


export default async function Page() {
   const service = await getservices();
     const categories = await getCategories();
 return(
  <ServicesPage  service={service} categories={categories} />
 );
  
}
