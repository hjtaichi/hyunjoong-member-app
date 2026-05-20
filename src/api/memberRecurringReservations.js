// member-app/src/api/memberRecurringReservations.js

import { apiRequest } from "./request";

export async function getRecurringReservations(token) {
  const data = await apiRequest(
    "/api/member/me/recurring-reservations",
    token
  );

  return data.data || data;
}

export async function saveRecurringReservations(token, payload) {
  const data = await apiRequest(
    "/api/member/me/recurring-reservations",
    token,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    }
  );

  return data.data || data;
}