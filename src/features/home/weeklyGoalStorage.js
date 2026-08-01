import AsyncStorage from "@react-native-async-storage/async-storage";

import { normalizeWeeklyGoalState } from "./weeklyGoalUtils";

const WEEKLY_GOAL_STORAGE_PREFIX =
  "hjtaichi:member-weekly-goal:v1:";

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
