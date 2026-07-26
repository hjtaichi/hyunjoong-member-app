import fs from "fs";
import path from "path";
import {
  DEFAULT_PROMOTION_BASE_ATTENDANCE,
  HIGHEST_RANK_LEVEL,
  getFallbackNextPromotionEvent,
} from "../src/features/trainingJourney/trainingJourneyUtils";

function readSource(...segments) {
  return fs.readFileSync(path.join(process.cwd(), ...segments), "utf8");
}

describe("승단·수련의 길 표시 정책", () => {
  test("기록이 없는 2단은 447회 기준에서 3단 목표를 계산한다", () => {
    expect(DEFAULT_PROMOTION_BASE_ATTENDANCE[2]).toBe(447);

    expect(
      getFallbackNextPromotionEvent({
        rankLevel: 2,
        danPromotions: [],
      })
    ).toMatchObject({
      attendanceCount: 897,
      baseAttendanceCount: 447,
      baseAttendanceSource: "estimated",
      requiredAttendanceCount: 450,
      title: "3단 승단 가능",
    });
  });

  test("실제 2단 승단 횟수가 있으면 실제값을 사용한다", () => {
    expect(
      getFallbackNextPromotionEvent({
        rankLevel: 2,
        danPromotions: [
          { danRank: 2, promotedAt: "2024-01-01", attendanceDay: 530 },
        ],
      })
    ).toMatchObject({
      attendanceCount: 980,
      baseAttendanceCount: 530,
      baseAttendanceSource: "recorded",
    });
  });

  test("9단은 최고단이며 10단 이벤트를 만들지 않는다", () => {
    expect(HIGHEST_RANK_LEVEL).toBe(9);
    expect(getFallbackNextPromotionEvent({ rankLevel: 9 })).toBeNull();
  });

  test("수련의 길은 Backend 자격 판정과 최고단 상태를 사용한다", () => {
    const source = readSource("app", "training-history.jsx");

    expect(source).toMatch(/promotionGoal\s*\?\.\s*isEligible\s*===\s*true/m);
    expect(source).toMatch(/promotionGoal\s*\?\.\s*targetAttendanceCount/m);
    expect(source).toMatch(/promotionGoal\s*\?\.\s*baseAttendanceCount/m);
    expect(source).toMatch(/promotionGoal\s*\?\.\s*attendanceAfterBase/m);
    expect(source).toContain("9단 최고단에 도달했습니다.");
    expect(source).toContain('promotionBaseSource === "estimated"');
    expect(source).not.toContain("attendanceCount + Number(promotionGoal?.remainingCount || 0)");
  });

  test("홈 배지는 9단 최고단과 남은 횟수를 안전하게 표시한다", () => {
    const source = readSource("app", "(tabs)", "home.jsx");

    expect(source).toContain('? "9단 최고단"');
    expect(source).toContain("승단까지 ${promotionRemainingText}회");
    expect(source).not.toContain("승단 D-${promotionRemainingText}일");
  });

  test("50회 단위 격려 문구 구현을 그대로 보존한다", () => {
    const source = readSource("app", "training-history.jsx");

    expect(source).toContain('50: "좋아, 첫걸음을 내디뎠어."');
    expect(source).toMatch(/Math\.round\(\s*attendanceCount\s*\/\s*50\s*\)\s*\*\s*50/m);
    expect(source).toContain("shouldShowJourneyQuote(attendanceCount)");
  });
});
