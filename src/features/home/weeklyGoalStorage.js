import AsyncStorage from "@react-native-async-storage/async-storage";

import { normalizeWeeklyGoalState } from "./weeklyGoalUtils";

const WEEKLY_GOAL_STORAGE_PREFIX =
  "hjtaichi:member-weekly-goal:v1:";

const WEEKLY_GOAL_ACHIEVEMENT_SEEN_PREFIX =
  "hjtaichi:weekly-goal-achievement-seen:v1:";

function getStorageKey(memberKey) {
  const normalized = String(memberKey || "").trim();

  if (!normalized) {
    throw new Error("회원 정보를 확인할 수 없습니다.");
  }

  return `${WEEKLY_GOAL_STORAGE_PREFIX}${normalized}`;
}

export async function loadWeeklyGoalState(memberKey) {
  const key = getStorageKey(memberKey);

  try {
    const raw = await AsyncStorage.getItem(key);
    return normalizeWeeklyGoalState(
      raw ? JSON.parse(raw) : null,
    );
  } catch {
    await AsyncStorage.removeItem(key);
    return normalizeWeeklyGoalState(null);
  }
}

export async function saveWeeklyGoalState(
  memberKey,
  state,
) {
  const key = getStorageKey(memberKey);
  const normalized = normalizeWeeklyGoalState(state);

  await AsyncStorage.setItem(
    key,
    JSON.stringify(normalized),
  );

  return normalized;
}

function getAchievementSeenKey(
  memberKey,
  currentWeekKey,
) {
  const normalizedMemberKey =
    String(memberKey || "").trim();
  const normalizedWeekKey =
    String(currentWeekKey || "").trim();

  if (!normalizedMemberKey || !normalizedWeekKey) {
    throw new Error(
      "주간 목표 달성 확인 정보를 만들 수 없습니다.",
    );
  }

  return [
    WEEKLY_GOAL_ACHIEVEMENT_SEEN_PREFIX,
    normalizedMemberKey,
    ":",
    normalizedWeekKey,
  ].join("");
}

export async function hasSeenPreviousWeekAchievement(
  memberKey,
  currentWeekKey,
) {
  const key = getAchievementSeenKey(
    memberKey,
    currentWeekKey,
  );

  return (await AsyncStorage.getItem(key)) === "1";
}

export async function markPreviousWeekAchievementSeen(
  memberKey,
  currentWeekKey,
) {
  const key = getAchievementSeenKey(
    memberKey,
    currentWeekKey,
  );

  await AsyncStorage.setItem(key, "1");
}
