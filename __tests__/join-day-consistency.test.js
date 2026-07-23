import fs from "fs";
import path from "path";
import {
  formatJoinDayCountLabel,
  getJoinDayCountFromHome,
  normalizeJoinDayCount,
} from "../src/utils/joinDay";

function readSource(...segments) {
  return fs.readFileSync(
    path.join(process.cwd(), ...segments),
    "utf8"
  );
}

describe("홈·내 정보·수련의 길 입관 경과일 일관성", () => {
  test("백엔드 joinDayCount만 정수 일차로 사용한다", () => {
    expect(
      getJoinDayCountFromHome({
        member: {
          joinDayCount: 24,
          joinDate: "2026-07-01T00:00:00+09:00",
        },
      })
    ).toBe(24);

    expect(
      getJoinDayCountFromHome({
        member: {
          joinDate: "2026-07-01T00:00:00+09:00",
        },
      })
    ).toBeNull();

    expect(normalizeJoinDayCount(0)).toBeNull();
    expect(normalizeJoinDayCount("24")).toBe(24);
    expect(formatJoinDayCountLabel(24)).toBe("입관 24일째");
    expect(formatJoinDayCountLabel(null)).toBe("입관일 확인 필요");
  });

  test("홈 화면은 날짜를 다시 계산하지 않는다", () => {
    const screen = readSource("app", "(tabs)", "home.jsx");
    const header = readSource(
      "src",
      "features",
      "home",
      "components",
      "HomeHeader.jsx"
    );

    expect(screen).toContain("getJoinDayCountFromHome(homeData)");
    expect(screen).toContain("joinDayCount={joinDayCount}");
    expect(screen).not.toContain("getDateDiffInDays");
    expect(screen).not.toContain("joinDateString");
    expect(header).toContain("입관 {joinDayCount}일째");
  });

  test("내 정보 화면은 백엔드 일차를 그대로 표시한다", () => {
    const screen = readSource("app", "(tabs)", "mypage.jsx");
    const legacyUtils = readSource(
      "src",
      "features",
      "mypage",
      "mypageUtils.js"
    );

    expect(screen).toContain("getJoinDayCountFromHome(homeData)");
    expect(screen).toContain("formatJoinDayCountLabel(joinDayCount)");
    expect(screen).not.toContain("getJoinedPeriodLabel");
    expect(legacyUtils).not.toContain("new Date(joinedAt)");
  });

  test("수련의 길은 같은 백엔드 일차를 입관 이력에 사용한다", () => {
    const history = readSource("app", "training-history.jsx");
    const journey = readSource("app", "training-journey.jsx");
    const journeyUtils = readSource(
      "src",
      "features",
      "trainingJourney",
      "trainingJourneyUtils.js"
    );

    expect(history).toContain("getJoinDayCountFromHome(homeData)");
    expect(history).toContain("`${joinDayCount}일째`");
    expect(history).not.toContain("getJoinedPeriodLabel");
    expect(journey).not.toContain("getJoinedPeriodLabel");
    expect(journeyUtils).not.toContain("new Date(joinedAt)");
  });
});
