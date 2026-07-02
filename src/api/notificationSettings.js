import client from "./client";

export async function getNotificationSettings() {
  const res = await client.get("/member/me/notification-settings");
  return res.data?.data ?? res.data;
}

export async function updateNotificationSettings(payload) {
  const res = await client.patch("/member/me/notification-settings", payload);
  return res.data?.data ?? res.data;
}