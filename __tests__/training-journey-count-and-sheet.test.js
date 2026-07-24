import fs from "fs";
import path from "path";
import {
  getFallbackNextPromotionEvent,
  getJourneyAttendanceCount,
  getJourneyRange,
  getJourneySegment,
  getSegmentProgress,
} from "../src/features/trainingJourney/trainingJourneyUtils";

function readSource(...segments) {
  return fs.readFileSync(path.join(process.cwd(), ...segments), "utf8");
}

describe("수련의 길 출석 횟수 기준과 바텀시트 보호", () => {
  test("같은 날 여러 수업도 출석 횟수 그대로 사용한다", () => {
    const homeData = {
      member: {
        totalAttendanceSessionCount: 7,
        totalAttendanceCount: 6,
      },
      trainingStats: {
        totalAttendanceSessionCount: 7,
        totalAttendanceCount: 6,
      },
    };

    expect(getJourneyAttendanceCount(homeData)).toBe(7);
  });

  test("출석 횟수 필드가 없을 때 출석 일수로 되돌아가지 않는다", () => {
    expect(
      getJourneyAttendanceCount({
        member: { totalAttendanceCount: 1000 },
        trainingStats: { totalAttendanceCount: 1000 },
      })
    ).toBe(0);
  });

  test("0~2200 수련 구간과 진행률을 출석 횟수로 계산한다", () => {
    expect(getJourneySegment(0)).toBe("start");
    expect(getJourneySegment(299)).toBe("1");
    expect(getJourneySegment(300)).toBe("2");
    expect(getJourneySegment(2200)).toBe("end");
    expect(getJourneyRange(2200)).toEqual({ start: 2050, end: 2200 });
    expect(getSegmentProgress(2175)).toBeCloseTo(125 / 150);
  });

  test("승단 횟수 기준은 147·300·450·600회를 사용한다", () => {
    expect(getFallbackNextPromotionEvent({ rankLevel: 0 })).toMatchObject({
      attendanceCount: 147,
      title: "1단 승단 가능",
    });
    expect(
      getFallbackNextPromotionEvent({
        rankLevel: 2,
        danPromotions: [{ danRank: 2, attendanceDay: 447 }],
      })
    ).toMatchObject({ attendanceCount: 897, title: "3단 승단 가능" });
    expect(getFallbackNextPromotionEvent({ rankLevel: 4 })).toBeNull();
  });

  test("수련의 길 화면은 횟수 필드만 사용하고 일수 문구를 남기지 않는다", () => {
    const historySource = readSource("app", "training-history.jsx");
    const journeySource = readSource("app", "training-journey.jsx");
    const statsSource = readSource("app", "training-stats.jsx");

    expect(historySource).toContain("getJourneyAttendanceCount(homeData)");
    expect(historySource).not.toContain("totalAttendanceCount ??");
    expect(historySource).not.toMatch(/출석\s*\d+일/);
    expect(historySource).not.toMatch(/\d+일\s*(달성|남음|더 수련)/);
    expect(journeySource).not.toMatch(/출석\s*\d+일/);
    expect(statsSource).toContain("totalAttendanceSessionCount");
    expect(statsSource).not.toContain("totalAttendanceCount ??");
    expect(statsSource).toContain("총 출석횟수");
    expect(statsSource).not.toContain("총 출석일");
  });

  test("바텀시트는 일정 화면과 같은 Modal slide 구조로 분리한다", () => {
    const source = readSource("app", "training-history.jsx");

    expect(source).toContain("function TrainingStatsBottomSheet(");
    expect(source).toContain("React.memo(TrainingStatsBottomSheet)");
    expect(source).toContain("<Modal");
    expect(source).toContain('animationType="slide"');
    expect(source).toContain("hardwareAccelerated");
    expect(source).toContain("styles.statsCollapsedSheet");
    expect(source).toContain("styles.statsModalOverlay");
    expect(source).toContain("styles.statsModalSheet");
    expect(source).not.toContain("Animated.spring");
    expect(source).not.toContain("PanResponder.create");
    expect(source).not.toContain("transform: [{ translateY }]");
    expect(source).not.toContain("{ height: sheetHeight }");
    expect(source).not.toContain("getCommonHistoryMilestones(token)");
  });
});
