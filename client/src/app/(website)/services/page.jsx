import Services from "./servicesComponent";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.API_BASE_URL ||
  "http://localhost:5000";

async function fetchJson(url) {
  const res = await fetch(url, {    next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
  return res.json();
}

async function getServicesPageData() {
  // 1) pages
  const pagesResponse = await fetchJson(`${API_BASE}/api/pages/active`);
  const pages = Array.isArray(pagesResponse)
    ? pagesResponse
    : pagesResponse.data || [];

  // 2) locate services page
  const servicesPage = pages.find((page) => {
    const name = page?.name?.toLowerCase();
    const slug = page?.slug?.toLowerCase();
    return name === "services" || slug === "services";
  });
  if (!servicesPage) throw new Error("Services page not found");
  const pageId = servicesPage.id || servicesPage._id;

  // 3) sections for services page (active)
  const sectionsResponse = await fetchJson(
    `${API_BASE}/api/sections/page/${pageId}/active`
  );
  const sectionsRaw = Array.isArray(sectionsResponse)
    ? sectionsResponse
    : sectionsResponse.data || [];
  const sections = [...sectionsRaw].sort(
    (a, b) =>
      (a.section_order ?? a.order ?? 0) - (b.section_order ?? b.order ?? 0)
  );

  // 4) latest content per section
  const sectionsWithContent = await Promise.all(
    sections.map(async (section) => {
      const sectionId = section.id || section._id;
      const contentResponse = await fetchJson(
        `${API_BASE}/api/section-content/section/${sectionId}/latest`
      );
      const contentEntry = contentResponse?.data ?? contentResponse;
      return {
        ...section,
        contentEntry,
        content: contentEntry?.content ?? {},
      };
    })
  );

  // 5) combined data
  return {
    page: servicesPage,
    sections: sectionsWithContent,
  };
}

async function getCategories() {
  return fetchJson(`${API_BASE}/api/categorie`);
}

export default async function Service() {
  const [servicesData, categories] = await Promise.all([
    getServicesPageData(),
    getCategories(),
  ]);

  return <Services data={servicesData} categories={categories} />;
}
