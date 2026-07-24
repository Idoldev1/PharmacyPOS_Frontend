import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "../store/authStore";
import type { AuthToken } from "../types/auth.types";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

interface RetryableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Requests to these endpoints must never trigger a refresh-and-retry — a 401 from
// them means "bad credentials"/"invalid or expired token", not "access token expired".
const NO_REFRESH_ENDPOINTS = ["/auth/login", "/auth/signup", "/auth/refresh"];

let isRefreshing = false;
let refreshWaiters: ((token: string | null) => void)[] = [];

function onRefreshed(token: string | null) {
  refreshWaiters.forEach((resolve) => resolve(token));
  refreshWaiters = [];
}

function logout() {
  useAuthStore.getState().clearAuth();
  window.location.href = "/login";
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableConfig | undefined;
    const message = (error.response?.data as { error?: string } | undefined)?.error ?? error.message;
    const skipRefresh = NO_REFRESH_ENDPOINTS.some((url) => originalRequest?.url?.includes(url));

    if (error.response?.status !== 401 || !originalRequest || skipRefresh || originalRequest._retry) {
      if (error.response?.status === 401 && !skipRefresh) logout();
      return Promise.reject(new Error(message));
    }

    const refreshToken = useAuthStore.getState().refreshToken;
    if (!refreshToken) {
      logout();
      return Promise.reject(new Error(message));
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshWaiters.push((newToken) => {
          if (!newToken) {
            reject(new Error(message));
            return;
          }
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          resolve(api(originalRequest));
        });
      });
    }

    isRefreshing = true;
    try {
      const { data } = await axios.post<AuthToken>(`${baseURL}/auth/refresh`, { token: refreshToken });
      useAuthStore.getState().setAuth(data.user, data.accessToken, data.refreshToken);
      onRefreshed(data.accessToken);
      originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
      return await api(originalRequest);
    } catch (refreshError) {
      onRefreshed(null);
      logout();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
