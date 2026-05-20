import { apiFetch } from "./api";

export async function getMemberTaegukwon(token) {
  const data = await apiFetch(
    `/member/me/taegukwon?t=${Date.now()}`,
    { method: "GET" },
    token
  );

  return data.data || data;
}