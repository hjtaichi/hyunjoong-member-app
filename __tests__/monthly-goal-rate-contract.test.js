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
  test("홈에는 달성률만 표시하고 예약 출석 분수는 표시하지 않는다", () => {
    expect(source).toContain(
      "출석 목표 달성률 {monthlyRate}%",
    );
    expect(source).not.toContain(
      "예약 출석",
    );
    expect(source).not.toContain(
      "monthlyAttendedCount",
    );
    expect(source).not.toContain(
      "monthlyReservationCount",
    );
  });
});