"use client";

import { useCallback, useEffect, useState } from "react";
import api from "../../../../lib/api";
import { getMediaUrl } from "../../../../lib/mediaUrl";

function getErrorMessage(error, fallback) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
}

function formatPrice(price) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  }).format(Number(price) || 0);
}

export default function AdminItemsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [skinType, setSkinType] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isActive, setIsActive] = useState(true);

  const loadProducts = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError("");

    try {
      const response = await api.get("/products/admin");
      if (!Array.isArray(response.data)) {
        throw new Error("The products API returned an unexpected response.");
      }
      setProducts(response.data);
    } catch (loadError) {
      setError(getErrorMessage(loadError, "Unable to load products."));
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    if (!imageFile) {
      setImagePreview("");
      return undefined;
    }

    const previewUrl = URL.createObjectURL(imageFile);
    setImagePreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [imageFile]);

  const resetForm = () => {
    setEditingProduct(null);
    setName("");
    setPrice("");
    setDescription("");
    setSkinType("");
    setImageUrl("");
    setImageFile(null);
    setIsActive(true);
  };

  const openCreateModal = () => {
    resetForm();
    setError("");
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setName(product.name || "");
    setPrice(String(product.price ?? ""));
    setDescription(product.description || "");
    setSkinType(product.skin_type || "");
    setImageUrl(product.image_url || "");
    setImageFile(null);
    setIsActive(Boolean(product.is_active));
    setError("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("price", price);
    formData.append("description", description.trim());
    formData.append("skin_type", skinType.trim());
    formData.append("is_active", String(isActive));
    if (imageFile) {
      formData.append("image", imageFile);
    }

    setSaving(true);
    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, formData);
        setMessage("Product updated successfully.");
      } else {
        await api.post("/products", formData);
        setMessage("Product created successfully.");
      }
      closeModal();
      await loadProducts(false);
    } catch (saveError) {
      setError(getErrorMessage(saveError, "Unable to save product."));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) {
      return;
    }

    setError("");
    setMessage("");
    setSaving(true);
    try {
      await api.delete(`/products/${product.id}`);
      setMessage("Product deleted successfully.");
      await loadProducts(false);
    } catch (deleteError) {
      setError(getErrorMessage(deleteError, "Unable to delete product."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section>
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-[var(--font-heading)] text-2xl font-bold">Items</h1>
          <p className="mt-1 text-sm text-gray-500">Manage products shown in the Shop.</p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="rounded-xl bg-gradient-to-r from-primary to-primary-dark px-6 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-primary/20"
        >
          + Add Item
        </button>
      </div>

      {message && (
        <p role="status" className="mb-5 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
          {message}
        </p>
      )}
      {error && (
        <div role="alert" className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          <p>{error}</p>
          {!showModal && (
            <button
              type="button"
              onClick={() => void loadProducts()}
              className="mt-2 font-semibold underline"
            >
              Try again
            </button>
          )}
        </div>
      )}

      {loading ? (
        <p className="py-10 text-center text-gray-500">Loading items...</p>
      ) : products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 py-10 text-center text-gray-500">
          No items yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <article
              key={product.id}
              className="overflow-hidden rounded-2xl border border-gray-100 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="aspect-[4/3] overflow-hidden bg-[#FAF8F5]">
                {product.image_url ? (
                  <img
                    src={getMediaUrl(product.image_url)}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-gray-400">
                    No image
                  </div>
                )}
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-[var(--font-heading)] text-lg font-semibold text-[#2C2C2C]">
                    {product.name}
                  </h2>
                  <span className="shrink-0 font-semibold text-primary">
                    {formatPrice(product.price)}
                  </span>
                </div>
                <p className="mt-3 min-h-12 whitespace-pre-wrap text-sm leading-relaxed text-gray-600">
                  {product.description}
                </p>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-[#FAF8F5] px-3 py-1 text-xs text-gray-600">
                      {product.skin_type || "Skin type not specified"}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        product.is_active
                          ? "bg-green-50 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {product.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => openEditModal(product)}
                      disabled={saving}
                      className="rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-600 transition-colors hover:bg-blue-100 disabled:opacity-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(product)}
                      disabled={saving}
                      className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-form-title"
            onClick={(event) => event.stopPropagation()}
            className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-gray-100 p-6">
              <h2
                id="product-form-title"
                className="font-[var(--font-heading)] text-xl font-bold"
              >
                {editingProduct ? "Edit Item" : "Add Item"}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                aria-label="Close product form"
                className="text-2xl text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <form className="space-y-4 p-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="product-name" className="mb-1 block text-sm font-medium text-gray-700">
                  Product name
                </label>
                <input
                  id="product-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  maxLength={200}
                  required
                  className="w-full rounded-xl border border-gray-200 p-3 transition-colors focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="product-price" className="mb-1 block text-sm font-medium text-gray-700">
                  Price (CA$)
                </label>
                <input
                  id="product-price"
                  type="number"
                  min="0"
                  max="99999999.99"
                  step="0.01"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  required
                  className="w-full rounded-xl border border-gray-200 p-3 transition-colors focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="product-description" className="mb-1 block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="product-description"
                  rows={4}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  required
                  className="w-full rounded-xl border border-gray-200 p-3 transition-colors focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="product-skin-type" className="mb-1 block text-sm font-medium text-gray-700">
                  Skin type
                </label>
                <input
                  id="product-skin-type"
                  value={skinType}
                  onChange={(event) => setSkinType(event.target.value)}
                  maxLength={100}
                  className="w-full rounded-xl border border-gray-200 p-3 transition-colors focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="product-image" className="mb-1 block text-sm font-medium text-gray-700">
                  Product image
                </label>
                <input
                  id="product-image"
                  type="file"
                  accept="image/*"
                  onChange={(event) => setImageFile(event.target.files?.[0] || null)}
                  className="w-full rounded-xl border border-gray-200 p-3 text-sm"
                />
                {(imagePreview || imageUrl) && (
                  <img
                    src={imagePreview || getMediaUrl(imageUrl)}
                    alt="Product image preview"
                    className="mt-3 h-36 w-full rounded-xl bg-[#FAF8F5] object-cover"
                  />
                )}
                {editingProduct && (
                  <p className="mt-2 text-xs text-gray-500">
                    Leave empty to keep the current image.
                  </p>
                )}
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(event) => setIsActive(event.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                Active
              </label>
              {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-semibold transition-colors hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-xl bg-gradient-to-r from-primary to-primary-dark py-3 text-sm font-semibold text-white transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Saving..." : editingProduct ? "Save Changes" : "Add Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
