// member-app/src/api/memberInquiryCreate.js

import { apiRequest } from "./request";

export async function createMemberInquiry(token, payload = {}) {
  const data = await apiRequest("/api/member/me/inquiries", token, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return data.data || data;
}