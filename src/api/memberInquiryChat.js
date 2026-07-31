import { memberInquiryRequest } from "./memberInquiryRequest";

export async function getInquiryMessages(token, roomId) {
  const result = await memberInquiryRequest(
    `/api/member/me/inquiries/${roomId}/messages`,
    token,
    {
      method: "GET",
      fallbackMessage: "문의 메시지를 불러오지 못했습니다.",
    }
  );

  return result.data || result;
}

export async function sendInquiryMessage(token, roomId, message) {
  const result = await memberInquiryRequest(
    `/api/member/me/inquiries/${roomId}/messages`,
    token,
    {
      method: "POST",
      data: { message },
      fallbackMessage: "메시지 전송에 실패했습니다.",
    }
  );

  return result.data || result;
}

export async function markInquiryRead(token, roomId) {
  const result = await memberInquiryRequest(
    `/api/member/me/inquiries/${roomId}/read`,
    token,
    {
      method: "POST",
      fallbackMessage: "문의 읽음 처리에 실패했습니다.",
    }
  );

  return result.data || result;
}