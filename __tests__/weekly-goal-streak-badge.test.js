import fs from "fs";
import path from "path";

const {
  getPreviousWeekAchievementStreak,
} = require("../src/features/home/weeklyGoalUtils");

function readSource(...segments) {
  return fs.readFileSync(
    path.join(process.cwd(), ...segments),
    "utf8",
  );
}

describe("주간 목표 연속달성 뱃지", () => {
  test("지난주부터 달성 주차가 실제로 연속된 경우에만 센다", () => {
    const state = {
      recurringGoal: 2,
      weeks: {
        "2026-07-13": {
          goal: 2,
          attendanceCount: 2,
        },
        "2026-07-20": {
          goal: 2,
          attendanceCount: 3,
        },
        "2026-07-27": {
          goal: 2,
          attendanceCount: 2,
        },
      },
    };

    expect(
      getPreviousWeekAchievementStreak(
        state,
        "2026-07-27",
      ),
    ).toBe(3);
  });

  test("쉬는 주나 미달성 주가 있으면 그 지점에서 연속 기록이 끊긴다", () => {
    const restWeekState = {
      recurringGoal: 2,
      weeks: {
        "2026-07-13": {
          goal: 2,
          attendanceCount: 2,
        },
        "2026-07-20": {
          goal: null,
          isRestWeek: true,
          attendanceCount: 0,
        },
        "2026-07-27": {
          goal: 2,
          attendanceCount: 2,
        },
      },
    };

    const missedWeekState = {
      recurringGoal: 2,
      weeks: {
        "2026-07-13": {
          goal: 2,
          attendanceCount: 2,
        },
        "2026-07-20": {
          goal: 2,
          attendanceCount: 1,
        },
        "2026-07-27": {
          goal: 2,
          attendanceCount: 2,
        },
      },
    };

    expect(
      getPreviousWeekAchievementStreak(
        restWeekState,
        "2026-07-27",
      ),
    ).toBe(1);

    expect(
      getPreviousWeekAchievementStreak(
        missedWeekState,
        "2026-07-27",
      ),
    ).toBe(1);
  });

  test("1주 달성에는 연속 뱃지가 없고 2주부터 지난주 목표달성 바로 뒤에 붙는다", () => {
    const home = readSource(
      "app",
      "(tabs)",
      "home.jsx",
    );
    const badgeAssets = readSource(
      "src",
      "features",
      "home",
      "memberBadges.js",
    );

    const assetNames = [
      "badge_weekly_goal_streak_2.png",
      "badge_weekly_goal_streak_3.png",
      "badge_weekly_goal_streak_4.png",
      "badge_weekly_goal_streak_5_plus.png",
    ];

    expect(home).toContain("streak >= 2");
    expect(home).toContain(
      "WEEKLY_GOAL_STREAK_5_PLUS",
    );
    expect(
      home.indexOf(
        'code: "PREVIOUS_WEEK_GOAL_ACHIEVED"',
      ),
    ).toBeLessThan(
      home.indexOf(
        "const streak = Math.max(",
      ),
    );

    for (const assetName of assetNames) {
      expect(badgeAssets).toContain(assetName);
      expect(
        fs.existsSync(
          path.join(
            process.cwd(),
            "assets",
            "badges",
            assetName,
          ),
        ),
      ).toBe(true);
    }
  });

  test("홈 헤더는 기존 flex-wrap 뱃지 행을 그대로 사용한다", () => {
    const header = readSource(
      "src",
      "features",
      "home",
      "components",
      "HomeHeader.jsx",
    );
    const styles = readSource(
      "src",
      "features",
      "home",
      "homeStyles.js",
    );

    expect(header).toContain(
      "visibleBadges.map((badge)",
    );
    expect(styles).toContain(
      'flexWrap: "wrap"',
    );
  });
});
