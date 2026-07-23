// src/utils/storage.js

import AsyncStorage from "@react-native-async-storage/async-storage";

const ACCESS_TOKEN_KEY = "member_access_token";
const USER_KEY = "member_user";
const authStorageListeners = new Set();

function emitAuthStorageChange(event) {
  authStorageListeners.forEach((listener) => {
    try {
      listener(event);
    } catch {
      // A consumer failure must not break token persistence.
    }
  });
}

export function subscribeAuthStorage(listener) {
  if (typeof listener !== "function") {
    return () => {};
  }

  authStorageListeners.add(listener);

  return () => {
    authStorageListeners.delete(listener);
  };
}

export async function setAccessToken(token) {
  await AsyncStorage.setItem(ACCESS_TOKEN_KEY, token);
  emitAuthStorageChange({
    type: "access-token",
    accessToken: token,
  });
}

export async function getAccessToken() {
  return AsyncStorage.getItem(ACCESS_TOKEN_KEY);
}

export async function removeAccessToken() {
  await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
  emitAuthStorageChange({
    type: "access-token",
    accessToken: null,
  });
}

export async function setUser(user) {
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function getUser() {
  try {
    const raw = await AsyncStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    await AsyncStorage.removeItem(USER_KEY);
    return null;
  }
}

export async function removeUser() {
  await AsyncStorage.removeItem(USER_KEY);
}

export async function clearAuthStorage() {
  await Promise.all([
    removeAccessToken(),
    removeRefreshToken(),
    removeUser(),
  ]);

  emitAuthStorageChange({
    type: "clear",
    accessToken: null,
  });
}

export async function setNoticeHiddenToday(key) {
  await AsyncStorage.setItem(key, "1");
}

export async function getNoticeHiddenToday(key) {
  return AsyncStorage.getItem(key);
}

const SAVED_LOGIN_ID_KEY = "member_saved_login_id";

export async function setSavedLoginId(loginId) {
  await AsyncStorage.setItem(SAVED_LOGIN_ID_KEY, loginId);
}

export async function getSavedLoginId() {
  return AsyncStorage.getItem(SAVED_LOGIN_ID_KEY);
}

export async function removeSavedLoginId() {
  await AsyncStorage.removeItem(SAVED_LOGIN_ID_KEY);
}

const REFRESH_TOKEN_KEY = "member_refresh_token";

export async function setRefreshToken(token) {
  await AsyncStorage.setItem(REFRESH_TOKEN_KEY, token);
}

export async function getRefreshToken() {
  return AsyncStorage.getItem(REFRESH_TOKEN_KEY);
}

export async function removeRefreshToken() {
  await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
}
