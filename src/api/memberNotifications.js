import { API_BASE_URL } from "../config/env";

export function normalizeMemberNotification(
  item
) {
  const safeItem =
    item &&
    typeof item === "object"
      ? item
      : {};

  const createdAt =
    safeItem.createdAt ??
    safeItem.created_at ??
    safeItem.timestamp ??
    safeItem.sentAt ??
    null;

  return {
    ...safeItem,
    message:
      safeItem.message ??
      safeItem.body ??
      "",
    createdAt,
  };
}

export async function getMemberNotifications(token) {
  const res = await fetch(`${API_BASE_URL}/api/me/notifications?t=${Date.now()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await res.json();

  if (!res.ok) {
    throw new Error(result?.message || "알림 조회 실패");
  }

  const items = Array.isArray(
    result.data
  )
    ? result.data
    : [];

  return items.map(
    normalizeMemberNotification
  );
}

export async function markMemberNotificationRead(token, notificationId) {
  const res = await fetch(
    `${API_BASE_URL}/api/me/notifications/${notificationId}/read`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const result = await res.json();

  if (!res.ok) {
    throw new Error(result?.message || "알림 읽음 처리 실패");
  }

  return result;
}