// member-app/src/api/memberHome.js

import { apiFetch } from "./api";

export async function getMemberHome(token) {
  const result = await apiFetch(
    `/member/me/home?t=${Date.now()}`,
    {
      method: "GET",
    },
    token
  );

  return result.data;
}