import { memberInquiryRequest } from "./memberInquiryRequest";

export async function getMemberInquiries(token) {
  const data = await memberInquiryRequest(
    "/api/member/me/inquiries",
    token,
    {
      method: "GET",
      fallbackMessage: "문의 목록을 불러오지 못했습니다.",
    }
  );

  if (Array.isArray(data)) return data;
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.data?.rooms)) return data.data.rooms;
  if (Array.isArray(data.rooms)) return data.rooms;

  return [];
}

export async function getMemberInquiryDetail(token, roomId) {
  const data = await memberInquiryRequest(
    `/api/member/me/inquiries/${roomId}`,
    token,
    {
      method: "GET",
      fallbackMessage: "문의 상세를 불러오지 못했습니다.",
    }
  );

  return data.data || data;
}

export async function sendMemberInquiryMessage(token, roomId, message) {
  const data = await memberInquiryRequest(
    `/api/member/me/inquiries/${roomId}/messages`,
    token,
    {
      method: "POST",
      data: { message },
      fallbackMessage: "메시지 전송에 실패했습니다.",
    }
  );

  return data.data || data;
}

export async function markMemberInquiryRead(token, roomId) {
  const data = await memberInquiryRequest(
    `/api/member/me/inquiries/${roomId}/read`,
    token,
    {
      method: "POST",
      fallbackMessage: "문의 읽음 처리에 실패했습니다.",
    }
  );

  return data.data || data;
}