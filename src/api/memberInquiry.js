import { apiRequest } from "./request";

export async function getMemberInquiries(token) {
  const data = await apiRequest("/api/member/me/inquiries", token);

  console.log("🔥 getMemberInquiries raw:", data);

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data.data)) {
    return data.data;
  }

  if (Array.isArray(data.data?.rooms)) {
    return data.data.rooms;
  }

  if (Array.isArray(data.rooms)) {
    return data.rooms;
  }

  return [];
}

export async function getMemberInquiryDetail(token, roomId) {
  const data = await apiRequest(`/api/member/me/inquiries/${roomId}`, token);
  return data.data || data;
}

export async function sendMemberInquiryMessage(token, roomId, message) {
  const data = await apiRequest(
    `/api/member/me/inquiries/${roomId}/messages`,
    token,
    {
      method: "POST",
      body: JSON.stringify({ message }),
    }
  );

  return data.data || data;
}

export async function markMemberInquiryRead(token, roomId) {
  return { ok: true };
}