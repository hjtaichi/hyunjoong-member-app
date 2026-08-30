import {
  markNfcAttendance,
} from "../src/api/memberAttendance";

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

describe("member NFC attendance API", () => {
  const apiBaseUrl =
    process.env.EXPO_PUBLIC_API_BASE_URL;

  let originalFetch;

  beforeAll(() => {
    originalFetch = global.fetch;
    global.fetch = jest.fn();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Bearer 인증과 NFC station token을 전송한다", async () => {
    global.fetch.mockResolvedValue(
      makeResponse({
        body: {
          data: {
            status: "present",
            attendanceMethod: "NFC",
          },
        },
      })
    );

    const result = await markNfcAttendance(
      "member-token",
      "hjtaichi_test_station_0123456789abcdef"
    );

    expect(global.fetch).toHaveBeenCalledWith(
      `${apiBaseUrl}/api/member/me/attendance/nfc`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer member-token",
        },
        body: JSON.stringify({
          nfcToken:
            "hjtaichi_test_station_0123456789abcdef",
        }),
      }
    );

    expect(result).toEqual({
      status: "present",
      attendanceMethod: "NFC",
    });
  });

  test("서버 오류 메시지를 그대로 전달한다", async () => {
    global.fetch.mockResolvedValue(
      makeResponse({
        ok: false,
        status: 400,
        body: {
          message:
            "현재 NFC 출석 가능한 수업이 없습니다.",
        },
      })
    );

    await expect(
      markNfcAttendance(
        "member-token",
        "hjtaichi_test_station_0123456789abcdef"
      )
    ).rejects.toThrow(
      "현재 NFC 출석 가능한 수업이 없습니다."
    );
  });
});