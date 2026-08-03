import fs from "fs";
import path from "path";

function readSource(...segments) {
  return fs.readFileSync(
    path.join(process.cwd(), ...segments),
    "utf8",
  );
}

describe("홈 수련 카드 제목 조건", () => {
  const home = readSource(
    "app",
    "(tabs)",
    "home.jsx",
  );

  const card = readSource(
    "src",
    "features",
    "home",
    "components",
    "Today",
    "TodayTrainingCard.jsx",
  );

  test("월요일의 정상 유단자회 세션이 있을 때만 지난주 수련으로 표시한다", () => {
    expect(home).toContain(
      "isActiveYudanjaScheduleForHomeTitle",
    );
    expect(home).toContain(
      "isMondayToday &&",
    );
    expect(home).toContain(
      "todaySchedules.some(",
    );
    expect(home).toContain(
      '? "지난주 수련"',
    );
    expect(home).toContain(
      ': "오늘의 수련"',
    );
    expect(home).toContain(
      "trainingLabel={todayTrainingLabel}",
    );
  });

  test("일반 회원·휴무·취소 유단자회는 지난주 수련 조건에서 제외한다", () => {
    expect(home).toContain(
      "isYudanja &&",
    );
    expect(home).toContain(
      'sessionLabel.includes("유단자")',
    );
    expect(home).toContain(
      "schedule?.isHoliday === true",
    );
    expect(home).toContain(
      "schedule?.isOpenHoliday !== true",
    );
    expect(home).toContain(
      'normalizedStatus === "cancelled"',
    );
    expect(home).toContain(
      "schedule?.isYudanjaClosed === true",
    );
    expect(home).toContain(
      "schedule?.closure?.isClosed === true",
    );
  });

  test("카드의 기존 기본 제목과 디자인은 유지한다", () => {
    expect(card).toContain(
      'trainingLabel = "오늘의 수련"',
    );
    expect(card).toContain(
      "{trainingLabel}",
    );
    expect(card).toContain(
      "styles.todayTrainingLabel",
    );
    expect(card).toContain(
      "styles.todayTrainingCard",
    );
  });
});
