import ShopContent from "./components/ShopContent";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

async function fetchJson(url) {
  const response = await fetch(url, { next: { revalidate: 60 } });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
  }
  return response.json();
}

async function getShopPageData() {
  const pagesResponse = await fetchJson(`${API_BASE}/pages/active`);
  const pages = Array.isArray(pagesResponse)
    ? pagesResponse
    : pagesResponse.data || [];
  const shopPage = pages.find((page) => {
    const name = page?.name?.toLowerCase();
    const slug = page?.slug?.toLowerCase();
    return name === "shop" || slug === "shop";
  });

  if (!shopPage) {
    throw new Error("Shop page not found");
  }

  const pageId = shopPage.id || shopPage._id;
  const sectionsResponse = await fetchJson(
    `${API_BASE}/sections/page/${pageId}/active`
  );
  const sections = Array.isArray(sectionsResponse)
    ? sectionsResponse
    : sectionsResponse.data || [];

  const orderedSections = [...sections].sort(
    (a, b) =>
      (a.section_order ?? a.order ?? 0) - (b.section_order ?? b.order ?? 0)
  );

  return Promise.all(
    orderedSections.map(async (section) => {
      const sectionId = section.id || section._id;
      const contentResponse = await fetchJson(
        `${API_BASE}/section-content/section/${sectionId}/latest`
      );
      const contentEntry = contentResponse?.data ?? contentResponse;
      return {
        ...section,
        content: contentEntry?.content ?? {},
      };
    })
  );
}

export default async function ShopPage() {
  const sections = await getShopPageData();
  return <ShopContent sections={sections} />;
}
