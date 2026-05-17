import ContactComponent from "./ContactComponent";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.API_BASE_URL ||
  "http://localhost:5000";

async function fetchJson(url) {
  const res = await fetch(url, {    next: { revalidate: 60 }});
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
  return res.json();
}

async function getContactPageData() {
  // 1) pages
  const pagesResponse = await fetchJson(`${API_BASE}/api/pages/active`);
  const pages = Array.isArray(pagesResponse)
    ? pagesResponse
    : pagesResponse.data || [];

  // 2) find contact page
  const contactPage = pages.find((page) => {
    const name = page?.name?.toLowerCase();
    const slug = page?.slug?.toLowerCase();
    return name === "contact" || slug === "contact";
  });
  if (!contactPage) throw new Error("Contact page not found");
  const pageId = contactPage.id || contactPage._id;

  // 3) sections for contact page (active)
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
    page: contactPage,
    sections: sectionsWithContent,
  };
}

export default async function Contact() {
  const contactData = await getContactPageData();
  return <ContactComponent data={contactData} />;
}
