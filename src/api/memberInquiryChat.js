// member-app/src/api/memberInquiryChat.js

import { apiRequest } from "./request";

export async function getInquiryMessages(token, roomId) {
  const result = await apiRequest(
    `/api/member/me/inquiries/${roomId}/messages`,
    token
  );

  return result.data || result;
}

export async function sendInquiryMessage(token, roomId, message) {
  const result = await apiRequest(
    `/api/member/me/inquiries/${roomId}/messages`,
    token,
    {
      method: "POST",
      body: JSON.stringify({ message }),
    }
  );

  return result.data || result;
}

export async function markInquiryRead(token, roomId) {
  const result = await apiRequest(
    `/api/member/me/inquiries/${roomId}/read`,
    token,
    {
      method: "POST",
    }
  );

  return result.data || result;
}