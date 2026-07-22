import React from "react";
import {
  act,
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react-native";

import { router, useLocalSearchParams } from "expo-router";
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

describe("HTTPS QR attendance screen", () => {
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
      token: "signed.qr_token",
    });

    useAuth.mockReturnValue({
      token: "member-access-token",
      isAuthenticated: true,
      isBootLoading: false,
    });

    markAttendance.mockResolvedValue({ status: "present" });

    timeoutSpy = jest.spyOn(global, "setTimeout").mockImplementation(
      (callback, delay, ...args) => {
        if (delay === 1200) {
          scheduledRedirect = callback;
          return 1200;
        }

        return realSetTimeout(callback, delay, ...args);
      },
    );
  });

  afterEach(() => {
    timeoutSpy.mockRestore();
  });

  test("does not submit while authentication is restoring", async () => {
    useAuth.mockReturnValue({
      token: null,
      isAuthenticated: false,
      isBootLoading: true,
    });

    await render(<AttendanceCheckScreen />);
    expect(markAttendance).not.toHaveBeenCalled();
    expect(router.replace).not.toHaveBeenCalled();
  });

  test("preserves the QR token when sending a signed-out member to login", async () => {
    useAuth.mockReturnValue({
      token: null,
      isAuthenticated: false,
      isBootLoading: false,
    });

    await render(<AttendanceCheckScreen />);

    await waitFor(() => {
      expect(router.replace).toHaveBeenCalledWith({
        pathname: "/login",
        params: { attendanceToken: "signed.qr_token" },
      });
    });

    expect(markAttendance).not.toHaveBeenCalled();
  });

  test("rejects a missing or malformed QR token before calling the API", async () => {
    useLocalSearchParams.mockReturnValue({ token: "bad token" });

    await render(<AttendanceCheckScreen />);

    expect(
      await screen.findByText("출석 QR 정보가 올바르지 않습니다."),
    ).toBeTruthy();
    expect(markAttendance).not.toHaveBeenCalled();
  });

  test("submits the signed QR token exactly once", async () => {
    await render(<AttendanceCheckScreen />);

    await waitFor(() => {
      expect(markAttendance).toHaveBeenCalledWith("member-access-token", {
        qrToken: "signed.qr_token",
      });
    });

    expect(markAttendance).toHaveBeenCalledTimes(1);
    expect(await screen.findByText("출석되었습니다.")).toBeTruthy();
  });

  test("moves to home with a one-time success result", async () => {
    await render(<AttendanceCheckScreen />);

    await waitFor(() => {
      expect(scheduledRedirect).toEqual(expect.any(Function));
    });

    await act(async () => {
      scheduledRedirect();
    });

    expect(router.replace).toHaveBeenCalledWith({
      pathname: "/(tabs)/home",
      params: { attendanceResult: "success" },
    });
  });

  test("shows the server error and keeps a manual home button", async () => {
    markAttendance.mockRejectedValue(
      new Error("출석 QR 유효시간이 지났습니다."),
    );

    await render(<AttendanceCheckScreen />);

    expect(
      await screen.findByText("출석 QR 유효시간이 지났습니다."),
    ).toBeTruthy();
    expect(scheduledRedirect).toBeNull();

    fireEvent.press(screen.getByText("홈으로 이동"));
    expect(router.replace).toHaveBeenCalledWith("/(tabs)/home");
  });
});
