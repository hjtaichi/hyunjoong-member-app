import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  loginApi,
  getMeApi,
  refreshAccessTokenApi,
} from "../api/auth";
import {
  clearAuthStorage,
  getAccessToken,
  getUser,
  setAccessToken,
  setUser,
  getRefreshToken,
  setRefreshToken,
  subscribeAuthStorage,
} from "../utils/storage";

const AuthContext = createContext(null);

function normalizeAuthUser(rawUser, fallback = {}) {
  if (!rawUser && !fallback) return null;

  const source = rawUser || {};
  const previous = fallback || {};
  const memberStatus =
    source.memberStatus ||
    source.status ||
    previous.memberStatus ||
    previous.status ||
    null;

  return {
    ...previous,
    id: source.userId || source.id || previous.id || previous.userId,
    userId: source.userId || source.id || previous.userId || previous.id,
    email: source.email || previous.email,
    role: source.role || previous.role,
    name: source.name || previous.name,
    status: memberStatus,
    memberStatus,
    rankLevel: Number(source.rankLevel ?? previous.rankLevel ?? 0),
    passwordResetRequired: Boolean(source.passwordResetRequired ?? previous.passwordResetRequired ?? false),
  };
}

function AuthProvider({ children }) {
  const [isBootLoading, setIsBootLoading] = useState(true);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [token, setToken] = useState(null);
  const [user, setUserState] = useState(null);

  useEffect(() => {
    let active = true;

    const unsubscribe = subscribeAuthStorage((event) => {
      if (!active) return;

      if (event?.type === "access-token") {
        setToken(event.accessToken || null);
        return;
      }

      if (event?.type === "clear") {
        setToken(null);
        setUserState(null);
      }
    });

    bootstrap();

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  async function bootstrap() {
    let savedToken = null;
    let savedRefreshToken = null;
    let savedUser = null;

    try {
      [savedToken, savedRefreshToken, savedUser] = await Promise.all([
        getAccessToken(),
        getRefreshToken(),
        getUser(),
      ]);

      if (!savedToken && savedRefreshToken) {
        const refreshResult = await refreshAccessTokenApi(savedRefreshToken);
        const refreshPayload = refreshResult?.data ?? refreshResult ?? {};
        const refreshedToken =
          refreshPayload?.accessToken || refreshPayload?.token || null;
        const refreshedRefreshToken =
          refreshPayload?.refreshToken || null;

        if (!refreshedToken) {
          throw new Error("갱신 응답에 access token이 없습니다.");
        }

        savedToken = refreshedToken;
        savedUser = normalizeAuthUser(refreshPayload?.user, savedUser);

        // MEMBER_REFRESH_ROTATION_V1
        if (refreshedRefreshToken) {
          savedRefreshToken = refreshedRefreshToken;
          await setRefreshToken(refreshedRefreshToken);
        }

        await setAccessToken(refreshedToken);

        if (savedUser) {
          await setUser(savedUser);
        }
      }

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
        return;
      }

      const nextUser = normalizeAuthUser(me, savedUser);
      const activeToken = (await getAccessToken()) || savedToken;

      await setUser(nextUser);

      setToken(activeToken);
      setUserState(nextUser);
    } catch (error) {
      const status = error?.response?.status;

      if (status === 401 || status === 403) {
        await clearAuthStorage();
        return;
      }

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUserState(savedUser);
        return;
      }

      setToken(null);
      setUserState(null);
    } finally {
      setIsBootLoading(false);
    }
  }

  async function login(email, password, autoLogin = true) {
  setIsLoginLoading(true);

  try {
    const authData = await loginApi({ email, password });


    const payload = authData?.data ?? authData ?? {};
    const nextToken = payload?.accessToken || payload?.token || null;
    const nextRefreshToken = payload?.refreshToken || null;
    const rawUser = payload?.user || authData?.user || null;

    if (!nextToken) {
      throw new Error("토큰이 응답에 없습니다.");
    }

    const nextUser = rawUser ? normalizeAuthUser(rawUser) : null;

if (autoLogin) {
  await setAccessToken(nextToken);

  if (nextRefreshToken) {
    await setRefreshToken(nextRefreshToken);
  }

  if (nextUser) {
    await setUser(nextUser);
  }

} else {
  await clearAuthStorage();
}

setToken(nextToken);
setUserState(nextUser);

    return { ok: true, passwordResetRequired: Boolean(payload?.passwordResetRequired || nextUser?.passwordResetRequired) };
  } catch (error) {

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

    const nextUser = normalizeAuthUser(me, user);
    const activeToken = (await getAccessToken()) || savedToken;

    await setUser(nextUser);
    setToken(activeToken);
    setUserState(nextUser);

    return nextUser;
} catch (error) {
  const status = error?.response?.status;


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
