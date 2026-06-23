import { apiFetch } from "./api";

export async function getYudanjaContent(token, type) {
  const result = await apiFetch(
    `/member/yudanja-content/${type}?t=${Date.now()}`,
    {
      method: "GET",
    },
    token
  );

  return result.data || result;
}

export async function getYudanjaLibrary(token, category) {
  const query = category ? `?category=${encodeURIComponent(category)}&t=${Date.now()}` : `?t=${Date.now()}`;

  const result = await apiFetch(
    `/member/yudanja-library${query}`,
    {
      method: "GET",
    },
    token
  );

  return result.data || result;
}

export async function getYudanjaLibraryDetail(token, id) {
  const result = await apiFetch(
    `/member/yudanja-library/${id}?t=${Date.now()}`,
    {
      method: "GET",
    },
    token
  );

  return result.data || result;
}

export async function getYudanjaTrainingItems(token) {
  const result = await apiFetch(
    `/member/yudanja-training-items?t=${Date.now()}`,
    {
      method: "GET",
    },
    token
  );

  return result.data || result;
}
export async function getMyYudanjaRecords(token) {
  const result = await apiFetch(
    `/member/yudanja-my-records?t=${Date.now()}`,
    {
      method: "GET",
    },
    token
  );

  return result.data || result;
}
export async function getYudanjaHome(token) {
  const result = await apiFetch(
    `/member/yudanja-home?t=${Date.now()}`,
    {
      method: "GET",
    },
    token
  );

  return result.data || result;
}