// member-app/src/config/env.js

const RAW_API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  "http://localhost:5000";

export const API_BASE_URL = RAW_API_BASE_URL
  .replace(/\/api\/?$/, "")
  .replace(/\/$/, "");