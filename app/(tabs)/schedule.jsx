import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { useAuth } from "../../src/contexts/AuthContext";

import { getMemberCalendar } from "../../src/api/memberCalendar";
import {
  getMyAttendance,
  markAttendance,
  reserveAttendance,
  cancelReservation,
  cancelAttendance,
  skipRecurringReservationOnce,
  undoSkipRecurringReservationOnce,
} from "../../src/api/memberAttendance";


function pad(n) {
  return String(n).padStart(2, "0");
}

function toDateString(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}`;
}

function getDateDiffInDays(fromDateString, toDateStringValue) {
  const from = new Date(`${fromDateString}T00:00:00`);
  const to = new Date(`${toDateStringValue}T00:00:00`);

  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
    return null;
  }

  const diffMs = to.getTime() - from.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

function getSessionDisplayLabel(item) {
  const title = item?.title || item?.name || "";
  const className = item?.className || "";

  if (title.includes("유단자") || className.includes("유단자")) {
    return "유단자수련";
  }

  const regularTitles = [
    "오전 10시 태극권반",
    "오후 4시 태극권반",
    "오후 7시 태극권반",
    "토요 1시 30분 태극권반",
    "현중태극권 수업",
  ];

  const isRegularTitle = regularTitles.some((text) => title.includes(text));

  if (title && !isRegularTitle) {
    return title;
  }

  const startText = item?.startTime || "";

  if (startText.includes("오전 10:00")) return "오전 10시부";
  if (startText.includes("오후 4:00")) return "오후 4시부";
  if (startText.includes("오후 7:00")) return "오후 7시부";
  if (startText.includes("오후 1:30")) return "오후 1시 30분부";

  return item?.timeLabel || title || "수업";
}


function getMonthMatrix(year, month) {
  const firstDay = new Date(year, month - 1, 1);
  const lastDate = new Date(year, month, 0).getDate();
  const startWeekday = firstDay.getDay();

  const cells = [];

  for (let i = 0; i < startWeekday; i += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= lastDate; day += 1) {
    cells.push(new Date(year, month - 1, day));
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  return weeks;
  
}

function getScheduleUiMeta(item, { isReservableDate }) {
  const attendanceStatus = item?.attendanceStatus || null;
  const recurringMeta = item?.recurringMeta || {};

  const hasMatchedRecurringRule =
    recurringMeta?.matchedRecurringRule === true &&
    !!recurringMeta?.memberRecurringReservationId;

  const hasRecurringException =
    recurringMeta?.hasRecurringException === true &&
    !!recurringMeta?.memberRecurringReservationId;

  const isRecurringReserved =
    attendanceStatus === "reserved" && hasMatchedRecurringRule;

  const isManualReserved =
    attendanceStatus === "reserved" && !hasMatchedRecurringRule;

  const canUndoSkip =
  isReservableDate &&
  hasRecurringException &&
  item?.canReserve !== false;

  const canSkipOnce =
  isReservableDate &&
  isRecurringReserved &&
  !hasRecurringException &&
  item?.canReserve !== false;

  const canCancelReserve =
    isReservableDate &&
    isManualReserved &&
    !hasRecurringException;

  const canReserve =
    isReservableDate &&
    !attendanceStatus &&
    !hasRecurringException &&
    item?.canReserve !== false;

  const canCancelAttendance = item?.canCancelAttendance === true;

  if (hasRecurringException) {
  return {
    tone: "available",
    label: "예약 가능",
    helperText: null,
    actionLabel: canUndoSkip ? "출석 예정" : null,
    actionType: canUndoSkip ? "undoSkip" : null,
    isRecurring: false,
  };
}

  if (attendanceStatus === "present") {
    return {
      tone: "done",
      label: "출석 완료",
      helperText: canCancelAttendance
        ? "출석 후 10분 이내에는 취소할 수 있어요."
        : item?.cancelAttendanceReason || null,
      actionLabel: canCancelAttendance ? "출석 취소" : null,
      actionType: canCancelAttendance ? "cancelAttendance" : null,
      isRecurring: hasMatchedRecurringRule,
    };
  }

  if (canSkipOnce) {
    return {
      tone: "reserved",
      label: "정기출석 예정",
      helperText: "정기출석으로 자동 예약된 수업입니다.",
      actionLabel: "이번만 쉬기",
      actionType: "skipOnce",
      isRecurring: true,
    };
  }

  if (canCancelReserve) {
    return {
      tone: "reserved",
      label: "출석 예정",
      helperText: null,
      actionLabel: "예약 취소",
      actionType: "cancelReserve",
      isRecurring: false,
    };
  }

  if (canReserve) {
    return {
      tone: "available",
      label: "예약 가능",
      helperText: null,
      actionLabel: "출석 예정",
      actionType: "reserve",
      isRecurring: hasMatchedRecurringRule,
    };
  }

  return {
    tone: "disabled",
    label: attendanceStatus === "absent" ? "결석" : "예약 불가",
    helperText:
      item?.reserveBlockedReason ||
      item?.cancelAttendanceReason ||
      (isReservableDate ? null : "예약 가능 기간이 아닙니다."),
    actionLabel: null,
    actionType: null,
    isRecurring: hasMatchedRecurringRule,
  };
}

function getScheduleCardStyle(tone) {
  switch (tone) {
    case "done":
      return {
        container: styles.scheduleCardDone,
        chip: styles.scheduleStatusChipDone,
        chipText: styles.scheduleStatusChipTextDone,
      };
    case "reserved":
      return {
        container: styles.scheduleCardReserved,
        chip: styles.scheduleStatusChipReserved,
        chipText: styles.scheduleStatusChipTextReserved,
      };
    case "available":
      return {
        container: styles.scheduleCardAvailable,
        chip: styles.scheduleStatusChipAvailable,
        chipText: styles.scheduleStatusChipTextAvailable,
      };
    case "cancelled":
      return {
        container: styles.scheduleCardCancelled,
        chip: styles.scheduleStatusChipCancelled,
        chipText: styles.scheduleStatusChipTextCancelled,
      };
    default:
      return {
        container: styles.scheduleCardDisabled,
        chip: styles.scheduleStatusChipDisabled,
        chipText: styles.scheduleStatusChipTextDisabled,
      };
  }
}

export default function ScheduleScreen() {
  const { token, user, logout } = useAuth();
  const authUser = user || {};
const memberStatus = authUser?.memberStatus || authUser?.status;
const isPausedMember = memberStatus === "paused";


  const today = useMemo(() => new Date(), []);
  const todayString = useMemo(() => toDateString(today), [today]);

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

  console.log("🔥 SCHEDULE calendarRes =", JSON.stringify(calendarRes, null, 2));

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
  error?.message ||
  error?.response?.data?.message ||
  "";

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

        Alert.alert("오류", error.message || "홈 데이터를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token, logout, refreshScreenData, isPausedMember]
    
  );
  
  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useFocusEffect(
    useCallback(() => {
      loadAll({ silent: true });
    }, [loadAll])
  );

  
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

  const selectedSchedules =
    calendarData?.scheduleByDate?.[selectedDate] || [];

  const selectedMySchedules = selectedSchedules.filter((item) => {
  return (
    item?.attendanceStatus === "reserved" ||
    item?.attendanceStatus === "present"
  );
});

  const selectedDateDiff = getDateDiffInDays(todayString, selectedDate);

  const isReservableDate =
    selectedDateDiff !== null &&
    selectedDateDiff >= 0 &&
    selectedDateDiff <= 14;

  const isSelectedToday = selectedDate === todayString;

  const weeks = useMemo(
    () => getMonthMatrix(currentYear, currentMonth),
    [currentYear, currentMonth]
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

  function canCheckInTodaySession(item) {
  const start = parseKoreanStartTimeToDate(todayString, item?.startTime);
  if (!start) return false;

  const now = new Date();

  // 시작 1시간 전
  const checkInStart = new Date(start);
  checkInStart.setHours(checkInStart.getHours() - 1);

  // 수업 종료 (1시간 30분 후)
  const checkInEnd = new Date(start);
  checkInEnd.setMinutes(checkInEnd.getMinutes() + 90);

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

  function parseKoreanStartTimeToDate(dateString, startTimeText) {
  if (!dateString || !startTimeText) return null;

  const match = String(startTimeText).match(/(오전|오후)\s*(\d+):(\d+)/);
  if (!match) return null;

  const period = match[1];
  let hour = Number(match[2]);
  const minute = Number(match[3]);

  if (period === "오후" && hour !== 12) hour += 12;
  if (period === "오전" && hour === 12) hour = 0;

  return new Date(`${dateString}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`);
}

const handlePressDate = useCallback(
  (dateObj) => {
    if (!dateObj || !token) return;

    const nextDate = toDateString(dateObj);

    setSelectedDate(nextDate);
    setIsScheduleSheetVisible(true);
  },
  [token]
);

  const closeScheduleSheet = useCallback(() => {
    setIsScheduleSheetVisible(false);
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

        Alert.alert("완료", "출석 예정이 등록되었습니다.");
        await refreshScreenData();
      } catch (error) {
        Alert.alert("오류", error.message || "출석 예정 등록에 실패했습니다.");
      } finally {
        setSubmittingAttendance(false);
      }
    },
    [token, refreshScreenData]
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

        const sessionId = item?.sessionId || item?.id;

await skipRecurringReservationOnce(token, {
  memberRecurringReservationId,
  date: selectedDate,
  reason: "",
});

updateScheduleItemLocally(selectedDate, sessionId, (prevItem) => ({
  ...prevItem,
  attendanceStatus: null,
  recurringMeta: {
    ...(prevItem.recurringMeta || {}),
    hasRecurringException: true,
    exceptionType: "skip",
    matchedRecurringRule: true,
    memberRecurringReservationId,
  },
}));

Alert.alert("완료", "이번만 쉬기로 처리되었습니다.");

      } catch (error) {
        Alert.alert("오류", error.message || "이번만 쉬기 처리에 실패했습니다.");
      } finally {
        setSubmittingAttendance(false);
      }
    },
    [token, selectedDate, refreshScreenData]
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

        const sessionId = item?.sessionId || item?.id;

await undoSkipRecurringReservationOnce(token, {
  memberRecurringReservationId,
  date: selectedDate,
});

updateScheduleItemLocally(selectedDate, sessionId, (prevItem) => ({
  ...prevItem,
  attendanceStatus: "reserved",
  recurringMeta: {
    ...(prevItem.recurringMeta || {}),
    hasRecurringException: false,
    exceptionType: null,
    matchedRecurringRule: true,
    memberRecurringReservationId,
  },
}));

Alert.alert("완료", "출석 예정으로 다시 등록되었습니다.");

      } catch (error) {
        Alert.alert("오류", error.message || "이번 쉬기 취소에 실패했습니다.");
      } finally {
        setSubmittingAttendance(false);
      }
    },
    [token, selectedDate, refreshScreenData]
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

        Alert.alert("완료", "출석 예정이 취소되었습니다.");
        await refreshScreenData();
      } catch (error) {
        Alert.alert("오류", error.message || "출석 예정 취소에 실패했습니다.");
      } finally {
        setSubmittingAttendance(false);
      }
    },
    [token, refreshScreenData]
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

        Alert.alert("완료", "출석이 취소되었습니다.");
        await refreshScreenData();
      } catch (error) {
        Alert.alert("오류", error.message || "출석 취소에 실패했습니다.");
      } finally {
        setSubmittingAttendance(false);
      }
    },
    [token, refreshScreenData]
  );

  const handleScheduleAction = useCallback(
    (item, actionType) => {
      switch (actionType) {
        case "attendance":
          return handleAttendance(item);
        case "qrAttendance":
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
      handleReserve,
      handleCancelReserve,
      handleCancelAttendance,
      handleSkipOnce,
      handleUndoSkip,
    ]
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>홈 화면을 불러오는 중입니다.</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
<View style={styles.schedulePageHeader}>
</View>

<View style={styles.scheduleViewToggle}>
  <Pressable
    style={[
      styles.scheduleToggleButton,
      scheduleViewMode === "calendar" && styles.scheduleToggleActive,
    ]}
    onPress={() => setScheduleViewMode("calendar")}
  >
    <Text
      style={[
        styles.scheduleToggleText,
        scheduleViewMode === "calendar" && styles.scheduleToggleTextActive,
      ]}
    >
      캘린더
    </Text>
  </Pressable>

  <Pressable
    style={[
      styles.scheduleToggleButton,
      scheduleViewMode === "list" && styles.scheduleToggleActive,
    ]}
    onPress={() => setScheduleViewMode("list")}
  >
    <Text
      style={[
        styles.scheduleToggleText,
        scheduleViewMode === "list" && styles.scheduleToggleTextActive,
      ]}
    >
      리스트
    </Text>
  </Pressable>
</View>

{scheduleViewMode === "calendar" ? (
  <>
    <View style={styles.calendarSection}>
  <View style={styles.calendarHeader}>
    <Pressable style={styles.monthButton} onPress={() => moveMonth(-1)}>
      <Text style={styles.monthButtonText}>‹</Text>
    </Pressable>

    <Text style={styles.monthTitle}>
      {currentYear}년 {currentMonth}월
    </Text>

    <Pressable style={styles.monthButton} onPress={() => moveMonth(1)}>
      <Text style={styles.monthButtonText}>›</Text>
    </Pressable>
  </View>

  <View style={styles.weekHeader}>
    {["일", "월", "화", "수", "목", "금", "토"].map((d, idx) => (
      <Text
        key={d}
        style={[
          styles.weekHeaderText,
          idx === 0 && styles.weekHeaderTextSunday,
        ]}
      >
        {d}
      </Text>
    ))}
  </View>

  {weeks.map((week, rowIndex) => (
    <View key={`week-${rowIndex}`} style={styles.weekRow}>
      {week.map((dateObj, colIndex) => {
        if (!dateObj) {
          return (
            <View
              key={`empty-${rowIndex}-${colIndex}`}
              style={styles.dayCell}
            />
          );
        }

        const dateString = toDateString(dateObj);
        const dayInfo = calendarMap[dateString];
        const selected = selectedDate === dateString;
    
        const todayFlag = dateString === todayString;
        const isSunday = dateObj.getDay() === 0;
        const isOpenEvent = dayInfo?.isOpenHoliday === true;
        const isClosedHoliday =
          dayInfo?.isHoliday === true && !isOpenEvent;

        return (
          <Pressable
            key={dateString}
            style={[
              styles.dayCell,
              selected && styles.dayCellSelected,
              todayFlag && styles.dayCellToday,
            ]}
            onPress={() => handlePressDate(dateObj)}
          >
            <Text
              style={[
                styles.dayNumber,
                (isSunday || isClosedHoliday) && styles.dayNumberSunday,
                isOpenEvent && styles.dayNumberEvent,
                selected && styles.dayNumberSelected,
              ]}
            >
              {dateObj.getDate()}
            </Text>

            {dayInfo?.holidayName ? (
              <View
                style={[
                  styles.eventDot,
                  dayInfo?.isOpenHoliday
                    ? styles.eventDotOpen
                    : styles.eventDotClosed,
                ]}
              />
            ) : null}

            {dayInfo?.attendanceStatus === "present" ? (
              <View style={styles.dayStatusDotPresent} />
            ) : null}

            {dayInfo?.attendanceStatus === "reserved" &&
            dayInfo?.isHoliday !== true &&
            dayInfo?.hasRecurringException !== true ? (
              <View style={styles.dayStatusDotReserved} />
            ) : null}
          </Pressable>
        );
      })}
    </View>
  ))}
</View>

<View style={styles.selectedScheduleSummaryCard}>
  <View style={styles.selectedScheduleSummaryHeader}>
    <Text style={styles.selectedScheduleSummaryTitle}>
      {Number(selectedDate.slice(5, 7))}.
      {Number(selectedDate.slice(8, 10))} 일정
    </Text>

    <Pressable onPress={() => setIsScheduleSheetVisible(true)}>
      <Text style={styles.selectedScheduleSummaryMore}>자세히 보기</Text>
    </Pressable>
  </View>

  {selectedMySchedules.length === 0 ? (
    <Text style={styles.selectedScheduleEmptyText}>
      일정이 없습니다.
    </Text>
  ) : (
    selectedMySchedules.slice(0, 3).map((item, index) => {
      const uiMeta = getScheduleUiMeta(item, { isReservableDate });
      const sessionId = item?.sessionId || item?.id || `summary-${index}`;

      return (
        <Pressable
          key={sessionId}
          style={styles.selectedScheduleSummaryItem}
          onPress={() => setIsScheduleSheetVisible(true)}
        >
          <View>
            <Text style={styles.selectedScheduleTime}>
              {item?.startTime || item?.timeLabel || "시간 미정"}
            </Text>
            <Text style={styles.selectedScheduleName}>
              {getSessionDisplayLabel(item)}
            </Text>
          </View>

          <View style={styles.selectedScheduleStatusChip}>
            <Text style={styles.selectedScheduleStatusText}>
              {uiMeta.label}
            </Text>
          </View>
        </Pressable>
      );
    })
  )}
</View>
 </>
) : (
  <View style={styles.weekListCard}>
    <Text style={styles.weekListTitle}>이번주 수련 일정</Text>

    {thisWeekDates.map((dateObj) => {
      const dateString = toDateString(dateObj);
      const schedules = calendarData?.scheduleByDate?.[dateString] || [];
      const visibleSchedules = schedules.filter((item) => {
  const uiMeta = getScheduleUiMeta(item, { isReservableDate: true });

  return (
    item?.attendanceStatus === "present" ||
    item?.attendanceStatus === "reserved" ||
    uiMeta.label === "정기출석 예정" ||
    String(item?.title || item?.name || "").includes("세미나") ||
    String(item?.title || item?.name || "").includes("행사")
  );
});
      const isToday = dateString === todayString;

      return (
        <View key={dateString} style={styles.weekDaySection}>
          <Text style={styles.weekDayTitle}>
            {dateObj.getMonth() + 1}월 {dateObj.getDate()}일{" "}
            {weekDayNames[dateObj.getDay()]}요일{isToday ? " (오늘)" : ""}
          </Text>

          {visibleSchedules.length === 0 ? (
            <Text style={styles.weekEmptyText}>일정이 없습니다.</Text>
          ) : (
            visibleSchedules.map((item, index) => {
              const uiMeta = getScheduleUiMeta(item, { isReservableDate: true });
              const sessionId =
                item?.sessionId || item?.id || `${dateString}-${index}`;

              return (
                <Pressable
                  key={sessionId}
                  style={styles.weekScheduleRow}
                  onPress={() => {
                    setSelectedDate(dateString);
                    setIsScheduleSheetVisible(true);
                  }}
                >
                  <Text style={styles.weekScheduleTime}>
                    {item?.startTime || item?.timeLabel || "시간 미정"}
                  </Text>

                  <Text style={styles.weekScheduleName}>
                    {getSessionDisplayLabel(item)}
                  </Text>

                  <View
  style={[
    styles.weekScheduleStatusChip,
    uiMeta.tone === "done" && styles.weekScheduleStatusChipDone,
    uiMeta.tone === "reserved" && styles.weekScheduleStatusChipReserved,
  ]}
>
  <Text
    style={[
      styles.weekScheduleStatusText,
      uiMeta.tone === "done" && styles.weekScheduleStatusTextDone,
      uiMeta.tone === "reserved" && styles.weekScheduleStatusTextReserved,
    ]}
  >
    {uiMeta.label}
  </Text>
</View>
                </Pressable>
              );
            })
          )}
        </View>
      );
    })}
  </View>
)}
      </ScrollView>

      <Modal
        visible={isScheduleSheetVisible}
        transparent
        animationType="slide"
        onRequestClose={closeScheduleSheet}
      >
        <View style={styles.sheetOverlay}>
          <Pressable style={styles.sheetBackdrop} onPress={closeScheduleSheet} />

          <View style={styles.sheetContainer}>
            <View style={styles.sheetHandle} />

            <View style={styles.sheetHeaderRow}>
              <Text style={styles.sheetTitle}>
                {selectedDate
                  ? `${Number(selectedDate.slice(5, 7))}월 ${Number(
                      selectedDate.slice(8, 10)
                    )}일 수업`
                  : "수업"}
              </Text>

              <Pressable
                onPress={closeScheduleSheet}
                style={styles.sheetCloseButton}
              >
                <Text style={styles.sheetCloseButtonText}>닫기</Text>
              </Pressable>
            </View>
            {calendarMap[selectedDate]?.holidayName ? (
  <View
    style={[
      styles.selectedEventNotice,
      calendarMap[selectedDate]?.isOpenHoliday
        ? styles.selectedEventNoticeOpen
        : styles.selectedEventNoticeClosed,
    ]}
  >
    <Text
      style={[
        styles.selectedEventNoticeTitle,
        calendarMap[selectedDate]?.isOpenHoliday
          ? styles.selectedEventNoticeTitleOpen
          : styles.selectedEventNoticeTitleClosed,
      ]}
    >
      {calendarMap[selectedDate]?.isOpenHoliday ? "도장 일정" : "휴관 안내"}
    </Text>

    <Text style={styles.selectedEventNoticeText}>
      {calendarMap[selectedDate]?.holidayName}
    </Text>

    {!calendarMap[selectedDate]?.isOpenHoliday ? (
      <Text style={styles.selectedEventNoticeSubText}>
        이 날은 예약이 제한될 수 있습니다.
      </Text>
    ) : null}
  </View>
) : null}

            <ScrollView
              contentContainerStyle={styles.sheetContent}
              showsVerticalScrollIndicator={false}
            >
              {selectedSchedules.length === 0 ? (
                <View style={styles.emptySheetBox}>
                  <Text style={styles.emptySheetText}>
  {calendarMap[selectedDate]?.holidayName
    ? calendarMap[selectedDate]?.isOpenHoliday
      ? "등록된 수업은 없지만 도장 일정이 있는 날입니다."
      : "이 날은 도장 휴관일입니다."
    : "등록된 수업이 없습니다."}
</Text>
                </View>
              ) : (
                selectedSchedules.map((item, index) => {
  const sessionId = item?.sessionId || item?.id || `session-${index}`;
  const uiMeta = getScheduleUiMeta(item, { isReservableDate });
  let finalUiMeta = uiMeta;

if (isSelectedToday) {
  // 1️⃣ 이미 출석한 경우
  if (item?.attendanceStatus === "present") {
    if (canCancelAttendance(item)) {
      finalUiMeta = {
        ...uiMeta,
        tone: "done",
        label: "출석 완료",
        actionLabel: "출석 취소",
        actionType: "cancelAttendance",
      };
    } else {
      finalUiMeta = {
        ...uiMeta,
        tone: "done",
        label: "출석 완료",
        actionLabel: null,
        helperText: "출석 후 10분이 지나 취소할 수 없습니다.",
      };
    }
  }

  // 2️⃣ 출석 가능한 수업
  else if (
  item?.attendanceStatus !== "present" &&
  canCheckInTodaySession(item)
) {
  finalUiMeta = {
    ...uiMeta,
    tone: "available",
    label: "출석 가능",
    actionLabel: "QR 출석",
    actionType: "qrAttendance",
  };
}
}
  const toneStyles = getScheduleCardStyle(finalUiMeta.tone);
  
  const showHelperText =
  finalUiMeta.tone === "disabled" || finalUiMeta.tone === "cancelled";

return (
  <View
  key={sessionId}
  style={[styles.compactScheduleCard, toneStyles.container]}
>
  <View style={styles.compactScheduleRow}>
    
    <View style={styles.compactScheduleLeft}>
      <View style={styles.compactTitleRow}>
        <Text style={styles.compactScheduleTitle}>
          {getSessionDisplayLabel(item)}
        </Text>

        {finalUiMeta.isRecurring ? (
          <View style={styles.compactRecurringBadge}>
            <Text style={styles.compactRecurringBadgeText}>정기</Text>
          </View>
        ) : null}

        <View style={[styles.compactStatusChip, toneStyles.chip]}>
          <Text
            style={[
              styles.compactStatusChipText,
              toneStyles.chipText,
            ]}
          >
            {finalUiMeta.label}
          </Text>
        </View>
      </View>

      {showHelperText && finalUiMeta.helperText ? (
        <Text style={styles.compactHelperText}>
          {finalUiMeta.helperText}
        </Text>
      ) : null}
    </View>

    {finalUiMeta.actionLabel ? (
      <Pressable
        style={[
          styles.compactActionButton,
          (finalUiMeta.tone === "reserved" ||
            finalUiMeta.tone === "done") &&
            styles.compactActionButtonSecondary,
        ]}
        onPress={() =>
          handleScheduleAction(item, finalUiMeta.actionType)
        }
      >
        <Text
          style={[
            styles.compactActionButtonText,
            (finalUiMeta.tone === "reserved" ||
              finalUiMeta.tone === "done") &&
              styles.compactActionButtonTextSecondary,
          ]}
        >
          {finalUiMeta.actionLabel}
        </Text>
      </Pressable>
    ) : null}
  </View>
  </View>
);
})
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFCF8",
  },

  content: {
  paddingHorizontal: 22,
  paddingTop: 55,
  paddingBottom: 55,
  gap: 10,
},

calendarSection: {
  paddingHorizontal: 0,
},

calendarHeader: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginTop: 0,
  marginBottom: 10,
},

selectedScheduleSummaryCard: {
  marginTop: 14,
  backgroundColor: "#FFFEFC",
  borderWidth: 1,
  borderColor: "#F2E8E1",
  borderRadius: 14,
  paddingHorizontal: 12,
  paddingTop: 10,
  paddingBottom: 8,
},

selectedScheduleSummaryHeader: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 4,
},

selectedScheduleSummaryTitle: {
  fontSize: 15,
  fontWeight: "700",
  color: "#2B2522",
},

selectedScheduleSummaryItem: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingVertical: 7,
  borderTopWidth: 1,
  borderTopColor: "#F3EDE7",
},

selectedScheduleTime: {
  fontSize: 11,
  fontWeight: "500",
  color: "#8A8176",
  marginBottom: 2,
},

selectedScheduleName: {
  fontSize: 13,
  fontWeight: "600",
  color: "#2B2522",
},

selectedScheduleStatusChip: {
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 8,
  backgroundColor: "#F7EEDC",
},

selectedScheduleStatusText: {
  fontSize: 10,
  fontWeight: "700",
  color: "#9A7448",
},

schedulePageHeader: {
  marginBottom: -10,
},

schedulePageTitle: {
  fontSize: 28,
  fontWeight: "800",
  color: "#2B2522",
  marginBottom: 8,
},

schedulePageDescription: {
  fontSize: 14,
  lineHeight: 20,
  color: "#8A8176",
},

scheduleViewToggle: {
  flexDirection: "row",
  backgroundColor: "#FFFEFC",
  borderWidth: 1,
  borderColor: "#EFE5DE",
  borderRadius: 12,
  padding: 3,
  marginTop: 6,
  marginBottom: 12,
},

scheduleToggleButton: {
  flex: 1,
  height: 40,
  borderRadius: 10,
  alignItems: "center",
  justifyContent: "center",
},

scheduleToggleText: {
  fontSize: 13,
  fontWeight: "600",
  color: "#A78D83",
},

monthButton: {
  width: 20,
  height: 20,
  borderRadius: 8,
  backgroundColor: "transparent",
  alignItems: "center",
  justifyContent: "center",
},

monthButtonText: {
  fontSize: 12,
  fontWeight: "800",
  color: "#8D7F76",
  marginTop: -1,
},

monthTitle: {
  fontSize: 14,
  fontWeight: "700",
  color: "#2B2522",
},
weekHeader: {
  flexDirection: "row",
  marginBottom: 8,
},

weekRow: {
  flexDirection: "row",
  marginTop: 7,
},

dayCell: {
  flex: 1,
  aspectRatio: 1,
  marginHorizontal: 3,
  borderRadius: 999,
  backgroundColor: "transparent",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
},
center: {
    flex: 1,
    backgroundColor: "#FFFCF8",
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "#7D746D",
  },
  scheduleToggleActive: {
  backgroundColor: "#6B4F46",
},

scheduleToggleText: {
  fontSize: 12,
  fontWeight: "600",
  color: "#A78D83",
},

scheduleToggleTextActive: {
  color: "#FFFFFF",
},
selectedScheduleSummaryMore: {
  fontSize: 12,
  fontWeight: "600",
  color: "#8A8176",
},

weekHeaderText: {
    flex: 1,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
    color: "#9A8F81",
  },

  weekHeaderTextSunday: {
    color: "#C45A2A",
  },
dayCellSelected: {
  backgroundColor: "#A78D83",
},

dayCellToday: {
  borderWidth: 1,
  borderColor: "#D8CFC4",
},

dayNumber: {
  fontSize: 15,
  fontWeight: "600",
  color: "#2B2522",
},

dayNumberSelected: {
  color: "#FFFFFF",
  fontWeight: "700",
},

  dayNumberSunday: {
    color: "#C45A2A",
  },

  dayNumberEvent: {
    color: "#7A8D63",
  },

  eventDot: {
    width: 5,
    height: 5,
    borderRadius: 999,
    marginTop: 3,
    zIndex: 20,
  },

  eventDotClosed: {
    backgroundColor: "#C45A2A",
  },

  eventDotOpen: {
    backgroundColor: "#9AA874",
  },

  selectedScheduleEmptyText: {
    fontSize: 15,
    color: "#7D746D",
    paddingVertical: 18,
  },

sheetOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(43,37,34,0.22)",
  },

  sheetBackdrop: {
    flex: 1,
  },

  sheetContainer: {
  backgroundColor: "#FFFEFC",
  borderTopLeftRadius: 28,
  borderTopRightRadius: 28,
  maxHeight: "68%",
  paddingTop: 10,
  paddingHorizontal: 18,
  paddingBottom: 22,
},

  sheetHandle: {
    alignSelf: "center",
    width: 46,
    height: 5,
    borderRadius: 999,
    backgroundColor: "#DCC6BE",
    marginBottom: 16,
  },

  sheetHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  sheetTitle: {
  fontSize: 20,
  fontWeight: "700",
  color: "#2B2522",
},

  sheetCloseButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  sheetCloseButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#7D746D",
  },

  sheetContent: {
    paddingBottom: 45,
    gap: 0,
  },

  emptySheetBox: {
    paddingVertical: 32,
    alignItems: "center",
  },

  emptySheetText: {
    fontSize: 15,
    color: "#7D746D",
  },

  selectedEventNotice: {
    marginBottom: 12,
    borderRadius: 18,
    paddingHorizontal: 15,
    paddingVertical: 13,
    borderWidth: 1,
  },

  selectedEventNoticeOpen: {
    backgroundColor: "#FFF8EF",
    borderColor: "#F1D7B9",
  },

  selectedEventNoticeClosed: {
    backgroundColor: "#FFF5F2",
    borderColor: "#EBCBC2",
  },

  selectedEventNoticeTitle: {
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 4,
  },

  selectedEventNoticeTitleOpen: {
    color: "#9A7448",
  },

  selectedEventNoticeTitleClosed: {
    color: "#B45B45",
  },

  selectedEventNoticeText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2B2522",
  },

  selectedEventNoticeSubText: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "500",
    color: "#8A5B50",
  },

  compactScheduleCard: {
  paddingVertical: 12,
  borderBottomWidth: 1,
  borderBottomColor: "#F1E8E0",
},

compactScheduleRow: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
},

compactScheduleLeft: {
  flex: 1,
  paddingRight: 8,
},
compactTitleRow: {
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
  flexWrap: "wrap",
},

compactScheduleTitle: {
  fontSize: 16,
  fontWeight: "700",
  color: "#2B2522",
},

compactStatusChip: {
  paddingHorizontal: 8,
  paddingVertical: 3,
  borderRadius: 999,
},

compactRecurringBadge: {
  backgroundColor: "#F7EEDC",
  paddingHorizontal: 8,
  paddingVertical: 3,
  borderRadius: 999,
},
compactScheduleTitle: {
  fontSize: 17,
  fontWeight: "700",
  color: "#2B2522",
  marginBottom: 4,
},

  compactRecurringBadge: {
    backgroundColor: "#F7EEDC",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },

  compactRecurringBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#8A684A",
  },

  compactStatusChip: {
  alignSelf: "flex-start",
  paddingHorizontal: 8,
  paddingVertical: 3,
  borderRadius: 999,
  marginBottom: 4,
},

compactStatusChipText: {
  fontSize: 10,
  fontWeight: "700",
},

compactHelperText: {
  marginTop: 2,
  fontSize: 12,
  lineHeight: 17,
  color: "#8A8176",
},

compactActionButton: {
  minWidth: 72,
  height: 36,
  paddingHorizontal: 10,
  borderRadius: 12,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#6B4F46",
},

compactActionButtonText: {
  fontSize: 12,
  fontWeight: "700",
  color: "#FFFFFF",
},

  compactActionButtonPrimary: {
    backgroundColor: "#6B4F46",
  },

  compactActionButtonSecondary: {
    backgroundColor: "#F3ECE5",
    borderWidth: 1,
    borderColor: "#DED4C8",
  },

  compactActionButtonTextSecondary: {
    color: "#6B4F46",
  },

  compactCancelButton: {
    marginTop: 10,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#F3ECE5",
    borderWidth: 1,
    borderColor: "#DED4C8",
  },

  compactCancelButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6B4F46",
  },

  scheduleCardAvailable: {
  backgroundColor: "transparent",
  borderColor: "transparent",
},

scheduleCardReserved: {
  backgroundColor: "transparent",
  borderColor: "transparent",
},

scheduleCardDone: {
  backgroundColor: "transparent",
  borderColor: "transparent",
},

  scheduleCardCancelled: {
    backgroundColor: "#FFF8EF",
    borderColor: "#F1D7B9",
  },

  scheduleCardDisabled: {
  backgroundColor: "transparent",
  borderColor: "transparent",
},

  scheduleStatusChipAvailable: {
    backgroundColor: "#F8F2ED",
  },

  scheduleStatusChipTextAvailable: {
    color: "#9A7B67",
  },

  scheduleStatusChipReserved: {
    backgroundColor: "#F3E4D2",
  },

  scheduleStatusChipTextReserved: {
    color: "#8A684A",
  },

  scheduleStatusChipDone: {
    backgroundColor: "#E9E1DA",
  },

  scheduleStatusChipTextDone: {
    color: "#6B4F46",
  },

  scheduleStatusChipCancelled: {
    backgroundColor: "#FFF1E6",
  },

  scheduleStatusChipTextCancelled: {
    color: "#9A7448",
  },

  scheduleStatusChipDisabled: {
    backgroundColor: "#EDE8E3",
  },

  scheduleStatusChipTextDisabled: {
    color: "#7D746D",
  },
  dayStatusDotPresent: {
  position: "absolute",
  bottom: 2,
  width: 4,
  height: 4,
  borderRadius: 999,
  backgroundColor: "#6B4F46",
},

dayStatusDotReserved: {
  position: "absolute",
  bottom: 2,
  width: 4,
  height: 4,
  borderRadius: 999,
  backgroundColor: "#D8BC8A",
},
weekListCard: {
  backgroundColor: "#FFFEFC",
  borderWidth: 1,
  borderColor: "#F2E8E1",
  borderRadius: 14,
  paddingHorizontal: 14,
  paddingTop: 14,
  paddingBottom: 8,
},

weekListTitle: {
  fontSize: 16,
  fontWeight: "700",
  color: "#2B2522",
  marginBottom: 10,
},

weekDaySection: {
  paddingVertical: 10,
  borderTopWidth: 1,
  borderTopColor: "#F3EDE7",
},

weekDayTitle: {
  fontSize: 13,
  fontWeight: "700",
  color: "#6B4F46",
  marginBottom: 8,
},

weekEmptyText: {
  fontSize: 12,
  color: "#A78D83",
},

weekScheduleRow: {
  flexDirection: "row",
  alignItems: "center",
  paddingVertical: 6,
  gap: 8,
},

weekScheduleTime: {
  width: 70,
  fontSize: 12,
  fontWeight: "500",
  color: "#8A8176",
},

weekScheduleName: {
  flex: 1,
  fontSize: 13,
  fontWeight: "600",
  color: "#2B2522",
},

weekScheduleStatusChip: {
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 999,
  backgroundColor: "#F7EEDC",
},

weekScheduleStatusText: {
  fontSize: 10,
  fontWeight: "700",
  color: "#9A7448",
},
weekScheduleStatusChipDone: {
  backgroundColor: "#E9E1DA",
},

weekScheduleStatusTextDone: {
  color: "#6B4F46",
},

weekScheduleStatusChipReserved: {
  backgroundColor: "#F7EEDC",
},

weekScheduleStatusTextReserved: {
  color: "#9A7448",
},
});