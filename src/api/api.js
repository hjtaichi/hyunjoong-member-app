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

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
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
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error("서버 응답이 지연되고 있습니다. 잠시 후 다시 시도해주세요.");
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}