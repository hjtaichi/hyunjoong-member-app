const {
  applyCurrentWeekGoal,
  applyRecurringGoal,
  applyRestWeek,
  countWeeklyGeneralAttendance,
  getKoreaWeekRange,
  getPreviousKoreaWeekRange,
  getMinimumSelectableWeeklyGoal,
  normalizeWeeklyGoalState,
  resolveCurrentWeeklyGoalState,
  resolvePreviousWeekGoalAchievement,
} = require("../src/features/home/weeklyGoalUtils");

const WEEK_KEY = "2026-07-27";
const NEXT_WEEK_KEY = "2026-08-03";

describe("일반수련 주간 목표 계산", () => {
  test("일반수련 실제 출석만 세고 유단자회와 보정출석은 제외한다", () => {
    const count = countWeeklyGeneralAttendance(
      {
        "2026-07-27": [
          {
            sessionId: "yudanja",
            title: "월요일 유단자수련",
            attendanceStatus: "present",
            sessionTimeKey: "MON_YUDANJA",
          },
        ],
        "2026-07-28": [
          {
            sessionId: "general-1",
            title: "오전 10시 태극권반",
            attendanceStatus: "present",
          },
          {
            sessionId: "adjusted",
            title: "오후 7시 태극권반",
            attendanceStatus: "present",
            attendanceSource: "admin_adjustment",
          },
        ],
        "2026-07-30": [
          {
            sessionId: "general-2",
            title: "오후 4시 태극권반",
            attendanceStatus: "present",
          },
          {
            sessionId: "reserved",
            title: "오후 7시 태극권반",
            attendanceStatus: "reserved",
          },
        ],
      },
      {
        startDate: WEEK_KEY,
        endDate: "2026-08-02",
      },
    );

    expect(count).toBe(2);
  });

  test("같은 날 서로 다른 일반수업에 여러 번 출석하면 횟수대로 합산한다", () => {
    const count = countWeeklyGeneralAttendance(
      {
        "2026-07-28": [
          {
            sessionId: "general",
            startTime: "오전 10:00",
            attendanceStatus: "present",
          },
          {
            sessionId: "general",
            startTime: "오후 1:30",
            attendanceStatus: "present",
          },
          {
            sessionId: "general",
            startTime: "오후 7:00",
            attendanceStatus: "present",
          },
          {
            sessionId: "general",
            startTime: "오후 7:00",
            attendanceStatus: "present",
          },
        ],
      },
      {
        startDate: WEEK_KEY,
        endDate: "2026-08-02",
      },
    );

    expect(count).toBe(3);
  });

  test("월이 바뀌어도 같은 주의 일반수련 출석 횟수를 합산한다", () => {
    const count = countWeeklyGeneralAttendance(
      {
        "2026-07-31": [
          {
            attendanceId: "july-session",
            startTime: "오후 7:00",
            attendanceStatus: "present",
          },
        ],
        "2026-08-01": [
          {
            attendanceId: "august-morning",
            startTime: "오전 10:00",
            attendanceStatus: "present",
          },
          {
            attendanceId: "august-afternoon",
            startTime: "오후 1:30",
            attendanceStatus: "present",
          },
        ],
      },
      {
        startDate: WEEK_KEY,
        endDate: "2026-08-02",
      },
    );

    expect(count).toBe(3);
  });

  test("목표 미설정 상태에서는 현재 출석 횟수 이상을 선택할 수 있다", () => {
    expect(
      getMinimumSelectableWeeklyGoal(0, null),
    ).toBe(1);
    expect(
      getMinimumSelectableWeeklyGoal(2, null),
    ).toBe(2);
    expect(
      getMinimumSelectableWeeklyGoal(6, null),
    ).toBe(6);
    expect(
      getMinimumSelectableWeeklyGoal(0, 5),
    ).toBe(1);
    expect(
      getMinimumSelectableWeeklyGoal(2, 5),
    ).toBe(2);
    expect(
      getMinimumSelectableWeeklyGoal(12, 10),
    ).toBe(12);

    const sameAsAttendance =
      applyCurrentWeekGoal(
        normalizeWeeklyGoalState(null),
        {
          weekKey: WEEK_KEY,
          attendanceCount: 2,
          goal: 2,
        },
      );

    expect(sameAsAttendance.record).toMatchObject({
      goal: 2,
      attendanceCount: 2,
    });
    expect(sameAsAttendance.record.completedAt).toBeTruthy();

    const highFrequencyGoal =
      applyCurrentWeekGoal(
        normalizeWeeklyGoalState(null),
        {
          weekKey: WEEK_KEY,
          attendanceCount: 6,
          goal: 15,
        },
      );

    expect(highFrequencyGoal.record).toMatchObject({
      goal: 15,
      attendanceCount: 6,
    });

    expect(() =>
      applyCurrentWeekGoal(
        normalizeWeeklyGoalState(null),
        {
          weekKey: WEEK_KEY,
          attendanceCount: 6,
          goal: 16,
        },
      ),
    ).toThrow(
      "목표 횟수는 1회부터 15회까지 입력해주세요.",
    );
  });

  test("매주 반복 목표는 다음 주부터 적용된다", () => {
    const result = applyRecurringGoal(
      normalizeWeeklyGoalState(null),
      {
        weekKey: WEEK_KEY,
        nextWeekKey: NEXT_WEEK_KEY,
        attendanceCount: 0,
        goal: 15,
      },
    );

    expect(result.state.recurringGoal).toBeNull();
    expect(result.state.pendingRecurringGoal).toBe(15);
    expect(result.state.pendingRecurringWeekKey).toBe(
      NEXT_WEEK_KEY,
    );
    expect(result.record.goal).toBeNull();
    expect(result.appliesFromNextWeek).toBe(true);
  });

  test("현재 출석과 같은 반복 목표도 다음 주부터 적용한다", () => {
    const result = applyRecurringGoal(
      normalizeWeeklyGoalState(null),
      {
        weekKey: WEEK_KEY,
        nextWeekKey: NEXT_WEEK_KEY,
        attendanceCount: 5,
        goal: 5,
      },
    );

    expect(result.appliesFromNextWeek).toBe(true);
    expect(result.state.pendingRecurringGoal).toBe(5);
    expect(result.record.goal).toBeNull();
  });

  test("반복 목표로 시작한 이번 주 목표도 실제 출석 횟수까지 낮출 수 있다", () => {
    const initial = normalizeWeeklyGoalState({
      recurringGoal: 5,
      weeks: {
        [WEEK_KEY]: {
          goal: 5,
          mode: "recurring",
        },
      },
    });

    const beforeAttendance =
      applyCurrentWeekGoal(initial, {
        weekKey: WEEK_KEY,
        attendanceCount: 0,
        goal: 1,
      });

    expect(
      beforeAttendance.record.goal,
    ).toBe(1);

    const afterAttendance =
      applyCurrentWeekGoal(initial, {
        weekKey: WEEK_KEY,
        attendanceCount: 2,
        goal: 2,
      });

    expect(
      afterAttendance.record.goal,
    ).toBe(2);

    expect(() =>
      applyCurrentWeekGoal(initial, {
        weekKey: WEEK_KEY,
        attendanceCount: 2,
        goal: 1,
      }),
    ).toThrow(
      "실제 일반수련 출석 횟수보다 낮게",
    );
  });

  test("반복 목표 변경은 현재 주와 관계없이 다음 주부터 적용한다", () => {
    const initial = normalizeWeeklyGoalState({
      recurringGoal: 5,
      weeks: {
        [WEEK_KEY]: {
          goal: 5,
          mode: "recurring",
        },
      },
    });

    const result = applyRecurringGoal(initial, {
      weekKey: WEEK_KEY,
      nextWeekKey: NEXT_WEEK_KEY,
      attendanceCount: 2,
      goal: 2,
    });

    expect(result.record.goal).toBe(5);
    expect(result.state.recurringGoal).toBe(5);
    expect(result.state.pendingRecurringGoal).toBe(2);
    expect(result.state.pendingRecurringWeekKey).toBe(
      NEXT_WEEK_KEY,
    );
    expect(result.appliesFromNextWeek).toBe(true);
  });

  test("첫 일반수련 출석 전까지만 쉬는 주를 설정할 수 있다", () => {
    const rest = applyRestWeek(
      normalizeWeeklyGoalState({
        recurringGoal: 3,
      }),
      {
        weekKey: WEEK_KEY,
        attendanceCount: 0,
      },
    );

    expect(rest.record).toMatchObject({
      goal: null,
      mode: "rest",
      isRestWeek: true,
    });

    expect(() =>
      applyRestWeek(rest.state, {
        weekKey: WEEK_KEY,
        attendanceCount: 1,
      }),
    ).toThrow(
      "일반수련에 출석하기 전까지만 쉬는 주를 설정할 수 있어요.",
    );
  });

  test("쉬는 주에 실제 출석하면 기존 반복 목표로 자동 복귀한다", () => {
    const rest = applyRestWeek(
      normalizeWeeklyGoalState({
        recurringGoal: 3,
      }),
      {
        weekKey: WEEK_KEY,
        attendanceCount: 0,
      },
    );

    const resolved = resolveCurrentWeeklyGoalState(
      rest.state,
      {
        weekKey: WEEK_KEY,
        attendanceCount: 1,
        nowIso: "2026-07-28T01:00:00.000Z",
      },
    );

    expect(resolved.autoResumed).toBe(true);
    expect(resolved.record).toMatchObject({
      goal: 3,
      mode: "recurring",
      isRestWeek: false,
      attendanceCount: 1,
    });
  });

  test("지난 주 기록은 현재 주 설정 변경으로 수정되지 않는다", () => {
    const previousWeek = "2026-07-20";
    const state = normalizeWeeklyGoalState({
      recurringGoal: 3,
      weeks: {
        [previousWeek]: {
          goal: 3,
          mode: "recurring",
          attendanceCount: 3,
          completedAt:
            "2026-07-25T01:00:00.000Z",
        },
      },
    });

    const previousSnapshot = JSON.stringify(
      state.weeks[previousWeek],
    );

    const next = applyCurrentWeekGoal(state, {
      weekKey: WEEK_KEY,
      attendanceCount: 0,
      goal: 4,
    }).state;

    expect(
      JSON.stringify(next.weeks[previousWeek]),
    ).toBe(previousSnapshot);
  });

  test("지난주 목표를 달성하거나 초과하면 이번 주 달성 정보가 생성된다", () => {
    const previousWeekRange =
      getPreviousKoreaWeekRange(
        NEXT_WEEK_KEY,
      );

    expect(previousWeekRange).toMatchObject({
      weekKey: WEEK_KEY,
      startDate: WEEK_KEY,
      endDate: "2026-08-02",
    });

    const achieved =
      resolvePreviousWeekGoalAchievement(
        {
          recurringGoal: 5,
          weeks: {
            [WEEK_KEY]: {
              goal: 5,
              mode: "recurring",
              attendanceCount: 4,
            },
          },
        },
        {
          weekRange:
            previousWeekRange,
          attendanceCount: 6,
          nowIso:
            "2026-08-03T00:00:00.000Z",
        },
      );

    expect(
      achieved.achievement,
    ).toMatchObject({
      goal: 5,
      attendanceCount: 6,
      achieved: true,
      exceeded: true,
    });
    expect(
      achieved.record.completedAt,
    ).toBeTruthy();
  });

  test("한국시간 날짜를 월요일 시작 주간으로 계산한다", () => {
    const range = getKoreaWeekRange(
      new Date("2026-08-01T01:00:00.000Z"),
    );

    expect(range).toEqual({
      weekKey: "2026-07-27",
      startDate: "2026-07-27",
      endDate: "2026-08-02",
      nextWeekKey: "2026-08-03",
    });
  });
});
