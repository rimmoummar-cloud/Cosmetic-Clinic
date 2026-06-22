



// // export default api;
// import axios from "axios";

// const api = axios.create({
//   baseURL: "http://localhost:5000/api",
//   withCredentials: true
// });

// // ==============================
// // 1. CSRF TOKEN CACHE (مهم جدًا)
// // ==============================

// let csrfTokenCache = null;

// async function getCsrfToken() {

//   if (csrfTokenCache) {
//     return csrfTokenCache;
//   }

//   const { data } = await api.get("/csrf-token");

//   csrfTokenCache = data.csrfToken;

//   return csrfTokenCache;
// }

// // ==============================
// // 2. REQUEST INTERCEPTOR
// // ==============================
// api.interceptors.request.use(async (config) => {

//   const method = config.method?.toLowerCase();

//   const methodsRequiringCSRF = ["post", "put", "delete"];


// const isPublicCreateBooking =
//   config.url?.startsWith("/bookings") &&
//   method === "post";
//   if (
//   ["post", "put", "delete"].includes(method) &&
//   !isPublicCreateBooking
// ) {
//   const token = await getCsrfToken();
//   config.headers["CSRF-Token"] = token;
// }
//   if (
//     methodsRequiringCSRF.includes(method) &&
//     !isPublicCreateBooking
//   ) {

//     const token = await getCsrfToken();

//     config.headers["CSRF-Token"] = token;

//   }

//   return config;

// });


// // ==============================
// // 3. RESPONSE INTERCEPTOR (refresh ready)
// // ==============================

// api.interceptors.response.use(

//   (response) => response,

//   async (error) => {
//     if (!error.response) {
//   return Promise.reject(error);
// }
   
  
// if (
//   error.response?.data?.message?.includes("csrf")
// ) {
//   csrfTokenCache = null;
// }


//     const originalRequest = error.config;

//     if (
//   error.response?.status === 401 &&
//   !originalRequest._retry &&
// !originalRequest.url?.includes("refresh")
  
// ) {

//       originalRequest._retry = true;

//       try {

//         await api.post("/refresh");

//         return api(originalRequest);

//       } catch (err) {

//         window.location.href = "/login";

//       }

//     }

//     return Promise.reject(error);

//   }

// );

// export default api;

import axios from "axios";

const api = axios.create({
  baseURL: "https://cosmetic-clinic.onrender.com/api",
  withCredentials: true
});

// ==============================
// 1. CSRF TOKEN CACHE (مهم جدًا)
// ==============================

let csrfTokenCache = null;

async function getCsrfToken() {
  if (csrfTokenCache) {
    return csrfTokenCache;
  }

  const { data } = await api.get("/csrf-token");

  csrfTokenCache = data.csrfToken;

  return csrfTokenCache;
}

// ==============================
// 2. REQUEST INTERCEPTOR
// ==============================
api.interceptors.request.use(async (config) => {
  const method = config.method?.toLowerCase();

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
    if (!error.response) {
      return Promise.reject(error);
    }

    if (
      error.response?.data?.message?.includes("csrf")
    ) {
      csrfTokenCache = null;
    }

    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("refresh")
    ) {
      originalRequest._retry = true;

      try {
        await api.post("/refresh");
        return api(originalRequest);
      } catch (err) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;