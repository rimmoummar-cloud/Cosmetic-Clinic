
import Home from "./home/Home";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.API_BASE_URL ||
  "http://localhost:5000";

async function fetchJson(url, init = {}) {
  const res = await fetch(url, {
  // cache: "no-store",
   next: { revalidate: 60 },
    ...init,
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
  }

  return res.json();
}

async function getHomeData() {
  // Step 1: load all active pages (SSR)
  const pagesResponse = await fetchJson(`${API_BASE}/api/pages/active`);
  const pages =
    Array.isArray(pagesResponse) ? pagesResponse : pagesResponse.data || [];

  // Step 2: find the home page by name or slug
  const homePage = pages.find((page) => {
    const name = page?.name?.toLowerCase();
    const slug = page?.slug?.toLowerCase();
    return name === "home" || slug === "home";
  });

  if (!homePage) {
    throw new Error("Home page not found in pages data");
  }

  const pageId = homePage.id || homePage._id;

  // Step 3: fetch sections for the home page (published only)
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

  // Step 4: fetch latest content for each section
  const sectionsWithContent = await Promise.all(
    sections.map(async (section) => {
      const sectionId = section.id || section._id;
      const contentResponse = await fetchJson(
        `${API_BASE}/api/section-content/section/${sectionId}/latest`
      );
  //       console.log("SECTION:", section.name);
  // console.log("CONTENT:", contentResponse);
      const contentEntry = contentResponse?.data ?? contentResponse;

      return {
        ...section,
        contentEntry,
        content: contentEntry?.content ?? {},
      };
    })
  );

  // Step 5: return combined data for Home component
  return {
    page: homePage,
    sections: sectionsWithContent,
  };
}

async function getCategories() {
  const res = await fetch(`${API_BASE}/api/categorie`, {
   next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

// async function getServices() {
//   const res = await fetch(`${API_BASE}/api/services`, {
//     cache: "no-store",
//   });
//   if (!res.ok) throw new Error("Failed to fetch services");
//   return res.json();
// }


export default async function Page() {
  const [homeData, categories] = await Promise.all([
    getHomeData(),
    getCategories(),
    // getServices(),
  ]);

  return <Home data={homeData} categories={categories}  />;
}

console.time("getHomeData");

const data = await getHomeData();

console.timeEnd("getHomeData");