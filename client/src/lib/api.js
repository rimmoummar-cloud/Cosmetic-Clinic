
// import axios from "axios";

// const api = axios.create({
//   baseURL: "http://localhost:5000/api",
//   withCredentials: true
// });

// api.interceptors.request.use(async (config) => {

//   if (["post", "put", "delete"].includes(config.method)) {

//     const { data } = await api.get("/csrf-token");

//     config.headers["CSRF-Token"] = data.csrfToken;
//   }

//   return config;
// });




// export default api;
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
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

  const methodsRequiringCSRF = ["post", "put", "delete"];

  const isPublicRoute =
    config.url?.startsWith("/bookings");

  if (
    methodsRequiringCSRF.includes(method) &&
    !isPublicRoute
  ) {

    const token = await getCsrfToken();

    config.headers["CSRF-Token"] = token;

  }

  return config;

});
// api.interceptors.request.use(async (config) => {

//   const method = config.method?.toLowerCase();

//   const methodsRequiringCSRF = ["post", "put", "delete"];
//   const publicRoutes = [
//   "/api/bookings",
// ];
// const isPublicRoute = publicRoutes.some((route) =>
//   config.url?.includes(route)
// );

// if (
//   methodsRequiringCSRF.includes(method) &&
//   !isPublicRoute
// )  {

//     const token = await getCsrfToken();

//     config.headers["CSRF-Token"] = token;

//   }


//   // if (methodsRequiringCSRF.includes(method)) {

//   //   const token = await getCsrfToken();

//   //   config.headers["CSRF-Token"] = token;

//   // }

//   return config;

// });

// ==============================
// 3. RESPONSE INTERCEPTOR (refresh ready)
// ==============================

api.interceptors.response.use(

  (response) => response,

  async (error) => {
    if (!error.response) {
  return Promise.reject(error);
}
    // if (error.response?.status === 403) {

    //   csrfTokenCache = null;

    // }
  
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