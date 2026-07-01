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

    if (!savedToken) {
      setToken(null);
      setUserState(null);
      return;
    }

    const meResult = await getMeApi(savedToken);
    const me = meResult?.data || meResult?.user || meResult;

    const memberStatus = me?.memberStatus || me?.status;

    if (memberStatus === "ended") {
      await clearAuthStorage();
      setToken(null);
      setUserState(null);
      return;
    }

    const nextUser = {
      id: me?.userId || me?.id,
      userId: me?.userId || me?.id,
      email: me?.email,
      role: me?.role,
      name: me?.name,
      status: memberStatus || null,
      memberStatus: memberStatus || null,
    };

    await setUser(nextUser);

    setToken(savedToken);
    setUserState(nextUser);
   } catch (e) {
    const status = e?.response?.status;

    console.error("bootstrap auth error:", e?.response?.data || e.message);

    if (status === 401 || status === 403) {
      await clearAuthStorage();
      setToken(null);
      setUserState(null);
    }

    setToken(null);
    setUserState(null);
  }
   finally {
    setIsBootLoading(false);
  }
}

  async function login(email, password, autoLogin = true) {
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

    if (autoLogin) {
  await setAccessToken(nextToken);

  if (nextUser) {
    await setUser(nextUser);
  }
} else {
  await clearAuthStorage();
}

setToken(nextToken);
setUserState(nextUser);

    return { ok: true };
  } catch (error) {
    console.log("login failed:", error?.response?.data || error.message);

    return {
  ok: false,
  code: error?.response?.data?.code || error?.code,
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
    const status = error?.response?.status;

    console.log("refreshMe error:", error?.response?.data || error.message);

    if (status === 401 || status === 403) {
      await clearAuthStorage();
      setToken(null);
      setUserState(null);
      return null;
    }

    return user;
  }
}

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: !isBootLoading && !!token && !!user,
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