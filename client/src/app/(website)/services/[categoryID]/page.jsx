import CategoryPageContent from "./components/CategoryPageContent";

async function getCategory(categoryId) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/categorie/${categoryId}`,
      { cache: "no-store" }
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
      `${process.env.NEXT_PUBLIC_API_URL}/services/samecategories/${categoryId}`,
      { cache: "no-store" }
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
      <CategoryPageContent
        category={category}
        categoryId={categoryID}
        services={services}
      />
    </div>
  );
}
