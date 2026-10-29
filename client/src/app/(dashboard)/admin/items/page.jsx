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

function getProductImageUrls(product) {
  const images = Array.isArray(product?.image_urls)
    ? product.image_urls.map(getMediaUrl).filter(Boolean)
    : [];

  return images.length || !product?.image_url
    ? images
    : [getMediaUrl(product.image_url)].filter(Boolean);
}

function getStoredProductImageUrls(product) {
  const images = Array.isArray(product?.image_urls) ? product.image_urls : [];
  const imageUrls =
    images.length || !product?.image_url ? images : [product.image_url];

  return imageUrls.filter(
    (image) =>
      typeof image === "string" &&
      image.trim() &&
      !image.trim().toLowerCase().startsWith("blob:")
  );
}

function ProductImageGallery({ product, onClick }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const images = getProductImageUrls(product);
  const imageIndex = images.length ? activeIndex % images.length : 0;

  const showPrevious = (event) => {
    event?.stopPropagation();
    setActiveIndex((current) => (images.length ? (current - 1 + images.length) % images.length : 0));
  };

  const showNext = (event) => {
    event?.stopPropagation();
    setActiveIndex((current) => (images.length ? (current + 1) % images.length : 0));
  };

  const handleDotClick = (event, index) => {
    event?.stopPropagation();
    setActiveIndex(index);
  };

  return (
    <div
      className="group relative aspect-[4/3] overflow-hidden bg-[#FAF8F5]"
      onClick={onClick}
    >
      {images.length > 0 ? (
        <img
          src={images[imageIndex]}
          alt={product.name}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full items-center justify-center text-sm text-gray-400">
          No image
        </div>
      )}
      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={showPrevious}
            aria-label={`Previous image for ${product.name}`}
            className="absolute left-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/70 text-[#5D5144] shadow-sm backdrop-blur-sm transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A66B]"
          >
            <span aria-hidden="true">‹</span>
          </button>
          <button
            type="button"
            onClick={showNext}
            aria-label={`Next image for ${product.name}`}
            className="absolute right-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/70 text-[#5D5144] shadow-sm backdrop-blur-sm transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A66B]"
          >
            <span aria-hidden="true">›</span>
          </button>
          <div className="absolute inset-x-0 bottom-2 z-10 flex items-center justify-center gap-1.5">
            {images.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={(event) => handleDotClick(event, index)}
                aria-label={`Show image ${index + 1} of ${images.length} for ${product.name}`}
                className="flex h-5 w-5 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full transition ${
                    imageIndex === index ? "bg-white" : "bg-white/55"
                  }`}
                />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ProductDescriptionPreview({ description, onOpen }) {
  const content = description?.trim();
  if (!content) {
    return <p className="mt-3 text-sm leading-relaxed text-gray-600">No description available.</p>;
  }

  const preview = content.length > 120 ? `${content.slice(0, 120).trimEnd()}…` : content;
  const hasMore = content.length > 120;

  return (
    <div className="mt-3">
      <p
        className="text-sm leading-relaxed text-gray-600"
        style={{
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {preview}
      </p>
      {hasMore && (
        <button
          type="button"
          onClick={onOpen}
          className="mt-2 inline-flex items-center text-xs font-medium text-[#8D6F4F] transition hover:text-[#6F563F]"
        >
          See more
        </button>
      )}
    </div>
  );
}

function ProductDetailsModal({ product, isOpen, onClose }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const images = getProductImageUrls(product);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleEscape = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (images.length) {
      setActiveIndex((current) => Math.min(current, images.length - 1));
    }
  }, [images.length]);

  if (!isOpen || !product) return null;

  const imageIndex = images.length ? activeIndex % images.length : 0;

  const showPrevious = (event) => {
    event?.stopPropagation();
    setActiveIndex((current) => (images.length ? (current - 1 + images.length) % images.length : 0));
  };

  const showNext = (event) => {
    event?.stopPropagation();
    setActiveIndex((current) => (images.length ? (current + 1) % images.length : 0));
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-details-title"
        onClick={(event) => event.stopPropagation()}
        className="relative z-10 w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close product details"
          className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/85 text-2xl text-gray-600 shadow-sm transition hover:bg-white"
        >
          ×
        </button>
        <div className="max-h-[90vh] overflow-y-auto">
          <div className="group relative aspect-[4/3] overflow-hidden bg-[#FAF8F5]">
            {images.length > 0 ? (
              <img
                src={images[imageIndex]}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-gray-400">
                No image
              </div>
            )}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={showPrevious}
                  aria-label={`Previous image for ${product.name}`}
                  className="absolute left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/70 text-[#5D5144] shadow-sm backdrop-blur-sm transition hover:bg-white/90"
                >
                  <span aria-hidden="true">‹</span>
                </button>
                <button
                  type="button"
                  onClick={showNext}
                  aria-label={`Next image for ${product.name}`}
                  className="absolute right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/70 text-[#5D5144] shadow-sm backdrop-blur-sm transition hover:bg-white/90"
                >
                  <span aria-hidden="true">›</span>
                </button>
                <div className="absolute inset-x-0 bottom-2 z-10 flex items-center justify-center gap-1.5">
                  {images.map((image, index) => (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setActiveIndex(index);
                      }}
                      aria-label={`Show image ${index + 1} of ${images.length} for ${product.name}`}
                      className="flex h-5 w-5 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full transition ${
                          imageIndex === index ? "bg-white" : "bg-white/55"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          <div className="p-5">
            <div className="flex items-start justify-between gap-3">
              <h3 id="product-details-title" className="font-[var(--font-heading)] text-xl font-semibold text-[#2C2C2C]">
                {product.name}
              </h3>
              <span className="shrink-0 font-semibold text-primary">
                {formatPrice(product.price)}
              </span>
            </div>
            {product.skin_type && (
              <span className="mt-3 inline-flex rounded-full bg-[#FAF8F5] px-3 py-1 text-xs text-gray-600">
                {product.skin_type}
              </span>
            )}
            <div className="mt-5 max-h-[36vh] overflow-y-auto rounded-2xl bg-[#FAF8F5] p-4">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                {product.description || "No description available."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminItemsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [descriptionFr, setDescriptionFr] = useState("");
  const [skinType, setSkinType] = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [retainedImageUrls, setRetainedImageUrls] = useState([]);
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
    const previewUrls = imageFiles.map((file) => URL.createObjectURL(file));
    setImagePreviews(previewUrls);
    return () => previewUrls.forEach((previewUrl) => URL.revokeObjectURL(previewUrl));
  }, [imageFiles]);

  const resetForm = () => {
    setEditingProduct(null);
    setName("");
    setPrice("");
    setDescription("");
    setDescriptionFr("");
    setSkinType("");
    setImageFiles([]);
    setImagePreviews([]);
    setRetainedImageUrls([]);
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
    setDescriptionFr(product.description_fr || "");
    setSkinType(product.skin_type || "");
    setImageFiles([]);
    setImagePreviews([]);
    setRetainedImageUrls(getStoredProductImageUrls(product));
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
    formData.append("description_fr", descriptionFr.trim());
    formData.append("skin_type", skinType.trim());
    formData.append("is_active", String(isActive));
    imageFiles.forEach((imageFile) => formData.append("images", imageFile));

    if (editingProduct) {
      formData.append("image_urls", JSON.stringify(retainedImageUrls));
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

  const handleImageSelection = (event) => {
    const selectedFiles = Array.from(event.currentTarget.files || []);
    setImageFiles((currentFiles) => {
      const nextFiles = [...currentFiles];
      selectedFiles.forEach((file) => {
        const alreadySelected = nextFiles.some(
          (currentFile) =>
            currentFile.name === file.name &&
            currentFile.size === file.size &&
            currentFile.lastModified === file.lastModified
        );
        if (!alreadySelected) nextFiles.push(file);
      });
      return nextFiles;
    });
    event.currentTarget.value = "";
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
              <ProductImageGallery
                product={product}
                onClick={() => setSelectedProduct(product)}
              />
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-[var(--font-heading)] text-lg font-semibold text-[#2C2C2C]">
                    {product.name}
                  </h2>
                  <span className="shrink-0 font-semibold text-primary">
                    {formatPrice(product.price)}
                  </span>
                </div>
                <ProductDescriptionPreview
                  description={product.description}
                  onOpen={() => setSelectedProduct(product)}
                />
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

      {selectedProduct && (
        <ProductDetailsModal
          product={selectedProduct}
          isOpen={Boolean(selectedProduct)}
          onClose={() => setSelectedProduct(null)}
        />
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
                  Description (English)
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
                <label htmlFor="product-description-fr" className="mb-1 block text-sm font-medium text-gray-700">
                  Description (French)
                </label>
                <textarea
                  id="product-description-fr"
                  rows={4}
                  value={descriptionFr}
                  onChange={(event) => setDescriptionFr(event.target.value)}
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
                <label htmlFor="product-images" className="mb-1 block text-sm font-medium text-gray-700">
                  Product images
                </label>
                <input
                  id="product-images"
                  name="images"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={handleImageSelection}
                  className="w-full rounded-xl border border-gray-200 p-3 text-sm"
                />
                {imageFiles.length > 0 && (
                  <p className="mt-2 text-xs text-gray-600" role="status">
                    {imageFiles.length} image{imageFiles.length === 1 ? "" : "s"} selected
                  </p>
                )}
                {editingProduct && retainedImageUrls.length > 0 && (
                  <div className="mt-3">
                    <p className="mb-2 text-xs font-medium text-gray-600">
                      Current images
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {retainedImageUrls.map((image, index) => (
                        <div key={`${image}-${index}`} className="relative">
                          <img
                            src={getMediaUrl(image)}
                            alt={`${editingProduct.name} current image ${index + 1}`}
                            className="h-24 w-full rounded-xl bg-[#FAF8F5] object-cover"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setRetainedImageUrls((currentImages) =>
                                currentImages.filter((_, imageIndex) => imageIndex !== index)
                              )
                            }
                            aria-label={`Remove current image ${index + 1}`}
                            className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-sm text-white transition hover:bg-black"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {imagePreviews.length > 0 && (
                  <div className="mt-3">
                    <p className="mb-2 text-xs font-medium text-gray-600">
                      Selected images to upload
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {imagePreviews.map((preview, index) => (
                        <div key={`${preview}-${index}`} className="relative">
                          <img
                            src={preview}
                            alt={`Selected product image ${index + 1}`}
                            className="h-24 w-full rounded-xl bg-[#FAF8F5] object-cover"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setImageFiles((currentFiles) =>
                                currentFiles.filter((_, fileIndex) => fileIndex !== index)
                              )
                            }
                            aria-label={`Remove selected image ${index + 1}`}
                            className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-sm text-white transition hover:bg-black"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {editingProduct && (
                  <p className="mt-2 text-xs text-gray-500">
                    Saved images are kept unless removed. Newly selected images are added when you save.
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
