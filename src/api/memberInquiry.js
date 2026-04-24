const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

async function parseJsonSafe(res) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { message: text || "서버 응답을 읽지 못했습니다." };
  }
}

export async function getMemberInquiries(token) {
  const res = await fetch(`${API_BASE_URL}/api/member/inquiries`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await parseJsonSafe(res);

  if (!res.ok) {
    throw new Error(data?.message || "문의 목록을 불러오지 못했습니다.");
  }

  return data.data || [];
}