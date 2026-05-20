import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { loginApi, getMeApi } from "../api/auth";
import {
  clearAuthStorage,
  getAccessToken,
  getUser,
  setAccessToken,
  setUser,
} from "../utils/storage";

const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [isBootLoading, setIsBootLoading] = useState(true);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [token, setToken] = useState(null);
  const [user, setUserState] = useState(null);

  useEffect(() => {
    bootstrap();
  }, []);

  async function bootstrap() {
  try {
    const savedToken = await getAccessToken();
    const savedUser = await getUser();

    if (!savedToken || !savedUser) {
      return;
    }

    // 저장 토큰 임시 적용
    setToken(savedToken);
    setUserState(savedUser);

    // 🔥 현재 회원 상태 다시 조회
    const meResult = await getMeApi(savedToken);

    const me =
      meResult?.data ||
      meResult?.user ||
      meResult;

    const memberStatus =
      me?.memberStatus ||
      me?.status;

    // 🔥 종료회원 → 강제 로그아웃
    if (memberStatus === "ended") {
      console.log("⛔ 종료회원 자동 로그아웃");

      await clearAuthStorage();

      setToken(null);
      setUserState(null);

      return;
    }

    // 🔥 휴식회원 → 상태 갱신
    const refreshedUser = {
      ...savedUser,
      status: memberStatus,
      memberStatus: memberStatus,
    };

    await setUser(refreshedUser);

    setUserState(refreshedUser);
  } catch (e) {
    console.error("bootstrap auth error:", e);

    // 토큰 오류 시 로그아웃
    await clearAuthStorage();

    setToken(null);
    setUserState(null);
  } finally {
    setIsBootLoading(false);
  }
}

  async function login(email, password) {
  setIsLoginLoading(true);

  try {
    const authData = await loginApi({ email, password });

    console.log("login response:", authData);

    const payload = authData?.data ?? authData ?? {};
    const nextToken = payload?.accessToken || payload?.token || null;
    const rawUser = payload?.user || authData?.user || null;

    if (!nextToken) {
      console.log("token parse failed. payload =", payload);
      throw new Error("토큰이 응답에 없습니다.");
    }

    const nextUser = rawUser
  ? {
      id: rawUser.userId || rawUser.id,
      userId: rawUser.userId || rawUser.id,
      email: rawUser.email,
      role: rawUser.role,
      name: rawUser.name,
      status: rawUser.status || rawUser.memberStatus || null,
      memberStatus: rawUser.memberStatus || rawUser.status || null,
    }
  : null;

    await setAccessToken(nextToken);

    if (nextUser) {
      await setUser(nextUser);
    }

    setToken(nextToken);
    setUserState(nextUser);

    return { ok: true };
  } catch (error) {
    console.log("login failed:", error?.response?.data || error.message);

    return {
      ok: false,
      message:
        error?.response?.data?.message ||
        error?.message ||
        "로그인에 실패했습니다.",
    };
  } finally {
    setIsLoginLoading(false);
  }
}

  async function logout() {
    await clearAuthStorage();
    setToken(null);
    setUserState(null);
  }


  async function refreshMe() {
  try {
    const savedToken = token || (await getAccessToken());

    if (!savedToken) {
      return null;
    }

    const meResult = await getMeApi(savedToken);
    const me = meResult?.data || meResult?.user || meResult;

    const memberStatus = me?.memberStatus || me?.status;

    if (memberStatus === "ended") {
      await clearAuthStorage();
      setToken(null);
      setUserState(null);
      return { status: "ended" };
    }

    const nextUser = {
      ...(user || {}),
      id: me?.id || user?.id,
      userId: me?.id || user?.userId,
      email: me?.email || user?.email,
      role: me?.role || user?.role,
      name: me?.name || user?.name,
      status: memberStatus,
      memberStatus,
    };

    await setUser(nextUser);
    setToken(savedToken);
    setUserState(nextUser);

    return nextUser;
  } catch (error) {
    console.log("refreshMe error:", error?.response?.data || error.message);

    await clearAuthStorage();
    setToken(null);
    setUserState(null);

    return null;
  }
}

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: !!token,
      isBootLoading,
      isLoginLoading,
      login,
      logout,
      refreshMe,
    }),
    [token, user, isBootLoading, isLoginLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

export { AuthProvider, useAuth };
export default AuthContext;