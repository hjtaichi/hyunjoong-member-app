// src/utils/clientLogger.js

import { API_BASE_URL } from "../config/env";

const CLIENT_LOG_ENDPOINT = `${API_BASE_URL}/api/client-logs`;

function safeString(value, maxLength = 500) {
  if (value == null) return value;

  const text = String(value);
  if (text.length <= maxLength) return text;

  return `${text.slice(0, maxLength)}...`;
}

function sanitizeExtra(extra = {}) {
  const safeExtra = {};

  Object.entries(extra || {}).forEach(([key, value]) => {
    const lowerKey = String(key).toLowerCase();

if (
  lowerKey === "token" ||
  lowerKey === "accesstoken" ||
  lowerKey === "refreshtoken" ||
  lowerKey.includes("password") ||
  lowerKey.includes("authorization") ||
  lowerKey === "cookie" ||
  lowerKey === "cookies"
) {
  return "[hidden]";
}

    if (typeof value === "string") {
      safeExtra[key] = safeString(value, 500);
      return;
    }

    safeExtra[key] = value;
  });

  return safeExtra;
}

export async function sendClientLog({
  level = "info",
  screen = "unknown",
  message = "",
  extra = {},
} = {}) {
  try {
    const userAgent =
      typeof navigator !== "undefined" ? navigator.userAgent : "";

    const platform =
      typeof navigator !== "undefined" ? navigator.platform : "";

    const language =
      typeof navigator !== "undefined" ? navigator.language : "";

    const online =
      typeof navigator !== "undefined" ? navigator.onLine : null;

    const standalone =
      typeof window !== "undefined" && window.navigator
        ? window.navigator.standalone === true
        : false;

    await fetch(CLIENT_LOG_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        level,
        screen,
        message: safeString(message, 300),
        extra: sanitizeExtra(extra),
        device: {
          userAgent,
          platform,
          language,
          online,
          standalone,
        },
        createdAt: new Date().toISOString(),
      }),
    });
  } catch (error) {
    // 로그 전송 실패 때문에 앱 기능이 멈추면 안 되므로 조용히 무시
  }
}