import { avatarImages, mypageImages } from "./mypageImages";

export function onlyNumbers(value) {
  return String(value || "").replace(/[^0-9]/g, "");
}

export function getAvatarSource(profileAvatar, version = "") {
  if (!profileAvatar) return mypageImages.profilePlaceholder;

  if (avatarImages[profileAvatar]) return avatarImages[profileAvatar];

  const rawBaseUrl = String(process.env.EXPO_PUBLIC_API_BASE_URL || "").replace(/\/$/, "");
  const originBaseUrl = rawBaseUrl.endsWith("/api")
    ? rawBaseUrl.replace(/\/api$/, "")
    : rawBaseUrl;

  const cacheQuery = version ? `?t=${encodeURIComponent(version)}` : "";

  if (String(profileAvatar).startsWith("/uploads/")) {
    return { uri: `${originBaseUrl}${profileAvatar}${cacheQuery}` };
  }

  if (String(profileAvatar).startsWith("http")) {
    return { uri: `${profileAvatar}${cacheQuery}` };
  }

  if (String(profileAvatar).startsWith("file:")) {
    return { uri: profileAvatar };
  }

  return mypageImages.profilePlaceholder;
}
