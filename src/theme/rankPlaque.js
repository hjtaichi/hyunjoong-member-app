// HJTAICHI_RANK_PLAQUE_V1
const PLAQUES = {
  0: {
    label: "무급",
    rows: ["無", "級"],
    fillStart: "#F7F3EA",
    fillEnd: "#D9D2C7",
    borderOuter: "#BBAF9F",
    borderInner: "#F4EEE3",
    text: "#2B2926",
    textStroke: "#D9D2C7",
    textShadow: "#F7F3EA",
    texture: "#A99D8D",
  },
  1: {
    label: "초단",
    rows: ["初", "段"],
    fillStart: "#2B1E15",
    fillEnd: "#6B4B22",
    borderOuter: "#A9701D",
    borderInner: "#F1C75A",
    text: "#FFD76A",
    textStroke: "#8D5D14",
    textShadow: "#5D3A0D",
    texture: "#D0A14A",
  },
  2: {
    label: "2단",
    rows: ["二", "段"],
    fillStart: "#536B7B",
    fillEnd: "#8CA2AF",
    borderOuter: "#A87824",
    borderInner: "#F0C763",
    text: "#FFD76A",
    textStroke: "#8B5E15",
    textShadow: "#51606A",
    texture: "#C9D3D8",
  },
  3: {
    label: "3단",
    rows: ["三", "段"],
    fillStart: "#B87517",
    fillEnd: "#E0A746",
    borderOuter: "#A96813",
    borderInner: "#F5CE70",
    text: "#FFE08A",
    textStroke: "#946019",
    textShadow: "#A86414",
    texture: "#F2D69B",
  },
  4: {
    label: "4단",
    rows: ["四", "段"],
    fillStart: "#8FA69A",
    fillEnd: "#C6D0C5",
    borderOuter: "#AA7D29",
    borderInner: "#F0C964",
    text: "#FFD76A",
    textStroke: "#8B5E15",
    textShadow: "#7D8F86",
    texture: "#E5ECE5",
  },
  5: {
    label: "5단",
    rows: ["五", "段"],
    fillStart: "#6F2118",
    fillEnd: "#A74326",
    borderOuter: "#A56B20",
    borderInner: "#F2C45D",
    text: "#FFD76A",
    textStroke: "#844E13",
    textShadow: "#641B14",
    texture: "#D88A68",
  },
  6: {
    label: "6단",
    rows: ["六", "段"],
    fillStart: "#111412",
    fillEnd: "#303630",
    borderOuter: "#9D741F",
    borderInner: "#EBC155",
    text: "#FFD76A",
    textStroke: "#7D5412",
    textShadow: "#050605",
    texture: "#727970",
  },
  7: {
    label: "7단",
    rows: ["七", "段"],
    fillStart: "#141517",
    fillEnd: "#3A342E",
    borderOuter: "#9D741F",
    borderInner: "#EBC155",
    text: "#FFD76A",
    textStroke: "#7D5412",
    textShadow: "#050605",
    texture: "#736B62",
  },
  8: {
    label: "8단",
    rows: ["八", "段"],
    fillStart: "#121417",
    fillEnd: "#272E37",
    borderOuter: "#9D741F",
    borderInner: "#EBC155",
    text: "#FFD76A",
    textStroke: "#7D5412",
    textShadow: "#050605",
    texture: "#68717D",
  },
  9: {
    label: "9단",
    rows: ["九", "段"],
    fillStart: "#0E1010",
    fillEnd: "#242725",
    borderOuter: "#9D741F",
    borderInner: "#F0CA62",
    text: "#FFE08A",
    textStroke: "#7D5412",
    textShadow: "#030403",
    texture: "#626962",
  },
};

export function normalizeRankPlaqueLevel(rankLevel) {
  const numeric = Number(rankLevel);
  if (!Number.isFinite(numeric)) return 0;

  return Math.max(0, Math.min(9, Math.trunc(numeric)));
}

export function getRankPlaqueConfig(rankLevel) {
  const level = normalizeRankPlaqueLevel(rankLevel);
  const config = PLAQUES[level] || PLAQUES[0];

  return {
    ...config,
    level,
    accessibilityLabel:
      level === 0 ? "현재 단계 무급" : `현재 단계 ${config.label}`,
  };
}

export function getRankPlaqueTextRows(rankLevel) {
  return getRankPlaqueConfig(rankLevel).rows;
}