// member-app/src/api/push.js

import { apiRequest } from "./request";

export async function savePushToken(pushToken, accessToken) {
  const data = await apiRequest("/api/member/push-token", accessToken, {
    method: "POST",
    body: JSON.stringify({
      type: "expo",
      token: pushToken,
    }),
  });

  return data.data || data;
}

export async function saveWebPushSubscription(subscription, accessToken) {
  const endpoint = subscription?.endpoint;

  const data = await apiRequest("/api/member/push-token", accessToken, {
    method: "POST",
    body: JSON.stringify({
      type: "web",
      token: endpoint,
      subscription,
      userAgent:
        typeof navigator !== "undefined" ? navigator.userAgent : null,
    }),
  });

  return data.data || data;
}