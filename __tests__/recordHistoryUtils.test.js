import {
  formatNumber,
  formatRecordCount,
  groupFormHistory,
  groupGongbeopGoals,
  groupGongbeopGoalsByHalf,
} from "../src/features/records/recordHistoryUtils";

describe("recordHistoryUtils", () => {
  test("기록 숫자에 천 단위 구분 기호를 표시한다", () => {
    expect(formatNumber(5222)).toBe("5,222");

    expect(
      formatRecordCount(5222, 999, "회")
    ).toBe("5,222 / 999회");
  });

  test("동일 반기의 같은 투로 기록을 하나로 묶는다", () => {
    const result = groupFormHistory([
      {
        periodYear: 2026,
        periodHalf: 1,
        periodLabel: "2026년 상반기",
        periodSub: "1월 ~ 6월",
        forms: [
          {
            formKey: "dando-24",
            name: "현중태극단도 24식",
            currentCount: 51,
            targetCount: 50,
            completedAt: "2026-06-20T10:00:00",
          },
          {
            formKey: "dando-24",
            name: "현중태극단도 24식",
            currentCount: 101,
            targetCount: 100,
            completedAt: "2026-06-30T10:00:00",
          },
          {
            formKey: "taeguk-29",
            name: "현중태극권 29식",
            currentCount: 10,
            targetCount: 10,
            completedAt: "2026-06-25T10:00:00",
          },
        ],
      },
    ]);

    expect(result).toHaveLength(1);
    expect(result[0].totalRecords).toBe(3);
    expect(result[0].totalForms).toBe(2);

    const dandoGroup = result[0].formGroups.find(
      (group) => group.key === "dando-24"
    );

    expect(dandoGroup.records).toHaveLength(2);
    expect(dandoGroup.latestRecord.targetCount).toBe(100);
  });

  test("공력 기록을 월별과 날짜별로 묶는다", () => {
    const result = groupGongbeopGoals([
      {
        id: "goal-1",
        type: "duyoMinutes",
        current: 25,
        target: 15,
        completedAt: "2026-07-08T10:00:00",
      },
      {
        id: "goal-2",
        type: "yobujeonsa",
        current: 31,
        target: 30,
        completedAt: "2026-07-06T10:00:00",
      },
      {
        id: "goal-3",
        type: "ohaengjeonsa",
        current: 25,
        target: 20,
        completedAt: "2026-07-06T12:00:00",
      },
    ]);

    expect(result).toHaveLength(1);
    expect(result[0].monthLabel).toBe("2026년 7월");
    expect(result[0].totalRecords).toBe(3);
    expect(result[0].dateGroups).toHaveLength(2);
    expect(result[0].dateGroups[0].dateLabel).toBe("7월 8일");
    expect(result[0].dateGroups[1].items).toHaveLength(2);
  });

  test("공력 기록을 연도별 상반기와 하반기로 나눈다", () => {
    const result = groupGongbeopGoalsByHalf([
      {
        id: "goal-second-half-july",
        type: "duyoMinutes",
        current: 25,
        target: 15,
        completedAt: "2026-07-08T10:00:00",
      },
      {
        id: "goal-first-half",
        type: "yobujeonsa",
        current: 31,
        target: 30,
        completedAt: "2026-06-30T10:00:00",
      },
      {
        id: "goal-second-half-december",
        type: "ohaengjeonsa",
        current: 25,
        target: 20,
        completedAt: "2026-12-01T10:00:00",
      },
    ]);

    expect(result).toHaveLength(2);
    expect(result[0].periodLabel).toBe("2026년 하반기");
    expect(result[0].periodSub).toBe("7월 ~ 12월");
    expect(result[0].totalRecords).toBe(2);
    expect(result[0].monthGroups).toHaveLength(2);
    expect(result[1].periodLabel).toBe("2026년 상반기");
    expect(result[1].periodSub).toBe("1월 ~ 6월");
    expect(result[1].totalRecords).toBe(1);
  });
});