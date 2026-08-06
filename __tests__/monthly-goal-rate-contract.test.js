const fs = require("fs");
const path = require("path");

function read(...segments) {
  return fs.readFileSync(
    path.join(process.cwd(), ...segments),
    "utf8",
  );
}

describe("일반수련 주간 목표 홈 표시", () => {
  test("기존 월간 달성률 대신 주간 일반수련 목표를 표시한다", () => {
    const header = read(
      "src",
      "features",
      "home",
      "components",
      "HomeHeader.jsx",
    );
    const home = read(
      "app",
      "(tabs)",
      "home.jsx",
    );

    expect(header).toContain(
      "이번 주 출석 목표",
    );
    expect(header).toContain(
      "weeklyGoalSummary?.valueText",
    );
    expect(home).toContain(
      "weeklyGoalSummary={weeklyGoal.summary}",
    );
    expect(home).toContain(
      "onPressWeeklyGoal",
    );

    expect(header).not.toContain(
      "출석 목표 달성률",
    );
    expect(header).not.toContain(
      "monthlyGoalRate",
    );
    expect(home).not.toContain(
      "monthlyGoalRate={homeData?.monthlyGoalRate}",
    );
  });

  test("목표 설정 바텀시트에 이번 주·반복·쉬는 주가 있다", () => {
    const modal = read(
      "src",
      "features",
      "home",
      "components",
      "WeeklyGoalModal.jsx",
    );

    expect(modal).toContain(
      "일반수련 주간 목표",
    );
    expect(modal).toContain(
      "이번 주만",
    );
    expect(modal).toContain(
      "매주 반복",
    );
    expect(modal).toContain(
      "이번 주 목표 쉬기",
    );
    expect(modal).toContain(
      "유단자회 수련은 목표 횟수에",
    );
    expect(modal).toContain(
      "포함되지 않습니다.",
    );
  });
});
