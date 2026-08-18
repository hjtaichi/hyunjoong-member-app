import client from "./client";

export async function getMemberHome(token) {
  const response = await client.get("/api/member/me/home", {
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : undefined,
  });

  return response.data?.data ?? response.data ?? {};
}
