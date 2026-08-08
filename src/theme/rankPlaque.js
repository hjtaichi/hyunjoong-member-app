// HJTAICHI_RANK_PLAQUE_USER_ASSETS_V1
const PLAQUE_LABELS = {
  0: "무급",
  1: "초단",
  2: "2단",
  3: "3단",
  4: "4단",
  5: "5단",
  6: "6단",
  7: "7단",
  8: "8단",
  9: "9단",
};

const PLAQUE_IMAGE_SOURCES = {
  0: require("../assets/rank-plaques/rank-0-mugup.png"),
  1: require("../assets/rank-plaques/rank-1-chodan.png"),
  2: require("../assets/rank-plaques/rank-2-idan.png"),
  3: require("../assets/rank-plaques/rank-3-samdan.png"),
  4: require("../assets/rank-plaques/rank-4-sadan.png"),
  5: require("../assets/rank-plaques/rank-5-odan.png"),
  6: require("../assets/rank-plaques/rank-6-yukdan.png"),
};

const LEGACY_FALLBACKS = {
  7: {
    fillStart: "#141517",
    fillEnd: "#3A342E",
    borderOuter: "#9D741F",
    borderInner: "#EBC155",
    text: "#FFD76A",
    textShadow: "#050605",
    texture: "#736B62",
    rows: ["七", "段"],
  },
  8: {
    fillStart: "#121417",
    fillEnd: "#272E37",
    borderOuter: "#9D741F",
    borderInner: "#EBC155",
    text: "#FFD76A",
    textShadow: "#050605",
    texture: "#68717D",
    rows: ["八", "段"],
  },
  9: {
    fillStart: "#0E1010",
    fillEnd: "#242725",
    borderOuter: "#9D741F",
    borderInner: "#F0CA62",
    text: "#FFE08A",
    textShadow: "#030403",
    texture: "#626962",
    rows: ["九", "段"],
  },
};

export function normalizeRankPlaqueLevel(rankLevel) {
  const numeric = Number(rankLevel);
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(0, Math.min(9, Math.trunc(numeric)));
}

export function getRankPlaqueConfig(rankLevel) {
  const level = normalizeRankPlaqueLevel(rankLevel);
  const label = PLAQUE_LABELS[level] || PLAQUE_LABELS[0];

  return {
    level,
    label,
    imageSource: level <= 6 ? PLAQUE_IMAGE_SOURCES[level] : null,
    legacyFallback: level >= 7 ? LEGACY_FALLBACKS[level] : null,
    accessibilityLabel:
      level === 0 ? "현재 단계 무급" : `현재 단계 ${label}`,
  };
}
