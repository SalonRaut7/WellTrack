import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5049";

const instance = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: false,
});

// helper to get tokens can be used later maybe so keeping it as it is for now(may delete later)
const getLocal = () => ({
  access: localStorage.getItem("accessToken"),
  refresh: localStorage.getItem("refreshToken"),
});

let isRefreshing = false;
let refreshQueue: { resolve: (token: string) => void; reject: (err: any) => void }[] = [];

function processQueue(err: any, token: string | null = null) {
  refreshQueue.forEach((p) => (err ? p.reject(err) : p.resolve(token!)));
  refreshQueue = [];
}

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

instance.interceptors.response.use(
  (r) => r,
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest) return Promise.reject(error);

    // if 401 from expired access token, try refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) return Promise.reject(error);

      if (isRefreshing) {
        // queue until finished
        return new Promise((resolve, reject) => {
          refreshQueue.push({
            resolve: (token: string) => {
              originalRequest.headers["Authorization"] = `Bearer ${token}`;
              resolve(instance(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;
      try {
        const resp = await instance.post("/api/Auth/refresh", refreshToken);
        const newAccess = resp.data.access;
        localStorage.setItem("accessToken", newAccess);
        processQueue(null, newAccess);
        originalRequest.headers["Authorization"] = `Bearer ${newAccess}`;
        return instance(originalRequest);
      } catch (err) {
        processQueue(err, null);
        // revoke on failure
        try { await instance.post("/api/Auth/revoke", refreshToken); } catch {}
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default instance;
