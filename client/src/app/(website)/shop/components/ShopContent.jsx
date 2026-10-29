"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FloatingElement } from "../../../components/AnimatedElements";
import { SectionHeader } from "../../../components/sectionHeader";
import { getMediaUrl } from "../../../../lib/mediaUrl";
import { DescriptionLanguageToggle, getLocalizedDescription } from "../../../../lib/localizedDescription";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

function formatPrice(price) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  }).format(Number(price) || 0);
}

function matchesSection(section, key) {
  return (
    section?.name?.toLowerCase() === key ||
    section?.slug?.toLowerCase() === key
  );
}

function getProductImageUrls(product) {
  const images = Array.isArray(product?.image_urls)
    ? product.image_urls.map(getMediaUrl).filter(Boolean)
    : [];

  return images.length || !product?.image_url
    ? images
    : [getMediaUrl(product.image_url)].filter(Boolean);
}

function ProductImageCarousel({ product, onClick }) {
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
      className="group relative aspect-[4/3] w-full overflow-hidden bg-[#F5F1ED]"
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
          No image available
        </div>
      )}
      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={showPrevious}
            aria-label={`Previous image for ${product.name}`}
            className="absolute left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/70 text-[#5D5144] shadow-sm backdrop-blur-sm transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A66B] sm:opacity-80 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
          >
            <ChevronLeft aria-hidden="true" size={19} />
          </button>
          <button
            type="button"
            onClick={showNext}
            aria-label={`Next image for ${product.name}`}
            className="absolute right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/70 text-[#5D5144] shadow-sm backdrop-blur-sm transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A66B] sm:opacity-80 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
          >
            <ChevronRight aria-hidden="true" size={19} />
          </button>
          <div className="absolute inset-x-0 bottom-2 z-10 flex items-center justify-center gap-1.5">
            {images.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={(event) => handleDotClick(event, index)}
                aria-label={`Show image ${index + 1} of ${images.length} for ${product.name}`}
                aria-current={imageIndex === index ? "true" : undefined}
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

function ProductDescriptionPreview({ description, onOpen, language = "en", product }) {
  const localizedDescription = description || getLocalizedDescription(product, language);
  if (!localizedDescription) {
    return <p className="mt-3 text-sm leading-relaxed text-[#2C2C2C]">No description available.</p>;
  }

  const preview = description.trim();
  const hasMore = preview.length > 120;
  const visiblePreview = hasMore ? `${preview.slice(0, 120).trimEnd()}…` : preview;

  return (
    <div className="mt-3">
      <p
        className="text-sm font-normal leading-relaxed text-[#2C2C2C]"
        style={{
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {visiblePreview}
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

function ProductModal({ product, isOpen, onClose, language = "en", onLanguageChange }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const images = getProductImageUrls(product);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
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

  if (typeof window === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[2147483647] flex items-center justify-center p-3 sm:p-6"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-modal-title"
        onClick={(event) => event.stopPropagation()}
        className="relative z-[2147483647] w-full max-w-xl overflow-hidden rounded-[28px] bg-white shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close item details"
          className="absolute right-4 top-4 z-[2147483647] flex h-10 w-10 items-center justify-center rounded-full border border-white/80 bg-white/80 text-xl text-[#5D5144] shadow-sm transition hover:bg-white"
        >
          ×
        </button>
        <div className="max-h-[88vh] overflow-y-auto">
          <div
            className="group relative aspect-[4/3] w-full overflow-hidden bg-[#F5F1ED]"
            onClick={(event) => event.stopPropagation()}
          >
            {images.length > 0 ? (
              <img
                src={images[imageIndex]}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-gray-400">
                No image available
              </div>
            )}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={showPrevious}
                  aria-label={`Previous image for ${product.name}`}
                  className="absolute left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/70 text-[#5D5144] shadow-sm backdrop-blur-sm transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A66B] sm:opacity-80 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
                >
                  <ChevronLeft aria-hidden="true" size={19} />
                </button>
                <button
                  type="button"
                  onClick={showNext}
                  aria-label={`Next image for ${product.name}`}
                  className="absolute right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/70 text-[#5D5144] shadow-sm backdrop-blur-sm transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A66B] sm:opacity-80 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
                >
                  <ChevronRight aria-hidden="true" size={19} />
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
                      aria-current={imageIndex === index ? "true" : undefined}
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
          <div className="p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <h3 id="product-modal-title" className="font-[var(--font-heading)] text-2xl font-semibold text-[#2C2C2C]">
                {product.name}
              </h3>
              <span className="shrink-0 whitespace-nowrap font-semibold text-[#C9A66B]">
                {formatPrice(product.price)}
              </span>
            </div>
            {product.skin_type && (
              <span className="mt-3 inline-flex rounded-full bg-[#FAF8F5] px-3 py-1 text-xs text-[#6B6B6B]">
                Skin Type: {product.skin_type}
              </span>
            )}
            <div className="mt-4 flex justify-end">
              <DescriptionLanguageToggle language={language} onChange={onLanguageChange} />
            </div>
            <div className="mt-5 max-h-[32vh] overflow-y-auto rounded-2xl bg-[#FAF8F5] p-4">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#2C2C2C]">
                {getLocalizedDescription(product, language) || "No description available."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function ShopContent({ sections = [] }) {
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState("");
  const [productLanguage, setProductLanguage] = useState("en");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const hero = sections.find((section) => matchesSection(section, "hero"));
  const intro = sections.find((section) =>
    matchesSection(section, "shop-intro")
  );
  const heroData = hero?.content ?? {};
  const introData = intro?.content ?? {};
  const shopLink =
    typeof introData.shopLink === "string" ? introData.shopLink.trim() : "";

  const loadProducts = useCallback(async () => {
    if (!API_BASE_URL) {
      setProductsError("The products service is not configured.");
      setLoadingProducts(false);
      return;
    }

    setLoadingProducts(true);
    setProductsError("");
    try {
      const response = await fetch(`${API_BASE_URL}/products`, {
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error(`Unable to load products (${response.status}).`);
      }

      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error("The products service returned an unexpected response.");
      }
      setProducts(data);
    } catch (error) {
      setProductsError(
        error instanceof Error ? error.message : "Unable to load products."
      );
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  return (
    <div className="w-full overflow-hidden">
      <section className="relative py-28 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#FFD700]/20 via-[#E8DDD0]/30 to-[#E8C7C3]/20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/85 via-[#FAF8F5]/92 to-white/80 backdrop-blur-[1px]" />
        <FloatingElement delay={0} duration={6}>
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#FFD700]/30 to-transparent rounded-full blur-3xl" />
        </FloatingElement>
        <FloatingElement delay={2} duration={7}>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tl from-[#E8C7C3]/30 to-transparent rounded-full blur-3xl" />
        </FloatingElement>
        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <SectionHeader
            label={heroData.subtitle}
            title={heroData.title}
            description={heroData.description}
          />
        </div>
      </section>

      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
        <FloatingElement delay={0} duration={6}>
          <div className="absolute top-8 left-8 w-72 h-72 bg-gradient-to-br from-[#FFD700]/15 to-transparent rounded-full blur-3xl" />
        </FloatingElement>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative z-10 max-w-4xl mx-auto text-center"
        >
          {introData.title && (
            <h2
              className="text-4xl md:text-5xl mb-4 text-[#2C2C2C]"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {introData.title}
            </h2>
          )}
          {introData.description && (
            <p className="text-lg text-[#6B6B6B] max-w-2xl mx-auto mb-8">
              {introData.description}
            </p>
          )}
          {shopLink && introData.linkText && (
            <motion.a
              href={shopLink}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{
                scale: 1.05,
                boxShadow: "0 0 30px rgba(212, 175, 122, 0.6)",
              }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex px-7 py-3 text-[0.9rem] rounded-full font-medium transition-all duration-300 bg-gradient-to-r from-[#D4AF7A] via-[#D4AF7A] to-[#D4AF7A] text-white shadow-lg shadow-[#D4AF7A]/40 hover:shadow-[0_0_30px_rgba(212,175,122,0.6)]"
            >
              {introData.linkText}
            </motion.a>
          )}
        </motion.div>
      </section>

      <section className="relative overflow-hidden bg-[#FAF8F5] px-4 py-20 sm:px-6 lg:px-8">
        <div className="relative z-10 mx-auto max-w-7xl">
          {selectedProduct && (
            <ProductModal
              product={selectedProduct}
              isOpen={Boolean(selectedProduct)}
              onClose={() => setSelectedProduct(null)}
              language={productLanguage}
              onLanguageChange={setProductLanguage}
            />
          )}
          {/* <div className="mb-10 text-center">
            <h2
              className="mb-3 text-3xl text-[#2C2C2C] sm:text-4xl"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Our Products
            </h2>
            <p className="mx-auto max-w-2xl text-gray-600">
              Explore products selected to support your skincare routine.
            </p>
          </div> */}

          {loadingProducts ? (
            <p className="py-10 text-center text-gray-500">Loading products...</p>
          ) : productsError ? (
            <div role="alert" className="py-8 text-center text-sm text-red-600">
              <p>{productsError}</p>
              <button
                type="button"
                onClick={() => void loadProducts()}
                className="mt-3 font-semibold underline"
              >
                Try again
              </button>
            </div>
          ) : products.length === 0 ? (
            <p className="py-10 text-center text-gray-500">
              No products are available right now.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <motion.article
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                  className="flex h-full flex-col overflow-hidden rounded-2xl border border-[#D4AF7A]/15 bg-white shadow-sm transition-shadow hover:shadow-lg"
                >
                  <ProductImageCarousel
                    key={product.id}
                    product={product}
                    onClick={() => setSelectedProduct(product)}
                  />
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="min-w-0 font-[var(--font-heading)] text-lg font-semibold text-[#2C2C2C]">
                        {product.name}
                      </h3>
                      <span className="shrink-0 whitespace-nowrap font-semibold text-[#C9A66B]">
                        {formatPrice(product.price)}
                      </span>
                    </div>
                    <div className="mt-3 flex justify-end">
                      <DescriptionLanguageToggle language={productLanguage} onChange={setProductLanguage} />
                    </div>
                    <ProductDescriptionPreview
                      description={product.description}
                      product={product}
                      language={productLanguage}
                      onOpen={() => setSelectedProduct(product)}
                    />
                    {product.skin_type && (
                      <span className="mt-4 self-start rounded-full bg-[#FAF8F5] px-3 py-1 text-xs text-[#6B6B6B]">
                        Skin Type: {product.skin_type}
                      </span>
                    )}
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
