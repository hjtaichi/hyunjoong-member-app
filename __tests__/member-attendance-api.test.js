import {
  getMyAttendance,
  reserveAttendance,
  markAttendance,
  cancelReservation,
  cancelAttendance,
  skipRecurringReservationOnce,
  undoSkipRecurringReservationOnce,
} from "../src/api/memberAttendance";
import {
  getRecurringReservations,
  saveRecurringReservations,
} from "../src/api/memberRecurringReservations";
import { apiRequest } from "../src/api/request";

jest.mock("../src/api/request", () => ({
  apiRequest: jest.fn(),
}));

function makeResponse({
  ok = true,
  status = 200,
  body = {},
} = {}) {
  const text =
    typeof body === "string"
      ? body
      : JSON.stringify(body);

  return {
    ok,
    status,
    text: jest.fn().mockResolvedValue(text),
  };
}

describe("회원 출석·예약 API", () => {
  const apiBaseUrl =
    process.env.EXPO_PUBLIC_API_BASE_URL;

  let originalFetch;
  let dateNowSpy;
  let consoleLogSpy;

  beforeAll(() => {
    originalFetch = global.fetch;
    global.fetch = jest.fn();

    dateNowSpy = jest.spyOn(Date, "now");

    consoleLogSpy = jest
      .spyOn(console, "log")
      .mockImplementation(() => {});
  });

  afterAll(() => {
    global.fetch = originalFetch;
    dateNowSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    dateNowSpy.mockReturnValue(1234567890);
  });

  test("날짜별 출석을 Bearer 토큰으로 조회한다", async () => {
    global.fetch.mockResolvedValue(
      makeResponse({
        body: {
          data: {
            items: [{ sessionId: "session-1" }],
          },
        },
      })
    );

    const result = await getMyAttendance(
      "member-token",
      "2026-07-16"
    );

    expect(global.fetch).toHaveBeenCalledWith(
      `${apiBaseUrl}/api/member/me/attendance?date=2026-07-16&t=1234567890`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer member-token",
        },
      }
    );

    expect(result).toEqual({
      items: [{ sessionId: "session-1" }],
    });
  });

  test("날짜가 없을 때도 캐시 방지값을 붙여 조회한다", async () => {
    global.fetch.mockResolvedValue(
      makeResponse({
        body: {
          items: [],
        },
      })
    );

    const result = await getMyAttendance(
      "member-token"
    );

    expect(global.fetch).toHaveBeenCalledWith(
      `${apiBaseUrl}/api/member/me/attendance?t=1234567890`,
      expect.objectContaining({
        method: "GET",
      })
    );

    expect(result).toEqual({
      items: [],
    });
  });

  test("출석 예정 등록 요청에 세션 ID를 전달한다", async () => {
    global.fetch.mockResolvedValue(
      makeResponse({
        body: {
          data: {
            status: "reserved",
          },
        },
      })
    );

    const result = await reserveAttendance(
      "member-token",
      "session-20"
    );

    expect(global.fetch).toHaveBeenCalledWith(
      `${apiBaseUrl}/api/member/me/reservations`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer member-token",
        },
        body: JSON.stringify({
          sessionId: "session-20",
        }),
      }
    );

    expect(result.status).toBe("reserved");
  });

  test("QR 출석 처리 본문을 그대로 전달한다", async () => {
    global.fetch.mockResolvedValue(
      makeResponse({
        body: {
          data: {
            status: "present",
          },
        },
      })
    );

    const result = await markAttendance(
      "qr-token",
      {
        sessionId: "session-30",
      }
    );

    expect(global.fetch).toHaveBeenCalledWith(
      `${apiBaseUrl}/api/member/me/attendance`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer qr-token",
        },
        body: JSON.stringify({
          sessionId: "session-30",
        }),
      }
    );

    expect(result.status).toBe("present");
  });

  test("일반 출석 예정은 세션 경로로 취소한다", async () => {
    global.fetch.mockResolvedValue(
      makeResponse({
        body: {
          data: {
            cancelled: true,
          },
        },
      })
    );

    await cancelReservation(
      "member-token",
      "session-40"
    );

    expect(global.fetch).toHaveBeenCalledWith(
      `${apiBaseUrl}/api/member/me/reservations/session-40`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer member-token",
        },
      }
    );
  });

  test("완료된 출석 취소는 전용 API로 요청한다", async () => {
    global.fetch.mockResolvedValue(
      makeResponse({
        body: {
          data: {
            status: "reserved",
          },
        },
      })
    );

    const result = await cancelAttendance(
      "member-token",
      "session-50"
    );

    expect(global.fetch).toHaveBeenCalledWith(
      `${apiBaseUrl}/api/member/me/attendance/cancel`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer member-token",
        },
        body: JSON.stringify({
          sessionId: "session-50",
        }),
      }
    );

    expect(result.status).toBe("reserved");
  });

  test("정기예약 이번만 쉬기를 POST 요청한다", async () => {
    global.fetch.mockResolvedValue(
      makeResponse({
        body: {
          ok: true,
          data: {
            exceptionType: "skip",
          },
        },
      })
    );

    const result =
      await skipRecurringReservationOnce(
        "member-token",
        {
          memberRecurringReservationId: 101,
          date: "2026-07-18",
          reason: "",
        }
      );

    expect(global.fetch).toHaveBeenCalledWith(
      `${apiBaseUrl}/api/member/me/recurring-reservation-exceptions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer member-token",
        },
        body: JSON.stringify({
          memberRecurringReservationId: 101,
          date: "2026-07-18",
          reason: "",
        }),
      }
    );

    expect(result.exceptionType).toBe("skip");
  });

  test("정기예약 이번 쉬기 취소를 DELETE 요청한다", async () => {
    global.fetch.mockResolvedValue(
      makeResponse({
        body: {
          ok: true,
          data: {
            restored: true,
          },
        },
      })
    );

    const result =
      await undoSkipRecurringReservationOnce(
        "member-token",
        {
          memberRecurringReservationId: 102,
          date: "2026-07-19",
        }
      );

    expect(global.fetch).toHaveBeenCalledWith(
      `${apiBaseUrl}/api/member/me/recurring-reservation-exceptions`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer member-token",
        },
        body: JSON.stringify({
          memberRecurringReservationId: 102,
          date: "2026-07-19",
        }),
      }
    );

    expect(result.restored).toBe(true);
  });

  test("서버가 보낸 출석·예약 실패 메시지를 유지한다", async () => {
    global.fetch.mockResolvedValue(
      makeResponse({
        ok: false,
        status: 409,
        body: {
          message: "예약 가능한 시간이 지났습니다.",
        },
      })
    );

    await expect(
      reserveAttendance(
        "member-token",
        "session-60"
      )
    ).rejects.toThrow(
      "예약 가능한 시간이 지났습니다."
    );
  });

  test("JSON이 아닌 실패 응답도 오류 메시지로 처리한다", async () => {
    global.fetch.mockResolvedValue(
      makeResponse({
        ok: false,
        status: 502,
        body: "proxy failure",
      })
    );

    await expect(
      markAttendance(
        "member-token",
        {
          sessionId: "session-70",
        }
      )
    ).rejects.toThrow("proxy failure");
  });

  test("현재 정기출석 설정을 인증 요청으로 조회한다", async () => {
    apiRequest.mockResolvedValue({
      data: {
        items: [
          {
            weekday: 2,
            sessionTimeKey: "AM_10",
          },
        ],
      },
    });

    const result =
      await getRecurringReservations(
        "member-token"
      );

    expect(apiRequest).toHaveBeenCalledWith(
      "/api/member/me/recurring-reservations",
      "member-token"
    );

    expect(result.items).toHaveLength(1);
  });

  test("정기출석 설정을 PUT 본문으로 저장한다", async () => {
    const payload = {
      items: [
        {
          weekday: 6,
          sessionTimeKey: "PM_130",
        },
      ],
    };

    apiRequest.mockResolvedValue({
      data: {
        saved: true,
      },
    });

    const result =
      await saveRecurringReservations(
        "member-token",
        payload
      );

    expect(apiRequest).toHaveBeenCalledWith(
      "/api/member/me/recurring-reservations",
      "member-token",
      {
        method: "PUT",
        body: JSON.stringify(payload),
      }
    );

    expect(result.saved).toBe(true);
  });
});