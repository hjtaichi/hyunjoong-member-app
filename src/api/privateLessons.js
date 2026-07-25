import { API_BASE_URL } from "../config/env";

async function requestPrivateLesson(path, token) {
  const response = await fetch(`${API_BASE_URL}/api${path}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "개인지도 정보를 불러오지 못했습니다.");
  }

  return result.data;
}

export async function getMyPrivateLessons(token) {
  return requestPrivateLesson("/member/me/private-lessons", token);
}

export async function getMyPrivateLessonDetail(packageId, token) {
  return requestPrivateLesson(`/member/me/private-lessons/${packageId}`, token);
}