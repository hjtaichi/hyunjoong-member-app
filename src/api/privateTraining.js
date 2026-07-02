import client from "./client";

export async function submitPrivateTrainingRequest(payload) {
  const res = await client.post(
    "/api/member/me/private-training-requests",
    payload
  );

  return res.data?.data ?? res.data;
}