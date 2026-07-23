import {
  Alert,
} from "react-native";
import {
  act,
  renderHook,
  waitFor,
} from "@testing-library/react-native";

import { router } from "expo-router";
import { getMemberCalendar } from "../src/api/memberCalendar";
import {
  markAttendance,
  reserveAttendance,
  cancelReservation,
  cancelAttendance,
  skipRecurringReservationOnce,
  undoSkipRecurringReservationOnce,
} from "../src/api/memberAttendance";
import { useScheduleScreen } from "../src/features/schedule/useScheduleScreen";

jest.mock("expo-router", () => ({
  router: {
    replace: jest.fn(),
    push: jest.fn(),
  },
}));

jest.mock("../src/api/memberCalendar", () => ({
  getMemberCalendar: jest.fn(),
}));

jest.mock("../src/api/memberAttendance", () => ({
  markAttendance: jest.fn(),
  reserveAttendance: jest.fn(),
  cancelReservation: jest.fn(),
  cancelAttendance: jest.fn(),
  skipRecurringReservationOnce: jest.fn(),
  undoSkipRecurringReservationOnce: jest.fn(),
}));

const TODAY = "2026-07-16";

function makeCalendarData(overrides = {}) {
  const item = {
    sessionId: "session-1",
    title: "태극권 수련",
    attendanceStatus: null,
    canCancelAttendance: false,
    canCancelReservation: true,
    cancelReservationReason: null,
    recurringMeta: {},
    ...overrides,
  };

  return {
    days: [
      {
        date: TODAY,
        attendanceStatus:
          item.attendanceStatus || null,
        hasRecurringException:
          item.recurringMeta
            ?.hasRecurringException === true,
      },
    ],
    scheduleByDate: {
      [TODAY]: [item],
    },
    recurringReservations: [
      {
        weekday: 2,
        sessionTimeKey: "AM_10",
      },
    ],
  };
}

function makeProps(overrides = {}) {
  const logout = jest
    .fn()
    .mockResolvedValue(undefined);

  const toDateString = jest.fn((value) => {
    return value?.iso || TODAY;
  });

  const getMonthMatrix = jest.fn(() => {
    return [
      [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ],
    ];
  });

  const getDateDiffInDays = jest.fn(
    (fromDate, toDate) => {
      const from = new Date(
        `${fromDate}T00:00:00`
      );
      const to = new Date(
        `${toDate}T00:00:00`
      );

      return Math.round(
        (to.getTime() - from.getTime()) /
          86400000
      );
    }
  );

  const formatRecurringReservations =
    jest.fn(() => "recurring-summary");

  return {
    token: "member-token",
    user: {
      memberStatus: "active",
    },
    logout,
    toDateString,
    getMonthMatrix,
    getDateDiffInDays,
    formatRecurringReservations,
    ...overrides,
  };
}

function renderScheduleHook(props) {
  return renderHook(() =>
    useScheduleScreen(props)
  );
}

describe("회원 일정 화면 상태와 출석·예약 동작", () => {
  let alertSpy;
  let consoleLogSpy;

  beforeAll(() => {
    alertSpy = jest
      .spyOn(Alert, "alert")
      .mockImplementation(() => {});

    consoleLogSpy = jest
      .spyOn(console, "log")
      .mockImplementation(() => {});
  });

  afterAll(() => {
    alertSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  beforeEach(() => {
    jest.clearAllMocks();

    getMemberCalendar.mockResolvedValue(
      makeCalendarData()
    );

    markAttendance.mockResolvedValue({
      status: "present",
    });

    reserveAttendance.mockResolvedValue({
      status: "reserved",
    });

    cancelReservation.mockResolvedValue({
      cancelled: true,
    });

    cancelAttendance.mockResolvedValue({
      status: null,
    });

    skipRecurringReservationOnce.mockResolvedValue({
      exceptionType: "skip",
    });

    undoSkipRecurringReservationOnce.mockResolvedValue({
      restored: true,
    });
  });

  test("토큰이 없으면 일정 API를 호출하지 않는다", async () => {
    const props = makeProps({
      token: null,
    });

    const { result } =
      await renderScheduleHook(props);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(
      getMemberCalendar
    ).not.toHaveBeenCalled();

    expect(result.current.calendarData).toBeNull();
  });

  test("휴식중 회원은 일정 API를 호출하지 않는다", async () => {
    const props = makeProps({
      user: {
        memberStatus: "paused",
      },
    });

    const { result } =
      await renderScheduleHook(props);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(
      getMemberCalendar
    ).not.toHaveBeenCalled();
  });

  test("현재 월 일정과 선택 날짜 상태를 구성한다", async () => {
    getMemberCalendar.mockResolvedValue(
      makeCalendarData({
        attendanceStatus: "reserved",
      })
    );

    const props = makeProps();
    const { result } =
      await renderScheduleHook(props);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(getMemberCalendar).toHaveBeenCalledWith(
      "member-token",
      expect.any(Number),
      expect.any(Number)
    );

    expect(result.current.selectedDate).toBe(TODAY);
    expect(result.current.selectedSchedules).toHaveLength(1);
    expect(result.current.selectedMySchedules).toHaveLength(1);

    expect(
      result.current.calendarMap[TODAY]
    ).toEqual(
      expect.objectContaining({
        date: TODAY,
        attendanceStatus: "reserved",
      })
    );

    expect(result.current.recurringInfoText).toBe(
      "recurring-summary"
    );
  });

  test("401 일정 조회 실패 시 로그아웃하고 로그인으로 이동한다", async () => {
    const error = new Error("expired token");
    error.response = {
      status: 401,
    };

    getMemberCalendar.mockRejectedValue(error);

    const props = makeProps();

    await renderScheduleHook(props);

    await waitFor(() => {
      expect(props.logout).toHaveBeenCalled();
    });

    expect(router.replace).toHaveBeenCalledWith(
      "/login"
    );

    expect(Alert.alert).toHaveBeenCalled();
  });

  test("날짜 선택 시 선택 날짜와 바텀시트를 연다", async () => {
    const props = makeProps();
    const { result } =
      await renderScheduleHook(props);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      result.current.handlePressDate({
        iso: "2026-07-20",
      });
    });

    expect(result.current.selectedDate).toBe(
      "2026-07-20"
    );

    expect(
      result.current.isScheduleSheetVisible
    ).toBe(true);

    await act(async () => {
      result.current.closeScheduleSheet();
    });

    expect(
      result.current.isScheduleSheetVisible
    ).toBe(false);
  });

  test("QR 출석 동작은 시트를 닫고 QR 화면으로 이동한다", async () => {
    const props = makeProps();
    const { result } =
      await renderScheduleHook(props);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      result.current.openScheduleSheet();
    });

    expect(
      result.current.isScheduleSheetVisible
    ).toBe(true);

    await act(async () => {
      result.current.handleScheduleAction(
        {},
        "qrAttendance"
      );
    });

    expect(
      result.current.isScheduleSheetVisible
    ).toBe(false);

    expect(router.push).toHaveBeenCalledWith(
      "/qr-attendance"
    );
  });

  test("일반 출석 예정 등록 후 로컬 상태를 reserved로 바꾼다", async () => {
    const initialData = makeCalendarData();

    getMemberCalendar.mockResolvedValue(
      initialData
    );

    const props = makeProps();
    const { result } =
      await renderScheduleHook(props);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const item =
      result.current.selectedSchedules[0];

    await act(async () => {
      await result.current.handleScheduleAction(
        item,
        "reserve"
      );
    });

    expect(reserveAttendance).toHaveBeenCalledWith(
      "member-token",
      "session-1"
    );

    expect(
      result.current.selectedSchedules[0]
        .attendanceStatus
    ).toBe("reserved");

    expect(
      result.current.selectedSchedules[0]
        .recurringMeta
    ).toMatchObject({
      isRecurring: false,
      hasRecurringException: false,
      exceptionType: null,
    });

    expect(getMemberCalendar).toHaveBeenCalledTimes(1);
    expect(result.current.submittingAttendance).toBe(
      false
    );
  });

  test("일반 예약 취소 후 최신 일정을 다시 조회한다", async () => {
    const initialData = makeCalendarData({
      attendanceStatus: "reserved",
    });

    const refreshedData = makeCalendarData({
      attendanceStatus: null,
    });

    getMemberCalendar
      .mockResolvedValueOnce(initialData)
      .mockResolvedValueOnce(refreshedData);

    const props = makeProps();
    const { result } =
      await renderScheduleHook(props);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const item =
      result.current.selectedSchedules[0];

    await act(async () => {
      await result.current.handleScheduleAction(
        item,
        "cancelReserve"
      );
    });

    expect(cancelReservation).toHaveBeenCalledWith(
      "member-token",
      "session-1"
    );

    expect(getMemberCalendar).toHaveBeenCalledTimes(2);

    expect(
      result.current.selectedSchedules[0]
        .attendanceStatus
    ).toBeNull();
  });

  test("시작한 일반 예약은 취소 API를 호출하지 않는다", async () => {
    getMemberCalendar.mockResolvedValue(
      makeCalendarData({
        attendanceStatus: "reserved",
        canCancelReservation: false,
        cancelReservationReason:
          "수업이 시작된 후에는 예약을 취소할 수 없습니다.",
      })
    );

    const props = makeProps();
    const { result } =
      await renderScheduleHook(props);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const item =
      result.current.selectedSchedules[0];

    await act(async () => {
      await result.current.handleScheduleAction(
        item,
        "cancelReserve"
      );
    });

    expect(cancelReservation).not.toHaveBeenCalled();
    expect(Alert.alert).toHaveBeenCalledWith(
      "안내",
      "수업이 시작된 후에는 예약을 취소할 수 없습니다."
    );
  });

  test("직접 출석 후 present 상태를 다시 조회한다", async () => {
    const initialData = makeCalendarData();

    const refreshedData = makeCalendarData({
      attendanceStatus: "present",
      canCancelAttendance: true,
    });

    getMemberCalendar
      .mockResolvedValueOnce(initialData)
      .mockResolvedValueOnce(refreshedData);

    const props = makeProps();
    const { result } =
      await renderScheduleHook(props);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const item =
      result.current.selectedSchedules[0];

    await act(async () => {
      await result.current.handleScheduleAction(
        item,
        "attendance"
      );
    });

    expect(markAttendance).toHaveBeenCalledWith(
      "member-token",
      {
        date: TODAY,
        sessionId: "session-1",
      }
    );

    expect(
      result.current.selectedSchedules[0]
        .attendanceStatus
    ).toBe("present");

    expect(
      result.current.selectedSchedules[0]
        .canCancelAttendance
    ).toBe(true);
  });

  test("출석 취소 결과가 reserved이면 예약 상태를 유지한다", async () => {
    const initialData = makeCalendarData({
      attendanceStatus: "present",
      canCancelAttendance: true,
    });

    const refreshedData = makeCalendarData({
      attendanceStatus: "reserved",
      canCancelAttendance: false,
    });

    cancelAttendance.mockResolvedValue({
      status: "reserved",
    });

    getMemberCalendar
      .mockResolvedValueOnce(initialData)
      .mockResolvedValueOnce(refreshedData);

    const props = makeProps();
    const { result } =
      await renderScheduleHook(props);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const item =
      result.current.selectedSchedules[0];

    await act(async () => {
      await result.current.handleScheduleAction(
        item,
        "cancelAttendance"
      );
    });

    expect(cancelAttendance).toHaveBeenCalledWith(
      "member-token",
      "session-1"
    );

    expect(
      result.current.selectedSchedules[0]
        .attendanceStatus
    ).toBe("reserved");

    expect(
      result.current.selectedSchedules[0]
        .canCancelAttendance
    ).toBe(false);
  });

  test("정기예약 이번만 쉬기는 예외 상태로 갱신한다", async () => {
    const initialData = makeCalendarData({
      attendanceStatus: "reserved",
      recurringMeta: {
        isRecurring: true,
        memberRecurringReservationId: 901,
      },
    });

    const refreshedData = makeCalendarData({
      attendanceStatus: null,
      recurringMeta: {
        isRecurring: false,
        memberRecurringReservationId: 901,
        hasRecurringException: true,
        exceptionType: "skip",
      },
    });

    getMemberCalendar
      .mockResolvedValueOnce(initialData)
      .mockResolvedValueOnce(refreshedData);

    const props = makeProps();
    const { result } =
      await renderScheduleHook(props);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const item =
      result.current.selectedSchedules[0];

    await act(async () => {
      await result.current.handleScheduleAction(
        item,
        "skipOnce"
      );
    });

    expect(
      skipRecurringReservationOnce
    ).toHaveBeenCalledWith(
      "member-token",
      {
        memberRecurringReservationId: 901,
        date: TODAY,
        reason: "",
      }
    );

    expect(
      result.current.selectedSchedules[0]
        .recurringMeta
    ).toMatchObject({
      isRecurring: false,
      hasRecurringException: true,
      exceptionType: "skip",
    });
  });

  test("시작한 정기예약은 이번만 쉬기 API를 호출하지 않는다", async () => {
    getMemberCalendar.mockResolvedValue(
      makeCalendarData({
        attendanceStatus: "reserved",
        canCancelReservation: false,
        cancelReservationReason:
          "수업이 시작된 후에는 예약을 취소할 수 없습니다.",
        recurringMeta: {
          isRecurring: true,
          memberRecurringReservationId: 903,
        },
      })
    );

    const props = makeProps();
    const { result } =
      await renderScheduleHook(props);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const item =
      result.current.selectedSchedules[0];

    await act(async () => {
      await result.current.handleScheduleAction(
        item,
        "skipOnce"
      );
    });

    expect(
      skipRecurringReservationOnce
    ).not.toHaveBeenCalled();
    expect(Alert.alert).toHaveBeenCalledWith(
      "안내",
      "수업이 시작된 후에는 예약을 취소할 수 없습니다."
    );
  });

  test("이번만 쉬기 취소는 정기예약 상태로 복구한다", async () => {
    const initialData = makeCalendarData({
      attendanceStatus: null,
      recurringMeta: {
        isRecurring: false,
        memberRecurringReservationId: 902,
        hasRecurringException: true,
        exceptionType: "skip",
      },
    });

    const refreshedData = makeCalendarData({
      attendanceStatus: "reserved",
      recurringMeta: {
        isRecurring: true,
        memberRecurringReservationId: 902,
        hasRecurringException: false,
        exceptionType: null,
      },
    });

    getMemberCalendar
      .mockResolvedValueOnce(initialData)
      .mockResolvedValueOnce(refreshedData);

    const props = makeProps();
    const { result } =
      await renderScheduleHook(props);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const item =
      result.current.selectedSchedules[0];

    await act(async () => {
      await result.current.handleScheduleAction(
        item,
        "undoSkip"
      );
    });

    expect(
      undoSkipRecurringReservationOnce
    ).toHaveBeenCalledWith(
      "member-token",
      {
        memberRecurringReservationId: 902,
        date: TODAY,
      }
    );

    expect(
      result.current.selectedSchedules[0]
        .attendanceStatus
    ).toBe("reserved");

    expect(
      result.current.selectedSchedules[0]
        .recurringMeta
    ).toMatchObject({
      isRecurring: true,
      hasRecurringException: false,
      exceptionType: null,
    });
  });

  test("시작한 수업의 이번만 쉬기 취소 API를 호출하지 않는다", async () => {
    getMemberCalendar.mockResolvedValue(
      makeCalendarData({
        attendanceStatus: null,
        canReserve: false,
        reserveBlockedReason:
          "이미 시작한 수업은 출석 예정으로 등록할 수 없습니다.",
        recurringMeta: {
          isRecurring: false,
          memberRecurringReservationId: 904,
          hasRecurringException: true,
          exceptionType: "skip",
        },
      })
    );

    const props = makeProps();
    const { result } =
      await renderScheduleHook(props);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const item =
      result.current.selectedSchedules[0];

    await act(async () => {
      await result.current.handleScheduleAction(
        item,
        "undoSkip"
      );
    });

    expect(
      undoSkipRecurringReservationOnce
    ).not.toHaveBeenCalled();
    expect(Alert.alert).toHaveBeenCalledWith(
      "안내",
      "이미 시작한 수업은 출석 예정으로 등록할 수 없습니다."
    );
  });

  test("세션 ID가 없으면 예약 API를 호출하지 않는다", async () => {
    const props = makeProps();
    const { result } =
      await renderScheduleHook(props);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.handleScheduleAction(
        {},
        "reserve"
      );
    });

    expect(
      reserveAttendance
    ).not.toHaveBeenCalled();

    expect(Alert.alert).toHaveBeenCalled();

    expect(result.current.submittingAttendance).toBe(
      false
    );
  });

  test("예약 API 실패 후에도 제출 상태를 해제한다", async () => {
    reserveAttendance.mockRejectedValue(
      new Error("예약 마감")
    );

    const props = makeProps();
    const { result } =
      await renderScheduleHook(props);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const item =
      result.current.selectedSchedules[0];

    await act(async () => {
      await result.current.handleScheduleAction(
        item,
        "reserve"
      );
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      expect.any(String),
      "예약 마감"
    );

    expect(result.current.submittingAttendance).toBe(
      false
    );

    expect(
      result.current.selectedSchedules[0]
        .attendanceStatus
    ).toBeNull();
  });
});
