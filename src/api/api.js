// member-app/src/api/api.js

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

async function parseJsonSafe(res) {
  const text = await res.text();

  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { message: text || "서버 응답을 읽지 못했습니다." };
  }
}

export async function apiFetch(path, options = {}, token) {
  const url = `${API_BASE_URL}/api${path}`;

  const res = await fetch(url, {
    ...options,

    // ✅ 웹앱 캐시 방지
    cache: "no-store",

    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",

      // ✅ 웹 캐시 방지
      "Cache-Control": "no-cache",
      Pragma: "no-cache",

      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const data = await parseJsonSafe(res);

  if (!res.ok) {
    throw new Error(data?.message || "요청 실패");
  }

  return data;
}