import fs from "fs";
import path from "path";

const root = path.resolve(__dirname, "..");

function read(relativePath) {
  return fs.readFileSync(
    path.join(root, relativePath),
    "utf8",
  );
}

describe("weekly goal server sync contract", () => {
  test("member API supports read save and local import", () => {
    const api = read(
      "src/api/memberWeeklyGoal.js",
    );

    expect(api).toContain(
      "/member/me/weekly-goal",
    );
    expect(api).toContain(
      "/member/me/weekly-goal/import",
    );
    expect(api).toContain(
      'method: "PATCH"',
    );
  });

  test("hook prefers server and keeps local fallback", () => {
    const hook = read(
      "src/features/home/useWeeklyGoal.js",
    );

    expect(hook).toContain(
      "getMemberWeeklyGoal",
    );
    expect(hook).toContain(
      "importMemberWeeklyGoalState",
    );
    expect(hook).toContain(
      "saveMemberWeeklyGoalSettings",
    );
    expect(hook).toContain(
      "loadFallbackFromCalendar",
    );
    expect(hook).toContain(
      "setWeekRange"
    );
    expect(hook).toContain(
      "nextWeekRange.weekKey"
    );
  });

  test("existing configured local goal is imported only when server has no state", () => {
    const hook = read(
      "src/features/home/useWeeklyGoal.js",
    );

    expect(hook).toContain(
      "snapshot?.hasServerState === false",
    );
    expect(hook).toContain(
      "hasConfiguredWeeklyGoalState",
    );
  });
  test("지난주 달성 팝업은 회원·주차별 1회만 표시한다", () => {
    const hook = read(
      "src/features/home/useWeeklyGoal.js",
    );
    const storage = read(
      "src/features/home/weeklyGoalStorage.js",
    );
    const home = read(
      "app/(tabs)/home.jsx",
    );

    expect(hook).toContain(
      "previousWeekAchievementPopup"
    );
    expect(hook).toContain(
      "hasSeenPreviousWeekAchievement"
    );
    expect(storage).toContain(
      "WEEKLY_GOAL_ACHIEVEMENT_SEEN_PREFIX"
    );
    expect(home).toContain(
      "지난주 목표 달성!"
    );
    expect(home).toContain(
      "이번 주도 힘차게 수련해봐요!"
    );
  });


});
