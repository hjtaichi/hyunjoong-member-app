// src/api/client.js

import axios from "axios";
import { API_BASE_URL } from "../config/env";
import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  clearAuthStorage,
} from "../utils/storage";

console.log("🔥 API_BASE_URL:", API_BASE_URL);

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "ngrok-skip-browser-warning": "true",
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
    Expires: "0",
  },
});

let isRefreshing = false;
let refreshQueue = [];

function resolveRefreshQueue(newToken) {
  refreshQueue.forEach((callback) => callback(newToken));
  refreshQueue = [];
}

client.interceptors.request.use(
  async (config) => {
    const token = await getAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (String(config.method || "get").toLowerCase() === "get") {
      config.params = {
        ...(config.params || {}),
        t: Date.now(),
      };
    }

    return config;
  },
  (error) => Promise.reject(error)
);

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config;
    const status = error?.response?.status;

    if (!originalRequest || status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (String(originalRequest.url || "").includes("/api/auth/refresh")) {
      await clearAuthStorage();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve) => {
        refreshQueue.push((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          resolve(client(originalRequest));
        });
      });
    }

    isRefreshing = true;

    try {
      const refreshToken = await getRefreshToken();

      if (!refreshToken) {
        await clearAuthStorage();
        return Promise.reject(error);
      }

      const refreshRes = await axios.post(
        `${API_BASE_URL}/api/auth/refresh`,
        { refreshToken },
        {
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      const payload = refreshRes.data?.data ?? refreshRes.data ?? {};
      const newAccessToken = payload?.accessToken || payload?.token;

      if (!newAccessToken) {
        await clearAuthStorage();
        return Promise.reject(error);
      }

      await setAccessToken(newAccessToken);

      resolveRefreshQueue(newAccessToken);

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      return client(originalRequest);
    } catch (refreshError) {
      await clearAuthStorage();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default client;