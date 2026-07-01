// src/api/auth.js

import client from "./client";

export async function loginApi({ email, password }) {
  const res = await client.post("/api/auth/login", {
    email,
    password,
  });

  return res.data;
}

export async function registerApi(payload) {
  const res = await client.post("/api/auth/register", payload);
  return res.data;
}

export async function getMeApi(accessToken) {
  const res = await client.get("/api/auth/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return res.data;
}

export async function refreshAccessTokenApi(refreshToken) {
  const res = await client.post("/api/auth/refresh", {
    refreshToken,
  });

  return res.data;
}