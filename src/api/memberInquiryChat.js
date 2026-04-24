const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

async function request(path, token, options = {}) {
  const res = await fetch(`${API_BASE_URL}/api${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.message || "요청 실패");
  }

  return result;
}

export async function getInquiryMessages(token, roomId) {
  return request(`/member/inquiries/${roomId}/messages`, token);
}

export async function sendInquiryMessage(token, roomId, message) {
  return request(`/member/inquiries/${roomId}/messages`, token, {
    method: "POST",
    body: JSON.stringify({ message }),
  });
}

export async function markInquiryRead(token, roomId) {
  return request(`/member/inquiries/${roomId}/read`, token, {
    method: "POST",
  });
}