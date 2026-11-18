
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true
});

// ==============================
// 1. CSRF TOKEN CACHE (مهم جدًا)
// ==============================

let csrfTokenCache = null;
let csrfTokenPromise = null;
let refreshPromise = null;
let authGeneration = 0;

async function getCsrfToken() {
  if (csrfTokenCache) return csrfTokenCache;
  if (!csrfTokenPromise) {
    csrfTokenPromise = api.get("/csrf-token", { _skipAuthRefresh: true })
      .then(({ data }) => {
        csrfTokenCache = data.csrfToken;
        return csrfTokenCache;
      }).finally(() => { csrfTokenPromise = null; });
  }
  return csrfTokenPromise;
}

function refreshSession() {
  if (!refreshPromise) {
    const renew = async () => {
      // Another tab may have renewed the shared cookies while this tab waited.
      try {
        await api.get("/me", { _skipAuthRefresh: true });
        return;
      } catch (error) {
        if (error.response?.status !== 401) throw error;
      }
      csrfTokenCache = null;
      await api.post("/refresh", {}, { _skipAuthRefresh: true });
    };
    // Web Locks serialize rotation across tabs without exposing HTTP-only tokens.
    const locks = typeof window !== "undefined" ? window.navigator?.locks : null;
    refreshPromise = (locks
      ? locks.request("clinic-admin-session-refresh", renew)
      : renew())
      .then(() => { authGeneration += 1; })
      .finally(() => { refreshPromise = null; });
  }
  return refreshPromise;
}

function redirectToLogin() {
  if (typeof window !== "undefined" && window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
}

// ==============================
// 2. REQUEST INTERCEPTOR
// ==============================
api.interceptors.request.use(async (config) => {
  const method = config.method?.toLowerCase();
  config._authGeneration = authGeneration;

const methodsRequiringCSRF = [
  "post",
  "put",
  "patch",
  "delete"
];

  const isPublicCreateBooking =
    config.url?.startsWith("/bookings") &&
    method === "post";

  if (
    methodsRequiringCSRF.includes(method) &&
    !isPublicCreateBooking
  ) {
    const token = await getCsrfToken();
    config.headers["CSRF-Token"] = token;
  }

  return config;
});

// ==============================
// 3. RESPONSE INTERCEPTOR (refresh ready)
// ==============================

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const data = error.response?.data;
    const message = String(data?.message || data?.error || (typeof data === "string" ? data : "")).toLowerCase();
    if (status === 403 && message.includes("csrf")) csrfTokenCache = null;

    const endpoint = originalRequest?.url?.split("?")[0];
    const isAuthenticationEndpoint = ["/login", "/refresh", "/csrf-token"].includes(endpoint);
    // A wrong password is a business response, not an expired session.
    const wrongPassword = endpoint === "/verify-password" && error.response?.data?.message === "Incorrect password";
    if (status !== 401 || !originalRequest || originalRequest._skipAuthRefresh || isAuthenticationEndpoint || wrongPassword) {
      return Promise.reject(error);
    }
    if (originalRequest._retry) {
      redirectToLogin();
      return Promise.reject(error);
    }
    originalRequest._retry = true;
    try {
      // A late 401 from a request sent before renewal can use the new cookies.
      if (originalRequest._authGeneration === authGeneration) await refreshSession();
    } catch (refreshError) {
      if (refreshError.response?.status === 401) redirectToLogin();
      // Keep transient network, CSRF and server failures recoverable.
      return Promise.reject(refreshError);
    }
    return api(originalRequest);
  }
);

export default api;
