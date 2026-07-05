
"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Instagram } from "lucide-react";
import { motion } from "framer-motion";
console.log(
  "API_BASE:",
  process.env.NEXT_PUBLIC_API_URL
);
const API_BASE = process.env.NEXT_PUBLIC_API_URL;

async function fetchJson(url) {
    console.log("FETCHING:", url);
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
  return res.json();
}

async function getFooterData() {
  // 1) pages
  const pagesResponse = await fetchJson(`${API_BASE}/pages/active`);

  const pages = Array.isArray(pagesResponse)
    ? pagesResponse
    : pagesResponse.data || [];

  // 2) find footer page
  const footerPage = pages.find((page) => {
    const name = page?.name?.toLowerCase();
    const slug = page?.slug?.toLowerCase();
    return name === "footer" || slug === "footer";
  });

  if (!footerPage) throw new Error("Footer page not found");

  const pageId = footerPage.id || footerPage._id;

  // 3) sections
  const sectionsResponse = await fetchJson(
    `${API_BASE}/sections/page/${pageId}/active`
  );

  const sectionsRaw = Array.isArray(sectionsResponse)
    ? sectionsResponse
    : sectionsResponse.data || [];

  const sections = [...sectionsRaw].sort(
    (a, b) =>
      (a.section_order ?? a.order ?? 0) -
      (b.section_order ?? b.order ?? 0)
  );

  // 4) latest content per section
  const sectionsWithContent = await Promise.all(
    sections.map(async (section) => {
      const sectionId = section.id || section._id;

      const contentResponse = await fetchJson(
        `${API_BASE}/section-content/section/${sectionId}/latest`
      );

      const contentEntry = contentResponse?.data ?? contentResponse;

      return {
        ...section,
        contentEntry,
        content: contentEntry?.content ?? {},
      };
    })
  );

  return {
    page: footerPage,
    sections: sectionsWithContent,
  };
}

export default function Footer() {
  const [data, setData] = useState(null);

  useEffect(() => {
    getFooterData()
      .then(setData)
      .catch((err) => {
        console.error("Footer load error:", err);
        setData({ sections: [] });
      });
  }, []);

  const sections = data?.sections || [];

  const findSection = (keys) => {
    const lookups = Array.isArray(keys) ? keys : [keys];

    const match = sections.find((section) => {
      const name = section?.name?.toLowerCase() || "";
      const slug = section?.slug?.toLowerCase() || "";

      return lookups.some((key) => {
        const k = key?.toLowerCase();
        return k && (name.includes(k) || slug.includes(k));
      });
    });

    return match?.content || {};
  };

  const brandData = findSection("footer");

  const socialLinks = [
    {
      name: "Instagram",
      icon: Instagram,
      href: brandData?.socialLinks?.instagram || "#",
    },
    // {
    //   name: "Facebook",
    //   icon: Facebook,
    //   href: brandData?.socialLinks?.facebook || "#",
    // },
    // {
    //   name: "Twitter",
    //   icon: Twitter,
    //   href: brandData?.socialLinks?.twitter || "#",
    // },
  ];
console.log("Footer:", Footer);
  return (
    <footer className="bg-gradient-to-b from-white to-[#FAF8F5] border-t border-[#D4AF7A]/20 mt-20 relative overflow-hidden">

  {/* Logo */}
  {/* <Link href="/" className="flex items-center gap-3 group">
    <motion.div 
      whileHover={{ scale: 1.08 }}
      transition={{ duration: 0.3 }}
      className="relative flex items-center justify-center"
    >
  
      <div className="absolute w-16 h-16 rounded-full bg-white/40 blur-xl opacity-70 group-hover:opacity-100 transition" />

      <div className="relative mt-10">    <Image 
        src="/image/logo.png" 
        alt="Shiny Skin Logo" 
        width={150} 
        height={50} 
        className="relative object-contain"
      />
      </div>

    </motion.div>

    <div>
              <div className="text-xl" style={{ fontFamily: 'var(--font-serif)' }}>
                <span className="font-semibold bg-gradient-to-r from-[#D4AF7A] to-[#C9A66B] bg-clip-text text-transparent">
                  Shiny Skin
                </span>
              </div>
              <div className="text-xs text-[#6B6B6B] -mt-1">Beauty Clinic</div>
            </div>
          </Link> */}


      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-[#FFD700]/10 to-transparent rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-[#E8C7C3]/20 to-transparent rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
  
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="col-span-1 md:col-span-2"
          >
            {/* <div className="flex items-center gap-3 mb-4">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="w-12 h-12 bg-gradient-to-br from-[#FFD700] via-[#D4AF7A] to-[#C9A66B] rounded-2xl flex items-center justify-center shadow-lg shadow-[#D4AF7A]/30"
              >
                <Sparkles className="w-6 h-6 text-white" />
              </motion.div>

              <div>
                <div
                  className="text-lg"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  <span className="font-semibold bg-gradient-to-r from-[#D4AF7A] to-[#C9A66B] bg-clip-text text-transparent">
                    {brandData?.brandName || "Shiny Skin"}
                  </span>
                </div>

                <div className="text-xs text-[#6B6B6B] -mt-1">
                  {brandData?.brandSubtitle }
                </div>
              </div>
            </div>

            <p className="text-sm text-[#6B6B6B] leading-relaxed max-w-md mb-6">
              {brandData?.description }
            </p> */}
<Link href="/" className="flex items-center gap-3 group mb-6">
  <motion.div
    whileHover={{ scale: 1.08 }}
    transition={{ duration: 0.3 }}
    className="relative flex items-center justify-center"
  >
    {/* Glow behind logo */}
    <div className="absolute w-16 h-16 rounded-full bg-white/40 blur-xl opacity-70 group-hover:opacity-100 transition" />

    {/* Logo */}
    <div className="relative mt-10">
      <Image
        src="/image/logo.png"
        alt="Shiny Skin Logo"
        width={150}
        height={50}
        className="relative object-contain"
      />
    </div>
  </motion.div>

  <div>
    <div
      className="text-xl"
      style={{ fontFamily: "var(--font-serif)" }}
    >
      <span className="font-semibold bg-gradient-to-r from-[#D4AF7A] to-[#C9A66B] bg-clip-text text-transparent">
        Shiny Skin
      </span>
    </div>

    <div className="text-xs text-[#6B6B6B] -mt-1">
      Beauty Clinic
    </div>
  </div>
</Link>
            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 bg-gradient-to-br from-[#FFD700]/20 to-[#D4AF7A]/20 rounded-xl flex items-center justify-center text-[#D4AF7A] hover:from-[#FFD700]/30 hover:to-[#D4AF7A]/30 transition-all shadow-md hover:shadow-lg"
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Working Hours */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h4
              className="text-sm font-medium text-[#2C2C2C] mb-4"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Working Hours
            </h4>

            <div className="flex flex-col gap-2 text-sm text-[#6B6B6B]">
              <p>{brandData?.workingHours?.weekdays}</p>
                  <p>Saturday : 10:00 AM - 3:00 PM</p>
              <p>{brandData?.workingHours?.weekend}</p>
              <p className="mt-2 text-[#D4AF7A]">
                {brandData?.workingHours?.note}
              </p>
            </div>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h4
              className="text-sm font-medium text-[#2C2C2C] mb-4"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Contact
            </h4>

            <div className="flex flex-col gap-2 text-sm text-[#6B6B6B]">
              <p>{brandData?.contact?.address}</p>
              <p>{brandData?.contact?.city}</p>
              <p className="mt-2 text-[#D4AF7A]">
                {brandData?.contact?.email}
              </p>
              <p className="text-[#D4AF7A]">
                {brandData?.contact?.phone}
              </p>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-12 pt-8 border-t border-[#D4AF7A]/20 text-center"
        >
          <p className="text-sm text-[#6B6B6B]">
            {brandData?.copyright}
          </p>
        </motion.div>
      </div>
    </footer>
  );
}