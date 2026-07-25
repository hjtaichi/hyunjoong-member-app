const {
  ALL_TRIAL_TIME_OPTIONS,
  getKoreaTodayDateKey,
  isPastTrialDate,
  getTrialTimeOptionsForDate,
  isTrialDateSelectable,
  validateTrialScheduleSelection,
} = require(
  "../src/features/trial/trialSchedule"
);

const FIXED_NOW =
  new Date("2026-07-25T06:00:00.000Z");

describe("체험 신청 날짜별 시간 UI 정책", () => {
  test("한국 시간 기준 오늘 날짜를 계산한다", () => {
    expect(
      getKoreaTodayDateKey(FIXED_NOW)
    ).toBe("2026-07-25");
  });

  test("과거 날짜는 선택할 수 없다", () => {
    expect(
      isPastTrialDate(
        "2026-07-16",
        FIXED_NOW
      )
    ).toBe(true);

    expect(
      isTrialDateSelectable(
        "2026-07-16",
        FIXED_NOW
      )
    ).toBe(false);

    expect(
      getTrialTimeOptionsForDate(
        "2026-07-16",
        FIXED_NOW
      )
    ).toEqual([]);
  });

  test("오늘 날짜는 운영 요일이면 선택할 수 있다", () => {
    expect(
      isPastTrialDate(
        "2026-07-25",
        FIXED_NOW
      )
    ).toBe(false);

    expect(
      isTrialDateSelectable(
        "2026-07-25",
        FIXED_NOW
      )
    ).toBe(true);
  });

  test("목요일에는 10시, 16시, 19시만 표시한다", () => {
    expect(
      getTrialTimeOptionsForDate(
        "2026-07-30",
        FIXED_NOW
      )
    ).toEqual([
      {
        label: "오전 10시",
        value: "10:00",
      },
      {
        label: "오후 4시",
        value: "16:00",
      },
      {
        label: "오후 7시",
        value: "19:00",
      },
    ]);
  });

  test("토요일에는 10시와 13시 30분만 표시한다", () => {
    expect(
      getTrialTimeOptionsForDate(
        "2026-08-01",
        FIXED_NOW
      )
    ).toEqual([
      {
        label: "오전 10시",
        value: "10:00",
      },
      {
        label: "13시 30분(토)",
        value: "13:30",
      },
    ]);
  });

  test("일요일과 월요일은 선택할 수 없다", () => {
    expect(
      isTrialDateSelectable(
        "2026-08-02",
        FIXED_NOW
      )
    ).toBe(false);

    expect(
      isTrialDateSelectable(
        "2026-08-03",
        FIXED_NOW
      )
    ).toBe(false);
  });

  test("과거 날짜 제출을 거부한다", () => {
    expect(
      validateTrialScheduleSelection(
        {
          hopeDate: "2026-07-16",
          hopeTime: "10:00",
        },
        FIXED_NOW
      )
    ).toEqual({
      ok: false,
      message:
        "지난 날짜에는 체험을 신청할 수 없습니다.",
    });
  });

  test("목요일 13시 30분 선택을 거부한다", () => {
    expect(
      validateTrialScheduleSelection(
        {
          hopeDate: "2026-07-30",
          hopeTime: "13:30",
        },
        FIXED_NOW
      )
    ).toEqual({
      ok: false,
      message:
        "오후 1시 30분 체험은 토요일에만 신청할 수 있습니다.",
    });
  });

  test("토요일 13시 30분 선택을 허용한다", () => {
    expect(
      validateTrialScheduleSelection(
        {
          hopeDate: "2026-08-01",
          hopeTime: "13:30",
        },
        FIXED_NOW
      )
    ).toEqual({
      ok: true,
      message: "",
    });
  });

  test("전체 시간 옵션은 기존 네 버튼을 유지한다", () => {
    expect(
      ALL_TRIAL_TIME_OPTIONS.map(
        (option) => option.value
      )
    ).toEqual([
      "10:00",
      "13:30",
      "16:00",
      "19:00",
    ]);
  });
});
