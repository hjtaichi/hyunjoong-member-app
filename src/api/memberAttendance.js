const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

async function parseJsonSafe(res) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { message: text || "서버 응답을 읽지 못했습니다." };
  }
}

export async function getMyAttendance(token, date) {
  const query = date ? `?date=${date}` : "";
const separator = query ? "&" : "?";
const url = `${API_BASE_URL}/api/member/me/attendance${query}${separator}t=${Date.now()}`;


  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });


    const data = await parseJsonSafe(res);

    if (!res.ok) {
      throw new Error(data?.message || "출석 정보를 불러오지 못했습니다.");
    }

    return data.data || data;
  } catch (error) {
    throw error;
  }
}

export async function reserveAttendance(token, sessionId) {
  const url = `${API_BASE_URL}/api/member/me/reservations`;


  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        sessionId,
      }),
    });


    const data = await parseJsonSafe(res);

    if (!res.ok) {
      throw new Error(data?.message || "출석 예정 등록에 실패했습니다.");
    }

    return data.data || data;
  } catch (error) {
    throw error;
  }
}

export async function markAttendance(token, payload) {
  const url = `${API_BASE_URL}/api/member/me/attendance`;


  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });


    const data = await parseJsonSafe(res);

    if (!res.ok) {
      throw new Error(data?.message || "출석 처리에 실패했습니다.");
    }

    return data.data || data;
  } catch (error) {
    throw error;
  }
}

// HJTAICHI_NFC_ATTENDANCE_PHASE1
export async function markNfcAttendance(
  token,
  nfcToken
) {
  const url =
    `${API_BASE_URL}/api/member/me/attendance/nfc`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        nfcToken,
      }),
    });

    const data = await parseJsonSafe(res);

    if (!res.ok) {
      throw new Error(
        data?.message ||
          "NFC 출석 처리에 실패했습니다."
      );
    }

    return data.data || data;
  } catch (error) {
    throw error;
  }
}

// HJTAICHI_NFC_ATTENDANCE_PHASE2_SECURE
export async function markSecureNfcAttendance(
  token,
  proofToken
) {
  const url =
    `${API_BASE_URL}/api/member/me/attendance/nfc-secure`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        proofToken,
      }),
    });

    const data = await parseJsonSafe(res);

    if (!res.ok) {
      const error = new Error(
        data?.message ||
          "NFC 출석 처리에 실패했습니다."
      );

      error.status = res.status;
      error.code = data?.code;
      throw error;
    }

    return data.data || data;
  } catch (error) {
    throw error;
  }
}
export async function cancelReservation(token, sessionId) {
  const url = `${API_BASE_URL}/api/member/me/reservations/${sessionId}`;


  try {
    const res = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });


    const data = await parseJsonSafe(res);

    if (!res.ok) {
      throw new Error(data?.message || "출석 예정 취소에 실패했습니다.");
    }

    return data.data || data;
  } catch (error) {
    throw error;
  }
}

export async function cancelAttendance(token, sessionId) {
  const url = `${API_BASE_URL}/api/member/me/attendance/cancel`;


  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        sessionId,
      }),
    });


    const data = await parseJsonSafe(res);

    if (!res.ok) {
      throw new Error(data?.message || "출석 취소에 실패했습니다.");
    }

    return data.data || data;
  } catch (error) {
    throw error;
  }
}

export async function skipRecurringReservationOnce(
  token,
  { memberRecurringReservationId, date, reason }
) {
  const response = await fetch(
    `${API_BASE_URL}/api/member/me/recurring-reservation-exceptions`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        memberRecurringReservationId,
        date,
        reason: reason || "",
      }),
    }
  );

  const text = await response.text();
  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch (e) {
    throw new Error(`이번만 쉬기 처리 응답 파싱 실패: ${text.slice(0, 120)}`);
  }

  if (!response.ok || !data?.ok) {
    throw new Error(data?.message || "이번만 쉬기 처리에 실패했습니다.");
  }

  return data?.data || data;
}

export async function undoSkipRecurringReservationOnce(
  token,
  { memberRecurringReservationId, date }
) {
  const response = await fetch(
    `${API_BASE_URL}/api/member/me/recurring-reservation-exceptions`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        memberRecurringReservationId,
        date,
      }),
    }
  );

  const text = await response.text();
  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch (e) {
    throw new Error(`이번 쉬기 취소 응답 파싱 실패: ${text.slice(0, 120)}`);
  }

  if (!response.ok || !data?.ok) {
    throw new Error(data?.message || "이번 쉬기 취소에 실패했습니다.");
  }

  return data?.data || data;
}