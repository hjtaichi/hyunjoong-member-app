import React from "react";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";

import {
  router,
  useLocalSearchParams,
} from "expo-router";
import {
  useAuth,
} from "../src/contexts/AuthContext";
import {
  markNfcAttendance,
} from "../src/api/memberAttendance";
import NfcAttendanceScreen from "../app/nfc-attendance";

jest.mock("expo-router", () => ({
  router: {
    replace: jest.fn(),
  },
  useLocalSearchParams: jest.fn(),
}));

jest.mock("../src/contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));

jest.mock("../src/api/memberAttendance", () => ({
  markNfcAttendance: jest.fn(),
}));

describe("NFC attendance screen", () => {
  let timeoutSpy;
  let scheduledRedirect;
  let realSetTimeout;

  beforeAll(() => {
    realSetTimeout = global.setTimeout;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    scheduledRedirect = null;

    useLocalSearchParams.mockReturnValue({
      token:
        "hjtaichi_test_station_0123456789abcdef",
    });

    useAuth.mockReturnValue({
      token: "member-access-token",
      isAuthenticated: true,
      isBootLoading: false,
    });

    markNfcAttendance.mockResolvedValue({
      status: "present",
      attendanceMethod: "NFC",
    });

    timeoutSpy = jest
      .spyOn(global, "setTimeout")
      .mockImplementation(
        (callback, delay, ...args) => {
          if (delay === 1200) {
            scheduledRedirect = callback;
            return 1200;
          }

          return realSetTimeout(
            callback,
            delay,
            ...args
          );
        }
      );
  });

  afterEach(() => {
    timeoutSpy.mockRestore();
  });

  test("auth 복원 중에는 제출하지 않는다", async () => {
    useAuth.mockReturnValue({
      token: null,
      isAuthenticated: false,
      isBootLoading: true,
    });

    await render(<NfcAttendanceScreen />);

    expect(markNfcAttendance).not.toHaveBeenCalled();
    expect(router.replace).not.toHaveBeenCalled();
  });

  test("로그아웃 상태면 NFC token을 로그인으로 넘긴다", async () => {
    useAuth.mockReturnValue({
      token: null,
      isAuthenticated: false,
      isBootLoading: false,
    });

    await render(<NfcAttendanceScreen />);

    await waitFor(() => {
      expect(router.replace).toHaveBeenCalledWith({
        pathname: "/login",
        params: {
          nfcAttendanceToken:
            "hjtaichi_test_station_0123456789abcdef",
        },
      });
    });

    expect(markNfcAttendance).not.toHaveBeenCalled();
  });

  test("NFC 출석을 정확히 한 번 요청한다", async () => {
    await render(<NfcAttendanceScreen />);

    await waitFor(() => {
      expect(markNfcAttendance).toHaveBeenCalledWith(
        "member-access-token",
        "hjtaichi_test_station_0123456789abcdef"
      );
    });

    expect(markNfcAttendance).toHaveBeenCalledTimes(1);
    expect(
      await screen.findByText("출석되었습니다.")
    ).toBeTruthy();
  });

  test("성공 후 홈으로 이동한다", async () => {
    await render(<NfcAttendanceScreen />);

    await waitFor(() => {
      expect(scheduledRedirect).toEqual(
        expect.any(Function)
      );
    });

    await act(async () => {
      scheduledRedirect();
    });

    expect(router.replace).toHaveBeenCalledWith({
      pathname: "/(tabs)/home",
      params: {
        attendanceResult: "success",
      },
    });
  });

  test("서버 오류를 표시하고 홈 버튼을 남긴다", async () => {
    markNfcAttendance.mockRejectedValue(
      new Error(
        "현재 NFC 출석 가능한 수업이 없습니다."
      )
    );

    await render(<NfcAttendanceScreen />);

    expect(
      await screen.findByText(
        "현재 NFC 출석 가능한 수업이 없습니다."
      )
    ).toBeTruthy();

    fireEvent.press(
      screen.getByText("홈으로 이동")
    );

    expect(router.replace).toHaveBeenCalledWith(
      "/(tabs)/home"
    );
  });
});