import { apiFetch } from "./api";

export async function getMemberInquiries(token) {
  const data = await apiFetch(
    `/member/me/inquiries?t=${Date.now()}`,
    { method: "GET" },
    token
  );

  if (Array.isArray(data)) return data;
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.data?.rooms)) return data.data.rooms;
  if (Array.isArray(data.rooms)) return data.rooms;

  return [];
}

export async function getMemberInquiryDetail(token, roomId) {
  const data = await apiFetch(
    `/member/me/inquiries/${roomId}?t=${Date.now()}`,
    { method: "GET" },
    token
  );

  return data.data || data;
}

export async function sendMemberInquiryMessage(token, roomId, message) {
  const data = await apiFetch(
    `/member/me/inquiries/${roomId}/messages`,
    {
      method: "POST",
      body: JSON.stringify({ message }),
    },
    token
  );

  return data.data || data;
}

export async function markMemberInquiryRead(token, roomId) {
  return { ok: true };
}