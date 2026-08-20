import { Alert } from "react-native";
import {
  act,
  renderHook,
  waitFor,
} from "@testing-library/react-native";

import { router } from "expo-router";
import { getMemberCalendar } from "../src/api/memberCalendar";
import {
  reserveAttendance,
  skipRecurringReservationOnce,
} from "../src/api/memberAttendance";
import { useScheduleScreen } from "../src/features/schedule/useScheduleScreen";

jest.mock("@react-navigation/native", () => {
  const ReactModule = require("react");

  return {
    useFocusEffect: (callback) => {
      ReactModule.useEffect(() => callback(), [callback]);
    },
  };
});

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

function makeScheduleItem(overrides = {}) {
  return {
    sessionId: "session-1",
    title: "현중태극권 일반 수업",
    attendanceStatus: null,
    canReserve: true,
    canCancelAttendance: false,
    canCancelReservation: true,
    recurringMeta: {},
    ...overrides,
  };
}

function makeCalendarData(item = makeScheduleItem()) {
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
    recurringReservations: [],
  };
}

function makeProps(overrides = {}) {
  return {
    token: "member-token",
    user: {
      memberStatus: "active",
    },
    logout: jest.fn().mockResolvedValue(undefined),
    toDateString: jest.fn(
      (value) => value?.iso || TODAY,
    ),
    getMonthMatrix: jest.fn(() => [
      [null, null, null, null, null, null, null],
    ]),
    getDateDiffInDays: jest.fn(
      (fromDate, toDate) => {
        const from = new Date(
          `${fromDate}T00:00:00`,
        );
        const to = new Date(
          `${toDate}T00:00:00`,
        );

        return Math.round(
          (to.getTime() - from.getTime()) /
            86400000,
        );
      },
    ),
    ...overrides,
  };
}

function renderScheduleHook(props) {
  return renderHook(() =>
    useScheduleScreen(props),
  );
}

describe("회원 일정 화면 현재 정책", () => {
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
      makeCalendarData(),
    );

    reserveAttendance.mockResolvedValue({
      status: "reserved",
    });

    skipRecurringReservationOnce.mockResolvedValue({
      exceptionType: "skip",
    });
  });

  test("토큰이 없으면 일정 API를 호출하지 않는다", async () => {
    const { result } = await renderScheduleHook(
      makeProps({
        token: null,
      }),
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(
      getMemberCalendar,
    ).not.toHaveBeenCalled();
  });

  test("휴식중 회원은 일정 API를 호출하지 않는다", async () => {
    const { result } = await renderScheduleHook(
      makeProps({
        user: {
          memberStatus: "paused",
        },
      }),
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(
      getMemberCalendar,
    ).not.toHaveBeenCalled();
  });

  test("일반수업 예약 상태는 달력에서 숨긴다", async () => {
    getMemberCalendar.mockResolvedValue(
      makeCalendarData(
        makeScheduleItem({
          attendanceStatus: "reserved",
        }),
      ),
    );

    const { result } = await renderScheduleHook(
      makeProps(),
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(
      result.current.calendarMap[TODAY],
    ).toMatchObject({
      date: TODAY,
      attendanceStatus: null,
    });
  });

  test("일반수업 예약 액션은 API를 호출하지 않는다", async () => {
    const { result } = await renderScheduleHook(
      makeProps(),
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.handleScheduleAction(
        makeScheduleItem(),
        "reserve",
      );
    });

    expect(
      reserveAttendance,
    ).not.toHaveBeenCalled();
  });

  test("유단자수련은 예약 액션을 허용한다", async () => {
    const yudanjaItem = makeScheduleItem({
      title: "월요일 유단자수련",
      sessionTimeKey: "MON_YUDANJA",
    });

    getMemberCalendar.mockResolvedValue(
      makeCalendarData(yudanjaItem),
    );

    const { result } = await renderScheduleHook(
      makeProps({
        user: {
          memberStatus: "active",
          canAccessYudanjaClass: true,
        },
      }),
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.handleScheduleAction(
        yudanjaItem,
        "reserve",
      );
    });

    expect(
      reserveAttendance,
    ).toHaveBeenCalledWith(
      "member-token",
      "session-1",
    );
  });

  test("유단자 정기예약은 이번만 쉬기를 호출한다", async () => {
    const yudanjaItem = makeScheduleItem({
      title: "월요일 유단자수련",
      sessionTimeKey: "MON_YUDANJA",
      attendanceStatus: "reserved",
      canCancelReservation: true,
      recurringMeta: {
        isRecurring: true,
        matchedRecurringRule: true,
        memberRecurringReservationId: 901,
      },
    });

    getMemberCalendar.mockResolvedValue(
      makeCalendarData(yudanjaItem),
    );

    const { result } = await renderScheduleHook(
      makeProps({
        user: {
          memberStatus: "active",
          canAccessYudanjaClass: true,
        },
      }),
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.handleScheduleAction(
        yudanjaItem,
        "skipOnce",
      );
    });

    expect(
      skipRecurringReservationOnce,
    ).toHaveBeenCalledWith(
      "member-token",
      {
        memberRecurringReservationId: 901,
        date: TODAY,
        reason: "",
      },
    );
  });

  test("QR 출석은 QR 화면으로 이동한다", async () => {
    const { result } = await renderScheduleHook(
      makeProps(),
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      result.current.handleScheduleAction(
        {},
        "qrAttendance",
      );
    });

    expect(router.push).toHaveBeenCalledWith(
      "/qr-attendance",
    );
  });

  test("일시적인 최종 401 일정 조회 실패만으로 전역 로그아웃하지 않는다", async () => {
    const error = new Error("temporary unauthorized");
    error.response = {
      status: 401,
    };

    getMemberCalendar.mockRejectedValue(error);

    const props = makeProps();
    await renderScheduleHook(props);

    await waitFor(() => {
      expect(getMemberCalendar).toHaveBeenCalled();
    });

    expect(props.logout).not.toHaveBeenCalled();
    expect(router.replace).not.toHaveBeenCalledWith(
      "/login",
    );
  });
});
