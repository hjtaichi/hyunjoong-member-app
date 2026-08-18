const {
  getMonthlyGoalCrownStatus,
} = require("../src/features/home/weeklyGoalUtils");

describe("월간 출석 목표 달성왕", () => {
  test("지난달 실제 목표 주를 모두 달성하면 왕관을 준다", () => {
    const state = {
      weeks: {
        "2026-07-06": { goal: 3, attendanceCount: 3 },
        "2026-07-13": { goal: 3, attendanceCount: 4 },
        "2026-07-20": { goal: 3, attendanceCount: 3 },
        "2026-07-27": { goal: 3, attendanceCount: 3 },
        "2026-08-03": { goal: 3, attendanceCount: 0 },
      },
    };

    expect(
      getMonthlyGoalCrownStatus(state, "2026-08-18"),
    ).toMatchObject({
      visible: true,
      targetMonthKey: "2026-07",
      goalWeekCount: 4,
      achievedWeekCount: 4,
      restWeekCount: 0,
      streakWeekCount: 4,
    });
  });

  test("월말에 시작한 주는 월요일이 속한 달에 귀속한다", () => {
    const state = {
      weeks: {
        "2026-08-03": { goal: 2, attendanceCount: 2 },
        "2026-08-10": { goal: 2, attendanceCount: 2 },
        "2026-08-17": { goal: 2, attendanceCount: 2 },
        "2026-08-24": { goal: 2, attendanceCount: 2 },
        "2026-08-31": { goal: 2, attendanceCount: 2 },
      },
    };

    expect(
      getMonthlyGoalCrownStatus(state, "2026-09-07"),
    ).toMatchObject({
      visible: true,
      targetMonthKey: "2026-08",
      goalWeekCount: 5,
      achievedWeekCount: 5,
      streakWeekCount: 5,
    });
  });

  test("쉬는 주는 실패에서 제외하고 연속 기간에는 포함한다", () => {
    const state = {
      weeks: {
        "2026-07-06": { goal: 3, attendanceCount: 3 },
        "2026-07-13": {
          goal: null,
          isRestWeek: true,
          attendanceCount: 0,
        },
        "2026-07-20": { goal: 3, attendanceCount: 3 },
        "2026-07-27": { goal: 3, attendanceCount: 4 },
      },
    };

    expect(
      getMonthlyGoalCrownStatus(state, "2026-08-18"),
    ).toMatchObject({
      visible: true,
      goalWeekCount: 3,
      achievedWeekCount: 3,
      restWeekCount: 1,
      streakWeekCount: 4,
    });
  });

  test("쉬는 주만 있고 실제 목표 주가 0주면 왕관이 없다", () => {
    const state = {
      weeks: {
        "2026-07-06": {
          goal: null,
          isRestWeek: true,
          attendanceCount: 0,
        },
        "2026-07-13": {
          goal: null,
          isRestWeek: true,
          attendanceCount: 0,
        },
      },
    };

    expect(
      getMonthlyGoalCrownStatus(state, "2026-08-18"),
    ).toMatchObject({
      visible: false,
      goalWeekCount: 0,
      restWeekCount: 2,
      streakWeekCount: 2,
    });
  });

  test("실제 목표 주 중 하나라도 미달성이면 왕관이 없다", () => {
    const state = {
      weeks: {
        "2026-07-06": { goal: 3, attendanceCount: 3 },
        "2026-07-13": { goal: 3, attendanceCount: 2 },
        "2026-07-20": { goal: 3, attendanceCount: 3 },
      },
    };

    expect(
      getMonthlyGoalCrownStatus(state, "2026-08-18"),
    ).toMatchObject({
      visible: false,
      goalWeekCount: 3,
      achievedWeekCount: 2,
    });
  });
});