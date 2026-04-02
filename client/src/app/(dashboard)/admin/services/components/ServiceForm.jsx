"use client";

import { useEffect, useState } from "react";

export default function ServiceForm({ onSubmit, loading = false, initialData = {}, isEditing = false, onClose, categories = [] }) {
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setName(initialData?.name ?? "");
    setCategoryId(initialData?.category_id ?? initialData?.categoryId ?? categories[0]?.id ?? "");
    setDescription(initialData?.description ?? "");
    setPrice(initialData?.price ?? "");
    setDurationMinutes(initialData?.duration_minutes ?? initialData?.duration ?? "");
    setImageUrl(initialData?.image_url ?? "");
    setIsActive(initialData?.is_active ?? true);
    setError("");
  }, [initialData, categories]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !String(categoryId).trim() || !price || !durationMinutes) {
      setError("Please fill all required fields");
      return;
    }

    setError("");

    const payload = {
      category_id: Number(categoryId),
      name,
      description,
      price: Number(price),
      duration_minutes: Number(durationMinutes),
      image_url: imageUrl,
      is_active: Boolean(isActive),
    };

    try {
      await onSubmit(payload);
    } catch (err) {
      setError(err?.message || "Unable to save service");
    }
  };

  return (
    <form className="p-6 space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Service Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-3 border border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-colors"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full p-3 border border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-colors"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min)</label>
          <input
            type="number"
            placeholder="e.g. 60"
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-colors"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-3 border border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-colors resize-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-primary transition-colors">
          <input
            type="text"
            placeholder="Paste image URL"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full bg-transparent text-sm focus:outline-none text-gray-700 placeholder:text-gray-400"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input
          id="is-active"
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="h-4 w-4 text-primary border-gray-300 rounded"
        />
        <label htmlFor="is-active" className="text-sm text-gray-700">
          Active
        </label>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Saving..." : isEditing ? "Update Service" : "Save Service"}
        </button>
      </div>
    </form>
  );
}
