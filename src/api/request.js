// member-app/src/api/request.js

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export async function parseJsonSafe(res) {
  const text = await res.text();

  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return {
      message: text || "서버 응답을 읽지 못했습니다.",
    };
  }
}

export async function apiRequest(path, token, options = {}) {
  const method = options.method || "GET";

  const shouldAddTimestamp = method === "GET";
  const separator = path.includes("?") ? "&" : "?";
  const finalPath = shouldAddTimestamp
    ? `${path}${separator}t=${Date.now()}`
    : path;

  const res = await fetch(`${API_BASE_URL}${finalPath}`, {
    ...options,
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "ngrok-skip-browser-warning": "true",
      ...(options.headers || {}),
    },
  });

  const data = await parseJsonSafe(res);

  if (!res.ok) {
    throw new Error(data?.message || "요청에 실패했습니다.");
  }

  return data;
}