// member-app/src/api/push.js

import { apiRequest } from "./request";

export async function savePushToken(pushToken, accessToken) {
  const data = await apiRequest("/api/member/push-token", accessToken, {
    method: "POST",
    body: JSON.stringify({ token: pushToken }),
  });

  return data.data || data;
}