
"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Facebook, Instagram } from "lucide-react";
import { motion } from "framer-motion";
import { formatTimeForDisplay } from "../feutures/booking/dataBooking";
console.log(
  "API_BASE:",
  process.env.NEXT_PUBLIC_API_URL
);
const API_BASE = process.env.NEXT_PUBLIC_API_URL;
const DAY_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function BrandIcon({ name, className }) {
  if (name === "TikTok") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.54v13.67a2.9 2.9 0 0 1-2.9 2.9 2.9 2.9 0 1 1 2.9-2.9c0-.18-.02-.36-.05-.53V11.5a6.44 6.44 0 1 0 3.59 5.78V9.82a8.32 8.32 0 0 0 4.87 1.57V7.85a4.8 4.8 0 0 1-1.1-.16Z" />
      </svg>
    );
  }

  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20.5 11.8a8.5 8.5 0 0 1-12.58 7.45L3 20.5l1.3-4.76A8.5 8.5 0 1 1 20.5 11.8Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.2 7.7c.2-.45.42-.46.67-.47h.57c.18 0 .42.07.54.4l.76 1.82c.1.24.08.43-.06.62l-.58.7c-.18.2-.13.4-.02.58.5.82 1.2 1.53 2.04 2.02.2.12.4.15.57-.05l.76-.9c.17-.2.37-.25.6-.15l1.73.82c.27.12.38.25.38.46 0 .33-.17 1.14-.84 1.63-.57.42-1.3.63-2.04.48-1.08-.22-2.45-.85-3.78-2.04-1.57-1.4-2.56-3.14-2.74-4.2-.15-.85.16-1.42.44-1.72.27-.3.6-.45.8-.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

function isValidSocialUrl(value) {
  if (typeof value !== "string" || !value.trim()) return false;

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

async function fetchJson(url) {
  if (!url || url.startsWith("undefined")) return null;

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
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

  if (!footerPage) return { sections: [] };

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

async function getWorkingHours() {
  const res = await fetch(`${API_BASE}/workingHours`, { cache: "no-store" });
  if (!res.ok) return null;

  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

function getDayIndex(dayOfWeek) {
  const numericDay = Number(dayOfWeek);
  if (Number.isInteger(numericDay) && numericDay >= 0 && numericDay <= 6) {
    return numericDay;
  }

  return DAY_LABELS.findIndex(
    (day) => day.toLowerCase() === String(dayOfWeek || "").toLowerCase()
  );
}

function getDayLabel(dayOfWeek) {
  const index = getDayIndex(dayOfWeek);
  return index >= 0 ? DAY_LABELS[index] : dayOfWeek || "Unknown";
}

function formatWorkingHourTime(time) {
  if (!time) return "";
  return formatTimeForDisplay(String(time).slice(0, 5));
}

function formatWorkingHourRange(row) {
  if (row?.is_day_off) return "Day Off";
  if (!row?.start_time || !row?.end_time) return "Unavailable";
  return `${formatWorkingHourTime(row?.start_time)} - ${formatWorkingHourTime(row?.end_time)}`;
}

export default function Footer() {
  const [data, setData] = useState(null);
  const [workingHours, setWorkingHours] = useState([]);
  const [workingHoursLoading, setWorkingHoursLoading] = useState(true);
  const [workingHoursError, setWorkingHoursError] = useState("");

  useEffect(() => {
    getFooterData()
      .then(setData)
      .catch((err) => {
        setData({ sections: [] });
      });

    getWorkingHours()
      .then((hours) => {
        if (!hours) {
          setWorkingHoursError("Working hours are currently unavailable.");
          return;
        }

        setWorkingHours(
          [...hours].sort((a, b) => {
            const aIndex = getDayIndex(a?.day_of_week);
            const bIndex = getDayIndex(b?.day_of_week);
            return (aIndex === -1 ? 7 : aIndex) - (bIndex === -1 ? 7 : bIndex);
          })
        );
      })
      .catch(() => {
        setWorkingHoursError("Working hours are currently unavailable.");
      })
      .finally(() => {
        setWorkingHoursLoading(false);
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
    {
      name: "Facebook",
      icon: Facebook,
      href: brandData?.socialLinks?.facebook,
    },
    {
      name: "TikTok",
      href: brandData?.socialLinks?.tiktok,
    },
    {
      name: "WhatsApp",
      href: brandData?.socialLinks?.whatsapp,
      target: "_blank",
    },
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
              {socialLinks.map((social) => {
                const clickable =
                  social.name === "Instagram" || isValidSocialUrl(social.href);
                const Icon = social.icon;
                const icon = Icon ? (
                  <Icon className="w-5 h-5" />
                ) : (
                  <BrandIcon name={social.name} className="w-5 h-5" />
                );
                const className =
                  "w-10 h-10 bg-gradient-to-br from-[#FFD700]/20 to-[#D4AF7A]/20 rounded-xl flex items-center justify-center text-[#D4AF7A] hover:from-[#FFD700]/30 hover:to-[#D4AF7A]/30 transition-all shadow-md hover:shadow-lg";

                return clickable ? (
                  <motion.a
                    key={social.name}
                    href={social.href}
                    target={social.target}
                    rel={social.target === "_blank" ? "noopener noreferrer" : undefined}
                    aria-label={social.name}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className={className}
                  >
                    {icon}
                  </motion.a>
                ) : (
                  <div
                    key={social.name}
                    aria-label={`${social.name} link unavailable`}
                    aria-disabled="true"
                    className={className}
                  >
                    {icon}
                  </div>
                );
              })}
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
              {workingHoursLoading && <p>Loading working hours...</p>}

              {!workingHoursLoading && workingHoursError && (
                <p className="text-[#D4AF7A]">{workingHoursError}</p>
              )}

              {!workingHoursLoading && !workingHoursError && workingHours.length === 0 && (
                <p>Working hours are currently unavailable.</p>
              )}

              {!workingHoursLoading &&
                !workingHoursError &&
                workingHours.map((row) => (
                  <div
                    key={row.id ?? row.day_of_week}
                    className="flex items-center justify-between gap-4"
                  >
                    <span>{getDayLabel(row.day_of_week)}</span>
                    <span className="text-right">{formatWorkingHourRange(row)}</span>
                  </div>
                ))}
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
              <p>
                <span>Address:</span> {brandData?.contact?.address}
              </p>
              <p>{brandData?.contact?.city}</p>
              <p className="mt-2">
                <span>Email:</span> {brandData?.contact?.email}
              </p>
              <p>
                <span>Phone:</span> {brandData?.contact?.phone}
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
