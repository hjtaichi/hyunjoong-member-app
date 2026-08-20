import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { subscribeAttendanceDataChanged } from "../../events/attendanceRefreshEvents";
import {
  getCalendarMonthKeysForDates,
  getCurrentWeekDateKeys,
  isYudanjaSchedule,
  shouldOpenScheduleBottomSheet,
  shouldShowSelectedSchedule,
} from "./scheduleUtils";

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
  const [weekScheduleByDate, setWeekScheduleByDate] = useState({});
  const [weeklyListLoading, setWeeklyListLoading] = useState(false);
  const [isScheduleSheetVisible, setIsScheduleSheetVisible] = useState(false);

  const thisWeekDateKeys = useMemo(
    () => getCurrentWeekDateKeys(todayString),
    [todayString]
  );

  const thisWeekDates = useMemo(
    () =>
      thisWeekDateKeys.map(
        (dateKey) => new Date(`${dateKey}T00:00:00`)
      ),
    [thisWeekDateKeys]
  );

  const weekMonthKeys = useMemo(
    () => getCalendarMonthKeysForDates(thisWeekDateKeys),
    [thisWeekDateKeys]
  );

  const combinedScheduleByDate = useMemo(
    () => ({
      ...weekScheduleByDate,
      ...(calendarData?.scheduleByDate || {}),
    }),
    [weekScheduleByDate, calendarData]
  );

  const isYudanjaMember = useMemo(() => {
    if (
      authUser?.canAccessYudanjaClass === true ||
      calendarData?.member?.canAccessYudanjaClass === true ||
      calendarData?.canAccessYudanjaClass === true
    ) {
      return true;
    }

    return Object.values(combinedScheduleByDate).some((items) => {
      return Array.isArray(items) && items.some(isYudanjaSchedule);
    });
  }, [
    authUser?.canAccessYudanjaClass,
    calendarData?.member?.canAccessYudanjaClass,
    calendarData?.canAccessYudanjaClass,
    combinedScheduleByDate,
  ]);

  // HJTAICHI_YUDANJA_RECURRING_VISIBILITY_V1_3
  const isActiveYudanjaSeasonMember =
    calendarData?.isActiveYudanjaSeasonMember === true;

  const refreshScreenData = useCallback(async () => {
    if (!token) return;

    const calendarRes = await getMemberCalendar(
      token,
      currentYear,
      currentMonth
    );

    setCalendarData(calendarRes);
  }, [token, currentYear, currentMonth]);

  const loadWeeklyAttendanceData = useCallback(
    async ({ silent = false } = {}) => {
      if (!token || isPausedMember) {
        setWeeklyListLoading(false);
        return;
      }

      try {
        if (!silent) {
          setWeeklyListLoading(true);
        }

        const responses = await Promise.all(
          weekMonthKeys.map((monthKey) => {
            const [yearText, monthText] = monthKey.split("-");

            return getMemberCalendar(
              token,
              Number(yearText),
              Number(monthText)
            );
          })
        );

        const mergedScheduleByDate = responses.reduce(
          (result, response) => ({
            ...result,
            ...(response?.scheduleByDate || {}),
          }),
          {}
        );

        setWeekScheduleByDate(mergedScheduleByDate);
      } catch (error) {
        Alert.alert(
          "오류",
          error?.message ||
            "이번 주 참여 수업을 불러오지 못했습니다."
        );
      } finally {
        setWeeklyListLoading(false);
      }
    },
    [token, isPausedMember, weekMonthKeys]
  );

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
          // MEMBER_SCHEDULE_GENERIC_STATUS_NO_GLOBAL_LOGOUT_V1
          errorMessage.includes("퇴관")
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
  useEffect(() => {
    if (
      scheduleViewMode !== "list" ||
      !token ||
      isPausedMember
    ) {
      return;
    }

    loadWeeklyAttendanceData();
  }, [
    scheduleViewMode,
    token,
    isPausedMember,
    loadWeeklyAttendanceData,
  ]);

  useEffect(() => {
    if (!token || isPausedMember) return undefined;

    return subscribeAttendanceDataChanged(() => {
      const refreshTasks = [refreshScreenData()];

      if (scheduleViewMode === "list") {
        refreshTasks.push(
          loadWeeklyAttendanceData({ silent: true })
        );
      }

      Promise.all(refreshTasks).catch((error) => {
        console.log(
          "SCHEDULE attendance refresh 실패:",
          error
        );
      });
    });
  }, [
    token,
    isPausedMember,
    refreshScreenData,
    scheduleViewMode,
    loadWeeklyAttendanceData,
  ]);

  useFocusEffect(
    useCallback(() => {
      if (!hasMountedRef.current || !token || isPausedMember) {
        return;
      }

      const refreshTasks = [loadAll({ silent: true })];

      if (scheduleViewMode === "list") {
        refreshTasks.push(
          loadWeeklyAttendanceData({ silent: true })
        );
      }

      Promise.all(refreshTasks).catch((error) => {
        console.log(
          "SCHEDULE focus refresh 실패:",
          error
        );
      });
    }, [
      loadAll,
      token,
      isPausedMember,
      scheduleViewMode,
      loadWeeklyAttendanceData,
    ])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);

    const refreshTasks = [loadAll({ silent: true })];

    if (scheduleViewMode === "list") {
      refreshTasks.push(
        loadWeeklyAttendanceData({ silent: true })
      );
    }

    await Promise.all(refreshTasks);
  }, [
    loadAll,
    scheduleViewMode,
    loadWeeklyAttendanceData,
  ]);

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
    const scheduleByDate = combinedScheduleByDate;
    const map = {};

    for (const day of days) {
      if (!day?.date) continue;

      const schedules = scheduleByDate[day.date] || [];
      const hasPresent = schedules.some(
        (item) => item?.attendanceStatus === "present"
      );
      const hasYudanjaReserved = schedules.some(
        (item) =>
          isYudanjaSchedule(item) && item?.attendanceStatus === "reserved"
      );

      map[day.date] = {
        ...day,
        attendanceStatus: hasPresent
          ? "present"
          : hasYudanjaReserved
          ? "reserved"
          : null,
      };
    }

    return map;
  }, [calendarData?.days, combinedScheduleByDate]);

  const selectedDateDiff = getDateDiffInDays(todayString, selectedDate);
  const selectedDayInfo = calendarMap[selectedDate] || null;

  const selectedSchedules = useMemo(() => {
    const schedules = combinedScheduleByDate[selectedDate] || [];

    if (selectedDateDiff === null) return [];

    const isHoliday = selectedDayInfo?.isHoliday === true;
    const isOpenHoliday = selectedDayInfo?.isOpenHoliday === true;

    if (isHoliday) {
      if (selectedDateDiff < 0) {
        return schedules.filter(
          (item) => item?.attendanceStatus === "present"
        );
      }

      if (selectedDateDiff === 0 && isOpenHoliday) {
        return schedules;
      }

      return [];
    }

    return schedules.filter((item) =>
      shouldShowSelectedSchedule(item, {
        dateDiff: selectedDateDiff,
        isYudanjaMember,
      })
    );
  }, [
    combinedScheduleByDate,
    selectedDate,
    selectedDateDiff,
    selectedDayInfo,
    isYudanjaMember,
  ]);

  const selectedMySchedules = useMemo(() => {
    return selectedSchedules;
  }, [selectedSchedules]);

  const shouldShowSelectedSummary =
    Boolean(selectedDayInfo?.holidayName) ||
    selectedMySchedules.length > 0;

  const canOpenSelectedScheduleSheet = useMemo(() => {
    const schedules = combinedScheduleByDate[selectedDate] || [];

    return shouldOpenScheduleBottomSheet({
      dateDiff: selectedDateDiff,
      dayInfo: selectedDayInfo,
      schedules,
      isYudanjaMember,
    });
  }, [
    combinedScheduleByDate,
    selectedDate,
    selectedDateDiff,
    selectedDayInfo,
    isYudanjaMember,
  ]);

  const yudanjaRecurringEnabled = useMemo(() => {
    const recurringList =
      calendarData?.recurringReservations ||
      calendarData?.memberRecurringReservations ||
      calendarData?.recurringSchedules ||
      calendarData?.myRecurringReservations ||
      [];

    return recurringList.some(
      (item) => item?.sessionTimeKey === "MON_YUDANJA"
    );
  }, [calendarData]);

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
      checkInEnd.setHours(16, 0, 0, 0);
    } else {
      checkInStart.setHours(checkInStart.getHours() - 1);
      checkInEnd.setMinutes(checkInEnd.getMinutes() + 90);
    }

    return now >= checkInStart && now <= checkInEnd;
  }

  function canCancelAttendance(item) {
    return (
      item?.attendanceStatus === "present" &&
      item?.canCancelAttendance === true
    );
  }

  const handlePressDate = useCallback(
    (dateObj) => {
      if (!dateObj || !token) return;

      const nextDate = toDateString(dateObj);
      const nextDateDiff = getDateDiffInDays(todayString, nextDate);
      const dayInfo = calendarMap[nextDate] || null;
      const schedules =
        combinedScheduleByDate[nextDate] || [];

      const shouldOpenSheet = shouldOpenScheduleBottomSheet({
        dateDiff: nextDateDiff,
        dayInfo,
        schedules,
        isYudanjaMember,
      });

      setSelectedDate(nextDate);
      setIsScheduleSheetVisible(shouldOpenSheet);
    },
    [
      token,
      toDateString,
      getDateDiffInDays,
      todayString,
      calendarMap,
      combinedScheduleByDate,
      isYudanjaMember,
    ]
  );

  const closeScheduleSheet = useCallback(() => {
    setIsScheduleSheetVisible(false);
  }, []);

  const openScheduleSheet = useCallback(() => {
    if (!canOpenSelectedScheduleSheet) return;

    setIsScheduleSheetVisible(true);
  }, [canOpenSelectedScheduleSheet]);

  const updateScheduleItemLocally = useCallback(
    (date, sessionId, updater) => {
      const updateItems = (items = []) =>
        items.map((item) => {
          const itemSessionId = item?.sessionId || item?.id;

          if (String(itemSessionId) !== String(sessionId)) {
            return item;
          }

          return updater(item);
        });

      setWeekScheduleByDate((prev) => {
        if (!prev?.[date]) return prev;

        return {
          ...prev,
          [date]: updateItems(prev[date]),
        };
      });

      setCalendarData((prev) => {
        if (!prev?.scheduleByDate?.[date]) return prev;

        const nextScheduleByDate = {
          ...prev.scheduleByDate,
          [date]: updateItems(prev.scheduleByDate[date]),
        };

        const nextDays = (prev.days || []).map((day) => {
          if (day.date !== date) return day;

          const daySchedules = nextScheduleByDate[date] || [];
          const hasYudanjaReserved = daySchedules.some(
            (item) =>
              isYudanjaSchedule(item) &&
              item?.attendanceStatus === "reserved"
          );
          const hasPresent = daySchedules.some(
            (item) => item?.attendanceStatus === "present"
          );
          const hasException = daySchedules.some(
            (item) =>
              item?.recurringMeta?.hasRecurringException === true
          );

          return {
            ...day,
            attendanceStatus: hasPresent
              ? "present"
              : hasYudanjaReserved
              ? "reserved"
              : null,
            hasRecurringException: hasException,
          };
        });

        return {
          ...prev,
          scheduleByDate: nextScheduleByDate,
          days: nextDays,
        };
      });
    },
    []
  );

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

        updateScheduleItemLocally(selectedDate, sessionId, (prev) => ({
          ...prev,
          attendanceStatus: "present",
          canCancelAttendance: true,
          cancelAttendanceReason: null,
        }));

        await refreshScreenData();

        Alert.alert("완료", "출석이 처리되었습니다.");
      } catch (error) {
        Alert.alert("오류", error.message || "출석 처리에 실패했습니다.");
      } finally {
        setSubmittingAttendance(false);
      }
    },
    [
      token,
      selectedDate,
      updateScheduleItemLocally,
      refreshScreenData,
    ]
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
        canCancelReservation: true,
        cancelReservationReason: null,
        recurringMeta: {
          ...(prev.recurringMeta || {}),
          isRecurring: false,
          hasRecurringException: false,
          exceptionType: null,
        },
      }));

      Alert.alert("완료", "출석 예정이 등록되었습니다.");

      // 바로 전체 달력 재조회하지 않음
      // await refreshScreenData();
    } catch (error) {
      Alert.alert(
        "오류",
        error.message || "출석 예정 등록에 실패했습니다."
      );
    } finally {
      setSubmittingAttendance(false);
    }
  },
  [token, selectedDate, updateScheduleItemLocally]
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

        if (item?.canCancelReservation !== true) {
          Alert.alert(
            "안내",
            item?.cancelReservationReason ||
              "수업이 시작된 후에는 이번만 쉬기로 변경할 수 없습니다."
          );
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
        await refreshScreenData();
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

        if (item?.canReserve === false) {
          Alert.alert(
            "안내",
            item?.reserveBlockedReason ||
              "이미 시작한 수업은 출석 예정으로 다시 등록할 수 없습니다."
          );
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
        await refreshScreenData();
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

        if (item?.canCancelReservation !== true) {
          Alert.alert(
            "안내",
            item?.cancelReservationReason ||
              "수업이 시작된 후에는 예약을 취소할 수 없습니다."
          );
          return;
        }

        await cancelReservation(token, sessionId);

        updateScheduleItemLocally(selectedDate, sessionId, (prev) => ({
          ...prev,
          attendanceStatus: null,
        }));

        Alert.alert("완료", "출석 예정이 취소되었습니다.");
        await refreshScreenData();
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

        const result = await cancelAttendance(token, sessionId);

        updateScheduleItemLocally(selectedDate, sessionId, (prev) => ({
          ...prev,
          attendanceStatus:
            result?.status === "reserved"
              ? "reserved"
              : null,
          canCancelAttendance: false,
          cancelAttendanceReason: null,
        }));

        await refreshScreenData();

        Alert.alert("완료", "출석이 취소되었습니다.");
      } catch (error) {
        Alert.alert("오류", error.message || "출석 취소에 실패했습니다.");
      } finally {
        setSubmittingAttendance(false);
      }
    },
    [
      token,
      selectedDate,
      updateScheduleItemLocally,
      refreshScreenData,
    ]
  );

  const handleScheduleAction = useCallback(
    (item, actionType) => {
      const reservationActions = new Set([
        "reserve",
        "cancelReserve",
        "skipOnce",
        "undoSkip",
      ]);

      if (reservationActions.has(actionType) && !isYudanjaSchedule(item)) {
        return;
      }

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
    weekScheduleByDate,
    weeklyListLoading,
    calendarMap,
    selectedDayInfo,
    selectedSchedules,
    selectedMySchedules,
    shouldShowSelectedSummary,
    canOpenSelectedScheduleSheet,
    isYudanjaMember,
    isActiveYudanjaSeasonMember,
    yudanjaRecurringEnabled,

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
