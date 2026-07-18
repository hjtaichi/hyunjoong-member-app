import React from "react";
import { render, waitFor } from "@testing-library/react-native";
import { router } from "expo-router";
import { useAuth } from "../src/contexts/AuthContext";
import IndexPage from "../app/index";

jest.mock("expo-router", () => ({
  router: {
    replace: jest.fn(),
  },
}));

jest.mock("../src/contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));

describe("회원 앱 시작 화면 인증 이동", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("인증 초기화 중에는 화면을 이동하지 않는다", () => {
    useAuth.mockReturnValue({
      isAuthenticated: false,
      isBootLoading: true,
      user: null,
    });

    render(<IndexPage />);

    expect(router.replace).not.toHaveBeenCalled();
  });

  test("로그인하지 않은 회원은 로그인 화면으로 이동한다", async () => {
    useAuth.mockReturnValue({
      isAuthenticated: false,
      isBootLoading: false,
      user: null,
    });

    render(<IndexPage />);

    await waitFor(() => {
      expect(router.replace).toHaveBeenCalledWith("/login");
    });
  });

  test("휴식중 회원은 문의 화면으로 이동한다", async () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      isBootLoading: false,
      user: {
        id: 10,
        memberStatus: "paused",
      },
    });

    render(<IndexPage />);

    await waitFor(() => {
      expect(router.replace).toHaveBeenCalledWith("/(tabs)/inquiry");
    });
  });

  test("정상 수련중 회원은 홈 화면으로 이동한다", async () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      isBootLoading: false,
      user: {
        id: 10,
        memberStatus: "active",
      },
    });

    render(<IndexPage />);

    await waitFor(() => {
      expect(router.replace).toHaveBeenCalledWith("/(tabs)/home");
    });
  });
});