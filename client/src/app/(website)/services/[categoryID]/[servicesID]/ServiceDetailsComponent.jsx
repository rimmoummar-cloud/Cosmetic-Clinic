import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Clock,
  HeartPulse,
  ImageOff,
  Info,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { ImageFallBack } from "../../../../components/EmageFullBack";
import ServiceFAQ from "./components/ServiceFAQ";
import ServiceCTA from "./components/ServiceCTA";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:5000/api"
).replace(/\/+$/, "");

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1582719478248-54e9f2af439c?auto=format&fit=crop&w=1600&q=80";

function apiPath(path) {
  const base = API_BASE_URL.endsWith("/api")
    ? API_BASE_URL
    : `${API_BASE_URL}/api`;
  return `${base}${path}`;
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function clean(value) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function formatPrice(value) {
  if (value === null || value === undefined || value === "") {
    return "Contact for pricing";
  }

  const number = Number(value);
  if (Number.isNaN(number)) return String(value);
  return `$${number.toFixed(2)}`;
}

function formatDuration(value) {
  if (!value && value !== 0) return "Consultation based";
  return `${value} min`;
}

function EmptyState({ children }) {
  return (
    <div className="rounded-2xl border border-[#D4AF7A]/15 bg-white/70 px-5 py-6 text-[#6B6B6B] shadow-[0_8px_26px_rgba(0,0,0,0.04)]">
      {children}
    </div>
  );
}

function SectionHeader({ eyebrow, title }) {
  return (
    <div className="mb-7 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <h2
        className="text-2xl md:text-3xl font-semibold text-[#2C2C2C]"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        {title}
      </h2>
      {eyebrow && (
        <p className="text-xs uppercase tracking-[0.15em] text-[#8A7766]">
          {eyebrow}
        </p>
      )}
    </div>
  );
}

async function getServiceFull(id) {
  try {
    const res = await fetch(apiPath(`/service/${id}/full`), {
      next: { revalidate: 60 },
    });

if (!res.ok) {
  console.warn("API failed:", res.status);
  return {
    service: null,
    details: {},
    benefits: [],
    tips: [],
    faqs: [],
    beforeAfterImages: [],
    suitableFor: [],
    contraindications: [],
    relatedServices: [],
  };
}

    const payload = await res.json();
    return payload?.data || null;
  } catch (error) {
    console.error("Failed to fetch service details:", error);
    return null;
  }
}

export default async function ServiceDetailsComponent({ id, categoryId }) {
 let data = null;

try {
  data = await getServiceFull(id);
} catch (e) {
  console.error("Service page crash safe:", e);
  data = null;
}
 const service = data?.service || {
  name: "Loading...",
  image_url: "",
  price: 0,
};
  const details = data?.details || {};
  const benefits = asArray(data?.benefits);
  const tips = asArray(data?.tips);
  const faqs = asArray(data?.faqs);
  const beforeAfterImages = asArray(data?.beforeAfterImages);
  const suitableFor = asArray(data?.suitableFor);
  const contraindications = asArray(data?.contraindications);
  const relatedServices = asArray(data?.relatedServices);

  if (!service) {
    return (
      <div className="min-h-[55vh] bg-[#FAF8F5] px-4 py-24 text-center">
        <h1
          className="text-3xl font-semibold text-[#2C2C2C]"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Service not found
        </h1>
        <p className="mt-3 text-[#6B6B6B]">
          Unable to load this service right now.
        </p>
      </div>
    );
  }
const heroImage =
  clean(service.image_url)
    ? `${API_BASE_URL.replace("/api", "")}${clean(
        service.image_url
      )}`
    : FALLBACK_IMAGE;
  const shortDescription =
    clean(details.short_description) ||
    clean(service.description) ||
    "A personalized clinical treatment tailored to your goals.";
  const category =
    clean(service.category_name) ||
    clean(service.category) ||
    clean(service.category_title);

const suitableText = clean(details.suitable_for);
const notSuitableText = clean(details.not_suitable_for);

  const detailCards = [
    // ["Short Description", details.short_description || service.description, Info],
    // ["Long Description", details.long_description, Sparkles],
    // ["Why Choose This", details.why_choose_this, BadgeCheck],
    // ["Suitable For", details.suitable_for, CheckCircle2],
    // ["Not Suitable For", details.not_suitable_for, AlertTriangle],
    ["Precautions", details.precautions, ShieldCheck],
    ["Preparation", details.preparation, HeartPulse],
    ["Recovery", details.recovery, Clock],
  ].filter(([, value]) => clean(value));

  const beforeTips = tips.filter((tip) => tip.type === "before_session");
  const afterTips = tips.filter((tip) => tip.type === "after_session");

const doTips = tips.filter(
  (tip) => tip.type === "do"
);

const doesNotTips = tips.filter(
  (tip) => tip.type === "dont"
);





  return (
    <div className="bg-gradient-to-b from-[#FAF8F5] via-white to-[#FAF8F5] text-[#2C2C2C]">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <ImageFallBack
            src={heroImage}
            alt={service.name || "Service image"}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/45 to-black/15" />
        </div>

        <div className="relative mx-auto grid min-h-[560px] max-w-7xl grid-cols-1 items-end gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-24">
          <div className="max-w-3xl pb-4 text-white">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-white/75">
              {category || "Clinical Treatment"}
            </p>
            <h1
              className="text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {service.name}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/90 sm:text-lg">
              {shortDescription}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <span className="rounded-full border border-white/25 bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur">
                {formatPrice(service.price)}
              </span>
              <span className="rounded-full border border-white/25 bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur">
                {formatDuration(service.duration_minutes)}
              </span>
            </div>
          </div>

          <div className="hidden overflow-hidden rounded-3xl border border-white/25 bg-white/15 shadow-2xl backdrop-blur-md lg:block">
            <ImageFallBack
              src={heroImage}
              alt={service.name || "Service preview"}
              className="h-[410px] w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <SectionHeader title="Service Details" eyebrow="What to expect" />
        <div className="mb-10 space-y-6">
  {clean(details.short_description) && (
    <p className="text-lg leading-8 text-[#4A4A4A]">
      {details.short_description}
    </p>
  )}

  {clean(details.long_description) && (
    <p className="leading-8 text-[#6B6B6B]">
      {details.long_description}
    </p>
  )}


  {clean(details.why_choose_this) && (
    <div className="border-l-4 border-[#D4AF7A] pl-5">
      <h3
        className="mb-3 text-2xl font-semibold text-[#2C2C2C]"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        Why Choose This Treatment?
      </h3>

      <p className="leading-8 text-[#5D5D5D]">
        {details.why_choose_this}
      </p>
    </div>
  )}


</div>

{(suitableText || notSuitableText) && (
  <div
    className="
      mb-10
      overflow-hidden
      rounded-[32px]
      bg-[#C79B63]
      text-white
      shadow-[0_20px_50px_rgba(0,0,0,0.12)]
    "
  >
    <div
      className="
        grid
        grid-cols-1
        md:grid-cols-2
      "
    >
      {/* Suitable */}
      <div className="p-8">
        <h3
          className="mb-5 text-2xl font-semibold"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Suitable For
        </h3>

        <p className="leading-8 text-white/90">
          {suitableText}
        </p>
      </div>

      {/* Divider */}
      <div
        className="
          hidden
          md:block
          absolute
        "
      />

      {/* Not Suitable */}
      <div
        className="
          p-8
          border-t
          border-white/20
          md:border-t-0
         md:border-l
md:border-white/40
        "
      >
        <h3
          className="mb-5 text-2xl font-semibold"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Not Suitable For
        </h3>

        <p className="leading-8 text-white/90">
          {notSuitableText}
        </p>
      </div>
    </div>
  </div>
)}

        {detailCards.length === 0 ? (
          <EmptyState>No service details available.</EmptyState>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {detailCards.map(([title, value, Icon]) => (
              <article
                key={title}
                className="rounded-2xl border border-[#D4AF7A]/15 bg-white/75 p-6 shadow-[0_12px_36px_rgba(0,0,0,0.05)] backdrop-blur-sm"
              >
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F8F3EC] text-[#D4AF7A]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="text-lg font-semibold">{title}</h3>
                </div>
                <p className="leading-7 text-[#5D5D5D]">{value}</p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 md:pb-20">
        <SectionHeader title="Benefits" eyebrow="Treatment value" />
        {benefits.length === 0 ? (
          <EmptyState>No benefits available.</EmptyState>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {benefits.map((benefit, index) => (
              <article
                key={benefit.id || benefit.title || index}
                className="rounded-2xl border border-[#D4AF7A]/15 bg-white/75 p-6 shadow-[0_12px_32px_rgba(0,0,0,0.05)]"
              >
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-full bg-[#D4AF7A]/12 text-[#D4AF7A]">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold">{benefit.title}</h3>
                <p className="mt-3 leading-7 text-[#6B6B6B]">
                  {benefit.description}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 md:pb-20">
        <SectionHeader title="Care Tips" eyebrow="Before and after" />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {[
            ["Before Session", beforeTips, Sparkles],
            ["After Session", afterTips, ShieldCheck],
          ].map(([title, items, Icon]) => (
            <article
              key={title}
              className="rounded-3xl border border-[#D4AF7A]/15 bg-white/75 p-6 shadow-[0_12px_32px_rgba(0,0,0,0.05)]"
            >
              <div className="mb-5 flex items-center gap-3">
                <Icon className="h-5 w-5 text-[#D4AF7A]" />
                <h3
                  className="text-xl font-semibold"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  {title}
                </h3>
              </div>
              {items.length === 0 ? (
                <p className="text-[#6B6B6B]">No tips available.</p>
              ) : (
                <ol className="space-y-4">
                  {items.map((tip, index) => (
                    <li key={tip.id || index} className="flex gap-3">
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#F8F3EC] text-sm font-semibold text-[#D4AF7A]">
                        {index + 1}
                      </span>
                      <span className="leading-7 text-[#5D5D5D]">{tip.content}</span>
                    </li>
                  ))}
                </ol>
              )}


{/* 
<>
  {items.length === 0 ? (
    <p className="text-[#6B6B6B]">
      No tips available.
    </p>
  ) : (
    <ol className="space-y-4">
      {items.map((tip, index) => (
        <li
          key={tip.id || index}
          className="flex gap-3"
        >
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#F8F3EC] text-sm font-semibold text-[#D4AF7A]">
            {index + 1}
          </span>

          <span className="leading-7 text-[#5D5D5D]">
            {tip.content}
          </span>
        </li>
      ))}
    </ol>
  )}

  {title === "Before Session" &&
    doTips.length > 0 && (
      <>
        <div className="mt-8 mb-4">
          <h4 className="text-lg font-semibold text-[#2C2C2C]">
            Do
          </h4>
        </div>

        <ol className="space-y-4">
          {doTips.map((tip, index) => (
            <li
              key={tip.id || index}
              className="flex gap-3"
            >
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-semibold text-green-700">
                ✓
              </span>

              <span className="leading-7 text-[#5D5D5D]">
                {tip.content}
              </span>
            </li>
          ))}
        </ol>
      </>
    )}

  {title === "After Session" &&
    doesNotTips.length > 0 && (
      <>
        <div className="mt-8 mb-4">
          <h4 className="text-lg font-semibold text-[#2C2C2C]">
            Does Not
          </h4>
        </div>

        <ol className="space-y-4">
          {doesNotTips.map((tip, index) => (
            <li
              key={tip.id || index}
              className="flex gap-3"
            >
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-100 text-sm font-semibold text-red-700">
                ✕
              </span>

              <span className="leading-7 text-[#5D5D5D]">
                {tip.content}
              </span>
            </li>
          ))}
        </ol>
      </>
    )}
</>
 */}




            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 md:pb-20">
       


 <div className="mb-10 flex items-center justify-between">
  <SectionHeader
    title="Before & After"
    // eyebrow="Transformation gallery"
  />

  <Link
    href={`/services/${categoryId}/${id}/images`}
    className="
      inline-flex
      items-center
      gap-2
      rounded-full
      border
      border-[#D4AF7A]/30
      bg-white
      px-5
      py-3
      text-sm
      font-semibold
      shadow-sm
      transition
      hover:text-[#D4AF7A]
    "
  >
    Show All Images
    <ArrowRight className="h-4 w-4" />
  </Link>
</div>

        {beforeAfterImages.length === 0 ? (
          <EmptyState>No transformation images available.</EmptyState>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {beforeAfterImages.slice(0, 3).map((item, index) => {
              const before = clean(item.before_image);
              const after = clean(item.after_image);

              return (
                <article
                  key={item.id || item.title || index}
                  className="overflow-hidden rounded-3xl border border-[#D4AF7A]/15 bg-white shadow-[0_14px_38px_rgba(0,0,0,0.07)]"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2">
                    {[
                      ["Before", before],
                      ["After", after],
                    ].map(([label, image]) => (
                      <div key={label} className="relative min-h-72 bg-[#F8F3EC]">
                        {image ? (
                          <ImageFallBack
                            src={image}
                            alt={`${label} ${item.title || service.name}`}
                            className="h-72 w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-72 items-center justify-center text-[#8A7766]">
                            <ImageOff className="h-8 w-8" />
                          </div>
                        )}
                        <span className="absolute left-4 top-4 rounded-full bg-white/85 px-3 py-1 text-xs font-semibold text-[#2C2C2C] backdrop-blur">
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                  {(clean(item.title) || clean(item.description)) && (
                    <div className="p-5">
                      {clean(item.title) && (
                        <h3 className="text-lg font-semibold">{item.title}</h3>
                      )}
                      {clean(item.description) && (
                        <p className="mt-2 leading-7 text-[#6B6B6B]">
                          {item.description}
                        </p>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* <section className="mx-auto max-w-6xl px-4 pb-16 md:pb-20">
        <SectionHeader title="Suitable For" eyebrow="Ideal candidates" />
        {suitableFor.length === 0 ? (
          <EmptyState>No suitable-for information available.</EmptyState>
        ) : (
          <div className="flex flex-wrap gap-3">
            {suitableFor.map((item, index) => (
              <span
                key={item.id || item.title || index}
                className="inline-flex items-center gap-2 rounded-full border border-[#D4AF7A]/20 bg-white px-4 py-2 text-sm font-semibold text-[#4A4A4A] shadow-sm"
              >
                {clean(item.icon) || <CheckCircle2 className="h-4 w-4 text-[#D4AF7A]" />}
                {item.title}
              </span>
            ))}
          </div>
        )}
      </section> */}

      <section className="mx-auto max-w-6xl px-4 pb-16 md:pb-20">
        <SectionHeader title="Contraindications" eyebrow="Please review" />
        {contraindications.length === 0 ? (
          <EmptyState>No contraindications available.</EmptyState>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {contraindications.map((item, index) => (
              <article
                key={item.id || item.title || index}
                className="rounded-2xl border border-amber-200/70 bg-amber-50/70 p-5 shadow-[0_10px_28px_rgba(0,0,0,0.04)]"
              >
                <div className="mb-3 flex items-center gap-3 text-amber-700">
                  <AlertTriangle className="h-5 w-5" />
                  <h3 className="font-semibold text-[#2C2C2C]">{item.title}</h3>
                </div>
                <p className="leading-7 text-[#6B5A45]">{item.description}</p>
              </article>
            ))}
          </div>
        )}
      </section>

      <ServiceFAQ faqs={faqs} />

      <section className="mx-auto max-w-6xl px-4 pb-20">
        <SectionHeader title="Related Services" eyebrow="Continue exploring" />
        {relatedServices.length === 0 ? (
          <EmptyState>No related services available.</EmptyState>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {relatedServices.map((item, index) => {
              const href = `/services/${categoryId}/${item.related_service_id}`;
              const image = clean(item.image_url);

              return (
                <article
                  key={item.related_service_id || item.name || index}
                  className="group overflow-hidden rounded-3xl border border-[#D4AF7A]/15 bg-white shadow-[0_12px_32px_rgba(0,0,0,0.05)] transition-all hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(212,175,122,0.16)]"
                >
                  <div className="h-52 bg-[#F8F3EC]">
                    {image ? (
                      <ImageFallBack
                        src={image}
                        alt={item.name || "Related service"}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[#8A7766]">
                        <ImageOff className="h-8 w-8" />
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3
                      className="text-xl font-semibold"
                      style={{ fontFamily: "var(--font-serif)" }}
                    >
                      {item.name}
                    </h3>
                    <p className="mt-2 text-sm font-semibold text-[#D4AF7A]">
                      {formatPrice(item.price)}
                    </p>
                    <Link
                      href={href}
                      className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#2C2C2C] transition-colors hover:text-[#D4AF7A]"
                    >
                      View details
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <ServiceCTA />
    </div>
  );
}
