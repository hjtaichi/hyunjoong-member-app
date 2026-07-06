export const GONGBEOP_LABELS = {
  ilsimyangui: "일심양의",
  yobujeonsa: "요부전사",
  duyoMinutes: "두요",
  ohaengjeonsa: "오행전사",
};

export const DEFAULT_GONGBEOP_GOALS = {
  ilsimyangui: "50",
  yobujeonsa: "30",
  duyoMinutes: "10",
  ohaengjeonsa: "20",
};

export function getGongbeopPercent(value, goal) {
  const current = Number(value || 0);
  if (!goal) return 0;
  return Math.round((current / goal) * 100);
}