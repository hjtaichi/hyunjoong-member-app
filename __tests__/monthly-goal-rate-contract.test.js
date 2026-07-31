const fs = require("fs");
const path = require("path");

const source = fs.readFileSync(
  path.join(
    process.cwd(),
    "src/features/home/components/HomeHeader.jsx",
  ),
  "utf8",
);

describe("월간 출석 목표 달성률 표시", () => {
  test("예약 출석 횟수와 이번 달 유효 예약 횟수를 함께 표시한다", () => {
    expect(source).toContain(
      "monthlyGoalRate?.attendedCount",
    );
    expect(source).toContain(
      "monthlyGoalRate?.targetCount",
    );
    expect(source).toContain(
      "monthlyAttendedCount}/{monthlyReservationCount",
    );
  });
});
