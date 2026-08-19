import fs from "fs";
import path from "path";

function readSource(...segments) {
  return fs.readFileSync(
    path.join(process.cwd(), ...segments),
    "utf8",
  );
}

describe("월간 목표달성왕 왕관 UI 계약", () => {
  test("실제 월간 상태로 프로필 왕관을 표시하고 클릭한다", () => {
    const home = readSource(
      "app",
      "(tabs)",
      "home.jsx",
    );

    const header = readSource(
      "src",
      "features",
      "home",
      "components",
      "HomeHeader.jsx",
    );

    expect(home).toContain(
      "monthlyGoalCrown={weeklyGoal.monthlyGoalCrown}",
    );

    expect(header).toContain(
      "monthlyGoalCrown?.visible === true",
    );

    expect(header).toContain(
      "setMonthlyGoalCrownModalVisible(true)",
    );

    expect(header).not.toContain(
      "MONTHLY_GOAL_CROWN_UI_PREVIEW = true",
    );
  });

  test("왕관 모달은 최종 확정 문구를 사용한다", () => {
    const modal = readSource(
      "src",
      "features",
      "home",
      "components",
      "MonthlyGoalCrownModal.jsx",
    );

    expect(modal).toContain(
      "👑 출석 목표 달성왕!",
    );

    expect(modal).toContain(
      "지난달 목표를 세운 {weekCount}주 모두 출석 목표를 달성했어요.",
    );

    expect(modal).not.toContain(
      "주 연속 출석 목표를 달성했어요.",
    );

    expect(modal).toContain(
      "이대로라면 금방 고수가 되시겠어요!",
    );

    expect(modal).toContain(
      "다음 달 왕관도 노려볼까요? ✨",
    );
  });

  test("정식 운영 시작 주와 최소 3개 실제 목표 주 정책을 유지한다", () => {
    const utils = readSource(
      "src",
      "features",
      "home",
      "weeklyGoalUtils.js",
    );

    expect(utils).toContain(
      "MONTHLY_GOAL_CROWN_OPERATION_START_WEEK_KEY",
    );

    expect(utils).toContain(
      '"2026-08-17"',
    );

    expect(utils).toContain(
      "MONTHLY_GOAL_CROWN_MIN_GOAL_WEEKS = 3",
    );

    expect(utils).toContain(
      "weekKey >=",
    );

    expect(utils).toContain(
      "achievedWeekCount === goalWeekCount",
    );
  });

  test("쉬는 주는 최소 목표 주 수와 안내 N에 포함하지 않는다", () => {
    const utils = readSource(
      "src",
      "features",
      "home",
      "weeklyGoalUtils.js",
    );

    expect(utils).toContain(
      "record?.isRestWeek === true",
    );

    expect(utils).toContain(
      "streakWeekCount: goalWeekCount",
    );

    expect(utils).not.toContain(
      "goalWeekCount + restWeekCount",
    );
  });

  test("최종 왕관 PNG와 일반/유단자 별도 위치 스타일을 사용한다", () => {
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

    expect(
      fs.existsSync(
        path.join(
          process.cwd(),
          "assets",
          "images",
          "monthly-goal-crown.png",
        ),
      ),
    ).toBe(true);

    expect(header).toContain(
      "styles.homeMonthlyGoalCrown",
    );

    expect(header).toContain(
      "styles.homeMonthlyGoalCrownYudanja",
    );

    expect(styles).toContain(
      "homeMonthlyGoalCrown:",
    );

    expect(styles).toContain(
      "homeMonthlyGoalCrownYudanja:",
    );
  });
});
