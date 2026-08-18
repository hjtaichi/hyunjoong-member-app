import client from "./client";

function getAuthConfig(token) {
  if (!token) return undefined;

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}

export async function getMyHistoryEvents(token) {
  const response = await client.get(
    "/api/member/me/history-events",
    getAuthConfig(token)
  );

  const data = response.data?.data ?? response.data ?? [];

  return Array.isArray(data) ? data : [];
}

export async function getCommonHistoryMilestones(token) {
  const response = await client.get(
    "/api/member/history-milestones",
    getAuthConfig(token)
  );

  const data = response.data?.data ?? response.data ?? [];

  return Array.isArray(data) ? data : [];
}
