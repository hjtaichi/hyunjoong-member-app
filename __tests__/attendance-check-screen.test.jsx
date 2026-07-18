import React from "react";
import { Alert } from "react-native";
import {
  act,
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react-native";

import {
  router,
  useLocalSearchParams,
} from "expo-router";
import { useAuth } from "../src/contexts/AuthContext";
import { markAttendance } from "../src/api/memberAttendance";
import AttendanceCheckScreen from "../app/attendance-check";

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
  markAttendance: jest.fn(),
}));

describe("QR 링크 출석 확인 화면", () => {
  let alertSpy;
  let timeoutSpy;
  let scheduledRedirect;
  let realSetTimeout;

  beforeAll(() => {
    realSetTimeout = global.setTimeout;

    alertSpy = jest
      .spyOn(Alert, "alert")
      .mockImplementation(() => {});
  });

  afterAll(() => {
    alertSpy.mockRestore();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    scheduledRedirect = null;

    useLocalSearchParams.mockReturnValue({
      sessionId: "session-100",
    });

    useAuth.mockReturnValue({
      token: "member-token",
      isAuthenticated: true,
      isBootLoading: false,
    });

    markAttendance.mockResolvedValue({
      status: "present",
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

  test("인증 복원 중에는 출석 API를 호출하지 않는다", async () => {
    useAuth.mockReturnValue({
      token: null,
      isAuthenticated: false,
      isBootLoading: true,
    });

    await render(<AttendanceCheckScreen />);

    expect(
      screen.getByText(
        "출석 정보를 확인하는 중입니다."
      )
    ).toBeTruthy();

    expect(markAttendance).not.toHaveBeenCalled();
    expect(Alert.alert).not.toHaveBeenCalled();
  });

  test("비로그인 회원에게 로그인 안내를 표시한다", async () => {
    useAuth.mockReturnValue({
      token: null,
      isAuthenticated: false,
      isBootLoading: false,
    });

    await render(<AttendanceCheckScreen />);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "로그인이 필요합니다",
        "로그인 후 다시 QR을 스캔해주세요.",
        expect.any(Array)
      );
    });

    expect(markAttendance).not.toHaveBeenCalled();

    const buttons =
      Alert.alert.mock.calls[0][2];

    await act(async () => {
      buttons[0].onPress();
    });

    expect(router.replace).toHaveBeenCalledWith(
      "/login"
    );
  });

  test("세션 ID가 없으면 잘못된 QR로 처리한다", async () => {
    useLocalSearchParams.mockReturnValue({});

    await render(<AttendanceCheckScreen />);

    expect(
      await screen.findByText(
        "출석 QR 정보가 올바르지 않습니다."
      )
    ).toBeTruthy();

    expect(markAttendance).not.toHaveBeenCalled();
    expect(
      screen.getByText("홈으로 이동")
    ).toBeTruthy();
  });

  test("세션 ID를 문자열로 변환해 출석 처리한다", async () => {
    useLocalSearchParams.mockReturnValue({
      sessionId: 200,
    });

    await render(<AttendanceCheckScreen />);

    await waitFor(() => {
      expect(markAttendance).toHaveBeenCalledWith(
        "member-token",
        {
          sessionId: "200",
        }
      );
    });

    expect(
      await screen.findByText("출석되었습니다.")
    ).toBeTruthy();
  });

  test("출석 성공 후 예약된 시간에 홈으로 이동한다", async () => {
    await render(<AttendanceCheckScreen />);

    await waitFor(() => {
      expect(scheduledRedirect).toEqual(
        expect.any(Function)
      );
    });

    await act(async () => {
      scheduledRedirect();
    });

    expect(router.replace).toHaveBeenCalledWith(
      "/(tabs)/home"
    );
  });

  test("출석 API 실패 메시지를 화면에 표시한다", async () => {
    markAttendance.mockRejectedValue(
      new Error("이미 출석 처리된 수업입니다.")
    );

    await render(<AttendanceCheckScreen />);

    expect(
      await screen.findByText(
        "이미 출석 처리된 수업입니다."
      )
    ).toBeTruthy();

    expect(
      screen.getByText("홈으로 이동")
    ).toBeTruthy();

    expect(scheduledRedirect).toBeNull();
  });

  test("완료 화면의 버튼으로 홈에 이동한다", async () => {
    

    await render(<AttendanceCheckScreen />);

    await fireEvent.press(
      await screen.findByText("홈으로 이동")
    );

    expect(router.replace).toHaveBeenCalledWith(
      "/(tabs)/home"
    );
  });
});