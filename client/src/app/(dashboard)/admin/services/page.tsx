import ServicesPage from "./services"

async function getservices() {
  const res = await fetch(

     `http://localhost:5000/api/services`,
    {
    cache: "no-store"
    }
  );

  return res.json();
}

async function getCategories() {
  const res = await fetch(
    "http://localhost:5000/api/categorie",
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
