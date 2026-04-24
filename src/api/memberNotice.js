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

export async function getPopupNotice(token) {
  const result = await request("/member/notices/popup", token);
  return result.data;
}

export async function hideNoticeToday(token, noticeId) {
  return request(`/member/notices/${noticeId}/hide-today`, token, {
    method: "POST",
  });
}

export async function getMemberNoticeList(token) {
  const result = await request("/member/notices", token);
  return result.data || [];
}

export async function getMemberNoticeDetail(token, noticeId) {
  const result = await request(`/member/notices/${noticeId}`, token);
  return result.data;
}