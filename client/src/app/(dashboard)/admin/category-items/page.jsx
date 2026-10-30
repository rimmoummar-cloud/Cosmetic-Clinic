"use client";

import { useCallback, useEffect, useState } from "react";
import api from "../../../../lib/api";

const emptyForm = { name: "", description: "", name_fr: "", description_fr: "" };
const fields = [
  ["name", "English name", true],
  ["name_fr", "French name", false],
  ["description", "English description", false],
  ["description_fr", "French description", false],
];

function getErrorMessage(error) {
  return error?.response?.data?.message || error?.message || "Unable to complete the request.";
}

export default function CategoryItemsPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/category-items");
      if (!Array.isArray(data)) throw new Error("The categories API returned an unexpected response.");
      setCategories(data);
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadCategories(); }, [loadCategories]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setError("");
    setIsOpen(true);
  };

  const openEdit = (category) => {
    setEditing(category);
    setForm(Object.fromEntries(Object.keys(emptyForm).map((key) => [key, category[key] || ""])));
    setError("");
    setIsOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.name.trim()) {
      setError("English name is required.");
      return;
    }
    setSaving(true);
    setError("");
    setStatus("");
    const payload = Object.fromEntries(Object.entries(form).map(([key, value]) => [key, value.trim()]));
    try {
      if (editing) await api.put(`/category-items/${editing.id}`, payload);
      else await api.post("/category-items", payload);
      setIsOpen(false);
      setStatus(editing ? "Category updated successfully." : "Category created successfully.");
      await loadCategories();
    } catch (saveError) {
      setError(getErrorMessage(saveError));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (category) => {
    if (!window.confirm(`Delete "${category.name}"? Its products will remain and become uncategorized.`)) return;
    setError("");
    setStatus("");
    try {
      await api.delete(`/category-items/${category.id}`);
      setStatus("Category deleted. Its products remain and are now uncategorized.");
      await loadCategories();
    } catch (deleteError) {
      setError(getErrorMessage(deleteError));
    }
  };

  return (
    <section>
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-[var(--font-heading)] text-2xl font-bold">Category Items</h1>
          <p className="mt-1 text-sm text-gray-500">Manage categories shown in the Shop.</p>
        </div>
        <button type="button" onClick={openCreate} className="rounded-xl bg-gradient-to-r from-primary to-primary-dark px-6 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-lg">+ Add Category</button>
      </div>

      {status && <p role="status" className="mb-5 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">{status}</p>}
      {error && <div role="alert" className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"><p>{error}</p><button type="button" onClick={() => void loadCategories()} className="mt-2 font-semibold underline">Try again</button></div>}

      <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500"><tr><th className="px-4 py-3">ID</th><th className="px-4 py-3">English name</th><th className="px-4 py-3">French name</th><th className="px-4 py-3">English description</th><th className="px-4 py-3">French description</th><th className="px-4 py-3">Actions</th></tr></thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-500">Loading categories...</td></tr>
              : categories.length === 0 ? <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-500">No categories yet.</td></tr>
                : categories.map((category) => <tr key={category.id} className="align-top"><td className="px-4 py-4 text-gray-500">{category.id}</td><td className="px-4 py-4 font-medium">{category.name}</td><td className="px-4 py-4">{category.name_fr || "—"}</td><td className="max-w-xs px-4 py-4"><p className="line-clamp-3">{category.description || "—"}</p></td><td className="max-w-xs px-4 py-4"><p className="line-clamp-3">{category.description_fr || "—"}</p></td><td className="px-4 py-4"><div className="flex gap-2"><button type="button" onClick={() => openEdit(category)} className="rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-600 hover:bg-blue-100">Edit</button><button type="button" onClick={() => void handleDelete(category)} className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 hover:bg-red-100">Delete</button></div></td></tr>)}
          </tbody>
        </table>
      </div>

      {isOpen && <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) setIsOpen(false); }}><div className="absolute inset-0 bg-black/50 backdrop-blur-sm" /><form onSubmit={handleSubmit} className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"><div className="mb-5 flex items-start justify-between"><div><h2 className="text-xl font-semibold">{editing ? "Edit category" : "Add category"}</h2><p className="mt-1 text-sm text-gray-500">English name is required. French fields are optional.</p></div><button type="button" onClick={() => setIsOpen(false)} disabled={saving} aria-label="Close" className="text-2xl text-gray-400">×</button></div><div className="grid gap-4 sm:grid-cols-2">{fields.map(([key, label, required]) => <label key={key} className="text-sm font-medium text-gray-700">{label}{key.includes("description") ? <textarea rows={4} required={required} value={form[key]} onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))} maxLength={key.includes("_fr") && !key.startsWith("name") ? undefined : key.startsWith("name") ? 200 : undefined} className="mt-1 w-full rounded-xl border border-gray-200 p-3 font-normal focus:border-primary focus:outline-none" /> : <input required={required} maxLength={200} value={form[key]} onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))} className="mt-1 w-full rounded-xl border border-gray-200 p-3 font-normal focus:border-primary focus:outline-none" />}</label>)}</div>{error && <p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}<div className="mt-6 flex justify-end gap-3"><button type="button" disabled={saving} onClick={() => setIsOpen(false)} className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm">Cancel</button><button type="submit" disabled={saving} className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Saving..." : editing ? "Save changes" : "Create category"}</button></div></form></div>}
    </section>
  );
}
