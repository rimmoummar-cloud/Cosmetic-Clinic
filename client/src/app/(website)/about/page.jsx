import AboutComponent from "./AboutComponent";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.API_BASE_URL ||
  "http://localhost:5000";

async function fetchJson(url) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
  return res.json();
}

async function getAboutPageData() {
  // 1) fetch pages
  const pagesResponse = await fetchJson(`${API_BASE}/api/pages/active`);
  const pages = Array.isArray(pagesResponse)
    ? pagesResponse
    : pagesResponse.data || [];

  // 2) find about page by name or slug
  const aboutPage = pages.find((page) => {
    const name = page?.name?.toLowerCase();
    const slug = page?.slug?.toLowerCase();
    return name === "about" || slug === "about";
  });

  if (!aboutPage) throw new Error("About page not found");
  const pageId = aboutPage.id || aboutPage._id;

  // 3) fetch sections for about page
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

  // 4) fetch latest content for each section
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
    page: aboutPage,
    sections: sectionsWithContent,
  };
}

export default async function About() {
  const aboutData = await getAboutPageData();
  return <AboutComponent data={aboutData} />;
}
