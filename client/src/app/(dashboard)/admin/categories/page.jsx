import CategoriesPage from "./categories";

// async function getCategories() {
//   const res = await fetch(
//     "http://localhost:5000/api/categorie",
//     {
//   cache: "no-store"
//     }
//   );

//   return res.json();
// }


export default async function AdminCategoriesPage() {
    // const categories = await getCategories();
  return (
  <CategoriesPage />
  );
}
