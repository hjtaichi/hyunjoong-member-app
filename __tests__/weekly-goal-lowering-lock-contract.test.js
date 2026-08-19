const fs = require("fs");
const path = require("path");

function readSource(...segments) {
  return fs.readFileSync(
    path.join(
      process.cwd(),
      ...segments,
    ),
    "utf8",
  );
}

describe("weekly goal lowering lock contract", () => {
  test("current goal is the floor after attendance", () => {
    const utils = readSource(
      "src",
      "features",
      "home",
      "weeklyGoalUtils.js",
    );

    expect(utils).toContain(
      "clampGoal(current.goal)",
    );

    expect(utils).toContain(
      "Number(attendanceCount || 0) > 0",
    );

    expect(utils).toContain(
      "일반수련 출석을 시작한 뒤에는 이번 주 목표를 낮출 수 없습니다.",
    );
  });

  test("modal prevents lowering below saved current goal after attendance", () => {
    const modal = readSource(
      "src",
      "features",
      "home",
      "components",
      "WeeklyGoalModal.jsx",
    );

    expect(modal).toContain(
      "[attendanceCount, savedCurrentGoal]",
    );

    expect(modal).toContain(
      "Number(attendanceCount || 0) <= 0",
    );

    expect(modal).toContain(
      "일반수련 출석 후에는 이번 주",
    );
  });
});
