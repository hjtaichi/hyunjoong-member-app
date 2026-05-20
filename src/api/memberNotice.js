// member-app/src/api/memberNotice.js

import { apiRequest } from "./request";

export async function getPopupNotice(token) {
  const result = await apiRequest("/api/member/notices/popup", token);
  return result.data;
}

export async function hideNoticeToday(token, noticeId) {
  const result = await apiRequest(
    `/api/member/notices/${noticeId}/hide-today`,
    token,
    {
      method: "POST",
    }
  );

  return result.data || result;
}

export async function getMemberNoticeList(token) {
  const result = await apiRequest("/api/member/notices", token);
  return result.data || [];
}

export async function getMemberNoticeDetail(token, noticeId) {
  const result = await apiRequest(`/api/member/notices/${noticeId}`, token);
  return result.data;
}