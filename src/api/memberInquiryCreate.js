import { memberInquiryRequest } from "./memberInquiryRequest";

export async function createMemberInquiry(token, payload = {}) {
  const data = await memberInquiryRequest(
    "/api/member/me/inquiries",
    token,
    {
      method: "POST",
      data: payload,
      fallbackMessage: "문의방을 열지 못했습니다.",
    }
  );

  return data.data || data;
}