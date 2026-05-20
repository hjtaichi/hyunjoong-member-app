// src/api/client.js

import axios from "axios";
import { API_BASE_URL } from "../config/env";
import { getAccessToken } from "../utils/storage";
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

client.interceptors.request.use(
  async (config) => {
    const token = await getAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // ✅ 웹앱에서 GET 캐시 방지
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

export default client;