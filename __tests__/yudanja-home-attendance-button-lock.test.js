const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const homePath = path.join(root, "app/(tabs)/home.jsx");

describe("유단자회 출석 완료 후 홈 출석 버튼 잠금", () => {
  const source = fs.readFileSync(homePath, "utf8");

  test("유단자회 판별은 명칭과 MON_YUDANJA 키를 지원한다", () => {
    expect(source).toContain(
      "isActiveYudanjaScheduleForHomeTitle"
    );
    expect(source).toContain(
      'sessionLabel.includes("유단자")'
    );
    expect(source).toContain(
      'sessionTimeKey === "MON_YUDANJA"'
    );
  });

  test("present 유단자회는 일반수련 시간창과 무관하게 완료 처리한다", () => {
    expect(source).toContain(
      "isActiveYudanjaScheduleForHomeTitle(item)"
    );
    expect(source).toContain("isYudanjaSession ||");
    expect(source).toContain(
      "isWithinTodayAttendanceLockWindow(item, todayString)"
    );
    expect(source).toMatch(
      /attendanceStatus\s*===\s*"present"[\s\S]*isYudanjaSession\s*\|\|[\s\S]*isWithinTodayAttendanceLockWindow/
    );
  });

  test("일반수련의 기존 시간창 판정은 그대로 유지한다", () => {
    expect(source).toContain(
      "isWithinTodayAttendanceLockWindow(item, todayString)"
    );
  });

  test("완료 여부가 기존 버튼 문구와 잠금 상태에 연결된다", () => {
    expect(source).toContain(
      "const hasTodayCompletedSession = !!todayCompletedSession"
    );
    expect(source).toContain(
      "const todayAttendanceButtonText = hasTodayCompletedSession"
    );
  });
});
