import { API_BASE_URL } from "../config/env";

export async function getMemberNotifications(token) {
  const res = await fetch(`${API_BASE_URL}/api/me/notifications?t=${Date.now()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "ngrok-skip-browser-warning": "true",
    },
  });

  const result = await res.json();

  if (!res.ok) {
    throw new Error(result?.message || "알림 조회 실패");
  }

  return result.data || [];
}

export async function markMemberNotificationRead(token, notificationId) {
  const res = await fetch(
    `${API_BASE_URL}/api/me/notifications/${notificationId}/read`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
    }
  );

  const result = await res.json();

  if (!res.ok) {
    throw new Error(result?.message || "알림 읽음 처리 실패");
  }

  return result;
}