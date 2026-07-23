export const JOURNEY_MAX_ATTENDANCE_COUNT = 2200;

export const PROMOTION_ATTENDANCE_REQUIREMENTS = Object.freeze({
  1: 147,
  2: 300,
  3: 450,
  4: 600,
});

function toSafeAttendanceCount(value) {
  const count = Number(value);

  if (!Number.isFinite(count) || count < 0) return null;

  return Math.floor(count);
}

export function getJourneyAttendanceCount(homeData) {
  const candidates = [
    homeData?.member?.totalAttendanceSessionCount,
    homeData?.trainingStats?.totalAttendanceSessionCount,
    homeData?.totalAttendanceSessionCount,
  ];

  for (const candidate of candidates) {
    const count = toSafeAttendanceCount(candidate);
    if (count != null) return count;
  }

  return 0;
}

export function getJourneyRange(attendanceCount) {
  if (attendanceCount < 50) return { start: 0, end: 50 };
  if (attendanceCount < 300) return { start: 50, end: 300 };
  if (attendanceCount < 550) return { start: 300, end: 550 };
  if (attendanceCount < 800) return { start: 550, end: 800 };
  if (attendanceCount < 1050) return { start: 800, end: 1050 };
  if (attendanceCount < 1300) return { start: 1050, end: 1300 };
  if (attendanceCount < 1550) return { start: 1300, end: 1550 };
  if (attendanceCount < 1800) return { start: 1550, end: 1800 };
  if (attendanceCount < 2050) return { start: 1800, end: 2050 };
  return { start: 2050, end: JOURNEY_MAX_ATTENDANCE_COUNT };
}

export function getJourneySegment(attendanceCount) {
  if (attendanceCount < 50) return "start";
  if (attendanceCount < 300) return "1";
  if (attendanceCount < 550) return "2";
  if (attendanceCount < 800) return "3";
  if (attendanceCount < 1050) return "4";
  if (attendanceCount < 1300) return "5";
  if (attendanceCount < 1550) return "6";
  if (attendanceCount < 1800) return "7";
  if (attendanceCount < 2050) return "8";
  return "end";
}

export function getSegmentProgress(attendanceCount) {
  const range = getJourneyRange(attendanceCount);

  return Math.min(
    1,
    Math.max(
      0,
      (attendanceCount - range.start) / (range.end - range.start)
    )
  );
}

export function getWalkerStageIndex(attendanceCount) {
  return Math.min(35, Math.max(0, Math.floor(attendanceCount / 100)));
}

export function getFallbackNextPromotionEvent(member) {
  const currentRankLevel = Number(
    member?.rankLevel ?? String(member?.level || "").replace("단", "") ?? 0
  );

  if (currentRankLevel >= 4) return null;

  const nextRankLevel = Math.max(1, currentRankLevel + 1);
  const requiredAttendanceCount =
    PROMOTION_ATTENDANCE_REQUIREMENTS[nextRankLevel];

  if (!requiredAttendanceCount) return null;

  if (currentRankLevel <= 0) {
    return {
      attendanceCount: requiredAttendanceCount,
      title: "1단 승단 가능",
      desc: "관리자 확인 후 승단을 진행할 수 있습니다.",
      kind: "promotion",
    };
  }

  const danPromotions = Array.isArray(member?.danPromotions)
    ? member.danPromotions
    : [];
  const latestPromotion = [...danPromotions].sort(
    (a, b) => Number(b.danRank) - Number(a.danRank)
  )[0];

  if (!latestPromotion) return null;

  return {
    attendanceCount:
      Number(latestPromotion.attendanceDay || 0) + requiredAttendanceCount,
    title: `${nextRankLevel}단 승단 가능`,
    desc: `${currentRankLevel}단 승단 후 다음 단계에 도전할 수 있습니다.`,
    kind: "promotion",
  };
}
