import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
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
import { useAuth } from "../../src/contexts/AuthContext";
import { LinearGradient } from "expo-linear-gradient";

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
import {
  getPopupNotice,
  hideNoticeToday,
  getMemberNoticeList,
} from "../../src/api/memberNotice";

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
    label: "수업 예정",
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
  const authUser = user || {};
const memberStatus = authUser?.memberStatus || authUser?.status;
const isPausedMember = memberStatus === "paused";


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
  const [noticeList, setNoticeList] = useState([]);
  const [isScheduleSheetVisible, setIsScheduleSheetVisible] = useState(false);
  const [noticeVisible, setNoticeVisible] = useState(false);
  const [activeNotice, setActiveNotice] = useState(null);
  const [hiddenNoticeIds, setHiddenNoticeIds] = useState([]);
  const [hasUnreadNotice, setHasUnreadNotice] = useState(false);
  const [memberNotifications, setMemberNotifications] = useState([]);
  const [closedNoticeIds, setClosedNoticeIds] = useState([]);

  const yudanjaEmblemFrame = require("../../assets/images/yudanja-emblem-frame.png");
  const yudanjaProfileBg = require("../../assets/images/yudanja-profile-card-bg.png");

const loadMemberNotifications = useCallback(async () => {
  if (!token) return;

  try {
    const response = await fetch(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/api/me/notifications?t=${Date.now()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      }
    );

    const result = await response.json();

    if (response.ok) {
      setMemberNotifications(result.data || []);
    } else {
      console.log("회원 알림 조회 실패:", result);
    }
  } catch (error) {
    console.log("회원 알림 조회 실패:", error);
  }
}, [token]);


  const refreshScreenData = useCallback(async () => {
  if (!token) {
    console.log("⏳ HOME token 아직 없음 - 요청 중단");
    return;
  }

  const homeRes = await getMemberHome(token);
  const calendarRes = await getMemberCalendar(token, currentYear, currentMonth);
  const noticeRes = await getMemberNoticeList(token);

  console.log("🔥 HOME homeRes =", JSON.stringify(homeRes, null, 2));
  console.log("🔥 HOME member =", JSON.stringify(homeRes?.member, null, 2));
  console.log("🔥 HOME groupProgress =", JSON.stringify(homeRes?.groupProgress, null, 2));
  console.log("🔥 HOME todayClass =", JSON.stringify(homeRes?.todayClass, null, 2));
  console.log("🔥 HOME calendarRes =", JSON.stringify(calendarRes, null, 2));

  setHomeData(homeRes);
  setCalendarData(calendarRes);
  setNoticeList(noticeRes || []);

  console.log("✅ HOME refreshScreenData 완료");
}, [token, currentYear, currentMonth]);

  const loadAll = useCallback(
  async ({ silent = false } = {}) => {
  if (!token) {
    console.log("⏳ HOME loadAll token 없음 - 대기");
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
if (!silent && !homeData && !calendarData) {
  setLoading(true);
}
        await refreshScreenData();
        await loadMemberNotifications();
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
[token, logout, refreshScreenData, loadMemberNotifications, isPausedMember]
    
  );
  
  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useFocusEffect(
    useCallback(() => {
      loadAll({ silent: true });
      loadMemberNotifications();
    }, [loadAll])
  );

  
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadAll({ silent: true });
    loadMemberNotifications();
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

  const miniCalendarWeeks = useMemo(() => {
  const base = new Date(todayString + "T00:00:00");
  const day = base.getDay();

  const sunday = new Date(base);
  sunday.setDate(base.getDate() - day);

  const cells = Array.from({ length: 14 }).map((_, index) => {
    const date = new Date(sunday);
    date.setDate(sunday.getDate() + index);
    return date;
  });

  return [cells.slice(0, 7), cells.slice(7, 14)];
}, [todayString]);

  const displayName =
  homeData?.member?.name ||
  user?.name ||
  homeData?.user?.name ||
  "회원님";

  const joinDate = homeData?.member?.joinDate;

const joinDateString = joinDate ? String(joinDate).slice(0, 10) : null;

const joinDays = joinDateString
  ? getDateDiffInDays(joinDateString, todayString) + 1
  : null;

const attendanceCount =
  homeData?.member?.totalAttendanceCount || 0;

const isYudanja = homeData?.member?.canAccessYudanjaClass === true;
const trainingGoals = homeData?.trainingGoals || null;

const promotionGoal = trainingGoals?.promotion || null;

const promotionRemainingText =
  promotionGoal && !promotionGoal.isEligible
    ? String(promotionGoal.remainingCount).padStart(3, "0")
    : null;

const promotionBadgeText = promotionGoal
  ? promotionGoal.isEligible
    ? "승단심사 가능"
    : `승단 D-${promotionRemainingText}일`
  : null;

const logoSource = isYudanja
  ? require("../../assets/images/yudanja-logo.png")
  : require("./logo-dojang.png");
const avatarImages = {
  avatar1: require("../../assets/images/avatar1.png"),
  avatar2: require("../../assets/images/avatar2.png"),
  avatar3: require("../../assets/images/avatar3.png"),
  avatar4: require("../../assets/images/avatar4.png"),
  avatar5: require("../../assets/images/avatar5.png"),
  avatar6: require("../../assets/images/avatar6.png"),
  avatar7: require("../../assets/images/avatar7.png"),
  avatar8: require("../../assets/images/avatar8.png"),
};

const profileAvatarKey = homeData?.member?.profileAvatar || "avatar1";
const profileImageSource = avatarImages[profileAvatarKey] || avatarImages.avatar1;
  const todaySchedules = useMemo(() => {
    return calendarData?.scheduleByDate?.[todayString] || [];
  }, [calendarData, todayString]);

  const unreadMemberNotificationCount = memberNotifications.filter(
  (item) => !item.isRead
).length;

const hasUnreadMemberNotification = unreadMemberNotificationCount > 0;

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
  return todaySchedules
    .filter((item) => item?.attendanceStatus === "reserved")
    .filter((item) => item?.canReserve !== false)
    .sort((a, b) => {
      const aText = a?.startTime || "";
      const bText = b?.startTime || "";
      return aText.localeCompare(bText, "ko");
    });
}, [todaySchedules]);

  const todayPresentSessions = useMemo(() => {
    return todaySchedules.filter((item) => item?.canCancelAttendance === true);
  }, [todaySchedules]);

  const hasTodayReserved = todayReservableSessions.length > 0;

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

const todayCheckInSessions = todaySchedules.filter((item) => {
  if (item?.attendanceStatus === "present") return false;
  return canCheckInTodaySession(item);
});

const hasTodayCheckInSession = todayCheckInSessions.length > 0;

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

function getNearestCheckInSession(sessions, todayString) {
  const now = new Date();

  const candidates = sessions
    .map((item) => {
      const start = parseKoreanStartTimeToDate(todayString, item?.startTime);
      if (!start) return null;

      const endLimit = new Date(start);
      endLimit.setHours(endLimit.getHours() + 2);

      const checkInStart = new Date(start);
checkInStart.setHours(checkInStart.getHours() - 1);

const checkInEnd = new Date(start);
checkInEnd.setMinutes(checkInEnd.getMinutes() + 90);

const isCheckInWindow =
  now >= checkInStart && now <= checkInEnd;

      if (!isCheckInWindow) return null;

      return {
        item,
        diff: Math.abs(start.getTime() - now.getTime()),
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.diff - b.diff);

  return candidates[0]?.item || null;
}

  const todayClass = homeData?.todayClass || null;

const todayWeekday = today.getDay(); // 일 0, 월 1, 화 2...
const isMondayToday = todayWeekday === 1;

const isTodayYudanjaSession =
  isYudanja &&
  isMondayToday &&
  todayClass?.isYudanjaSession === true;

const yudanjaProgress =
  isYudanja && isTodayYudanjaSession
    ? todayClass?.yudanjaProgress || homeData?.yudanjaProgress || null
    : null;

const homeGroupProgress =
  homeData?.homeGroupProgress ||
  homeData?.groupProgress ||
  homeData?.activeGroupTrack ||
  homeData?.currentGroupProgress ||
  null;

console.log("🔥 [HOME homeData keys]", Object.keys(homeData || {}));
console.log("🔥 [HOME homeGroupProgress]", homeGroupProgress);
const todayClassTitle = useMemo(() => {
  if (isTodayYudanjaSession) {
    return yudanjaProgress?.title || "유단자회 수련";
  }

  return (
  homeGroupProgress?.curriculumName ||
  homeGroupProgress?.curriculum?.name ||
  homeGroupProgress?.curriculumTitle ||
  todayClass?.groupProgress?.curriculumName ||
  todayClass?.groupProgress?.curriculum?.name ||
  homeData?.groupProgress?.curriculumName ||
  homeData?.groupProgress?.curriculum?.name ||
  homeData?.activeGroupTrack?.curriculum?.name ||
  todayClass?.className ||
  todayClass?.title ||
  "현중태극권"
);
}, [
  isTodayYudanjaSession,
  yudanjaProgress,
  homeGroupProgress,
  todayClass,
  homeData,
]);

const todayWeekProgressText = useMemo(() => {
  if (isTodayYudanjaSession) {
    return yudanjaProgress?.memo || "";
  }

  if (!homeGroupProgress) {
    return "아직 등록되지 않았어요.";
  }

  const startStep =
  homeGroupProgress?.startStep ??
  homeGroupProgress?.currentStartStep ??
  homeGroupProgress?.fromStep ??
  null;

const endStep =
  homeGroupProgress?.endStep ??
  homeGroupProgress?.currentEndStep ??
  homeGroupProgress?.toStep ??
  homeGroupProgress?.currentStep ??
  null;

if (startStep && endStep) {
  return `이번 주 ${startStep}식 ~ ${endStep}식`;
}

if (homeGroupProgress?.currentStep) {
  return `이번 주 ${homeGroupProgress.currentStep}식`;
}

return "아직 등록되지 않았어요.";
}, [isTodayYudanjaSession, yudanjaProgress, homeGroupProgress]);

  const handleHideNoticeToday = useCallback(async () => {
  if (!activeNotice?.id) {
    setNoticeVisible(false);
    setHasUnreadNotice(false);
    return;
  }

  try {
    await hideNoticeToday(token, activeNotice.id);

    // 🔥 프론트에서도 막아버림
    setHiddenNoticeIds((prev) => [...prev, activeNotice.id]);

    setNoticeVisible(false);
    setActiveNotice(null);
  } catch (error) {
    Alert.alert("오류", error.message || "공지 숨김 처리 실패");
  }
}, [token, activeNotice]);


const checkNoticePopup = useCallback(async () => {
  if (!token || !homeData) return;

  try {
    const notice = await getPopupNotice(token);

    // 🔥 추가: 프론트에서도 막기
    if (
  !notice?.id ||
  hiddenNoticeIds.includes(notice.id) ||
  closedNoticeIds.includes(notice.id)
) {
      setActiveNotice(null);
      setNoticeVisible(false);
      return;
    }

    setActiveNotice(notice);
    setNoticeVisible(true);
    setHasUnreadNotice(true);
  } catch (error) {
    setActiveNotice(null);
    setNoticeVisible(false);
  }
}, [token, homeData, hiddenNoticeIds, closedNoticeIds]);

useEffect(() => {
  checkNoticePopup();
}, [checkNoticePopup]);

useFocusEffect(
  useCallback(() => {
    checkNoticePopup();
  }, [checkNoticePopup])
);

const handleCloseNotice = useCallback(() => {
  if (activeNotice?.id) {
    setClosedNoticeIds((prev) =>
      prev.includes(activeNotice.id) ? prev : [...prev, activeNotice.id]
    );
  }

  setNoticeVisible(false);
  setHasUnreadNotice(false);
}, [activeNotice]);

const handleNoticeDetail = useCallback(() => {
  if (!activeNotice?.id) {
    setNoticeVisible(false);
    setHasUnreadNotice(false);
    return;
  }

  setNoticeVisible(false);
  setHasUnreadNotice(false);

  router.push({
    pathname: "/notice/[noticeId]",
    params: {
      noticeId: String(activeNotice.id),
    },
  });
}, [activeNotice]);

  const handlePressDate = useCallback(
  async (dateObj) => {
    if (!dateObj || !token) return;

    const nextDate = toDateString(dateObj);
    setSelectedDate(nextDate);

    const dayInfo = calendarMap[nextDate];

    const hasSpecialDay =
      !!dayInfo?.holidayName ||
      dayInfo?.isHoliday === true ||
      dayInfo?.isOpenHoliday === true;

    if (!hasSpecialDay) {
      return;
    }

    try {
      const attendanceRes = await getMyAttendance(token, nextDate);
      setAttendanceData(attendanceRes);
      setIsScheduleSheetVisible(true);
    } catch (error) {
      Alert.alert("오류", error.message || "일정 정보를 불러오지 못했습니다.");
    }
  },
  [token, calendarMap]
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
  <View style={styles.homeHeader}>
    <Image
  source={require("../../assets/images/home-mountain-bg.png")}
  style={styles.homeMountainBg}
  resizeMode="cover"
/>

<Pressable
  style={styles.homeNoticeBell}
  onPress={() => router.push("/member-notifications")}
>
<Image
  source={require("../../assets/images/bell-line.png")}
  style={styles.homeNoticeBellIcon}
  resizeMode="contain"
/>

{hasUnreadNotice || hasUnreadMemberNotification ? (
  <View style={styles.homeNoticeDot} />
) : null}
</Pressable>

<LinearGradient
  colors={["rgba(255,249,246,0)", "#FFF9F6"]}
  style={styles.homeMountainFade}
/>
    <View style={styles.homeHeaderTextBlock}>
  <Text style={styles.homeGreeting}>안녕하세요!</Text>
    <Text style={styles.homeName}>{displayName}님</Text>

    <View style={styles.homeBadgeRow}>
      <View style={styles.homeBadge}>
        <Text style={styles.homeBadgeText}>
          {homeData?.member?.levelLabel || homeData?.member?.level || "일반회원"}
        </Text>
      </View>
      

      {isYudanja ? (
        <View style={[styles.homeBadge, styles.homeBadgeYudanja]}>
          <Text style={[styles.homeBadgeText, styles.homeBadgeTextYudanja]}>
            유단자회
          </Text>
        </View>
      ) : null}
    </View>
    {joinDays ? (
  <Text style={styles.homeAttendanceSummary}>
    입관 {joinDays}일째 · 누적 출석 {attendanceCount}일
  </Text>
) : null}
  </View>

  <View style={[styles.homeProfileWrap, isYudanja && styles.homeProfileWrapYudanja]}>
  <View style={[styles.homeProfileCircle, isYudanja && styles.homeProfileCircleYudanja]}>
    <Image
      source={profileImageSource}
      style={styles.homeProfileImage}
      resizeMode="cover"
    />
  </View>

  {isYudanja ? (
  <Image
    source={yudanjaEmblemFrame}
    style={[styles.homeYudanjaEmblemFrame, { pointerEvents: "none" }]}
    resizeMode="contain"
  />
) : null}
</View>
</View>

<LinearGradient
  colors={
    isYudanja
      ? ["#FFFDF7", "#FFF8E8", "#FFFFFF"]
      : [colors.card, colors.card]
  }
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 1 }}
  style={[
    styles.todayTrainingCard,
    isYudanja && styles.todayTrainingCardYudanja,
  ]}
>
  {isYudanja ? (
  <>
    <Image
      source={yudanjaProfileBg}
      style={[styles.todayYudanjaBgImage, { pointerEvents: "none" }]}
      resizeMode="cover"
    />

    <View
      style={[styles.yudanjaGoldBorderOuter, { pointerEvents: "none" }]}
    />

    <View
      style={[styles.yudanjaGoldBorderInner, { pointerEvents: "none" }]}
    />
  </>
) : null}

  <View style={styles.todayTrainingHeader}>
    <Text style={styles.todayTrainingLabel}>오늘의 수련</Text>

    <Pressable onPress={() => router.push("/(tabs)/taegukwon")}>
      <View style={styles.moreLinkRow}>
        <Text style={styles.todayTrainingMore}>자세히 보기</Text>
      </View>
    </Pressable>
  </View>

  <Text style={styles.todayTrainingTitle}>{todayClassTitle}</Text>
  <Text
    style={[
      styles.todayTrainingStep,
      isYudanja && styles.todayTrainingStepYudanja,
    ]}
  >
    {todayWeekProgressText}
  </Text>

  <Image
    source={require("../../assets/images/taichi-silhouette.png")}
    style={[
      styles.todaySilhouette,
      isYudanja && styles.todaySilhouetteYudanja,
    ]}
    resizeMode="contain"
  />

  <Pressable
    style={[
      styles.todayTrainingButton,
      isYudanja && styles.todayTrainingButtonYudanja,
    ]}
    onPress={() => router.push("/qr-attendance")}
  >
    <Text
      style={[
        styles.todayTrainingButtonText,
        isYudanja && styles.todayTrainingButtonTextYudanja,
      ]}
    >
      ☑  출석하기
    </Text>
  </Pressable>
</LinearGradient>

        <View style={styles.card}>
          <View style={styles.miniCalendarHeader}>
  <Text style={styles.miniCalendarTitle}>
    {today.getMonth() + 1}월 출석 현황
  </Text>

  <Pressable onPress={() => router.push("/(tabs)/schedule")}>
    <View style={styles.moreLinkRow}>
  <Text style={styles.miniCalendarMore}>더보기</Text>
</View>
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

          {miniCalendarWeeks.map((week, rowIndex) => (
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
                const attendanceCountForDay =
                      dayInfo?.presentCount ||
                      dayInfo?.attendanceCount ||
                      dayInfo?.presentSessionCount ||
                      (dayInfo?.attendanceStatus === "present" ? 1 : 0);
                const selected = selectedDate === dateString;
                const todayFlag = dateString === todayString;
                const statusMeta = getStatusMeta(dayInfo);
                const isSunday = dateObj.getDay() === 0;
                const isHoliday = dayInfo?.isHoliday === true;
                const isOpenEvent = dayInfo?.isOpenHoliday === true;
                const isClosedHoliday = dayInfo?.isHoliday === true && !isOpenEvent;

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
  {dayInfo?.attendanceStatus === "present" ? (
  <View
    style={[
      styles.dayStampPresent,
      attendanceCountForDay >= 2 && styles.dayStampPresentTwo,
      attendanceCountForDay >= 3 && styles.dayStampPresentThree,
    ]}
  >
    <Text style={styles.dayStampTextPresent}>{dateObj.getDate()}</Text>
  </View>
) : dayInfo?.attendanceStatus === "reserved" &&
  dayInfo?.isHoliday !== true &&
  dayInfo?.hasRecurringException !== true ? (
  <View style={styles.dayStampReserved}>
    <Text style={styles.dayStampTextReserved}>{dateObj.getDate()}</Text>
  </View>
) : (
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
)}
  </Pressable>
);
})}
 </View>
 ))}

<View style={styles.calendarLegend}>
  <View style={styles.legendItem}>
    <View style={styles.legendDotPresent} />
    <Text style={styles.legendText}>출석</Text>
  </View>

  <View style={styles.legendItem}>
    <View style={styles.legendDotReserved} />
    <Text style={styles.legendText}>예약</Text>
  </View>
</View>
        </View>

        

<View style={styles.noticeSummaryCard}>
  <View style={styles.noticeSummaryHeader}>
    <Text style={styles.noticeSummaryTitle}>도장 소식</Text>

    <Pressable onPress={() => router.push("/(tabs)/inquiry")}>
      <Text style={styles.noticeSummaryMore}>더보기 </Text>
    </Pressable>
  </View>

  {noticeList.slice(0, 2).length === 0 ? (
  <Text style={styles.noticeSummaryEmpty}>등록된 소식이 없습니다.</Text>
) : (
  noticeList.slice(0, 2).map((notice) => (
    <Pressable
      key={notice.id}
      style={styles.noticeSummaryItem}
      onPress={() =>
        router.push({
          pathname: "/notice/[noticeId]",
          params: { noticeId: String(notice.id) },
        })
      }
    >
      <Text style={styles.noticeSummaryBullet}>•</Text>

      <Text style={styles.noticeSummaryText} numberOfLines={1}>
        {notice.title}
      </Text>

      <Text style={styles.noticeSummaryDate}>
        {String(notice.publishedAt || notice.createdAt || "")
          .slice(5, 10)
          .replace("-", ".")}
      </Text>
    </Pressable>
  ))
)}
</View>
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
      )}일 안내`
    : "일정 안내"}
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
        <Text style={styles.compactScheduleTitle}>
          {getSessionDisplayLabel(item)}
        </Text>

        {finalUiMeta.isRecurring ? (
          <View style={styles.compactRecurringBadge}>
            <Text style={styles.compactRecurringBadgeText}>정기</Text>
          </View>
        ) : null}

        <View style={[styles.compactStatusChip, toneStyles.chip]}>
          <Text style={[styles.compactStatusChipText, toneStyles.chipText]}>
            {finalUiMeta.label}
          </Text>
        </View>
      </View>
    </View>

    {showHelperText && finalUiMeta.helperText ? (
      <Text style={styles.compactHelperText}>{finalUiMeta.helperText}</Text>
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

const colors = {
  background: "#FFFCFA",
  card: "#FFFFFF",
  blushBeige: "#F5EAE4",
  roseTaupe: "#DCC6BE",
  warmBrown: "#76564B",
  softBrown: "#A78D83",
  bronzeGold: "#C89E6A",
  textMain: "#3A2C27",
  textSub: "#8A7A72",
  textMuted: "#A99F98",
  border: "#EFE5DE",
  reserved: "#F4E4C8",
  present: "#6B4F46",
  absent: "#D9D2CD",
  closed: "#E9E1DB",
  white: "#FFFFFF",
  danger: "#C46A5A",
};
const isWeb = Platform.OS === "web";
const fonts = {
  regular: "PretendardRegular",
  medium: "PretendardMedium",
  semiBold: "PretendardSemiBold",
  bold: "PretendardBold",
};
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
  paddingHorizontal: isWeb ? 12 : 16,
  paddingTop: isWeb ? 28 : 48,
  paddingBottom: isWeb ? 30 : 18,
  gap: isWeb ? 12 : 15,
  width: "100%",
  maxWidth: 430,
  alignSelf: "center",
},

  center: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSub,
  },

  homeHeader: {
  minHeight: isWeb ? 112 : 140,
  paddingHorizontal: 4,
  paddingTop: isWeb ? 0 : 8,
  paddingBottom: isWeb ? 28 : 45,
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "flex-start",
  position: "relative",
  overflow: "visible",
},

homeHeaderTextBlock: {
  paddingLeft: 9,
},
  homeMountainBg: {
  position: "absolute",
  left: -100,
  right: -40,
  bottom: -75,
  height: 175,
  opacity: 0.55,
  transform: [{ scale: 0.75}],
},

  homeGreeting: {
  fontSize: isWeb ? 14 : 14,
  fontFamily: fonts.semiBold,
  lineHeight: isWeb ? 18 : 20,
  color: colors.textSub,
  marginTop: 10,
  marginBottom: 3,
},

homeName: {
  fontSize: isWeb ? 30 : 36,
  fontFamily: fonts.bold,
  letterSpacing: -1.2,
  color: "#161311",
  marginBottom: 1,
},

  homeBadgeRow: {
    marginTop: 8,
    flexDirection: "row",
    gap: 7,
    flexWrap: "wrap",
  },

  homeBadge: {
  minHeight: isWeb ? 26 : 30,
  paddingHorizontal: isWeb ? 9 : 11,
  paddingVertical: isWeb ? 4 : 5,
  borderRadius: 999,
  backgroundColor: colors.blushBeige,
  alignItems: "center",
  justifyContent: "center",
},


  homeBadgeText: {
  fontSize: 11,
  fontFamily: fonts.bold,
  color: colors.warmBrown,
},

  homeBadgeYudanja: {
    backgroundColor: colors.warmBrown,
  },

  homeBadgeTextYudanja: {
    color: "#E3B66F",
  },

  todayTrainingCard: {
  marginTop: isWeb ? -14 : -25,
  backgroundColor: colors.card,
  borderRadius: isWeb ? 20 : 22,
  borderWidth: 0.3,
  borderColor: colors.border,
  paddingTop: isWeb ? 13 : 15,
  paddingBottom: isWeb ? 13 : 15,
  paddingHorizontal: isWeb ? 15 : 18,
  overflow: "hidden",
  shadowColor: "#BFA79B",
  shadowOpacity: 0.08,
  shadowRadius: 14,
  shadowOffset: { width: 0, height: 6 },
  elevation: 3,
},

todayTrainingHeader: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: isWeb ? 14 : 20,
  marginLeft: isWeb ? 2 : 8,
  zIndex: 5,
},

todayTrainingLabel: {
  marginTop: 3,
  fontSize: isWeb ? 15 : 17,
  fontFamily: fonts.bold,
  lineHeight: 22,
  color: colors.textMain,
},

todayTrainingMore: {
  fontSize: 11,
  fontFamily: fonts.Medium,
  marginTop: isWeb ? -10 : -10,
  color: colors.textSub,
},

todayTrainingTitle: {
  fontSize: isWeb ? 24 : 28,
  fontFamily: fonts.bold,
  letterSpacing: -0.8,
  lineHeight: isWeb ? 30 : 33,
  color: colors.textMain,
  marginTop: 10,
  marginLeft: isWeb ? 2 : 8,
  maxWidth: "76%",
  zIndex: 5,
},

todayTrainingStep: {
  fontSize: isWeb ? 15 : 17,
  fontFamily: fonts.semiBold,
  lineHeight: isWeb ? 20 : 22,
  color: colors.warmBrown,
  marginBottom: isWeb ? 30 : 40,
  marginLeft: isWeb ? 2 : 8,
  maxWidth: "76%",
  zIndex: 5,
},

todayTrainingButton: {
  height: isWeb ? 43 : 47,
  borderRadius: 14,
  backgroundColor: colors.warmBrown,
  alignItems: "center",
  justifyContent: "center",
  marginTop: 3,
  zIndex: 5,
},

todayTrainingButtonText: {
  fontSize: isWeb ? 15 : 17,
  fontFamily: fonts.bold,
  color: colors.white,
},

card: {
  backgroundColor: colors.card,
  borderRadius: isWeb ? 20 : 22,
  paddingHorizontal: isWeb ? 14 : 16,
  paddingTop: isWeb ? 14 : 16,
  paddingBottom: isWeb ? 14 : 16,
  borderWidth: 0.3,
  borderColor: colors.border,
  shadowColor: "#BFA79B",
  shadowOpacity: 0.05,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
  elevation: 2,
},

  miniCalendarHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  miniCalendarTitle: {
  fontSize: 17,
  fontFamily: fonts.bold,
  letterSpacing: -0.4,
  lineHeight: 24,
  color: colors.textMain,
},

miniCalendarMore: {
  fontSize: 11,
  fontFamily: fonts.semiBold,
  color: colors.textSub,
},

  weekHeader: {
    flexDirection: "row",
    marginTop: 2,
    marginBottom: 4,
  },

  weekHeaderText: {
  flex: 1,
  textAlign: "center",
  fontSize: 13,
  fontFamily: fonts.bold,
  color: "#B7AAA2",
},

  weekHeaderTextSunday: {
    color: "#C45A2A",
  },

  weekRow: {
    flexDirection: "row",
    marginTop: 1,
  },

  dayCell: {
  flex: 1,
  height: 34,
  marginHorizontal: 2,
  borderRadius: 999,
  backgroundColor: "transparent",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
  overflow: "visible",
},

  dayCellSelected: {
    borderWidth: 0.8,
    borderColor: colors.roseTaupe,
    backgroundColor: "#FFFDF9",
  },

  dayCellToday: {
    borderWidth: 1,
    borderColor: colors.roseTaupe,
    backgroundColor: "#FFFDF9",
  },

  dayNumber: {
  fontSize: 14,
  fontFamily: fonts.bold,
  color: colors.textMain,
  zIndex: 5,
},

  dayNumberSelected: {
    color: "#325B7A",
  },

  dayNumberSunday: {
    color: "#C45A2A",
  },

  dayNumberEvent: {
    color: "#059669",
  },

  dayStatusDotPresent: {
    position: "absolute",
    bottom: 4,
    width: 5,
    height: 5,
    borderRadius: 999,
    backgroundColor: colors.present,
  },

  dayStatusDotReserved: {
    position: "absolute",
    bottom: 4,
    width: 5,
    height: 5,
    borderRadius: 999,
    backgroundColor: colors.bronzeGold,
  },

  eventDot: {
    position: "absolute",
    bottom: 4,
    width: 5,
    height: 5,
    borderRadius: 999,
    zIndex: 20,
  },

  eventDotClosed: {
    backgroundColor: colors.danger,
  },

  eventDotOpen: {
    backgroundColor: "#10B981",
  },

  noticeSummaryCard: {
    backgroundColor: colors.card,
    borderRadius: 22,
    borderWidth: 0.4,
    borderColor: colors.border,
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginBottom: -8,
  },

  noticeSummaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  noticeSummaryTitle: {
  fontSize: 17,
  fontFamily: fonts.bold,
  color: colors.textMain,
},

noticeSummaryMore: {
  fontSize: 12,
  fontFamily: fonts.bold,
  color: colors.textSub,
},

  noticeSummaryItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  },

  noticeSummaryBullet: {
    width: 16,
    fontSize: 16,
    fontWeight: "800",
    color: colors.warmBrown,
  },

  noticeSummaryText: {
  flex: 1,
  fontSize: 14,
  fontFamily: fonts.semiBold,
  color: colors.textMain,
},

noticeSummaryDate: {
  marginLeft: 10,
  fontSize: 12,
  fontFamily: fonts.semiBold,
  color: colors.textSub,
},

  noticeSummaryEmpty: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textSub,
    paddingVertical: 6,
  },

  sheetOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(43,37,34,0.25)",
  },

  sheetBackdrop: {
    flex: 1,
  },

  sheetContainer: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "72%",
    paddingTop: 10,
    paddingHorizontal: 18,
    paddingBottom: 22,
  },

  sheetHandle: {
    alignSelf: "center",
    width: 48,
    height: 5,
    borderRadius: 999,
    backgroundColor: colors.roseTaupe,
    marginBottom: 14,
  },

  sheetHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  sheetTitle: {
    fontSize: 23,
    fontWeight: "800",
    color: colors.textMain,
  },

  sheetCloseButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  sheetCloseButtonText: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.textSub,
  },

  sheetContent: {
    paddingBottom: 45,
    gap: 0,
  },

  emptySheetBox: {
    paddingVertical: 28,
    alignItems: "center",
  },

  emptySheetText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textSub,
  },

  selectedEventNotice: {
    marginBottom: 12,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
  },

  selectedEventNoticeOpen: {
    backgroundColor: "#FFF7ED",
    borderColor: "#FED7AA",
  },

  selectedEventNoticeClosed: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
  },

  selectedEventNoticeTitle: {
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 4,
  },

  selectedEventNoticeTitleOpen: {
    color: "#C2410C",
  },

  selectedEventNoticeTitleClosed: {
    color: "#B91C1C",
  },

  selectedEventNoticeText: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.textMain,
  },

  selectedEventNoticeSubText: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "600",
    color: "#7F1D1D",
  },

  compactScheduleCard: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.card,
  },

  compactScheduleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  compactScheduleLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 7,
  },

  compactScheduleTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.textMain,
  },

  compactRecurringBadge: {
    backgroundColor: colors.blushBeige,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },

  compactRecurringBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.warmBrown,
  },

  compactStatusChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },

  compactStatusChipText: {
    fontSize: 11,
    fontWeight: "800",
  },

  compactHelperText: {
    marginTop: 10,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "600",
    color: colors.textSub,
  },

  compactActionButton: {
    minWidth: 96,
    height: 46,
    paddingHorizontal: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.warmBrown,
  },

  compactActionButtonPrimary: {
    backgroundColor: colors.warmBrown,
  },

  compactActionButtonSecondary: {
    backgroundColor: colors.blushBeige,
  },

  compactActionButtonText: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.white,
  },

  compactActionButtonTextSecondary: {
    color: colors.warmBrown,
  },

  scheduleCardAvailable: {
    backgroundColor: colors.card,
    borderColor: colors.border,
  },

  scheduleCardReserved: {
    backgroundColor: colors.card,
    borderColor: colors.border,
  },

  scheduleCardDone: {
    backgroundColor: colors.card,
    borderColor: colors.border,
  },

  scheduleCardCancelled: {
    backgroundColor: colors.card,
    borderColor: colors.border,
  },

  scheduleCardDisabled: {
    backgroundColor: colors.card,
    borderColor: colors.border,
  },

  scheduleStatusChipAvailable: {
    backgroundColor: colors.blushBeige,
  },

  scheduleStatusChipReserved: {
    backgroundColor: colors.reserved,
  },

  scheduleStatusChipDone: {
    backgroundColor: colors.closed,
  },

  scheduleStatusChipCancelled: {
    backgroundColor: colors.closed,
  },

  scheduleStatusChipDisabled: {
    backgroundColor: colors.closed,
  },

  scheduleStatusChipTextAvailable: {
    color: colors.warmBrown,
  },

  scheduleStatusChipTextReserved: {
    color: "#9A7448",
  },

  scheduleStatusChipTextDone: {
    color: colors.warmBrown,
  },

  scheduleStatusChipTextCancelled: {
    color: colors.textSub,
  },

  scheduleStatusChipTextDisabled: {
    color: colors.textSub,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(43,37,34,0.35)",
    justifyContent: "center",
    padding: 20,
  },

  noticeModalCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 20,
    maxHeight: "72%",
    borderWidth: 1,
    borderColor: colors.border,
  },

  noticeModalLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.textSub,
  },

  noticeModalTitle: {
    marginTop: 8,
    fontSize: 22,
    fontWeight: "800",
    color: colors.textMain,
  },

  noticeModalBody: {
    marginTop: 14,
    maxHeight: 260,
  },

  noticeModalContent: {
    fontSize: 15,
    lineHeight: 24,
    color: colors.textSub,
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
    backgroundColor: colors.warmBrown,
  },

  noticeButtonSecondary: {
    backgroundColor: colors.blushBeige,
    borderWidth: 1,
    borderColor: colors.border,
  },

  noticeButtonPrimaryText: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.white,
  },

  noticeButtonSecondaryText: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.warmBrown,
  },

  noticeDetailButton: {
    marginTop: 10,
    minHeight: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },

  noticeDetailButtonText: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.warmBrown,
  },
  homeMountainFade: {
  position: "absolute",
  left: 0,
  right: 0,
  bottom: -70,
  height: 90,
},

calendarLegend: {
  flexDirection: "row",
  justifyContent: "center",
  gap: 18,
  marginTop: 14,
},

legendItem: {
  flexDirection: "row",
  alignItems: "center",
},

legendDotPresent: {
  width: 7,
  height: 7,
  borderRadius: 999,
  backgroundColor: colors.present,
  marginRight: 6,
},

legendDotReserved: {
  width: 7,
  height: 7,
  borderRadius: 999,
  backgroundColor: colors.bronzeGold,
  marginRight: 6,
},

legendText: {
  fontSize: 11,
  fontFamily: fonts.medium,
  color: colors.textSub,
},
todaySilhouette: {
  position: "absolute",
  right: -20,
  top: 25,
  width: 190,
  height: 150,
  opacity: 1,
  zIndex: 1,
},
dayStampPresent: {
  width: 28,
  height: 28,
  borderRadius: 14,
  backgroundColor: "#8B6A5E",
  alignItems: "center",
  justifyContent: "center",
},

dayStampPresentTwo: {
  backgroundColor: "#76564B",
},

dayStampPresentThree: {
  backgroundColor: "#4A332C",
},

dayStampReserved: {
  width: 28,
  height: 28,
  borderRadius: 14,
  backgroundColor: "#F2E1C4",
  alignItems: "center",
  justifyContent: "center",
},

dayStampTextPresent: {
  fontSize: 14,
  fontFamily: fonts.bold,
  color: colors.white,
},

dayStampTextReserved: {
  fontSize: 14,
  fontFamily: fonts.bold,
  color: "#8A6B44",
},
moreLinkRow: {
  flexDirection: "row",
  alignItems: "center",
  gap: 3,
},

moreLinkArrow: {
  fontSize: 6,
  fontWeight: "700",
  color: colors.textSub,
  marginTop: -1,
},
homeNoticeBell: {
  position: "absolute",
  top: -18,
  right: -1,
  width: 28,
  height: 28,
  borderRadius: 14,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "transparent",
  zIndex: 10,
},

homeNoticeBellIcon: {
  width: 22,
  height: 22,
  opacity: 0.9,
},

homeNoticeDot: {
  position: "absolute",
  top: 5,
  right: 6,
  width: 6,
  height: 6,
  borderRadius: 999,
  backgroundColor: "#D9534F",
},
todayTrainingCardYudanja: {
  borderWidth: 1,
  borderColor: "rgba(214, 168, 78, 0.75)",
  backgroundColor: "#FFFDF7",
  shadowColor: "#D7A63D",
  shadowOpacity: 0.12,
  shadowRadius: 14,
  shadowOffset: {
    width: 0,
    height: 5,
  },
  elevation: 3,
},

todayTrainingStepYudanja: {
  color: "#7A5737",
},

todayTrainingButtonYudanja: {
  backgroundColor: "#25211C",
  borderWidth: 1,
  borderColor: "rgba(214, 168, 78, 0.75)",
  shadowColor: "#D6A84E",
  shadowOpacity: 0.18,
  shadowRadius: 7,
  shadowOffset: {
    width: 0,
    height: 3,
  },
  elevation: 3,
},

todayTrainingButtonTextYudanja: {
  color: "#F4D27A",
},

todaySilhouetteYudanja: {
  opacity: 0.45,
  right: -16,
  top: 25,
  width: 180,
  height: 125,
},

yudanjaGoldGlow: {
  display: "none",
},

yudanjaFlowLine: {
  display: "none",
},
homeProfileWrap: {
  width: isWeb ? 88 : 104,
  height: isWeb ? 88 : 104,
  marginTop: isWeb ? 10 : 28,
  marginRight: isWeb ? 20 : 8,
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
},

homeProfileWrapYudanja: {
  width: isWeb ? 132 : 132,
  height: isWeb ? 132 : 132,
  marginTop: isWeb ? 10 : 18,
  marginRight: isWeb ? -3 : -2,
  marginBottom: isWeb ? -10 : 18,
},

homeProfileCircle: {
  width: isWeb ? 76 : 90,
  height: isWeb ? 76 : 90,
  borderRadius: 999,
  overflow: "hidden",
  backgroundColor: "#F7EFE8",
},

homeProfileCircleYudanja: {
  width: isWeb ? 88 : 98,
  height: isWeb ? 88 : 98,
   transform: [
    { translateX: isWeb ? -17 : 0 },
    { translateY: isWeb ? -23 : 0 },
  ],
},
homeProfileInnerCircle: {
  width: 105,
  height: 105,
  borderRadius: 56,
  backgroundColor: colors.blushBeige,
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
  borderWidth: 1,
  borderColor: colors.border,
},

homeProfileImage: {
  width: "100%",
  height: "100%",
},

homeYudanjaEmblemFrame: {
  position: "absolute",
  width: isWeb ? 130 : 138,
  height: isWeb ? 130 : 138,
  top: isWeb ? -14 : -20,
  left: isWeb ? -16 : -20,
},
yudanjaGoldBorderOuter: {
  position: "absolute",
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  borderRadius: isWeb ? 20 : 22,
  borderWidth: 1,
  borderColor: "rgba(214, 168, 78, 0.42)",
  zIndex: 2,
},

yudanjaGoldBorderInner: {
  display: "none",
},

yudanjaSoftLight: {
  position: "absolute",
  right: -45,
  bottom: -45,
  width: 150,
  height: 150,
  borderRadius: 999,
  backgroundColor: "rgba(255, 218, 120, 0.18)",
  zIndex: 1,
},
todayYudanjaBgImage: {
  position: "absolute",
  right: -35,
  bottom: -28,
  width: 180,
  height: 130,
  opacity: 0.08,
  zIndex: 0,
},
homeAttendanceSummary: {
  marginTop: 8,
  marginLeft: 2,

  fontSize: isWeb ? 12 : 14,
  lineHeight: isWeb ? 18 : 20,

  fontFamily: fonts.medium,
  color: "#8E8178",

  letterSpacing: -0.3,
},
});