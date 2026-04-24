const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

async function parseJsonSafe(res) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { message: text || "서버 응답을 읽지 못했습니다." };
  }
}

export async function getMemberInquiryDetail(token, roomId) {
  const res = await fetch(
    `${API_BASE_URL}/api/member/inquiries/${roomId}/messages`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await parseJsonSafe(res);

  if (!res.ok) {
    throw new Error(data?.message || "문의 상세를 불러오지 못했습니다.");
  }

  return data;
}

export async function sendMemberInquiryMessage(token, roomId, message) {
  const res = await fetch(
    `${API_BASE_URL}/api/member/inquiries/${roomId}/messages`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ message }),
    }
  );

  const data = await parseJsonSafe(res);

  if (!res.ok) {
    throw new Error(data?.message || "메시지 전송에 실패했습니다.");
  }

  return data;
}

export async function markMemberInquiryRead(token, roomId) {
  const res = await fetch(
    `${API_BASE_URL}/api/member/inquiries/${roomId}/read`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await parseJsonSafe(res);

  if (!res.ok) {
    throw new Error(data?.message || "읽음 처리에 실패했습니다.");
  }

  return data;
}