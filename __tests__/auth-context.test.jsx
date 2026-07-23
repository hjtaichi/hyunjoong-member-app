import React from "react";
import { Text } from "react-native";
import {
  act,
  render,
  waitFor,
} from "@testing-library/react-native";

import {
  loginApi,
  getMeApi,
  refreshAccessTokenApi,
} from "../src/api/auth";
import {
  clearAuthStorage,
  getAccessToken,
  getRefreshToken,
  getUser,
  setAccessToken,
  setRefreshToken,
  setUser,
  subscribeAuthStorage,
} from "../src/utils/storage";
import {
  AuthProvider,
  useAuth,
} from "../src/contexts/AuthContext";

jest.mock("../src/api/auth", () => ({
  loginApi: jest.fn(),
  getMeApi: jest.fn(),
  refreshAccessTokenApi: jest.fn(),
}));

jest.mock("../src/utils/storage", () => ({
  clearAuthStorage: jest.fn(),
  getAccessToken: jest.fn(),
  getUser: jest.fn(),
  setAccessToken: jest.fn(),
  setUser: jest.fn(),
  getRefreshToken: jest.fn(),
  setRefreshToken: jest.fn(),
  subscribeAuthStorage: jest.fn(),
}));

let latestAuth = null;
let authStorageListener = null;
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
    authStorageListener = null;

    getAccessToken.mockResolvedValue(null);
    getRefreshToken.mockResolvedValue(null);
    getUser.mockResolvedValue(null);
    clearAuthStorage.mockResolvedValue(undefined);
    setAccessToken.mockResolvedValue(undefined);
    setRefreshToken.mockResolvedValue(undefined);
    setUser.mockResolvedValue(undefined);
    subscribeAuthStorage.mockImplementation((listener) => {
      authStorageListener = listener;
      return jest.fn();
    });
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

  test("앱 시작 중 갱신된 access token을 Context에 반영한다", async () => {
    getAccessToken
      .mockResolvedValueOnce("expired-token")
      .mockResolvedValue("refreshed-token");
    getUser.mockResolvedValue({
      userId: 12,
      email: "member12",
      role: "member",
      name: "회원12",
      memberStatus: "active",
    });
    getMeApi.mockResolvedValue({
      data: {
        id: 12,
        email: "member12",
        role: "member",
        name: "회원12",
        memberStatus: "active",
      },
    });

    await renderAuthProvider();

    await waitFor(() => {
      expect(latestAuth.isAuthenticated).toBe(true);
    });

    expect(latestAuth.token).toBe("refreshed-token");
  });

  test("access token이 없어도 refresh token으로 자동 로그인을 복원한다", async () => {
    getAccessToken
      .mockResolvedValueOnce(null)
      .mockResolvedValue("restored-token");
    getRefreshToken.mockResolvedValue("saved-refresh-token");
    refreshAccessTokenApi.mockResolvedValue({
      data: {
        accessToken: "restored-token",
        user: {
          userId: 13,
          email: "member13",
          role: "member",
          name: "회원13",
          memberStatus: "active",
        },
      },
    });
    getMeApi.mockResolvedValue({
      data: {
        id: 13,
        email: "member13",
        role: "member",
        name: "회원13",
        memberStatus: "active",
      },
    });

    await renderAuthProvider();

    await waitFor(() => {
      expect(latestAuth.isAuthenticated).toBe(true);
    });

    expect(refreshAccessTokenApi).toHaveBeenCalledWith("saved-refresh-token");
    expect(setAccessToken).toHaveBeenCalledWith("restored-token");
    expect(latestAuth.token).toBe("restored-token");
  });

  test("일시적인 네트워크 오류로 저장된 자동 로그인을 해제하지 않는다", async () => {
    const savedUser = {
      userId: 14,
      email: "member14",
      role: "member",
      name: "회원14",
      memberStatus: "active",
    };

    getAccessToken.mockResolvedValue("saved-token");
    getUser.mockResolvedValue(savedUser);
    getMeApi.mockRejectedValue(new Error("Network Error"));

    await renderAuthProvider();

    await waitFor(() => {
      expect(latestAuth.isAuthenticated).toBe(true);
    });

    expect(clearAuthStorage).not.toHaveBeenCalled();
    expect(latestAuth.token).toBe("saved-token");
    expect(latestAuth.user).toEqual(savedUser);
  });

  test("앱 실행 중 token 갱신과 세션 초기화를 즉시 반영한다", async () => {
    getAccessToken.mockResolvedValue("saved-token");
    getMeApi.mockResolvedValue({
      data: {
        id: 15,
        email: "member15",
        role: "member",
        name: "회원15",
        memberStatus: "active",
      },
    });

    await renderAuthProvider();

    await waitFor(() => {
      expect(latestAuth.isAuthenticated).toBe(true);
    });

    await act(async () => {
      authStorageListener({
        type: "access-token",
        accessToken: "runtime-refreshed-token",
      });
    });

    expect(latestAuth.token).toBe("runtime-refreshed-token");

    await act(async () => {
      authStorageListener({ type: "clear", accessToken: null });
    });

    expect(latestAuth.isAuthenticated).toBe(false);
    expect(latestAuth.token).toBeNull();
    expect(latestAuth.user).toBeNull();
  });

  test("인증 401은 저장된 인증 정보를 제거한다", async () => {
    getAccessToken.mockResolvedValue("invalid-token");
    getUser.mockResolvedValue({
      userId: 16,
      memberStatus: "active",
    });
    getMeApi.mockRejectedValue({
      response: { status: 401 },
    });

    await renderAuthProvider();

    await waitFor(() => {
      expect(latestAuth.isBootLoading).toBe(false);
    });

    expect(clearAuthStorage).toHaveBeenCalled();
    expect(latestAuth.isAuthenticated).toBe(false);
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
