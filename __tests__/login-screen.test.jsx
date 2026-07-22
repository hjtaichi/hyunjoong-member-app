import React from "react";
import {
  userEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";

import { router, useLocalSearchParams } from "expo-router";
import { useAuth } from "../src/contexts/AuthContext";
import {
  getSavedLoginId,
  setSavedLoginId,
} from "../src/utils/storage";
import LoginScreen from "../src/screens/LoginScreen";

jest.mock("expo-router", () => ({
  router: {
    replace: jest.fn(),
    push: jest.fn(),
  },
  useLocalSearchParams: jest.fn(),
}));

jest.mock("../src/contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));

jest.mock("../src/utils/storage", () => ({
  getSavedLoginId: jest.fn(),
  setSavedLoginId: jest.fn(),
  removeSavedLoginId: jest.fn(),
}));

describe("회원 로그인 화면", () => {
  let login;

  beforeEach(() => {
    jest.clearAllMocks();

    login = jest.fn();

    getSavedLoginId.mockResolvedValue(null);
    setSavedLoginId.mockResolvedValue(undefined);
    useLocalSearchParams.mockReturnValue({});

    useAuth.mockReturnValue({
      login,
      isLoginLoading: false,
      isAuthenticated: false,
      isBootLoading: false,
      user: null,
    });
  });

  test("저장된 로그인 ID를 입력칸에 복원한다", async () => {
    getSavedLoginId.mockResolvedValue("saved-member");

    const user = userEvent.setup();
    await render(<LoginScreen />);

    expect(
      await screen.findByDisplayValue("saved-member")
    ).toBeTruthy();
  });

  test("로그인 ID가 없으면 입력 안내를 표시한다", async () => {
    const user = userEvent.setup();
    await render(<LoginScreen />);

    await waitFor(() => {
      expect(getSavedLoginId).toHaveBeenCalled();
    });

    await user.press(screen.getByText("로그인"));

    expect(
      await screen.findByText("아이디를 입력해주세요.")
    ).toBeTruthy();

    expect(login).not.toHaveBeenCalled();
  });

  test("비밀번호가 없으면 입력 안내를 표시한다", async () => {
    const user = userEvent.setup();
    await render(<LoginScreen />);

    await waitFor(() => {
      expect(getSavedLoginId).toHaveBeenCalled();
    });

    await user.type(
      screen.getByPlaceholderText("아이디"),
      "member01"
    );

    await user.press(screen.getByText("로그인"));

    expect(
      await screen.findByText("비밀번호를 입력해주세요.")
    ).toBeTruthy();

    expect(login).not.toHaveBeenCalled();
  });

  test("로그인 ID를 정리해 로그인하고 홈으로 이동한다", async () => {
    login.mockResolvedValue({
      ok: true,
    });

    const user = userEvent.setup();
    await render(<LoginScreen />);

    await waitFor(() => {
      expect(getSavedLoginId).toHaveBeenCalled();
    });

    await user.type(
      screen.getByPlaceholderText("아이디"),
      "  Member01  "
    );

    await user.type(
      screen.getByPlaceholderText("비밀번호"),
      "secret"
    );

    await user.press(screen.getByText("로그인"));

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith(
        "member01",
        "secret",
        true
      );
    });

    expect(setSavedLoginId).toHaveBeenCalledWith("member01");
    expect(router.replace).toHaveBeenCalledWith("/(tabs)/home");
  });

  test("returns to signed QR attendance after login", async () => {
    useLocalSearchParams.mockReturnValue({
      attendanceToken: "signed.qr_token",
    });
    login.mockResolvedValue({ ok: true });

    const user = userEvent.setup();
    await render(<LoginScreen />);

    await user.type(screen.getByPlaceholderText("아이디"), "member01");
    await user.type(screen.getByPlaceholderText("비밀번호"), "secret");
    await user.press(screen.getByText("로그인"));

    await waitFor(() => {
      expect(router.replace).toHaveBeenCalledWith({
        pathname: "/attendance-check",
        params: { token: "signed.qr_token" },
      });
    });
  });

  test("승인 대기 회원은 승인 대기 화면으로 이동한다", async () => {
    login.mockResolvedValue({
      ok: false,
      code: "APPROVAL_PENDING",
      message: "관리자 승인 대기 중입니다.",
    });

    const user = userEvent.setup();
    await render(<LoginScreen />);

    await waitFor(() => {
      expect(getSavedLoginId).toHaveBeenCalled();
    });

    await user.type(
      screen.getByPlaceholderText("아이디"),
      "pending-member"
    );

    await user.type(
      screen.getByPlaceholderText("비밀번호"),
      "secret"
    );

    await user.press(screen.getByText("로그인"));

    await waitFor(() => {
      expect(router.replace).toHaveBeenCalledWith(
        "/approval-pending"
      );
    });

    expect(setSavedLoginId).not.toHaveBeenCalled();
  });

  test("로그인 실패 메시지를 화면에 표시한다", async () => {
    login.mockResolvedValue({
      ok: false,
      message: "아이디 또는 비밀번호가 올바르지 않습니다.",
    });

    const user = userEvent.setup();
    await render(<LoginScreen />);

    await waitFor(() => {
      expect(getSavedLoginId).toHaveBeenCalled();
    });

    await user.type(
      screen.getByPlaceholderText("아이디"),
      "member01"
    );

    await user.type(
      screen.getByPlaceholderText("비밀번호"),
      "wrong-password"
    );

    await user.press(screen.getByText("로그인"));

    expect(
      await screen.findByText(
        "아이디 또는 비밀번호가 올바르지 않습니다."
      )
    ).toBeTruthy();

    expect(screen.getByText("로그인 실패")).toBeTruthy();
  });
});