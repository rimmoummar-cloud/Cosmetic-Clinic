"use client";

import { use, useEffect, useState } from "react";
import api from "../../../../../../../lib/api";

const sectionLabels = {
  "service-detail": "Service Detail",
  benefits: "Benefits",
  tips: "Tips",
  faqs: "FAQs",
  "before-after": "Before & After",
  contraindications: "Contraindications",
  "related-services": "Related Services",
};

function getServiceSectionsUrl(serviceId, sectionKey = "") {
  const rawBase = process.env.NEXT_PUBLIC_API_URL || "";
  const rootBase = rawBase
    .replace(/\/api\/?$/, "")
    .replace(/\/+$/, "");

  const suffix = sectionKey ? `/${sectionKey}` : "";
  return `${rootBase}/service-sections/${serviceId}${suffix}`;
}

export default function Page({ params }) {
  const { serviceId } = use(params);

  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingKey, setUpdatingKey] = useState("");

  const fetchSections = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get(
        getServiceSectionsUrl(serviceId)
      );

      setSections(res?.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch service sections:", err);
      setError("Unable to load section availability.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (serviceId) {
      fetchSections();
    }
  }, [serviceId]);

  const handleToggle = async (section) => {
    const nextEnabled = section.is_enabled !== true;

    try {
      setUpdatingKey(section.section_key);
      setError("");

      await api.patch(
        getServiceSectionsUrl(serviceId, section.section_key),
        {
          is_enabled: nextEnabled,
        }
      );

      setSections((current) =>
        current.map((item) =>
          item.section_key === section.section_key
            ? {
                ...item,
                is_enabled: nextEnabled,
              }
            : item
        )
      );
    } catch (err) {
      console.error("Failed to update service section:", err);
      setError("Unable to update this section. Please try again.");
    } finally {
      setUpdatingKey("");
    }
  };

  if (loading) {
    return (
      <div className="p-10 text-gray-500">
        Loading...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-[var(--font-heading)]">
          Section Availability
        </h1>

        <p className="text-gray-500 text-sm mt-1">
          Manage which service sections are visible on the public website.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                  Section Name
                </th>

                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                  Current Status
                </th>

                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {sections.length === 0 ? (
                <tr>
                  <td
                    colSpan="3"
                    className="text-center py-10 text-gray-400"
                  >
                    No sections found
                  </td>
                </tr>
              ) : (
                sections.map((section) => {
                  const isEnabled = section.is_enabled === true;
                  const isUpdating =
                    updatingKey === section.section_key;

                  return (
                    <tr
                      key={section.section_key}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-medium">
                        {sectionLabels[section.section_key] ||
                          section.section_key}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={
                            isEnabled
                              ? "inline-flex rounded-lg bg-green-50 px-3 py-1 text-xs font-semibold text-green-700"
                              : "inline-flex rounded-lg bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600"
                          }
                        >
                          {isEnabled ? "Available" : "Not Available"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => handleToggle(section)}
                          disabled={isUpdating}
                          className={
                            isEnabled
                              ? "px-3 py-1.5 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 disabled:opacity-60"
                              : "px-3 py-1.5 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 disabled:opacity-60"
                          }
                        >
                          {isUpdating
                            ? "Saving..."
                            : isEnabled
                              ? "Disable"
                              : "Enable"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
