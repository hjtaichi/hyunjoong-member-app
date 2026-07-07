export const avatarImages = {
  avatar1: require("../../../assets/images/avatar1.png"),
  avatar2: require("../../../assets/images/avatar2.png"),
  avatar3: require("../../../assets/images/avatar3.png"),
  avatar4: require("../../../assets/images/avatar4.png"),
  avatar5: require("../../../assets/images/avatar5.png"),
  avatar6: require("../../../assets/images/avatar6.png"),
  avatar7: require("../../../assets/images/avatar7.png"),
  avatar8: require("../../../assets/images/avatar8.png"),
  avatar9: require("../../../assets/images/avatar9.png"),
  avatar10: require("../../../assets/images/avatar10.png"),
  avatar11: require("../../../assets/images/avatar11.png"),
  avatar12: require("../../../assets/images/avatar12.png"),
  avatar13: require("../../../assets/images/avatar13.png"),
  avatar14: require("../../../assets/images/avatar14.png"),
  avatar15: require("../../../assets/images/avatar15.png"),
  avatar16: require("../../../assets/images/avatar16.png"),
  avatar17: require("../../../assets/images/avatar17.png"),
  avatar18: require("../../../assets/images/avatar18.png"),
  avatar19: require("../../../assets/images/avatar19.png"),
  avatar20: require("../../../assets/images/avatar20.png"),
  avatar21: require("../../../assets/images/avatar21.png"),
  avatar22: require("../../../assets/images/avatar22.png"),
  avatar23: require("../../../assets/images/avatar23.png"),
  avatar24: require("../../../assets/images/avatar24.png"),
  avatar25: require("../../../assets/images/avatar25.png"),
};

export function getProfileImageSource(profileAvatar, version = "") {
  if (!profileAvatar) {
    return avatarImages.avatar1;
  }

  if (avatarImages[profileAvatar]) {
    return avatarImages[profileAvatar];
  }

  const rawBaseUrl = String(process.env.EXPO_PUBLIC_API_BASE_URL || "").replace(
    /\/$/,
    ""
  );

  const originBaseUrl = rawBaseUrl.endsWith("/api")
    ? rawBaseUrl.replace(/\/api$/, "")
    : rawBaseUrl;

  if (String(profileAvatar).startsWith("/uploads/")) {
    return {
      uri: version
        ? `${originBaseUrl}${profileAvatar}?t=${version}`
        : `${originBaseUrl}${profileAvatar}`,
    };
  }

  if (String(profileAvatar).startsWith("http")) {
    return {
      uri: version ? `${profileAvatar}?t=${version}` : profileAvatar,
    };
  }

  return avatarImages.avatar1;
}