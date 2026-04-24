const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

async function parseJsonSafe(res) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { message: text || "서버 응답을 읽지 못했습니다." };
  }
}

export async function getMemberCalendar(token, year, month) {
  const res = await fetch(
    `${API_BASE_URL}/api/member/me/calendar?year=${year}&month=${month}&t=${Date.now()}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await parseJsonSafe(res);

  if (!res.ok) {
    throw new Error(data?.message || "달력 정보를 불러오지 못했습니다.");
  }

  return data.data;
}