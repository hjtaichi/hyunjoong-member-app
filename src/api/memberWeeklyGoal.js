import { apiFetch } from "./api";

export async function getMemberWeeklyGoal(token) {
  const result = await apiFetch(
    `/member/me/weekly-goal?t=${Date.now()}`,
    {
      method: "GET",
    },
    token,
  );

  return result.data;
}

export async function saveMemberWeeklyGoalSettings(
  token,
  payload,
) {
  const result = await apiFetch(
    "/member/me/weekly-goal",
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
    token,
  );

  return result.data;
}

export async function importMemberWeeklyGoalState(
  token,
  state,
) {
  const result = await apiFetch(
    "/member/me/weekly-goal/import",
    {
      method: "POST",
      body: JSON.stringify({
        state,
      }),
    },
    token,
  );

  return result.data;
}
