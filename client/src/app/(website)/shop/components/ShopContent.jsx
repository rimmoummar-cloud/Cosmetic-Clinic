"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FloatingElement } from "../../../components/AnimatedElements";
import { SectionHeader } from "../../../components/sectionHeader";
import { getMediaUrl } from "../../../../lib/mediaUrl";

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

export default function ShopContent({ sections = [] }) {
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState("");
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
                  <div className="aspect-[4/3] w-full overflow-hidden bg-[#F5F1ED]">
                    {product.image_url ? (
                      <img
                        src={getMediaUrl(product.image_url)}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-gray-400">
                        No image available
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="min-w-0 font-[var(--font-heading)] text-lg font-semibold text-[#2C2C2C]">
                        {product.name}
                      </h3>
                      <span className="shrink-0 whitespace-nowrap font-semibold text-[#C9A66B]">
                        {formatPrice(product.price)}
                      </span>
                    </div>
                    <p className="mt-3 flex-1 whitespace-pre-wrap text-sm font-normal leading-relaxed text-[#2C2C2C]">
                      {product.description}
                    </p>
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
