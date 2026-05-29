import { apiFetch } from "./api";

export async function getMyHistoryEvents(token) {
  const data = await apiFetch(
    "/member/me/history-events",
    { method: "GET" },
    token
  );

  return data.data || [];
}

export async function getCommonHistoryMilestones(token) {
  const data = await apiFetch(
    "/member/history-milestones",
    { method: "GET" },
    token
  );

  return data.data || [];
}