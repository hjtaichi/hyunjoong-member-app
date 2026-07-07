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

export function getJoinedPeriodLabel(joinedAt) {
  if (!joinedAt) return "입관일 확인 필요";

  const start = new Date(joinedAt);
  const today = new Date();

  if (Number.isNaN(start.getTime())) return "입관일 확인 필요";

  const startDate = new Date(
    start.getFullYear(),
    start.getMonth(),
    start.getDate()
  );

  const todayDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  let years = todayDate.getFullYear() - startDate.getFullYear();

  let anniversary = new Date(
    todayDate.getFullYear(),
    startDate.getMonth(),
    startDate.getDate()
  );

  if (todayDate < anniversary) {
    years -= 1;
    anniversary = new Date(
      todayDate.getFullYear() - 1,
      startDate.getMonth(),
      startDate.getDate()
    );
  }

  const diffMs = todayDate.getTime() - anniversary.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (years <= 0) return `입관 ${days}일째`;

  return `입관 ${years}년 ${days}일째`;
}