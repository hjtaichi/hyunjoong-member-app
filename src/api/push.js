const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export async function savePushToken(pushToken, accessToken) {
  const res = await fetch(`${API_BASE_URL}/api/member/push-token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ token: pushToken }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message || "푸시 토큰 저장 실패");
  }

  return data;
}