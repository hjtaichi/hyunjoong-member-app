// src/api/auth.js

import client from "./client";

export async function loginApi({ email, password }) {
  const res = await client.post("/auth/login", {
    email,
    password,
  });

  return res.data;
}