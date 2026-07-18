import React from "react";
import { Text } from "react-native";
import {
  act,
  render,
  waitFor,
} from "@testing-library/react-native";

import { loginApi, getMeApi } from "../src/api/auth";
import {
  clearAuthStorage,
  getAccessToken,
  setAccessToken,
  setRefreshToken,
  setUser,
} from "../src/utils/storage";
import {
  AuthProvider,
  useAuth,
} from "../src/contexts/AuthContext";

jest.mock("../src/api/auth", () => ({
  loginApi: jest.fn(),
  getMeApi: jest.fn(),
}));

jest.mock("../src/utils/storage", () => ({
  clearAuthStorage: jest.fn(),
  getAccessToken: jest.fn(),
  getUser: jest.fn(),
  setAccessToken: jest.fn(),
  setUser: jest.fn(),
  getRefreshToken: jest.fn(),
  setRefreshToken: jest.fn(),
}));

let latestAuth = null;
let consoleLogSpy;
let consoleErrorSpy;

function AuthProbe() {
  latestAuth = useAuth();

  return (
    <Text>
      {latestAuth.isBootLoading
        ? "boot-loading"
        : latestAuth.isAuthenticated
          ? "authenticated"
          : "anonymous"}
    </Text>
  );
}

function renderAuthProvider() {
  return render(
    <AuthProvider>
      <AuthProbe />
    </AuthProvider>
  );
}

describe("회원 인증 상태 관리", () => {
  beforeAll(() => {
    consoleLogSpy = jest
      .spyOn(console, "log")
      .mockImplementation(() => {});

    consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
  });

  afterAll(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    latestAuth = null;

    getAccessToken.mockResolvedValue(null);
    clearAuthStorage.mockResolvedValue(undefined);
    setAccessToken.mockResolvedValue(undefined);
    setRefreshToken.mockResolvedValue(undefined);
    setUser.mockResolvedValue(undefined);
  });

  test("저장된 토큰이 없으면 비로그인 상태로 초기화한다", async () => {
    await renderAuthProvider();

    await waitFor(() => {
      expect(latestAuth.isBootLoading).toBe(false);
    });

    expect(latestAuth.isAuthenticated).toBe(false);
    expect(latestAuth.token).toBeNull();
    expect(latestAuth.user).toBeNull();
    expect(getMeApi).not.toHaveBeenCalled();
  });

  test("저장된 토큰으로 회원 정보를 복원한다", async () => {
    getAccessToken.mockResolvedValue("saved-token");

    getMeApi.mockResolvedValue({
      data: {
        userId: 10,
        email: "member01",
        role: "member",
        name: "회원",
        memberStatus: "active",
      },
    });

    await renderAuthProvider();

    await waitFor(() => {
      expect(latestAuth.isAuthenticated).toBe(true);
    });

    expect(getMeApi).toHaveBeenCalledWith("saved-token");
    expect(latestAuth.token).toBe("saved-token");
    expect(latestAuth.user).toMatchObject({
      id: 10,
      userId: 10,
      email: "member01",
      role: "member",
      memberStatus: "active",
    });

    expect(setUser).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 10,
        memberStatus: "active",
      })
    );
  });

  test("종료 회원의 저장 인증정보를 제거한다", async () => {
    getAccessToken.mockResolvedValue("ended-token");

    getMeApi.mockResolvedValue({
      data: {
        userId: 11,
        status: "ended",
      },
    });

    await renderAuthProvider();

    await waitFor(() => {
      expect(latestAuth.isBootLoading).toBe(false);
    });

    expect(clearAuthStorage).toHaveBeenCalled();
    expect(latestAuth.isAuthenticated).toBe(false);
    expect(latestAuth.token).toBeNull();
    expect(latestAuth.user).toBeNull();
  });

  test("자동 로그인 성공 시 토큰과 회원정보를 저장한다", async () => {
    loginApi.mockResolvedValue({
      data: {
        accessToken: "new-token",
        refreshToken: "new-refresh-token",
        user: {
          userId: 20,
          email: "member20",
          role: "member",
          name: "회원20",
          memberStatus: "active",
        },
      },
    });

    await renderAuthProvider();

    await waitFor(() => {
      expect(latestAuth.isBootLoading).toBe(false);
    });

    let result;

    await act(async () => {
      result = await latestAuth.login(
        "member20",
        "password",
        true
      );
    });

    expect(result).toEqual({
      ok: true,
    });

    expect(loginApi).toHaveBeenCalledWith({
      email: "member20",
      password: "password",
    });

    expect(setAccessToken).toHaveBeenCalledWith("new-token");
    expect(setRefreshToken).toHaveBeenCalledWith(
      "new-refresh-token"
    );

    expect(setUser).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 20,
        memberStatus: "active",
      })
    );

    expect(latestAuth.isAuthenticated).toBe(true);
  });

  test("자동 로그인을 끄면 인증정보를 저장하지 않는다", async () => {
    loginApi.mockResolvedValue({
      data: {
        accessToken: "session-token",
        user: {
          userId: 21,
          email: "member21",
          role: "member",
          name: "회원21",
          status: "active",
        },
      },
    });

    await renderAuthProvider();

    await waitFor(() => {
      expect(latestAuth.isBootLoading).toBe(false);
    });

    await act(async () => {
      await latestAuth.login(
        "member21",
        "password",
        false
      );
    });

    expect(clearAuthStorage).toHaveBeenCalled();
    expect(setAccessToken).not.toHaveBeenCalled();
    expect(setRefreshToken).not.toHaveBeenCalled();
    expect(latestAuth.isAuthenticated).toBe(true);
  });

  test("로그인 응답에 토큰이 없으면 실패 결과를 반환한다", async () => {
    loginApi.mockResolvedValue({
      data: {
        user: {
          userId: 30,
        },
      },
    });

    await renderAuthProvider();

    await waitFor(() => {
      expect(latestAuth.isBootLoading).toBe(false);
    });

    let result;

    await act(async () => {
      result = await latestAuth.login(
        "member30",
        "password",
        true
      );
    });

    expect(result).toMatchObject({
      ok: false,
      message: "토큰이 응답에 없습니다.",
    });

    expect(latestAuth.isAuthenticated).toBe(false);
  });

  test("로그아웃하면 저장 인증정보와 메모리 상태를 제거한다", async () => {
    getAccessToken.mockResolvedValue("saved-token");

    getMeApi.mockResolvedValue({
      data: {
        userId: 40,
        email: "member40",
        role: "member",
        name: "회원40",
        memberStatus: "active",
      },
    });

    await renderAuthProvider();

    await waitFor(() => {
      expect(latestAuth.isAuthenticated).toBe(true);
    });

    await act(async () => {
      await latestAuth.logout();
    });

    expect(clearAuthStorage).toHaveBeenCalled();
    expect(latestAuth.isAuthenticated).toBe(false);
    expect(latestAuth.token).toBeNull();
    expect(latestAuth.user).toBeNull();
  });
});