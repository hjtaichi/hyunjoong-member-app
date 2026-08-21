import client from "./client";
export async function getMemberTrainingMedals() {
const response = await client.get(
    "/api/member/me/training-medals"
  );

  return response.data?.data ?? response.data ?? {
    collection: [],
    home: [],
    annual: [],
  };
}