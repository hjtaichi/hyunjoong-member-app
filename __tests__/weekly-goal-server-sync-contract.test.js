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
});
