import Link from "next/link";
import { ArrowLeft, ImageOff } from "lucide-react";
import { ImageFallBack } from "../../../../../components/EmageFullBack";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:5000/api"
).replace(/\/+$/, "");

function apiPath(path) {
  const base = API_BASE_URL.endsWith("/api")
    ? API_BASE_URL
    : `${API_BASE_URL}/api`;

  return `${base}${path}`;
}

function clean(value) {
  if (value === null || value === undefined)
    return "";

  return String(value).trim();
}

async function getServiceImages(id) {
  try {
    console.log("ID RECEIVED:", id);
console.log(
  "URL:",
  apiPath(`/service/${id}/full`)
);
    const res = await fetch(
      apiPath(`/service/${id}/full`),
      {
        next: {
          revalidate: 60,
        },
      }
    );

    if (!res.ok) {
      return [];
    }

    const payload =
      await res.json();

    return (
      payload?.data
        ?.beforeAfterImages || []
    );
  } catch (err) {
    console.error(err);
    return [];
  }
}

function getImageUrl(path) {
  if (!path) return "";

  if (path.startsWith("http")) {
    return path;
  }

  return `${API_BASE_URL.replace(
    "/api",
    ""
  )}${path}`;
}



export default async function ImagePage({
  params,
}) {
  const {
    servicesID,
    categoryID,
  } = await params;

const images =
  await getServiceImages(
    servicesID
  );
    console.log(params);

console.log(
  "SERVICE ID:",
  servicesID
);

console.log(
  "CATEGORY ID:",
  categoryID
);
  return (
    <div className="bg-[#FAF8F5] min-h-screen">

    <div className="mx-auto max-w-7xl px-4 pt-32 pb-16 md:px-8">

        <div className="mb-12 flex items-center justify-between">

          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-[#8A7766]">
              Transformation Gallery
            </p>

            <h1
              className="mt-3 text-4xl font-semibold text-[#2C2C2C]"
              style={{
                fontFamily:
                  "var(--font-serif)",
              }}
            >
              Before & After Images
            </h1>
          </div>

          <Link
       href={`/services/${categoryID}/${servicesID}`}
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
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </div>

        {images.length === 0 ? (
          <div className="rounded-3xl bg-white p-16 text-center shadow">
            No images available.
          </div>
        ) : (
          <div className="grid gap-10">

            {images.map(
              (item, index) => {
               const before = getImageUrl(
  clean(item.before_image)
);

const after = getImageUrl(
  clean(item.after_image)
);

                return (
                  <article
                    key={
                      item.id ||
                      index
                    }
                    className="
                      overflow-hidden
                      rounded-3xl
                      bg-white
                      shadow-[0_14px_38px_rgba(0,0,0,0.07)]
                    "
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2">

                      {[
                        [
                          "Before",
                          before,
                        ],
                        [
                          "After",
                          after,
                        ],
                      ].map(
                        ([
                          label,
                          image,
                        ]) => (
                          <div
                            key={
                              label
                            }
                            className="
                              relative
                              min-h-[420px]
                              bg-[#F8F3EC]
                            "
                          >
                            {image ? (
                              <ImageFallBack
                                src={
                                  image
                                }
                                alt={
                                  label
                                }
                                className="
                                  h-[420px]
                                  w-full
                                  object-cover
                                "
                              />
                            ) : (
                              <div className="flex h-[420px] items-center justify-center text-[#8A7766]">
                                <ImageOff className="h-10 w-10" />
                              </div>
                            )}

                            <span
                              className="
                                absolute
                                left-5
                                top-5
                                rounded-full
                                bg-white/90
                                px-4
                                py-2
                                text-sm
                                font-semibold
                              "
                            >
                              {label}
                            </span>
                          </div>
                        )
                      )}
                    </div>

                    {(clean(
                      item.title
                    ) ||
                      clean(
                        item.description
                      )) && (
                      <div className="p-8">

                        {clean(
                          item.title
                        ) && (
                          <h3 className="text-2xl font-semibold text-[#2C2C2C]">
                            {
                              item.title
                            }
                          </h3>
                        )}

                        {clean(
                          item.description
                        ) && (
                          <p className="mt-4 leading-8 text-[#6B6B6B]">
                            {
                              item.description
                            }
                          </p>
                        )}
                      </div>
                    )}
                  </article>
                );
              }
            )}
          </div>
        )}
      </div>
    </div>
  );
}