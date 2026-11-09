import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

/*
=====================================================
REQUEST INTERCEPTOR
=====================================================

Har API request ke saath JWT automatically bhejega.
*/

api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("token");

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);


/*
=====================================================
RESPONSE INTERCEPTOR
=====================================================

Agar backend 401 return kare:

1. Token remove
2. User remove
3. Login page par redirect
*/

api.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {
    if (
      error.response?.status === 401
    ) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      /*
      Login request ko exception do.

      Agar /auth/login khud 401 return kare,
      to user ko login page se redirect karne
      ki zarurat nahi.
      */

      const requestUrl =
        error.config?.url || "";

      if (
        !requestUrl.includes(
          "/auth/login"
        )
      ) {
        window.location.href =
          "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;