import CategoryHeader from "./components/CategoryHeader";
import ServicesGrid from "./components/ServicesGrid";

async function getCategory(categoryId) {
  try {
    const res = await fetch(
      `http://localhost:5000/api/categorie/${categoryId}`,
      { next: { revalidate: 60 } }
    );

    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error("Failed to load category", error);
    return null;
  }
}

async function getServices(categoryId) {
  try {
    const res = await fetch(
      `http://localhost:5000/api/services/samecategories/${categoryId}`,
      { next: { revalidate: 60 } }
    );

    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error("Failed to load services", error);
    return [];
  }
}

export default async function Page({ params }) {
  const { categoryID } = await params;

  const [category, services] = await Promise.all([
    getCategory(categoryID),
    getServices(categoryID),
  ]);

  return (
    <div className="bg-gradient-to-b from-[#FAF8F5] via-white to-[#FAF8F5] text-[#2C2C2C]">
      <CategoryHeader category={category} />
      <ServicesGrid
        categoryId={categoryID}
        initialServices={services}
        categoryName={category?.name}
      />
    </div>
  );
}
