import { API_BASE_URL } from "../config/env";

async function requestCustomPractice(path, token, options = {}) {
  const response = await fetch(`${API_BASE_URL}/api${path}`, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body:
      options.body === undefined
        ? undefined
        : JSON.stringify(options.body),
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      result.message || "개별수련 정보를 처리하지 못했습니다."
    );
  }

  return result.data ?? result;
}

export function getMyCustomPractices(token) {
  return requestCustomPractice("/member/me/custom-practices", token);
}

export function getMyCustomPractice(practiceId, token) {
  return requestCustomPractice(
    `/member/me/custom-practices/${encodeURIComponent(practiceId)}`,
    token
  );
}

export function createMyCustomPractice(payload, token) {
  return requestCustomPractice("/member/me/custom-practices", token, {
    method: "POST",
    body: payload,
  });
}

export function updateMyCustomPractice(practiceId, payload, token) {
  return requestCustomPractice(
    `/member/me/custom-practices/${encodeURIComponent(practiceId)}`,
    token,
    {
      method: "PATCH",
      body: payload,
    }
  );
}

export function createMyCustomPracticeRecord(practiceId, payload, token) {
  return requestCustomPractice(
    `/member/me/custom-practices/${encodeURIComponent(practiceId)}/records`,
    token,
    {
      method: "POST",
      body: payload,
    }
  );
}

export function deleteMyCustomPracticeRecord(recordId, token) {
  return requestCustomPractice(
    `/member/me/custom-practice-records/${encodeURIComponent(recordId)}`,
    token,
    {
      method: "DELETE",
    }
  );
}
