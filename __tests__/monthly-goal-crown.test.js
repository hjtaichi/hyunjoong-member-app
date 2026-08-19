const {
  getMonthlyGoalCrownStatus,
} = require("../src/features/home/weeklyGoalUtils");

describe("월간 출석 목표 달성왕", () => {
  test("김뚀깡의 7월 27일 테스트 달성 기록은 8월 왕관을 만들지 않는다", () => {
    const state = {
      recurringGoal: 5,
      weeks: {
        "2026-07-27": {
          goal: 6,
          attendanceCount: 6,
          mode: "one-time",
          isRestWeek: false,
          completedAt:
            "2026-08-01T06:47:56.949Z",
        },
      },
    };

    expect(
      getMonthlyGoalCrownStatus(
        state,
        "2026-08-19",
      ),
    ).toMatchObject({
      visible: false,
      targetMonthKey: "2026-07",
      goalWeekCount: 0,
      achievedWeekCount: 0,
      restWeekCount: 0,
      streakWeekCount: 0,
    });
  });

  test("첫 정상 왕관은 8월 17일 이후 세 목표 주를 모두 달성하면 9월에 지급한다", () => {
    const state = {
      weeks: {
        "2026-08-03": {
          goal: 5,
          attendanceCount: 5,
        },
        "2026-08-10": {
          goal: 5,
          attendanceCount: 5,
        },
        "2026-08-17": {
          goal: 3,
          attendanceCount: 3,
        },
        "2026-08-24": {
          goal: 3,
          attendanceCount: 4,
        },
        "2026-08-31": {
          goal: 3,
          attendanceCount: 3,
        },
      },
    };

    expect(
      getMonthlyGoalCrownStatus(
        state,
        "2026-09-01",
      ),
    ).toMatchObject({
      visible: true,
      targetMonthKey: "2026-08",
      goalWeekCount: 3,
      achievedWeekCount: 3,
      restWeekCount: 0,
      streakWeekCount: 3,
    });
  });

  test("실제 목표 주가 1주뿐이면 전부 달성해도 왕관이 없다", () => {
    const state = {
      weeks: {
        "2026-09-07": {
          goal: 2,
          attendanceCount: 2,
        },
      },
    };

    expect(
      getMonthlyGoalCrownStatus(
        state,
        "2026-10-05",
      ),
    ).toMatchObject({
      visible: false,
      goalWeekCount: 1,
      achievedWeekCount: 1,
      streakWeekCount: 1,
    });
  });

  test("실제 목표 주가 2주뿐이면 전부 달성해도 왕관이 없다", () => {
    const state = {
      weeks: {
        "2026-09-07": {
          goal: 2,
          attendanceCount: 2,
        },
        "2026-09-14": {
          goal: 2,
          attendanceCount: 2,
        },
      },
    };

    expect(
      getMonthlyGoalCrownStatus(
        state,
        "2026-10-05",
      ),
    ).toMatchObject({
      visible: false,
      goalWeekCount: 2,
      achievedWeekCount: 2,
      streakWeekCount: 2,
    });
  });

  test("실제 목표 주가 최소 3주이고 전부 달성하면 왕관을 준다", () => {
    const state = {
      weeks: {
        "2026-09-07": {
          goal: 3,
          attendanceCount: 3,
        },
        "2026-09-14": {
          goal: 3,
          attendanceCount: 4,
        },
        "2026-09-21": {
          goal: 3,
          attendanceCount: 3,
        },
      },
    };

    expect(
      getMonthlyGoalCrownStatus(
        state,
        "2026-10-05",
      ),
    ).toMatchObject({
      visible: true,
      goalWeekCount: 3,
      achievedWeekCount: 3,
      streakWeekCount: 3,
    });
  });

  test("쉬는 주는 실패가 아니지만 최소 3주와 표시 N에서는 제외한다", () => {
    const state = {
      weeks: {
        "2026-09-07": {
          goal: 3,
          attendanceCount: 3,
        },
        "2026-09-14": {
          goal: null,
          isRestWeek: true,
          attendanceCount: 0,
        },
        "2026-09-21": {
          goal: 3,
          attendanceCount: 3,
        },
        "2026-09-28": {
          goal: 3,
          attendanceCount: 4,
        },
      },
    };

    expect(
      getMonthlyGoalCrownStatus(
        state,
        "2026-10-05",
      ),
    ).toMatchObject({
      visible: true,
      goalWeekCount: 3,
      achievedWeekCount: 3,
      restWeekCount: 1,
      streakWeekCount: 3,
    });
  });

  test("목표 2주와 쉬는 주가 있어도 최소 3개 실제 목표 주를 못 채우면 왕관이 없다", () => {
    const state = {
      weeks: {
        "2026-09-07": {
          goal: 3,
          attendanceCount: 3,
        },
        "2026-09-14": {
          goal: null,
          isRestWeek: true,
          attendanceCount: 0,
        },
        "2026-09-21": {
          goal: 3,
          attendanceCount: 3,
        },
        "2026-09-28": {
          goal: null,
          isRestWeek: true,
          attendanceCount: 0,
        },
      },
    };

    expect(
      getMonthlyGoalCrownStatus(
        state,
        "2026-10-05",
      ),
    ).toMatchObject({
      visible: false,
      goalWeekCount: 2,
      achievedWeekCount: 2,
      restWeekCount: 2,
      streakWeekCount: 2,
    });
  });

  test("실제 목표 주 중 하나라도 미달성이면 왕관이 없다", () => {
    const state = {
      weeks: {
        "2026-09-07": {
          goal: 3,
          attendanceCount: 3,
        },
        "2026-09-14": {
          goal: 3,
          attendanceCount: 2,
        },
        "2026-09-21": {
          goal: 3,
          attendanceCount: 3,
        },
      },
    };

    expect(
      getMonthlyGoalCrownStatus(
        state,
        "2026-10-05",
      ),
    ).toMatchObject({
      visible: false,
      goalWeekCount: 3,
      achievedWeekCount: 2,
      streakWeekCount: 3,
    });
  });

  test("월말 주는 월요일 weekKey가 속한 달에 귀속한다", () => {
    const state = {
      weeks: {
        "2026-08-17": {
          goal: 2,
          attendanceCount: 2,
        },
        "2026-08-24": {
          goal: 2,
          attendanceCount: 2,
        },
        "2026-08-31": {
          goal: 2,
          attendanceCount: 2,
        },
        "2026-09-07": {
          goal: 5,
          attendanceCount: 0,
        },
      },
    };

    expect(
      getMonthlyGoalCrownStatus(
        state,
        "2026-09-07",
      ),
    ).toMatchObject({
      visible: true,
      targetMonthKey: "2026-08",
      goalWeekCount: 3,
      achievedWeekCount: 3,
      streakWeekCount: 3,
    });
  });
});
