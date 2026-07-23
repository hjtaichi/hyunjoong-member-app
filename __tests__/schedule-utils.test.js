import {
  pad,
  toDateString,
  getDateDiffInDays,
  getMonthMatrix,
  formatRecurringTime,
  formatRecurringReservations,
  getSessionDisplayLabel,
  getScheduleUiMeta,
  getScheduleCardStyle,
} from "../src/features/schedule/scheduleUtils";

describe("회원 일정 날짜 계산", () => {
  test("월과 일을 두 자리로 맞춘다", () => {
    expect(pad(3)).toBe("03");
    expect(pad(12)).toBe("12");
  });

  test("로컬 날짜를 YYYY-MM-DD 형식으로 만든다", () => {
    expect(toDateString(new Date(2026, 6, 9))).toBe("2026-07-09");
  });

  test("두 날짜의 차이를 일수로 계산한다", () => {
    expect(getDateDiffInDays("2026-07-01", "2026-07-05")).toBe(4);
  });

  test("올바르지 않은 날짜는 null로 처리한다", () => {
    expect(getDateDiffInDays("invalid", "2026-07-05")).toBeNull();
  });

  test("달력은 7일 단위 주차와 해당 월 전체 날짜를 만든다", () => {
    const matrix = getMonthMatrix(2026, 7);
    const dates = matrix.flat().filter(Boolean);

    expect(matrix.every((week) => week.length === 7)).toBe(true);
    expect(dates).toHaveLength(31);
    expect(toDateString(dates[0])).toBe("2026-07-01");
    expect(toDateString(dates[dates.length - 1])).toBe("2026-07-31");
  });
});

describe("정기예약과 수업 표시", () => {
  test.each([
    ["MON_YUDANJA", "유단자회"],
    ["10:00", "10시"],
    ["16:00", "4시"],
    ["13:30", "1시 30분"],
  ])("%s 시간값을 %s로 표시한다", (value, expected) => {
    expect(formatRecurringTime(value)).toBe(expected);
  });

  test("정기예약 요일과 시간을 한 줄로 표시한다", () => {
    const result = formatRecurringReservations([
      {
        weekday: 2,
        sessionTimeKey: "10:00",
      },
      {
        dayOfWeek: 6,
        time: "13:30",
      },
    ]);

    expect(result).toBe("화(10시) · 토(1시 30분)");
  });

  test("유단자수련과 일반 수업 시간을 구분한다", () => {
    expect(
      getSessionDisplayLabel({
        title: "월요일 유단자 특별수련",
      })
    ).toBe("유단자수련");

    expect(
      getSessionDisplayLabel({
        title: "현중태극권 수업",
        startTime: "오후 7:00",
      })
    ).toBe("오후 7시 수업");
  });
});

describe("예약·출석 화면 상태 판독", () => {
  test("정기예약 쉬기 예외는 다시 출석 예정으로 복구할 수 있다", () => {
    const meta = getScheduleUiMeta(
      {
        canReserve: true,
        recurringMeta: {
          hasRecurringException: true,
          memberRecurringReservationId: 101,
        },
      },
      {
        isReservableDate: true,
      }
    );

    expect(meta).toMatchObject({
      tone: "available",
      label: "예약 가능",
      actionLabel: "출석 예정",
      actionType: "undoSkip",
      isRecurring: false,
    });
  });

  test("시작한 수업의 이번만 쉬기 상태는 유지하고 복구 동작을 숨긴다", () => {
    const meta = getScheduleUiMeta(
      {
        canReserve: false,
        reserveBlockedReason:
          "이미 시작한 수업은 출석 예정으로 등록할 수 없습니다.",
        recurringMeta: {
          hasRecurringException: true,
          memberRecurringReservationId: 104,
        },
      },
      {
        isReservableDate: true,
      }
    );

    expect(meta).toMatchObject({
      tone: "disabled",
      label: "이번만 쉬기",
      helperText:
        "이미 시작한 수업은 출석 예정으로 등록할 수 없습니다.",
      actionLabel: null,
      actionType: null,
      isRecurring: false,
    });
  });

  test("정기예약 수업은 이번만 쉬기 동작을 표시한다", () => {
    const meta = getScheduleUiMeta(
      {
        attendanceStatus: "reserved",
        canCancelReservation: true,
        recurringMeta: {
          isRecurring: true,
          matchedRecurringRule: true,
          memberRecurringReservationId: 102,
        },
      },
      {
        isReservableDate: true,
      }
    );

    expect(meta).toMatchObject({
      tone: "reserved",
      label: "정기출석 예정",
      actionLabel: "이번만 쉬기",
      actionType: "skipOnce",
      isRecurring: true,
    });
  });

  test("일반예약 수업은 예약 취소 동작을 표시한다", () => {
    const meta = getScheduleUiMeta(
      {
        attendanceStatus: "reserved",
        canCancelReservation: true,
        recurringMeta: {
          isRecurring: false,
        },
      },
      {
        isReservableDate: true,
      }
    );

    expect(meta).toMatchObject({
      tone: "reserved",
      label: "출석 예정",
      actionLabel: "예약 취소",
      actionType: "cancelReserve",
      isRecurring: false,
    });
  });

  test("시작한 일반예약은 출석 예정 상태를 유지하고 취소 동작을 숨긴다", () => {
    const meta = getScheduleUiMeta(
      {
        attendanceStatus: "reserved",
        canReserve: false,
        canCancelReservation: false,
        cancelReservationReason:
          "수업이 시작된 후에는 예약을 취소할 수 없습니다.",
        recurringMeta: {
          isRecurring: false,
        },
      },
      {
        isReservableDate: true,
      }
    );

    expect(meta).toMatchObject({
      tone: "reserved",
      label: "출석 예정",
      helperText:
        "수업이 시작된 후에는 예약을 취소할 수 없습니다.",
      actionLabel: null,
      actionType: null,
      isRecurring: false,
    });
  });

  test("시작한 정기예약은 정기출석 예정 상태를 유지하고 이번만 쉬기를 숨긴다", () => {
    const meta = getScheduleUiMeta(
      {
        attendanceStatus: "reserved",
        canReserve: false,
        canCancelReservation: false,
        cancelReservationReason:
          "수업이 시작된 후에는 예약을 취소할 수 없습니다.",
        recurringMeta: {
          isRecurring: true,
          matchedRecurringRule: true,
          memberRecurringReservationId: 103,
        },
      },
      {
        isReservableDate: true,
      }
    );

    expect(meta).toMatchObject({
      tone: "reserved",
      label: "정기출석 예정",
      helperText:
        "수업이 시작된 후에는 예약을 취소할 수 없습니다.",
      actionLabel: null,
      actionType: null,
      isRecurring: true,
    });
  });

  test("출석 취소 가능 상태를 표시한다", () => {
    const meta = getScheduleUiMeta(
      {
        attendanceStatus: "present",
        canCancelAttendance: true,
      },
      {
        isReservableDate: true,
      }
    );

    expect(meta).toMatchObject({
      tone: "done",
      label: "출석 완료",
      actionLabel: "출석 취소",
      actionType: "cancelAttendance",
    });
  });

  test("예약 가능한 수업은 출석 예정 동작을 표시한다", () => {
    const meta = getScheduleUiMeta(
      {
        canReserve: true,
        recurringMeta: {},
      },
      {
        isReservableDate: true,
      }
    );

    expect(meta).toMatchObject({
      tone: "available",
      label: "예약 가능",
      actionLabel: "출석 예정",
      actionType: "reserve",
    });
  });

  test("예약 차단 사유가 있으면 예약 불가 상태를 표시한다", () => {
    const meta = getScheduleUiMeta(
      {
        canReserve: false,
        reserveBlockedReason: "주말반 회원은 토요일만 예약할 수 있습니다.",
      },
      {
        isReservableDate: true,
      }
    );

    expect(meta).toMatchObject({
      tone: "disabled",
      label: "예약 불가",
      helperText: "주말반 회원은 토요일만 예약할 수 있습니다.",
      actionLabel: null,
      actionType: null,
    });
  });

  test("화면 상태별 카드 스타일을 연결한다", () => {
    const styles = {
      scheduleCardDone: "done-card",
      scheduleStatusChipDone: "done-chip",
      scheduleStatusChipTextDone: "done-text",
      scheduleCardReserved: "reserved-card",
      scheduleStatusChipReserved: "reserved-chip",
      scheduleStatusChipTextReserved: "reserved-text",
      scheduleCardAvailable: "available-card",
      scheduleStatusChipAvailable: "available-chip",
      scheduleStatusChipTextAvailable: "available-text",
      scheduleCardCancelled: "cancelled-card",
      scheduleStatusChipCancelled: "cancelled-chip",
      scheduleStatusChipTextCancelled: "cancelled-text",
      scheduleCardDisabled: "disabled-card",
      scheduleStatusChipDisabled: "disabled-chip",
      scheduleStatusChipTextDisabled: "disabled-text",
    };

    expect(getScheduleCardStyle(styles, "done")).toEqual({
      container: "done-card",
      chip: "done-chip",
      chipText: "done-text",
    });

    expect(getScheduleCardStyle(styles, "reserved")).toEqual({
      container: "reserved-card",
      chip: "reserved-chip",
      chipText: "reserved-text",
    });

    expect(getScheduleCardStyle(styles, "available")).toEqual({
      container: "available-card",
      chip: "available-chip",
      chipText: "available-text",
    });

    expect(getScheduleCardStyle(styles, "cancelled")).toEqual({
      container: "cancelled-card",
      chip: "cancelled-chip",
      chipText: "cancelled-text",
    });

    expect(getScheduleCardStyle(styles, "unknown")).toEqual({
      container: "disabled-card",
      chip: "disabled-chip",
      chipText: "disabled-text",
    });
  });
});


const { readFileSync: readAttendanceConsistencySource } = require("node:fs");
const { join: joinAttendanceConsistencyPath } = require("node:path");

function readAttendanceConsistencyFile(relativePath) {
  return readAttendanceConsistencySource(joinAttendanceConsistencyPath(process.cwd(), relativePath), "utf8");
}

describe("회원 홈 출석 표시 일관성", () => {
  test("누적 출석은 수업 횟수 단위로 표시한다", () => {
    const source = readAttendanceConsistencyFile("src/features/home/components/HomeHeader.jsx");
    expect(source).toContain("누적 출석 {attendanceCount}회");
    expect(source).not.toContain("누적 출석 {attendanceCount}일");
  });

  test("출석 목표 달성률은 백엔드 계산값을 표시한다", () => {
    const source = readAttendanceConsistencyFile("src/features/home/components/HomeHeader.jsx");
    expect(source).toContain("Number(monthlyGoalRate?.rate || 0)");
    expect(source).toContain("출석 목표 달성률 {monthlyRate}%");
  });

  test("홈 응답과 출석 목표를 무조건 console에 출력하지 않는다", () => {
    const hookSource = readAttendanceConsistencyFile("src/features/home/useHomeScreen.js");
    const screenSource = readAttendanceConsistencyFile("app/(tabs)/home.jsx");
    expect(hookSource).not.toContain(`console.log("🔥 HOME RESPONSE ="`);
    expect(hookSource).not.toContain(`console.log("🔥 monthlyGoalRate ="`);
    expect(screenSource).not.toContain(`console.log("🔥 monthlyGoalRate ="`);
  });
});
