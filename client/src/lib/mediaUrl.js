const API_MEDIA_BASE = (process.env.NEXT_PUBLIC_API_URL || "")
  .replace(/\/api\/?$/, "")
  .replace(/\/+$/, "");

export function getMediaUrl(path) {
  if (!path) return "";

  const value = String(path).trim();
  const normalizePath = (pathname) =>
    pathname
      .replace(/\/{2,}/g, "/")
      .replace(/^(\/?uploads\/)+/, "/uploads/");

  if (value.toLowerCase().startsWith("blob:")) {
    return "";
  }

  if (value.startsWith("data:")) {
    return value;
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  const normalizedPath = normalizePath(value).replace(/^\/+/, "");
  return API_MEDIA_BASE
    ? `${API_MEDIA_BASE}/${normalizedPath}`
    : `/${normalizedPath}`;
}
