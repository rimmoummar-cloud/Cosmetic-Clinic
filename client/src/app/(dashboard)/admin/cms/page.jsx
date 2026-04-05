"use client";

import { useEffect, useMemo, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

const statusClasses = {
  success: "bg-green-50 text-green-800 border border-green-200",
  error: "bg-red-50 text-red-800 border border-red-200",
  info: "bg-blue-50 text-blue-800 border border-blue-200",
};

function Modal({ open, onClose, title, children, widthClass = "max-w-4xl" }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
      <div
        className={`w-full ${widthClass} max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-gray-100`}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>
        <div className="max-h-[calc(90vh-64px)] overflow-y-auto overflow-x-hidden p-6">{children}</div>
      </div>
    </div>
  );
}

function LoadingRows({ count = 6 }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="animate-pulse rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
        >
          <div className="mb-3 h-4 w-1/2 rounded bg-gray-200" />
          <div className="mb-2 h-3 w-1/3 rounded bg-gray-200" />
          <div className="h-3 w-full rounded bg-gray-200" />
        </div>
      ))}
    </div>
  );
}

const isPrimitive = (val) =>
  val === null ||
  typeof val === "string" ||
  typeof val === "number" ||
  typeof val === "boolean";

function cloneTemplate(sample) {
  if (Array.isArray(sample)) return [];
  if (sample && typeof sample === "object") {
    return Object.fromEntries(
      Object.entries(sample).map(([k, v]) => [k, cloneTemplate(v)])
    );
  }
  if (typeof sample === "number") return 0;
  if (typeof sample === "boolean") return false;
  return "";
}

function getValueAtPath(data, pathArr) {
  return pathArr.reduce((acc, key) => {
    if (acc === undefined || acc === null) return undefined;
    const idx = Number.isInteger(Number(key)) ? Number(key) : key;
    return acc[idx];
  }, data);
}

function setValueAtPath(data, pathArr, value) {
  if (!pathArr.length) return value;
  const [head, ...rest] = pathArr;
  const key = Number.isInteger(Number(head)) ? Number(head) : head;
  const clone = Array.isArray(data) ? [...data] : { ...data };
  clone[key] = setValueAtPath(clone[key], rest, value);
  return clone;
}

function FieldRenderer({
  label,
  value,
  path,
  onChange,
  onAddItem,
  onRemoveItem,
}) {
  const hasLabel = Boolean(label);
  const fieldKey = path[path.length - 1] || label || "";
  const isImageField =
    typeof value === "string" &&
    /(image|img|photo|picture|background|banner|logo)/i.test(fieldKey);

  if (Array.isArray(value)) {
    return (
      <div className="overflow-x-hidden rounded-xl border border-gray-100 bg-white/60 p-4 shadow-sm">
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h4 className="text-sm font-semibold text-gray-700">{label}</h4>
          <button
            onClick={() => onAddItem(path, value)}
            className="text-sm font-medium text-primary hover:text-primary-dark"
          >
            + Add item
          </button>
        </div>
        <div className="w-full space-y-3 overflow-x-hidden">
          {value.length === 0 && (
            <p className="text-xs text-gray-400">No items yet.</p>
          )}
          {value.map((item, idx) => (
            <div
              key={`${path.join(".")}.${idx}`}
              className="min-w-0 rounded-lg border border-gray-100 bg-white p-3"
            >
              <div className="mb-2 flex items-center justify-between text-xs font-semibold text-gray-500">
                <span>Item {idx + 1}</span>
                <button
                  onClick={() => onRemoveItem([...path, idx])}
                  className="rounded-full px-2 py-1 text-gray-400 transition hover:bg-gray-100 hover:text-danger"
                >
                  Remove
                </button>
              </div>
              <FieldRenderer
                label=""
                value={item}
                path={[...path, idx]}
                onChange={onChange}
                onAddItem={onAddItem}
                onRemoveItem={onRemoveItem}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (value && typeof value === "object") {
    return (
      <div className="overflow-x-hidden rounded-xl border border-gray-100 bg-white/60 p-4 shadow-sm">
        {label && (
          <h4 className="mb-3 text-sm font-semibold text-gray-700">{label}</h4>
        )}
        <div className="w-full grid grid-cols-1 gap-4">
          {Object.entries(value).map(([key, val]) => (
            <FieldRenderer
              key={key}
              label={key}
              value={val}
              path={[...path, key]}
              onChange={onChange}
              onAddItem={onAddItem}
              onRemoveItem={onRemoveItem}
            />
          ))}
        </div>
      </div>
    );
  }

  const isLong = typeof value === "string" && value.length > 80;

  return (
    <label
      className={`flex flex-col gap-2 ${
        hasLabel ? "md:grid md:grid-cols-[minmax(160px,1fr)_2fr] md:items-center md:gap-4" : ""
      } md:rounded-lg md:bg-white md:p-4 md:shadow-sm`}
    >
      {label && (
        <span className="text-sm font-semibold capitalize text-gray-700 md:text-right md:pr-2">
          {label.replace(/([A-Z])/g, " $1")}
        </span>
      )}
      {typeof value === "boolean" ? (
        <div className="flex items-center gap-2 md:justify-start">
          <input
            type="checkbox"
            checked={value}
            onChange={(e) => onChange(path, e.target.checked)}
            className="h-4 w-4 accent-primary"
          />
          <span className="text-sm text-gray-600">Active</span>
        </div>
      ) : isImageField ? (
        <div className="space-y-3">
          {value ? (
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
              <img
                src={value}
                alt={fieldKey}
                className="h-40 w-full object-cover"
              />
            </div>
          ) : (
            <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 text-sm text-gray-400">
              No image selected
            </div>
          )}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const objectUrl = URL.createObjectURL(file);
                onChange(path, objectUrl);
              }}
              className="w-full cursor-pointer rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm outline-none transition file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-primary hover:border-primary"
            />
            <input
              type="text"
              value={value ?? ""}
              onChange={(e) => onChange(path, e.target.value)}
              placeholder="Or paste image URL"
              className="w-full min-w-0 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm outline-none transition focus:border-primary"
            />
          </div>
        </div>
      ) : isLong ? (
        <textarea
          value={value ?? ""}
          onChange={(e) => onChange(path, e.target.value)}
          rows={4}
          className="w-full min-w-0 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm outline-none transition focus:border-primary"
        />
      ) : (
        <input
          type={typeof value === "number" ? "number" : "text"}
          value={value ?? ""}
          onChange={(e) =>
            onChange(path, typeof value === "number" ? Number(e.target.value) : e.target.value)
          }
          className="w-full min-w-0 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm outline-none transition focus:border-primary"
        />
      )}
    </label>
  );
}

export default function CmsDashboard() {
  const [pages, setPages] = useState([]);
  const [sections, setSections] = useState([]);
  const [content, setContent] = useState(null);

  const [selectedPage, setSelectedPage] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);

  const [loadingPages, setLoadingPages] = useState(false);
  const [loadingSections, setLoadingSections] = useState(false);
  const [loadingContent, setLoadingContent] = useState(false);
  const [saving, setSaving] = useState(false);

  const [toast, setToast] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const fetchPages = async () => {
      setLoadingPages(true);
      try {
        const res = await fetch(`http://localhost:5000/api/pages/`, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load pages");
        const data = await res.json();
        setPages(Array.isArray(data) ? data : data?.pages || []);
      } catch (err) {
        showToast("error", err.message);
      } finally {
        setLoadingPages(false);
      }
    };
    fetchPages();
  }, []);

  const openPage = async (page) => {
    setSelectedPage(page);
    setSelectedSection(null);
    setContent(null);
    setLoadingSections(true);
    try {
   
      const res = await fetch(`http://localhost:5000/api/sections/page/${page._id || page.id}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to load sections");
      const data = await res.json();
    const sectionsData = Array.isArray(data) ? data : data?.data || [];
    setSections(sectionsData);
      // setSections(Array.isArray(data) ? data : data?.sections || []);
         console.log("Fetched sections:", sections);
    } catch (err) {
      showToast("error", err.message);
    } finally {
      setLoadingSections(false);
    }
  };

// useEffect(() => {
//   console.log("Sections updated:", sections);
// }, [sections]);



  const openSection = async (section) => {
    setSelectedSection(section);
    setLoadingContent(true);
    try {
      const res = await fetch(`http://localhost:5000/api/section-content/section/${section._id || section.id}/latest`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to load section content");
      const data = await res.json();
      const contentObj = data?.content || data;
      setContent(contentObj || {});
    } catch (err) {
      showToast("error", err.message);
    } finally {
      setLoadingContent(false);
    }
  };

  const handleFieldChange = (pathArr, value) => {
    setContent((prev) => setValueAtPath(prev, pathArr, value));
  };

  const handleAddItem = (pathArr, currentValue) => {
    const template = currentValue[0] !== undefined ? cloneTemplate(currentValue[0]) : "";
    setContent((prev) => {
      const existing = getValueAtPath(prev, pathArr) || [];
      return setValueAtPath(prev, pathArr, [...existing, template]);
    });
  };

  const handleRemoveItem = (pathArr) => {
    setContent((prev) => {
      const parentPath = pathArr.slice(0, -1);
      const index = pathArr[pathArr.length - 1];
      const currentArr = getValueAtPath(prev, parentPath) || [];
      const filtered = currentArr.filter((_, idx) => idx !== Number(index));
      return setValueAtPath(prev, parentPath, filtered);
    });
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   if (!selectedSection) return;
  //   setSaving(true);
  //   try {
  //     console.log("Section ID:",content.data.id);
  //     //    console.log("Sending content:", content);
  // console.log(content);
  //     console.log(content.data.content);
  //     const res = await fetch(
  //       `http://localhost:5000/api/section-content/${content.data.id}`,
  //       {
  //         method: "PUT",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify(content.data.content),
  //       }
  //     );

  //     if (!res.ok) throw new Error("Failed to update content");
  //     showToast("success", "Section content updated");
  //   } catch (err) {
  //     showToast("error", err.message);
  //   } finally {
  //     setSaving(false);
  //   }
  // };




const handleSubmit = async (e) => {
  e.preventDefault();
  if (!selectedSection) return;

  setSaving(true);

  try {
    const res = await fetch(
      `http://localhost:5000/api/section-content/${content.data.id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content.data.content),
      }
    );

    if (!res.ok) throw new Error("Failed to update content");

    showToast("success", "Section content updated");

    // 🔥 هذا السطر هو الحل
    await openSection(selectedSection);

  } catch (err) {
    showToast("error", err.message);
  } finally {
    setSaving(false);
  }
};





// const handleSubmit = async (e) => {
//   e.preventDefault();
//   if (!selectedSection) return;
//   setSaving(true);
//   try {
//     console.log("Section ID:", content.data.id);
//     console.log("Sending content:", content.data.content);

//     const res = await fetch(
//       `http://localhost:5000/api/section-content/${content.data.id}`,
//       {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(content.data.content), // فقط المحتوى
//       }
//     );

//     if (!res.ok) throw new Error("Failed to update content");
//     showToast("success", "Section content updated");
//   } catch (err) {
//     showToast("error", err.message);
//   } finally {
//     setSaving(false);
//   }
// };




  const sectionTitle = useMemo(
    () => (selectedSection ? `${selectedSection.name || selectedSection.title}` : ""),
    [selectedSection]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-gray-400">Content</p>
          <h1 className="text-2xl font-semibold text-gray-800">CMS Dashboard</h1>
          <p className="text-sm text-gray-500">
            Manage page sections without leaving the dashboard. All data comes from your API.
          </p>
        </div>
      </div>

      {toast && (
        <div
          className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm shadow-sm ${
            statusClasses[toast.type] || statusClasses.info
          }`}
        >
          <span>{toast.message}</span>
        </div>
      )}

      {loadingPages ? (
        <LoadingRows />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {pages.map((page) => (
            <button
              key={page._id || page.id}
              onClick={() => openPage(page)}
              className="group relative flex flex-col items-start rounded-2xl border border-gray-100 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="mb-3 flex w-full items-center justify-between">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  {page.slug || "no-slug"}
                </span>
                <span className="text-sm text-gray-400">View sections →</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800">{page.name || "Untitled"}</h3>
              <p className="mt-2 line-clamp-2 text-sm text-gray-500">
                {page.description || "No description provided."}
              </p>
              <div className="absolute inset-0 rounded-2xl border border-transparent transition group-hover:border-primary/50" />
            </button>
          ))}
        </div>
      )}

      <Modal
        open={Boolean(selectedPage)}
        onClose={() => {
          setSelectedPage(null);
          setSections([]);
        }}
        title={selectedPage ? `Sections for ${selectedPage.name || selectedPage.title}` : ""}
        widthClass="max-w-5xl"
      >
        {loadingSections ? (
          <LoadingRows count={4} />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {sections.map((section) => (
              <button
                key={section._id || section.id}
                onClick={() => openSection(section)}
                className="flex flex-col items-start rounded-2xl border border-gray-100 bg-white p-4 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex w-full items-center justify-between">
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                    {section.slug || "no-slug"}
                  </span>
                  <span
                    className={`rounded-full px-2 py-1 text-[11px] font-semibold ${
                      section.active || section.isActive
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {(section.active ?? section.isActive) ? "Active" : "Inactive"}
                  </span>
                </div>
                <h4 className="mt-3 text-base font-semibold text-gray-800">
                  {section.name || section.title}
                </h4>
                <p className="mt-1 text-xs text-gray-500">Order: {section.order ?? "—"}</p>
              </button>
            ))}
            {sections.length === 0 && (
              <p className="text-sm text-gray-500">No sections found for this page.</p>
            )}
          </div>
        )}
      </Modal>

      <Modal
        open={Boolean(selectedSection)}
        onClose={() => setSelectedSection(null)}
        title={sectionTitle || "Edit Section"}
        widthClass="max-w-6xl"
      >
        {loadingContent ? (
          <div className="space-y-3">
            <div className="h-4 w-1/3 animate-pulse rounded bg-gray-200" />
            <div className="h-32 animate-pulse rounded-xl bg-gray-100" />
          </div>
        ) : (
          <form className="space-y-6 md:space-y-8" onSubmit={handleSubmit}>
            {content ? (
              <FieldRenderer
                label=""
                value={content}
                path={[]}
                onChange={handleFieldChange}
                onAddItem={handleAddItem}
                onRemoveItem={handleRemoveItem}
              />
            ) : (
              <p className="text-sm text-gray-500">No content to display.</p>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedSection(null)}
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-gradient-to-r from-primary to-primary-dark px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
