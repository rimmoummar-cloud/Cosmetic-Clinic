"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "../../../../../../lib/api";
import { getMediaUrl } from "../../../../../../lib/mediaUrl";

export default function ServiceDetailsMain({
  serviceId,
}) {
  const [service, setService] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const fetchService =
      async () => {
        try {
          setLoading(true);

          const response =
           await api.get(
  `/service/${serviceId}/full`
);

          setService(
            response.data.data
          );
        } catch (error) {
          console.error(
            "Failed to fetch service:",
            error
          );

          setService(null);
        } finally {
          setLoading(false);
        }
      };

    fetchService();
  }, [serviceId]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-primary rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">
            Loading service...
          </p>
        </div>
      </div>
    );
  }

  if (!service?.service) {
    return (
      <div
        className="
          bg-white
          rounded-2xl
          border
          border-gray-100
          p-10
          text-center
        "
      >
        <h2 className="text-xl font-bold text-gray-700">
          Service not found
        </h2>

        <p className="text-gray-500 mt-2">
          Unable to load this service.
        </p>
      </div>
    );
  }

  const svc = service.service;

  const sections = [
    {
      title: "Service Detail",
      icon: "📄",
      href: "service-detail",
      count: service.details ? 1 : 0,
    },
    {
      title: "Benefits",
      icon: "✨",
      href: "benefits",
      count:
        service.benefits?.length || 0,
    },
    {
      title: "Tips",
      icon: "💡",
      href: "tips",
      count:
        service.tips?.length || 0,
    },
    {
      title: "FAQs",
      icon: "❓",
      href: "faqs",
      count:
        service.faqs?.length || 0,
    },
    {
      title: "Before & After .",
      icon: "📸",
      href: "before-after",
      count:
        service.beforeAfterImages
          ?.length || 0,
    },
    // {
    //   title: "Suitable For",
    //   icon: "🎯",
    //   href: "suitable-for",
    //   count:
    //     service.suitableFor?.length ||
    //     0,
    // },
    {
      title: "Contraindications",
      icon: "⚠️",
      href: "contraindications",
      count:
        service.contraindications
          ?.length || 0,
    },
    {
      title: "Related Services",
      icon: "🔗",
      href: "related-services",
      count:
        service.relatedServices
          ?.length || 0,
    },
    {
      title: "Section Availability",
      icon: "✓",
      href: "section-availability",
      count: 7,
    },
  ];

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-[var(--font-heading)]">
          Service Details
        </h1>

        <p className="text-gray-500 text-sm mt-1">
          Manage all information for this
          service.
        </p>
      </div>

      {/* Service Card */}
      <div
        className="
          bg-white
          rounded-3xl
          border
          border-gray-100
          p-8
          shadow-sm
        "
      >
        <div className="flex items-center gap-6">

          <div
            className="
              w-28
              h-28
              rounded-3xl
              overflow-hidden
              bg-accent
            "
          >
            {svc.image_url && (
              <img
                src={getMediaUrl(svc.image_url)}
                alt={svc.name}
                className="
                  w-full
                  h-full
                  object-cover
                "
              />
            )}
          </div>

          <div className="flex-1">

            <h2
              className="
                text-3xl
                font-bold
                font-[var(--font-heading)]
              "
            >
              {svc.name}
            </h2>

            <p className="text-gray-500 mt-2">
              {svc.description}
            </p>

            <div className="flex gap-3 mt-5">

              <div
                className="
                  px-4
                  py-2
                  rounded-xl
                  bg-primary/10
                  text-primary
                  text-sm
                  font-semibold
                "
              >
                💰 ${svc.price}
              </div>

              <div
                className="
                  px-4
                  py-2
                  rounded-xl
                  bg-gray-100
                  text-gray-700
                  text-sm
                  font-semibold
                "
              >
                ⏱️{" "}
                {svc.duration_minutes}
                {" "}min
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Modules */}
      <div>

        <h2 className="text-lg font-bold mb-5">
          Service Modules
        </h2>

        <div
          className="
            grid
            grid-cols-1
            md:grid-cols-2
            xl:grid-cols-4
            gap-5
          "
        >
          {sections.map((item) => (
            <Link
              key={item.href}
              href={`/admin/services/service-details/${svc.id}/${item.href}`}
              className="
                bg-white
                rounded-2xl
                border
                border-gray-100
                p-6
                hover:shadow-lg
                hover:shadow-primary/10
                hover:-translate-y-1
                transition-all
              "
            >
              <div className="text-4xl">
                {item.icon}
              </div>

              <h3
                className="
                  mt-4
                  font-bold
                  text-gray-800
                "
              >
                {item.title}
              </h3>

              <p
                className="
                  text-gray-400
                  text-sm
                  mt-2
                "
              >
                {item.count} item
                {item.count !== 1
                  ? "s"
                  : ""}
              </p>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}
