// member-app/src/api/memberProfile.js

import { apiRequest } from "./request";

export async function updateMyProfileAvatar(token, profileAvatar) {
  const result = await apiRequest(
    "/api/member/me/profile-avatar",
    token,
    {
      method: "PATCH",
      body: JSON.stringify({ profileAvatar }),
    }
  );

  return result.data || result;
}