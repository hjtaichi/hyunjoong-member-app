// member-app/src/api/memberCalendar.js

import { apiFetch } from "./api";

export async function getMemberCalendar(token, year, month) {
  const result = await apiFetch(
    `/member/me/calendar?year=${year}&month=${month}&t=${Date.now()}`,
    {
      method: "GET",
    },
    token
  );

  return result.data;
}

export async function getMemberCalendarSummary(token, year, month) {
  const result = await apiFetch(
    `/member/me/calendar-summary?year=${year}&month=${month}&t=${Date.now()}`,
    {
      method: "GET",
    },
    token
  );

  return result.data;
}