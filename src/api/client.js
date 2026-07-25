// src/api/client.js

import axios from "axios";
import { API_BASE_URL } from "../config/env";
import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  clearAuthStorage,
} from "../utils/storage";


const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
    Expires: "0",
  },
});

let isRefreshing = false;
let refreshQueue = [];

function resolveRefreshQueue(newToken) {
  refreshQueue.forEach(({ resolve }) => resolve(newToken));
  refreshQueue = [];
}

function rejectRefreshQueue(error) {
  refreshQueue.forEach(({ reject }) => reject(error));
  refreshQueue = [];
}

function isPublicAuthRequest(url) {
  const value = String(url || "");

  return [
    "/api/auth/login",
    "/api/auth/register",
    "/api/auth/refresh",
  ].some((path) => value.includes(path));
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

    if (
      !originalRequest ||
      status !== 401 ||
      originalRequest._retry ||
      isPublicAuthRequest(originalRequest.url)
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({
          resolve: (newToken) => {
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(client(originalRequest));
          },
          reject,
        });
      });
    }

    isRefreshing = true;

    try {
      const refreshToken = await getRefreshToken();

      if (!refreshToken) {
        await clearAuthStorage();
        rejectRefreshQueue(error);
        return Promise.reject(error);
      }

      const refreshRes = await axios.post(
        `${API_BASE_URL}/api/auth/refresh`,
        { refreshToken },
        {
          headers: {
          },
        }
      );

      const payload = refreshRes.data?.data ?? refreshRes.data ?? {};
      const newAccessToken = payload?.accessToken || payload?.token;

      if (!newAccessToken) {
        await clearAuthStorage();
        rejectRefreshQueue(error);
        return Promise.reject(error);
      }

      await setAccessToken(newAccessToken);

      resolveRefreshQueue(newAccessToken);

      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      return client(originalRequest);
    } catch (refreshError) {
      await clearAuthStorage();
      rejectRefreshQueue(refreshError);
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default client;
