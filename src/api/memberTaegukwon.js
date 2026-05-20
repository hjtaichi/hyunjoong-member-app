const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

async function parseJsonSafe(res) {
  const text = await res.text();

  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { message: text || "서버 응답을 읽지 못했습니다." };
  }
}

export async function getMemberTaegukwon(token) {
  const url = `${API_BASE_URL}/api/member/me/taegukwon?t=${Date.now()}`;

  console.log("[getMemberTaegukwon] API_BASE_URL =", API_BASE_URL);
  console.log("[getMemberTaegukwon] url =", url);
  console.log("[getMemberTaegukwon] token exists =", !!token);

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "ngrok-skip-browser-warning": "true",
    },
  });

  console.log("[getMemberTaegukwon] status =", res.status);

  const data = await parseJsonSafe(res);
  console.log("[getMemberTaegukwon] data =", data);

  if (!res.ok) {
    throw new Error(data?.message || "태극권 정보를 불러오지 못했습니다.");
  }

  return data.data || data;
}