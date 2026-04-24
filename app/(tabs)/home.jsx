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
  Image,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";

import { getMemberHome } from "../../src/api/memberHome";
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
import { getPopupNotice, hideNoticeToday } from "../../src/api/memberNotice";
import { useAuth } from "../../src/contexts/AuthContext";

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
  const startText = item?.startTime || "";

  if (title.includes("유단자")) return "유단자수련";
  if (startText.includes("오전 10:00")) return "오전 10시부";
  if (startText.includes("오후 4:00")) return "오후 4시부";
  if (startText.includes("오후 7:00")) return "오후 7시부";
  if (startText.includes("오후 1:30")) return "오후 1시 30분부";

  return item?.timeLabel || "수업";
}

function getSessionSubLabel(item) {
  const title = item?.title || item?.name || "현중태극권";
  if (title.includes("유단자")) return "월요일 저녁 유단자 수업";
  return "현중태극권";
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

function getStatusMeta(dayInfo) {
  if (!dayInfo) {
    return { label: "", tone: "default" };
  }

  if (dayInfo.attendanceStatus === "present") {
    return { label: "", tone: "present" };
  }

  if (dayInfo.attendanceStatus === "reserved") {
    return { label: "", tone: "reserved" };
  }

  if (dayInfo.attendanceStatus === "absent") {
    return { label: "", tone: "absent" };
  }

  return { label: "", tone: "default" };
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
    !hasRecurringException;

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
      tone: "cancelled",
      label: "이번만 쉬기",
      helperText: "정기출석 예외가 적용된 날입니다.",
      actionLabel: canUndoSkip ? "다시 예약" : null,
      actionType: canUndoSkip ? "undoSkip" : null,
      isRecurring: true,
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

function StatusBadge({ label, tone = "default" }) {
  if (!label) return null;

  return (
    <View
      style={[
        styles.badge,
        tone === "present" && styles.badgePresent,
        tone === "reserved" && styles.badgeReserved,
        tone === "absent" && styles.badgeAbsent,
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          tone === "present" && styles.badgeTextPresent,
          tone === "reserved" && styles.badgeTextReserved,
          tone === "absent" && styles.badgeTextAbsent,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

export default function HomeScreen() {
  const { token, user, logout } = useAuth();

  const today = useMemo(() => new Date(), []);
  const todayString = useMemo(() => toDateString(today), [today]);

  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState(todayString);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submittingAttendance, setSubmittingAttendance] = useState(false);

  const [homeData, setHomeData] = useState(null);
  const [calendarData, setCalendarData] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);

  const [isScheduleSheetVisible, setIsScheduleSheetVisible] = useState(false);
  const [noticeVisible, setNoticeVisible] = useState(false);
  const [activeNotice, setActiveNotice] = useState(null);

  const refreshScreenData = useCallback(async () => {
    const [homeRes, calendarRes, attendanceRes] = await Promise.all([
      getMemberHome(token),
      getMemberCalendar(token, currentYear, currentMonth),
      getMyAttendance(token, selectedDate),
    ]);

    setHomeData(homeRes);
    setCalendarData(calendarRes);
    setAttendanceData(attendanceRes);
  }, [token, currentYear, currentMonth, selectedDate]);

  const loadAll = useCallback(
    async ({ silent = false } = {}) => {
      if (!token) return;

      try {
        if (!silent) setLoading(true);
        await refreshScreenData();
      } catch (error) {
        if (error.message === "유효하지 않은 토큰입니다.") {
          Alert.alert("세션 만료", "다시 로그인해주세요.");
          await logout();
          return;
        }

        Alert.alert("오류", error.message || "홈 데이터를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token, logout, refreshScreenData]
    
  );
  useEffect(() => {
  console.log("HOME homeData:", homeData);
  console.log("HOME member:", homeData?.member);
}, [homeData]);

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

  const displayName =
    homeData?.member?.name ||
    user?.name ||
    homeData?.user?.name ||
    "회원님";

  const todaySchedules = useMemo(() => {
    return calendarData?.scheduleByDate?.[todayString] || [];
  }, [calendarData, todayString]);

  const todayReservedCount = useMemo(() => {
    return todaySchedules.filter(
      (item) => item?.attendanceStatus === "reserved"
    ).length;
  }, [todaySchedules]);

  const todayPresentCount = useMemo(() => {
    return todaySchedules.filter(
      (item) => item?.attendanceStatus === "present"
    ).length;
  }, [todaySchedules]);

  const todayStatusLabel = useMemo(() => {
    if (todayPresentCount > 0 && todayReservedCount > 0) {
      return "출석 완료 + 예약 있음";
    }
    if (todayPresentCount > 0) return "출석 완료";
    if (todayReservedCount > 0) return "출석 예정";
    return "오늘 예약 없음";
  }, [todayPresentCount, todayReservedCount]);

  const todayReservableSessions = useMemo(() => {
    return todaySchedules.filter((item) => item?.attendanceStatus === "reserved");
  }, [todaySchedules]);

  const todayPresentSessions = useMemo(() => {
    return todaySchedules.filter((item) => item?.canCancelAttendance === true);
  }, [todaySchedules]);

  const hasTodayReserved = todayReservableSessions.length > 0;

  const todayClass = homeData?.todayClass || null;

const todayClassTitle = useMemo(() => {
  return (
    todayClass?.groupProgress?.curriculumName ||
    todayClass?.className ||
    todayClass?.title ||
    "현중태극권"
  );
}, [todayClass]);

const todayWeekProgressText = useMemo(() => {
  if (todayClass?.isYudanjaSession) return null;

  if (!todayClass?.groupProgress) {
    return "아직 등록되지 않았어요.";
  }

  return `${todayClass.groupProgress.startStep}식 ~ ${todayClass.groupProgress.endStep}식`;
}, [todayClass]);

  

  const handleHideNoticeToday = useCallback(async () => {
  if (!activeNotice?.id) {
    setNoticeVisible(false);
    return;
  }

  try {
    await hideNoticeToday(token, activeNotice.id);
    setNoticeVisible(false);
  } catch (error) {
    Alert.alert("오류", error.message || "공지 숨김 처리 실패");
  }
}, [token, activeNotice]);


const checkNoticePopup = useCallback(async () => {
  if (!token || !homeData) return;

  try {
    console.log("🔥 token:", token);
    console.log("🔥 homeData:", homeData);

    const notice = await getPopupNotice(token);
    console.log("🔥 popup notice:", notice);

    if (!notice?.id) {
      setActiveNotice(null);
      setNoticeVisible(false);
      return;
    }

    console.log("🔥 팝업 표시 시도");
    setActiveNotice(notice);
    setNoticeVisible(true);
  } catch (error) {
    console.log("팝업 공지 조회 실패:", error?.message);
    setActiveNotice(null);
    setNoticeVisible(false);
  }
}, [token, homeData]);

useEffect(() => {
  checkNoticePopup();
}, [checkNoticePopup]);

useFocusEffect(
  useCallback(() => {
    checkNoticePopup();
  }, [checkNoticePopup])
);

const handleNoticeDetail = useCallback(() => {
  if (!activeNotice?.id) {
    setNoticeVisible(false);
    return;
  }

  setNoticeVisible(false);

  router.push({
    pathname: "/notice/[noticeId]",
    params: {
      noticeId: String(activeNotice.id),
    },
  });
}, [activeNotice]);

const handleCloseNotice = useCallback(() => {
  setNoticeVisible(false);
}, []);

  const handlePressDate = useCallback(
    async (dateObj) => {
      if (!dateObj || !token) return;

      const nextDate = toDateString(dateObj);
      setSelectedDate(nextDate);

      try {
        const attendanceRes = await getMyAttendance(token, nextDate);
        setAttendanceData(attendanceRes);
        setIsScheduleSheetVisible(true);
      } catch (error) {
        Alert.alert("오류", error.message || "출석 정보를 불러오지 못했습니다.");
      }
    },
    [token]
  );

  const closeScheduleSheet = useCallback(() => {
    setIsScheduleSheetVisible(false);
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

        await skipRecurringReservationOnce(token, {
          memberRecurringReservationId,
          date: selectedDate,
          reason: "",
        });

        Alert.alert("완료", "이번만 쉬기로 처리되었습니다.");
        await refreshScreenData();
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

        await undoSkipRecurringReservationOnce(token, {
          memberRecurringReservationId,
          date: selectedDate,
        });

        Alert.alert("완료", "이번 쉬기 취소가 완료되었습니다.");
        await refreshScreenData();
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
function handleCancelReservation(item) {
  Alert.alert(
    "예약 취소",
    `${getSessionDisplayLabel(item)} 예약을 취소하시겠습니까?`,
    [
      { text: "아니오", style: "cancel" },
      {
        text: "취소하기",
        style: "destructive",
        onPress: () => {
          console.log("예약 취소 대상:", item);
        },
      },
    ]
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
        <View style={styles.heroCard}>
 <View style={styles.heroHeaderRow}>
  <Image
    source={require("./logo-dojang.png")}
    style={styles.heroLogo}
    resizeMode="contain"
  />

  <View style={styles.heroHeaderTextWrap}>
    <View style={styles.heroNameRow}>
      <Text style={styles.heroNameText}>{displayName}님</Text>

      <View
        style={[
          styles.headerStatusPill,
          todayStatusLabel === "출석 완료" && styles.statusPillDone,
          todayStatusLabel === "출석 예정" && styles.statusPillReserved,
          todayStatusLabel === "오늘 예약 없음" && styles.statusPillIdle,
        ]}
      >
        <Text
          style={[
            styles.headerStatusPillText,
            todayStatusLabel === "출석 완료" && styles.statusPillTextDone,
            todayStatusLabel === "출석 예정" && styles.statusPillTextReserved,
            todayStatusLabel === "오늘 예약 없음" && styles.statusPillTextIdle,
          ]}
        >
          {todayStatusLabel}
        </Text>
      </View>
    </View>

    <View style={styles.heroBadgeRow}>
      <View style={styles.heroMiniBadge}>
  <Text style={styles.heroMiniBadgeText}>
    {homeData?.member?.levelLabel || homeData?.member?.level || "일반회원"}
  </Text>
</View>

      {homeData?.member?.canAccessYudanjaClass ? (
  <View style={styles.heroMiniBadge}>
    <Text style={styles.heroMiniBadgeText}>유단자회</Text>
  </View>
) : null}
    </View>
  </View>
</View>

  <View style={styles.todayClassCard}>
  
  <View style={styles.todayClassContent}>
    <Text style={styles.todayClassLabel}>오늘 수업</Text>
    <Text style={styles.todayClassTitle}>{todayClassTitle}</Text>

{!todayClass?.isYudanjaSession ? (
  <View style={styles.weekProgressWrap}>
    <Text style={styles.weekProgressLabel}>이번 주 수련</Text>
    <Text style={styles.weekProgressValue}>
      {todayWeekProgressText}
    </Text>
  </View>
) : null}
  </View>

  <View style={styles.todayClassActionWrap}>
    {isSelectedToday && hasTodayReserved ? (
      <Pressable
        style={styles.heroPrimaryButton}
        onPress={() => {
          if (todayReservableSessions.length === 0) {
            Alert.alert("안내", "출석 예정된 수업이 없습니다.");
            return;
          }

          if (todayReservableSessions.length === 1) {
            handleAttendance(todayReservableSessions[0]);
            return;
          }

          Alert.alert(
            "오늘 출석",
            "출석 처리할 시간대를 선택해주세요.",
            todayReservableSessions.map((item) => ({
              text: getSessionDisplayLabel(item),
              onPress: () => handleAttendance(item),
            }))
          );
        }}
      >
        <Text style={styles.heroPrimaryButtonText}>오늘 출석</Text>
      </Pressable>
    ) : isSelectedToday && todayPresentSessions.length > 0 ? (
      <Pressable
        style={styles.heroSecondaryButton}
        onPress={() => {
          if (todayPresentSessions.length === 1) {
            handleCancelAttendance(todayPresentSessions[0]);
            return;
          }

          Alert.alert(
            "오늘 출석 취소",
            "취소할 시간대를 선택해주세요.",
            todayPresentSessions.map((item) => ({
              text: getSessionDisplayLabel(item),
              onPress: () => handleCancelAttendance(item),
            }))
          );
        }}
      >
        <Text style={styles.heroSecondaryButtonText}>출석 취소</Text>
      </Pressable>
    ) : (
      <View style={styles.heroActionPlaceholder} />
    )}
  </View>
</View>
</View>

        <View style={styles.card}>
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
                const statusMeta = getStatusMeta(dayInfo);
                const isSunday = dateObj.getDay() === 0;
                const isHoliday = dayInfo?.isHoliday === true;

                let dayCellBackgroundColor = "#FCFAF6";

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
    (isSunday || isHoliday) && styles.dayNumberSunday,
    selected && styles.dayNumberSelected,
  ]}
>
  {dateObj.getDate()}
</Text>

    <View style={styles.dayStampWrapper}>
      {dayInfo?.attendanceStatus === "present" && (
        <Image
          source={require("./stamp-dark.png")}
          style={styles.dayStampImagePresent}
          resizeMode="contain"
        />
      )}

      {dayInfo?.attendanceStatus === "reserved" && (
        <Image
          source={require("./stamp-light.png")}
          style={styles.dayStampImageReserved}
          resizeMode="contain"
        />
      )}
    </View>
  </Pressable>
);
              })}
            </View>
          ))}
        </View>

        <Text style={styles.calendarHintText}>
          날짜를 선택하면 2주간의 출석 계획을 세울 수 있습니다.
        </Text>
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

            <ScrollView
              contentContainerStyle={styles.sheetContent}
              showsVerticalScrollIndicator={false}
            >
              {selectedSchedules.length === 0 ? (
                <View style={styles.emptySheetBox}>
                  <Text style={styles.emptySheetText}>
                    일요일은 도장 휴관일 입니다.
                  </Text>
                </View>
              ) : (
                selectedSchedules.map((item, index) => {
  const sessionId = item?.sessionId || item?.id || `session-${index}`;
  const uiMeta = getScheduleUiMeta(item, { isReservableDate });
  const toneStyles = getScheduleCardStyle(uiMeta.tone);
  const canCancelReservation =
  item?.attendanceStatus === "reserved" ||
  uiMeta?.tone === "reserved" ||
  uiMeta?.tone === "waiting";

  const showHelperText =
    uiMeta.tone === "disabled" || uiMeta.tone === "cancelled";

  return (
    <View
      key={sessionId}
      style={[styles.compactScheduleCard, toneStyles.container]}
    >
      <View style={styles.compactScheduleRow}>
        <View style={styles.compactScheduleLeft}>
          <Text style={styles.compactScheduleTitle}>
            {getSessionDisplayLabel(item)}
          </Text>

          {uiMeta.isRecurring ? (
            <View style={styles.compactRecurringBadge}>
              <Text style={styles.compactRecurringBadgeText}>정기</Text>
            </View>
          ) : null}

          <View style={[styles.compactStatusChip, toneStyles.chip]}>
            <Text style={[styles.compactStatusChipText, toneStyles.chipText]}>
              {uiMeta.label}
            </Text>
          </View>
        </View>

        {uiMeta.actionLabel ? (
          <Pressable
            style={[
              styles.compactActionButton,
              (uiMeta.tone === "reserved" || uiMeta.tone === "done") &&
                styles.compactActionButtonSecondary,
              uiMeta.tone === "cancelled" &&
                styles.compactActionButtonPrimary,
            ]}
            onPress={() => handleScheduleAction(item, uiMeta.actionType)}
            disabled={submittingAttendance}
          >
            <Text
              style={[
                styles.compactActionButtonText,
                (uiMeta.tone === "reserved" || uiMeta.tone === "done") &&
                  styles.compactActionButtonTextSecondary,
              ]}
            >
              {submittingAttendance ? "처리 중..." : uiMeta.actionLabel}
            </Text>
          </Pressable>
        ) : null}
      </View>

      {showHelperText && uiMeta.helperText ? (
        <Text style={styles.compactHelperText}>{uiMeta.helperText}</Text>
      ) : null}
      {canCancelReservation ? (
  <Pressable
    style={styles.compactCancelButton}
    onPress={() => handleCancelReservation(item)}
  >
    <Text style={styles.compactCancelButtonText}>예약 취소</Text>
  </Pressable>
) : null}
    </View>
  );
})
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={noticeVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCloseNotice}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.noticeModalCard}>
            <Text style={styles.noticeModalLabel}>최근 공지</Text>
            <Text style={styles.noticeModalTitle}>
              {activeNotice?.title || "공지"}
            </Text>

            <ScrollView style={styles.noticeModalBody}>
              <Text style={styles.noticeModalContent}>
                {activeNotice?.content || ""}
              </Text>
            </ScrollView>

            <View style={styles.noticeButtonRow}>
  <Pressable
    style={[styles.noticeButton, styles.noticeButtonSecondary]}
    onPress={handleHideNoticeToday}
  >
    <Text style={styles.noticeButtonSecondaryText}>오늘 하루 보지 않기</Text>
  </Pressable>

  <Pressable
    style={[styles.noticeButton, styles.noticeButtonPrimary]}
    onPress={handleCloseNotice}
  >
    <Text style={styles.noticeButtonPrimaryText}>닫기</Text>
  </Pressable>
</View>

<Pressable
  style={styles.noticeDetailButton}
  onPress={handleNoticeDetail}
>
  <Text style={styles.noticeDetailButtonText}>자세히 보기</Text>
</Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f6f7fb",
  },
  content: {
  paddingHorizontal: 16,
  paddingTop: 36,
  paddingBottom: 28,
  gap: 18,
},
  center: {
    flex: 1,
    backgroundColor: "#f6f7fb",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "#666",
  },

  heroCard: {
  backgroundColor: "#F8F5EF",
  borderRadius: 30,
  paddingHorizontal: 18,
  paddingTop: 18,
  paddingBottom: 16,
  borderWidth: 1,
  borderColor: "#E8E1D6",
  position: "relative",
},

heroMarkWrap: {
  marginBottom: 10,
},

heroLogo: {
  width: 52,
  height: 52,
},

heroGreeting: {
  fontSize: 30,
  fontWeight: "800",
  color: "#161311",
  marginBottom: 14,
},
  
  heroStatusRow: {
    marginTop: 18,
    flexDirection: "row",
  },

  statusPill: {
  paddingHorizontal: 14,
  paddingVertical: 8,
  borderRadius: 999,
  alignSelf: "flex-start",
},
  statusPillIdle: {
    backgroundColor: "#F3F4F6",
  },
  statusPillReserved: {
    backgroundColor: "#DCFCE7",
  },
  statusPillDone: {
    backgroundColor: "#DBEAFE",
  },
  statusPillText: {
    fontSize: 13,
    fontWeight: "800",
  },
  statusPillTextIdle: {
    color: "#4B5563",
  },
  statusPillTextReserved: {
    color: "#166534",
  },
  statusPillTextDone: {
    color: "#1D4ED8",
  },

  card: {
  backgroundColor: "#FFFEFC",
  borderRadius: 28,
  paddingHorizontal: 18,
  paddingTop: 18,
  paddingBottom: 18,
  borderWidth: 1,
  borderColor: "#ECE7DE",
},

calendarHeader: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 10,
},

monthButton: {
  width: 42,
  height: 42,
  borderRadius: 21,
  backgroundColor: "#F6F1E8",
  alignItems: "center",
  justifyContent: "center",
},

monthButtonText: {
  fontSize: 24,
  fontWeight: "500",
  color: "#7B7164",
},

monthTitle: {
  fontSize: 20,
  fontWeight: "800",
  color: "#1F1A17",
},

weekHeader: {
  marginTop: 8,
  marginBottom: 8,
  flexDirection: "row",
},

weekHeaderText: {
  flex: 1,
  textAlign: "center",
  fontSize: 13,
  fontWeight: "700",
  color: "#9A8F81",
},

weekRow: {
  flexDirection: "row",
  marginTop: 8,
},

dayCell: {
  flex: 1,
  aspectRatio: 1,
  marginHorizontal: 3,
  borderRadius: 16,
  backgroundColor: "#FCFAF6",
  alignItems: "center",
  justifyContent: "flex-start",
  paddingTop: 8,
  position: "relative",
  overflow: "hidden",
},

dayCellSelected: {
  borderWidth: 2,
  borderColor: "#6FA3C8",
  backgroundColor: "#F7FBFF",
},

dayCellToday: {
  borderWidth: 1,
  borderColor: "#C8BFB1",
  backgroundColor: "#FFFDF9",
},

dayNumber: {
  fontSize: 17,
  fontWeight: "700",
  color: "#1F1A17",
  zIndex: 2,
},

dayNumberSelected: {
  color: "#325B7A",
},

  badge: {
    marginTop: 6,
    minWidth: 34,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  badgePresent: {
    backgroundColor: "#dcfce7",
  },
  badgeReserved: {
    backgroundColor: "#dbeafe",
  },
  badgeAbsent: {
    backgroundColor: "#fee2e2",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#6b7280",
  },
  badgeTextPresent: {
    color: "#15803d",
  },
  badgeTextReserved: {
    color: "#1d4ed8",
  },
  badgeTextAbsent: {
    color: "#b91c1c",
  },

  sheetOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.18)",
  },
  sheetBackdrop: {
    flex: 1,
  },
  sheetContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "72%",
    paddingTop: 10,
    paddingHorizontal: 18,
    paddingBottom: 22,
  },
  sheetHandle: {
    alignSelf: "center",
    width: 44,
    height: 5,
    borderRadius: 999,
    backgroundColor: "#D1D5DB",
    marginBottom: 14,
  },
  sheetHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
  },
  sheetCloseButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  sheetCloseButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#6B7280",
  },
  sheetContent: {
    paddingBottom: 20,
    gap: 12,
  },
  emptySheetBox: {
    paddingVertical: 28,
    alignItems: "center",
  },
  emptySheetText: {
    fontSize: 15,
    color: "#6B7280",
  },

  recurringBadgeCompact: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  recurringBadgeCompactText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#4338CA",
  },

  scheduleCard: {
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    borderWidth: 1,
  },
  
  scheduleCardAvailable: {
    backgroundColor: "#F0FDF4",
    borderColor: "#BBF7D0",
  },
  scheduleCardReserved: {
    backgroundColor: "#EFF6FF",
    borderColor: "#BFDBFE",
  },
  scheduleCardDone: {
    backgroundColor: "#ECFDF5",
    borderColor: "#A7F3D0",
  },
  scheduleCardCancelled: {
    backgroundColor: "#FFF7ED",
    borderColor: "#FED7AA",
  },
  scheduleCardDisabled: {
    backgroundColor: "#F9FAFB",
    borderColor: "#E5E7EB",
  },

  scheduleStatusChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  scheduleStatusChipText: {
    fontSize: 12,
    fontWeight: "700",
  },
  scheduleStatusChipAvailable: {
    backgroundColor: "#DCFCE7",
  },
  scheduleStatusChipReserved: {
    backgroundColor: "#DBEAFE",
  },
  scheduleStatusChipDone: {
    backgroundColor: "#D1FAE5",
  },
  scheduleStatusChipCancelled: {
    backgroundColor: "#FFEDD5",
  },
  scheduleStatusChipDisabled: {
    backgroundColor: "#E5E7EB",
  },
  scheduleStatusChipTextAvailable: {
    color: "#166534",
  },
  scheduleStatusChipTextReserved: {
    color: "#1D4ED8",
  },
  scheduleStatusChipTextDone: {
    color: "#047857",
  },
  scheduleStatusChipTextCancelled: {
    color: "#C2410C",
  },
  scheduleStatusChipTextDisabled: {
    color: "#4B5563",
  },

  compactScheduleCard: {
  borderRadius: 14,
  paddingHorizontal: 14,
  paddingVertical: 12,
  borderWidth: 1,
},

compactScheduleRow: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
},

compactScheduleLeft: {
  flex: 1,
  flexDirection: "row",
  alignItems: "center",
  flexWrap: "wrap",
  gap: 6,
},

compactScheduleTitle: {
  fontSize: 15,
  fontWeight: "800",
  color: "#111827",
},

compactRecurringBadge: {
  backgroundColor: "#EEF2FF",
  paddingHorizontal: 8,
  paddingVertical: 3,
  borderRadius: 999,
},

compactRecurringBadgeText: {
  fontSize: 11,
  fontWeight: "800",
  color: "#4338CA",
},

compactStatusChip: {
  paddingHorizontal: 9,
  paddingVertical: 4,
  borderRadius: 999,
},

compactStatusChipText: {
  fontSize: 11,
  fontWeight: "800",
},

compactHelperText: {
  marginTop: 8,
  fontSize: 12,
  lineHeight: 17,
  color: "#6B7280",
},

compactActionButton: {
  minWidth: 74,
  paddingHorizontal: 10,
  paddingVertical: 8,
  borderRadius: 10,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#2563EB",
},

compactActionButtonPrimary: {
  backgroundColor: "#2563EB",
},

compactActionButtonSecondary: {
  backgroundColor: "#E5E7EB",
},

compactActionButtonText: {
  fontSize: 12,
  fontWeight: "700",
  color: "#FFFFFF",
},

compactActionButtonTextSecondary: {
  color: "#111827",
},

  modalOverlay: {
  flex: 1,
  backgroundColor: "rgba(17, 24, 39, 0.38)",
  justifyContent: "center",
  padding: 20,
},
noticeModalCard: {
  backgroundColor: "#fffdf9",
  borderRadius: 24,
  padding: 20,
  maxHeight: "72%",
  borderWidth: 1,
  borderColor: "#ece4d8",
},
noticeModalLabel: {
  fontSize: 12,
  fontWeight: "700",
  color: "#8a7f72",
},
noticeModalTitle: {
  marginTop: 8,
  fontSize: 22,
  fontWeight: "800",
  color: "#2f2a24",
},
noticeModalBody: {
  marginTop: 14,
  maxHeight: 260,
},
noticeModalContent: {
  fontSize: 15,
  lineHeight: 24,
  color: "#4c4339",
},
noticeButtonRow: {
  flexDirection: "row",
  marginTop: 18,
  gap: 8,
},
noticeButton: {
  flex: 1,
  minHeight: 48,
  borderRadius: 14,
  alignItems: "center",
  justifyContent: "center",
  paddingHorizontal: 8,
},
noticeButtonPrimary: {
  backgroundColor: "#8c6330",
},
noticeButtonSecondary: {
  backgroundColor: "#f3ecdf",
  borderWidth: 1,
  borderColor: "#e2d7c6",
},
noticeButtonPrimaryText: {
  fontSize: 14,
  fontWeight: "800",
  color: "#fffdf9",
},
noticeButtonSecondaryText: {
  fontSize: 13,
  fontWeight: "700",
  color: "#7c4f21",
},
noticeDetailButton: {
  marginTop: 10,
  minHeight: 46,
  borderRadius: 14,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#fffdf9",
  borderWidth: 1,
  borderColor: "#ece4d8",
},
noticeDetailButtonText: {
  fontSize: 14,
  fontWeight: "800",
  color: "#8c6330",
},
  content: {
  paddingHorizontal: 16,
  paddingTop: 36,
  paddingBottom: 28,
  gap: 18,
},

heroHeaderRow: {
  flexDirection: "row",
  alignItems: "flex-start",
  marginBottom: 18,
},

heroLogo: {
  width: 56,
  height: 56,
  marginTop: 8,
},

heroHeaderTextWrap: {
  marginLeft: 10,
  flex: 1,
  paddingTop: 12,
},

heroNameRow: {
  flexDirection: "row",
  alignItems: "center",
  flexWrap: "wrap",
  gap: 4,
},

heroNameText: {
  fontSize: 22,
  fontWeight: "800",
  color: "#161311",
},

heroBadgeRow: {
  marginTop: 3,
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 6,
},

heroMiniBadge: {
  paddingHorizontal: 9,
  paddingVertical: 4,
  borderRadius: 999,
  backgroundColor: "#F1ECE3",
  borderWidth: 1,
  borderColor: "#DED4C7",
},

heroMiniBadgeText: {
  fontSize: 10,
  fontWeight: "700",
  color: "#5F554B",
},

headerStatusPill: {
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 999,
},

headerStatusPillText: {
  fontSize: 12,
  fontWeight: "800",
},

todayClassCard: {
  borderRadius: 28,
  borderWidth: 1,
  borderColor: "#DDD4C8",
  backgroundColor: "#FBF8F2",
  paddingHorizontal: 16,
  paddingVertical: 14,
  flexDirection: "row",
  alignItems: "center",
  overflow: "hidden",
},

todayClassContent: {
  flex: 1,
  paddingRight: 12,
  paddingLeft: 4,
},

todayClassLabel: {
  fontSize: 14,
  fontWeight: "700",
  color: "#6E675D",
  marginBottom: 8,
},

todayClassTitle: {
  fontSize: 21,
  fontWeight: "800",
  color: "#181411",
  marginBottom: 8,
},

todayClassDesc: {
  fontSize: 14,
  lineHeight: 20,
  color: "#4E4841",
},

todayClassActionWrap: {
  width: 118,
  alignItems: "flex-end",
  justifyContent: "center",
  paddingTop: 45,
},

heroPrimaryButton: {
  minWidth: 108,
  height: 48,
  borderRadius: 24,
  backgroundColor: "#314E67",
  alignItems: "center",
  justifyContent: "center",
  paddingHorizontal: 18,
},

heroPrimaryButtonText: {
  color: "#FFFFFF",
  fontSize: 16,
  fontWeight: "700",
},

heroSecondaryButton: {
  minWidth: 108,
  height: 48,
  borderRadius: 24,
  backgroundColor: "#F1ECE3",
  borderWidth: 1,
  borderColor: "#D9D0C2",
  alignItems: "center",
  justifyContent: "center",
  paddingHorizontal: 18,
},

heroSecondaryButtonText: {
  color: "#2A2624",
  fontSize: 15,
  fontWeight: "700",
},

heroActionPlaceholder: {
  width: 108,
  height: 48,
},

heroHeaderRow: {
  flexDirection: "row",
  alignItems: "flex-start",
  marginBottom: 18,
},

heroLogo: {
  width: 58,
  height: 58,
  marginTop: 15,
},

heroHeaderTextWrap: {
  marginLeft: 6,
  flex: 1,
  paddingTop: 12,
},

heroBadgeRow: {
  marginTop: 6,
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 5,
},

heroNameText: {
  fontSize: 26,
  fontWeight: "800",
  color: "#161311",
},

heroBadgeRow: {
  marginTop: 2,
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 6,
},

heroMiniBadge: {
  paddingHorizontal: 10,
  paddingVertical: 5,
  borderRadius: 999,
  backgroundColor: "#F1ECE3",
  borderWidth: 1,
  borderColor: "#DED4C7",
},

heroMiniBadgeText: {
  fontSize: 11,
  fontWeight: "700",
  color: "#5F554B",
},
headerStatusPill: {
  paddingHorizontal: 10,
  paddingVertical: 5,
  borderRadius: 999,
},

headerStatusPillText: {
  fontSize: 11,
  fontWeight: "800",
},

todayClassTopRow: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 10,
},

todayClassLabel: {
  fontSize: 14,
  fontWeight: "700",
  color: "#6E675D",
},

statusPill: {
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 999,
  alignSelf: "flex-start",
},

statusPillText: {
  fontSize: 12,
  fontWeight: "800",
},
dayStampWrapper: {
  position: "absolute",
  left: 0,
  right: 0,
  top: -3,
  alignItems: "center",
},

dayStampImagePresent: {
  width: 48,
  height: 48,
},

dayStampImageReserved: {
  width: 48,
  height: 48,
  opacity: 0.65,
},
weekHeaderTextSunday: {
  color: "#C2410C",
},
dayNumberSunday: {
  color: "#C2410C",
},
compactCancelButton: {
  marginTop: 10,
  alignSelf: "flex-start",
  paddingHorizontal: 12,
  paddingVertical: 8,
  borderRadius: 999,
  backgroundColor: "#F3F1EC",
  borderWidth: 1,
  borderColor: "#DDD4C8",
},

compactCancelButtonText: {
  fontSize: 12,
  fontWeight: "700",
  color: "#5F554B",
},
weekProgressWrap: {
  marginTop: 6,
},

weekProgressLabel: {
  fontSize: 13,
  fontWeight: "700",
  color: "#7a6f61",
  marginBottom: 2,
},

weekProgressValue: {
  fontSize: 16,
  fontWeight: "700",
  color: "#7c4f21",
},
});