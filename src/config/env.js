// member-app/src/config/env.js

const RAW_API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  "https://unmade-whiff-treat.ngrok-free.dev";

export const API_BASE_URL = RAW_API_BASE_URL
  .replace(/\/api\/?$/, "")
  .replace(/\/$/, "");