import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { loginApi } from "../api/auth";
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

    if (savedToken) {
      setToken(savedToken);
    }
    if (savedUser) {
      setUserState(savedUser);
    }
  } catch (e) {
    console.error("bootstrap auth error:", e);
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
    console.error("login error:", error?.response?.data || error.message);

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

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: !!token,
      isBootLoading,
      isLoginLoading,
      login,
      logout,
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