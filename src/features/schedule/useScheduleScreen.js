import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert } from "react-native";
import { router } from "expo-router";

import { getMemberCalendar } from "../../api/memberCalendar";
import {
  markAttendance,
  reserveAttendance,
  cancelReservation,
  cancelAttendance,
  skipRecurringReservationOnce,
  undoSkipRecurringReservationOnce,
} from "../../api/memberAttendance";

export function useScheduleScreen({
  token,
  user,
  logout,
  toDateString,
  getMonthMatrix,
  getDateDiffInDays,
  formatRecurringReservations,
}) {
  const authUser = user || {};
  const memberStatus = authUser?.memberStatus || authUser?.status;
  const isPausedMember = memberStatus === "paused";

  const today = useMemo(() => new Date(), []);
  const todayString = useMemo(() => toDateString(today), [today, toDateString]);

  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState(todayString);
  const [scheduleViewMode, setScheduleViewMode] = useState("calendar");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submittingAttendance, setSubmittingAttendance] = useState(false);

  const [calendarData, setCalendarData] = useState(null);
  const [isScheduleSheetVisible, setIsScheduleSheetVisible] = useState(false);

  const refreshScreenData = useCallback(async () => {
    if (!token) {
      console.log("⏳ SCHEDULE token 아직 없음 - 요청 중단");
      return;
    }

    const calendarRes = await getMemberCalendar(token, currentYear, currentMonth);

    setCalendarData(calendarRes);

    console.log("✅ SCHEDULE refreshScreenData 완료");
  }, [token, currentYear, currentMonth]);

  const loadAll = useCallback(
    async ({ silent = false } = {}) => {
      if (!token) {
        console.log("⏳ SCHEDULE loadAll token 없음 - 대기");
        setLoading(false);
        setRefreshing(false);
        return;
      }

      if (isPausedMember) {
        setLoading(false);
        setRefreshing(false);
        return;
      }

      try {
        if (!silent) setLoading(true);
        await refreshScreenData();
      } catch (error) {
        const errorMessage =
          error?.message || error?.response?.data?.message || "";

        if (
          errorMessage.includes("유효하지 않은 토큰") ||
          errorMessage.includes("인증 토큰") ||
          errorMessage.includes("퇴관") ||
          error?.response?.status === 401 ||
          error?.response?.status === 403
        ) {
          Alert.alert("로그인이 필요합니다", "다시 로그인해주세요.");
          await logout();
          router.replace("/login");
          return;
        }

        Alert.alert("오류", error.message || "일정 데이터를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token, logout, refreshScreenData, isPausedMember]
  );

  const hasMountedRef = useRef(false);
const previousMonthKeyRef = useRef(`${currentYear}-${currentMonth}`);

useEffect(() => {
  if (hasMountedRef.current) return;

  hasMountedRef.current = true;
  previousMonthKeyRef.current = `${currentYear}-${currentMonth}`;
  loadAll();
}, [loadAll, currentYear, currentMonth]);

useEffect(() => {
  if (!hasMountedRef.current) return;

  const monthKey = `${currentYear}-${currentMonth}`;

  if (previousMonthKeyRef.current === monthKey) return;

  previousMonthKeyRef.current = monthKey;
  loadAll({ silent: true });
}, [currentYear, currentMonth, loadAll]);

// useFocusEffect(
//   useCallback(() => {
//     if (!hasMountedRef.current) return;
//
//     loadAll({ silent: true });
//   }, [loadAll])
// );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadAll({ silent: true });
  }, [loadAll]);

  const moveMonth = useCallback(
    (diff) => {
      setCurrentMonth((prevMonth) => {
        let nextMonth = prevMonth + diff;
        let nextYear = currentYear;

        if (nextMonth < 1) {
          nextMonth = 12;
          nextYear = currentYear - 1;
        } else if (nextMonth > 12) {
          nextMonth = 1;
          nextYear = currentYear + 1;
        }

        setCurrentYear(nextYear);
        return nextMonth;
      });
    },
    [currentYear]
  );

  const calendarMap = useMemo(() => {
    const days = calendarData?.days ?? [];
    const map = {};

    for (const item of days) {
      if (item?.date) {
        map[item.date] = item;
      }
    }

    return map;
  }, [calendarData]);

  const selectedSchedules = calendarData?.scheduleByDate?.[selectedDate] || [];

  const selectedMySchedules = selectedSchedules.filter((item) => {
    return (
      item?.attendanceStatus === "reserved" ||
      item?.attendanceStatus === "present"
    );
  });

  const recurringInfoText = useMemo(() => {
    const recurringList =
      calendarData?.recurringReservations ||
      calendarData?.memberRecurringReservations ||
      calendarData?.recurringSchedules ||
      calendarData?.myRecurringReservations ||
      [];

    return formatRecurringReservations(recurringList);
  }, [calendarData, formatRecurringReservations]);

  const selectedDateDiff = getDateDiffInDays(todayString, selectedDate);

  const isReservableDate =
    selectedDateDiff !== null &&
    selectedDateDiff >= 0 &&
    selectedDateDiff <= 14;

  const isSelectedToday = selectedDate === todayString;

  const weeks = useMemo(
    () => getMonthMatrix(currentYear, currentMonth),
    [currentYear, currentMonth, getMonthMatrix]
  );

  const weekDayNames = ["일", "월", "화", "수", "목", "금", "토"];

  const thisWeekDates = useMemo(() => {
    const base = new Date(todayString + "T00:00:00");
    const day = base.getDay();

    const monday = new Date(base);
    monday.setDate(base.getDate() - (day === 0 ? 6 : day - 1));

    return Array.from({ length: 6 }).map((_, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);
      return date;
    });
  }, [todayString]);

  function parseKoreanStartTimeToDate(dateString, startTimeText) {
    if (!dateString || !startTimeText) return null;

    const match = String(startTimeText).match(/(오전|오후)\s*(\d+):(\d+)/);
    if (!match) return null;

    const period = match[1];
    let hour = Number(match[2]);
    const minute = Number(match[3]);

    if (period === "오후" && hour !== 12) hour += 12;
    if (period === "오전" && hour === 12) hour = 0;

    return new Date(
      `${dateString}T${String(hour).padStart(2, "0")}:${String(minute).padStart(
        2,
        "0"
      )}:00`
    );
  }

  function canCheckInTodaySession(item) {
    const start = parseKoreanStartTimeToDate(todayString, item?.startTime);
    if (!start) return false;

    const now = new Date();
    const startText = item?.startTime || "";

    const checkInStart = new Date(start);
    const checkInEnd = new Date(start);

    if (startText.includes("오전 10:00")) {
      checkInStart.setHours(9, 0, 0, 0);
      checkInEnd.setHours(13, 0, 0, 0);
    } else if (startText.includes("오후 4:00")) {
      checkInStart.setHours(15, 0, 0, 0);
      checkInEnd.setHours(18, 0, 0, 0);
    } else if (startText.includes("오후 7:00")) {
      checkInStart.setHours(18, 0, 0, 0);
      checkInEnd.setHours(21, 0, 0, 0);
    } else if (startText.includes("오후 1:30")) {
      checkInStart.setHours(13, 0, 0, 0);
      checkInEnd.setHours(15, 30, 0, 0);
    } else {
      checkInStart.setHours(checkInStart.getHours() - 1);
      checkInEnd.setMinutes(checkInEnd.getMinutes() + 90);
    }

    return now >= checkInStart && now <= checkInEnd;
  }

  function canCancelAttendance(item) {
    if (item?.attendanceStatus !== "present") return false;
    if (!item?.checkedAt) return false;

    const checkedAt = new Date(item.checkedAt);
    const now = new Date();

    const limit = new Date(checkedAt);
    limit.setMinutes(limit.getMinutes() + 10);

    return now <= limit;
  }

  const handlePressDate = useCallback(
    (dateObj) => {
      if (!dateObj || !token) return;

      const nextDate = toDateString(dateObj);

      setSelectedDate(nextDate);
      setIsScheduleSheetVisible(true);
    },
    [token, toDateString]
  );

  const closeScheduleSheet = useCallback(() => {
    setIsScheduleSheetVisible(false);
  }, []);

  const openScheduleSheet = useCallback(() => {
    setIsScheduleSheetVisible(true);
  }, []);

  const updateScheduleItemLocally = useCallback((date, sessionId, updater) => {
    setCalendarData((prev) => {
      if (!prev?.scheduleByDate?.[date]) return prev;

      const nextScheduleByDate = {
        ...prev.scheduleByDate,
        [date]: prev.scheduleByDate[date].map((item) => {
          const itemSessionId = item?.sessionId || item?.id;

          if (String(itemSessionId) !== String(sessionId)) {
            return item;
          }

          return updater(item);
        }),
      };

      const nextDays = (prev.days || []).map((day) => {
        if (day.date !== date) return day;

        const daySchedules = nextScheduleByDate[date] || [];
        const hasReserved = daySchedules.some(
          (item) => item?.attendanceStatus === "reserved"
        );
        const hasPresent = daySchedules.some(
          (item) => item?.attendanceStatus === "present"
        );
        const hasException = daySchedules.some(
          (item) => item?.recurringMeta?.hasRecurringException === true
        );

        return {
          ...day,
          attendanceStatus: hasPresent ? "present" : hasReserved ? "reserved" : null,
          hasRecurringException: hasException,
        };
      });

      return {
        ...prev,
        scheduleByDate: nextScheduleByDate,
        days: nextDays,
      };
    });
  }, []);

  const handleAttendance = useCallback(
    async (item) => {
      try {
        setSubmittingAttendance(true);

        const sessionId = item?.sessionId || item?.id;
        if (!sessionId) {
          Alert.alert("안내", "출석 처리할 수업 정보가 없습니다.");
          return;
        }

        await markAttendance(token, {
          date: selectedDate,
          sessionId,
        });

        Alert.alert("완료", "출석이 처리되었습니다.");
        await refreshScreenData();
      } catch (error) {
        Alert.alert("오류", error.message || "출석 처리에 실패했습니다.");
      } finally {
        setSubmittingAttendance(false);
      }
    },
    [token, selectedDate, refreshScreenData]
  );

  const handleReserve = useCallback(
    async (item) => {
      try {
        setSubmittingAttendance(true);

        const sessionId = item?.sessionId || item?.id;
        if (!sessionId) {
          Alert.alert("안내", "예약할 수업 정보가 없습니다.");
          return;
        }

await reserveAttendance(token, sessionId);

updateScheduleItemLocally(selectedDate, sessionId, (prev) => ({
  ...prev,
  attendanceStatus: "reserved",
  recurringMeta: {
    ...(prev.recurringMeta || {}),
    isRecurring: false,
    hasRecurringException: false,
    exceptionType: null,
  },
}));

Alert.alert("완료", "출석 예정이 등록되었습니다.");
refreshScreenData();
      } catch (error) {
        Alert.alert("오류", error.message || "출석 예정 등록에 실패했습니다.");
      } finally {
        setSubmittingAttendance(false);
      }
    },
    [token, selectedDate, updateScheduleItemLocally, refreshScreenData]
  );

  const handleSkipOnce = useCallback(
  async (item) => {
    try {
      setSubmittingAttendance(true);

      const recurringMeta = item?.recurringMeta || {};
      const memberRecurringReservationId =
        recurringMeta?.memberRecurringReservationId;

      if (!memberRecurringReservationId) {
        Alert.alert("안내", "정기출석 정보가 없어 이번만 쉬기를 처리할 수 없습니다.");
        return;
      }

      await skipRecurringReservationOnce(token, {
        memberRecurringReservationId,
        date: selectedDate,
        reason: "",
      });

updateScheduleItemLocally(selectedDate, item?.sessionId || item?.id, (prev) => ({
  ...prev,
  attendanceStatus: null,
  recurringMeta: {
    ...(prev.recurringMeta || {}),
    isRecurring: false,
    hasRecurringException: true,
    exceptionType: "skip",
  },
}));

Alert.alert("완료", "이번만 쉬기로 처리되었습니다.");
refreshScreenData();
    } catch (error) {
      Alert.alert("오류", error.message || "이번만 쉬기 처리에 실패했습니다.");
    } finally {
      setSubmittingAttendance(false);
    }
  },
  [token, selectedDate, updateScheduleItemLocally, refreshScreenData]
);

  const handleUndoSkip = useCallback(
  async (item) => {
    try {
      setSubmittingAttendance(true);

      const recurringMeta = item?.recurringMeta || {};
      const memberRecurringReservationId =
        recurringMeta?.memberRecurringReservationId;

      if (!memberRecurringReservationId) {
        Alert.alert("안내", "정기출석 정보가 없어 이번 쉬기 취소를 처리할 수 없습니다.");
        return;
      }

      await undoSkipRecurringReservationOnce(token, {
        memberRecurringReservationId,
        date: selectedDate,
      });

updateScheduleItemLocally(selectedDate, item?.sessionId || item?.id, (prev) => ({
  ...prev,
  attendanceStatus: "reserved",
  recurringMeta: {
    ...(prev.recurringMeta || {}),
    isRecurring: true,
    hasRecurringException: false,
    exceptionType: null,
  },
}));

Alert.alert("완료", "출석 예정으로 다시 등록되었습니다.");
refreshScreenData();
    } catch (error) {
      Alert.alert("오류", error.message || "이번 쉬기 취소에 실패했습니다.");
    } finally {
      setSubmittingAttendance(false);
    }
  },
[token, selectedDate, updateScheduleItemLocally, refreshScreenData]
);

  const handleCancelReserve = useCallback(
    async (item) => {
      try {
        setSubmittingAttendance(true);

        const sessionId = item?.sessionId || item?.id;
        if (!sessionId) {
          Alert.alert("안내", "취소할 수업 정보가 없습니다.");
          return;
        }

await cancelReservation(token, sessionId);

updateScheduleItemLocally(selectedDate, sessionId, (prev) => ({
  ...prev,
  attendanceStatus: null,
}));

Alert.alert("완료", "출석 예정이 취소되었습니다.");
refreshScreenData();
      } catch (error) {
        Alert.alert("오류", error.message || "출석 예정 취소에 실패했습니다.");
      } finally {
        setSubmittingAttendance(false);
      }
    },
    [token, selectedDate, updateScheduleItemLocally, refreshScreenData]
  );

  const handleCancelAttendance = useCallback(
    async (item) => {
      try {
        setSubmittingAttendance(true);

        const sessionId = item?.sessionId || item?.id;
        if (!sessionId) {
          Alert.alert("안내", "취소할 출석 정보가 없습니다.");
          return;
        }

await cancelAttendance(token, sessionId);

updateScheduleItemLocally(selectedDate, sessionId, (prev) => ({
  ...prev,
  attendanceStatus: prev.recurringMeta?.isRecurring ? "reserved" : null,
}));

Alert.alert("완료", "출석이 취소되었습니다.");
refreshScreenData();
      } catch (error) {
        Alert.alert("오류", error.message || "출석 취소에 실패했습니다.");
      } finally {
        setSubmittingAttendance(false);
      }
    },
    [token, selectedDate, updateScheduleItemLocally, refreshScreenData]
  );

  const handleScheduleAction = useCallback(
    (item, actionType) => {
      switch (actionType) {
        case "attendance":
          return handleAttendance(item);
        case "qrAttendance":
          closeScheduleSheet();
          return router.push("/qr-attendance");
        case "reserve":
          return handleReserve(item);
        case "cancelReserve":
          return handleCancelReserve(item);
        case "cancelAttendance":
          return handleCancelAttendance(item);
        case "skipOnce":
          return handleSkipOnce(item);
        case "undoSkip":
          return handleUndoSkip(item);
        default:
          return;
      }
    },
    [
      handleAttendance,
      handleReserve,
      handleCancelReserve,
      handleCancelAttendance,
      handleSkipOnce,
      handleUndoSkip,
      closeScheduleSheet,
    ]
  );

  return {
    todayString,
    currentYear,
    currentMonth,
    selectedDate,
    setSelectedDate,
    scheduleViewMode,
    setScheduleViewMode,

    loading,
    refreshing,
    submittingAttendance,

    calendarData,
    calendarMap,
    selectedSchedules,
    selectedMySchedules,
    recurringInfoText,

    isScheduleSheetVisible,
    setIsScheduleSheetVisible,
    closeScheduleSheet,
    openScheduleSheet,

    isReservableDate,
    isSelectedToday,
    weeks,
    weekDayNames,
    thisWeekDates,

    onRefresh,
    moveMonth,
    handlePressDate,
    handleScheduleAction,
    canCancelAttendance,
    canCheckInTodaySession,
  };
}