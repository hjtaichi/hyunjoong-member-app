const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

async function parseJsonSafe(res) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { message: text || "서버 응답을 읽지 못했습니다." };
  }
}

export async function createMemberInquiry(token, payload = {}) {
  const res = await fetch(`${API_BASE_URL}/api/member/inquiries`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await parseJsonSafe(res);

  if (!res.ok) {
    throw new Error(data?.message || "문의 등록에 실패했습니다.");
  }

  return data.data || data;
}