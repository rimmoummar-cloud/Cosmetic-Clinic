const API_MEDIA_BASE = (
  process.env.NEXT_PUBLIC_API_BASE_URL 
)
  .replace(/\/api\/?$/, "")
  .replace(/\/+$/, "");

export function getMediaUrl(path) {
  if (!path) return "";

  const value = String(path).trim();
  const normalizePath = (pathname) =>
    pathname
      .replace(/\/{2,}/g, "/")
      .replace(/^(\/?uploads\/)+/, "/uploads/");

  if (
    value.startsWith("blob:") ||
    value.startsWith("data:")
  ) {
    return value;
  }

if (
  value.startsWith("http://") ||
  value.startsWith("https://")
) {
  return value;
}

  const normalizedPath = normalizePath(value).replace(/^\/+/, "");
  return `${API_MEDIA_BASE}/${normalizedPath}`;
}
