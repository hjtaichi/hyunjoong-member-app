import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import {
  toDateString,
  getSessionDisplayLabel,
  isWithinTodayAttendanceLockWindow,
} from "../../src/features/home/homeUtils";
import { getJoinDayCountFromHome } from "../../src/utils/joinDay";
import { styles } from "../../src/features/home/homeStyles";
import { useFocusEffect } from "@react-navigation/native";
import { router, useLocalSearchParams } from "expo-router";
import { useAuth } from "../../src/contexts/AuthContext";
import { getRankBadgeColors } from "../../src/theme/rankBadge";
import { getProfileImageSource } from "../../src/features/home/homeImages";
import NoticeModal from "../../src/features/home/components/NoticeModal";
import TrainingRecordBanner from "../../src/features/home/components/TrainingRecordBanner";
import NoticeSummary from "../../src/features/home/components/NoticeSummary";
import TrainingRecordModal from "../../src/features/home/components/TrainingRecordModal";
import HomeHeader from "../../src/features/home/components/HomeHeader";
import TodayTrainingCard from "../../src/features/home/components/Today/TodayTrainingCard";
import AttendanceCalendar from "../../src/features/home/components/AttendanceCalendar";

import {
  getPopupNotice,
  hideNoticeToday,
} from "../../src/api/memberNotice";

import { DEBUG_HOME, useHomeScreen } from "../../src/features/home/useHomeScreen";


export default function HomeScreen() {
  const { token, user, logout } = useAuth();
  const { attendanceResult } = useLocalSearchParams();
  const attendanceResultShownRef = useRef(false);
  const authUser = user || {};
const memberStatus = authUser?.memberStatus || authUser?.status;
const isPausedMember = memberStatus === "paused";

useEffect(() => {
  if (attendanceResult !== "success" || attendanceResultShownRef.current) return;

  attendanceResultShownRef.current = true;
  Alert.alert("출석 완료", "출석이 정상 처리되었습니다.");
  router.setParams({ attendanceResult: "" });
}, [attendanceResult]);

  const today = useMemo(() => new Date(), []);
  const todayString = useMemo(() => toDateString(today), [today]);

  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1);
const {
  loading,
  refreshing,
  homeData,
  calendarData,
  noticeList,
  memberNotifications,
  onRefresh,
} = useHomeScreen({
  token,
  logout,
  isPausedMember,
  currentYear,
  currentMonth,
});
  const [selectedDate, setSelectedDate] = useState(todayString);

  const [noticeVisible, setNoticeVisible] = useState(false);
  const [activeNotice, setActiveNotice] = useState(null);
  const [hiddenNoticeIds, setHiddenNoticeIds] = useState([]);
  const [hasUnreadNotice, setHasUnreadNotice] = useState(false);

  const [closedNoticeIds, setClosedNoticeIds] = useState([]);
  const [trainingRecordSheetVisible, setTrainingRecordSheetVisible] = useState(false);

  const yudanjaEmblemFrame = require("../../assets/images/yudanja-emblem-frame.png");
  const yudanjaProfileBg = require("../../assets/images/yudanja-profile-card-bg.png");

const calendarMap = useMemo(() => {
  const scheduleByDate = calendarData?.scheduleByDate || {};
  const map = {};

  Object.entries(scheduleByDate).forEach(([date, schedules]) => {
    const hasPresent = schedules.some(
      (item) => item?.attendanceStatus === "present"
    );

    const hasReserved = schedules.some(
      (item) => item?.attendanceStatus === "reserved"
    );

    map[date] = {
      date,
      attendanceStatus: hasPresent
        ? "present"
        : hasReserved
        ? "reserved"
        : null,
      hasClass: schedules.length > 0,
      classCount: schedules.length,
      isHoliday: schedules.some((item) => item?.isHoliday === true),
      isOpenHoliday: schedules.some((item) => item?.isOpenHoliday === true),
      holidayName: schedules.find((item) => item?.holidayName)?.holidayName || null,
    };
  });

  return map;
}, [calendarData]);

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

const joinDayCount = getJoinDayCountFromHome(homeData);

const attendanceCount =
  homeData?.member?.totalAttendanceSessionCount ??
  homeData?.member?.totalAttendanceCount ??
  0;

const isYudanja = homeData?.member?.canAccessYudanjaClass === true;
const rankLevel = Number(homeData?.member?.rankLevel || 0);
const rankBadgeColors = getRankBadgeColors(rankLevel);
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
const profileImageVersion =
  homeData?.member?.profileImageUpdatedAt ||
  homeData?.member?.updatedAt ||
  "";

const profileImageSource = useMemo(() => {
  return getProfileImageSource(
    homeData?.member?.profileAvatar,
    profileImageVersion
  );
}, [homeData?.member?.profileAvatar, profileImageVersion]);

  const todaySchedules = useMemo(() => {
    return calendarData?.scheduleByDate?.[todayString] || [];
  }, [calendarData, todayString]);

  const unreadMemberNotificationCount = memberNotifications.filter(
  (item) => !item.isRead
).length;

const hasUnreadMemberNotification = unreadMemberNotificationCount > 0;

const todayCompletedSession = todaySchedules.find((item) => {
  return (
    item?.attendanceStatus === "present" &&
    isWithinTodayAttendanceLockWindow(item, todayString)
  );
});

const hasTodayCompletedSession = !!todayCompletedSession;

const todayAttendanceButtonText = hasTodayCompletedSession
  ? `${getSessionDisplayLabel(todayCompletedSession)} 출석 완료`
  : "☑  출석하기";

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

if (DEBUG_HOME) {
  console.log("🔥 [HOME homeData keys]", Object.keys(homeData || {}));
  console.log("🔥 [HOME homeGroupProgress]", homeGroupProgress);
}
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

const handleTodayTrainingDetail = useCallback(() => {
  const curriculumId =
    homeGroupProgress?.curriculumId ||
    homeGroupProgress?.curriculum?.id ||
    homeData?.groupProgress?.curriculumId ||
    homeData?.groupProgress?.curriculum?.id;

  if (!curriculumId) {
    Alert.alert("안내", "현재 단체 수련 진도 정보가 없습니다.");
    return;
  }

  const startStep =
    homeGroupProgress?.startStep ??
    homeGroupProgress?.currentStartStep ??
    homeGroupProgress?.fromStep ??
    "";

  const endStep =
    homeGroupProgress?.endStep ??
    homeGroupProgress?.currentEndStep ??
    homeGroupProgress?.toStep ??
    homeGroupProgress?.currentStep ??
    "";

  router.push({
    pathname: "/taegukwon/[curriculumId]",
    params: {
      curriculumId,
      name:
        homeGroupProgress?.curriculumName ||
        homeGroupProgress?.curriculum?.name ||
        homeGroupProgress?.curriculumTitle ||
        "현중태극권 29식",
      currentStep: String(endStep || 0),
      totalSteps: String(homeGroupProgress?.totalSteps || 29),
      startStep: String(startStep || ""),
      endStep: String(endStep || ""),
      source: "group",
    },
  });
}, [homeGroupProgress, homeData]);

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

  const handlePressDate = useCallback((dateObj) => {
  if (!dateObj) return;
  setSelectedDate(toDateString(dateObj));
}, []);

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
<HomeHeader
  displayName={displayName}
  joinDayCount={joinDayCount}
  attendanceCount={attendanceCount}
  monthlyGoalRate={homeData?.monthlyGoalRate}
  hasUnreadNotice={hasUnreadNotice}
  hasUnreadMemberNotification={hasUnreadMemberNotification}
  onPressNotification={() => router.push("/member-notifications")}
  rankBadgeColors={rankBadgeColors}
  levelLabel={
    homeData?.member?.levelLabel ||
    homeData?.member?.level ||
    "일반회원"
  }
  isYudanja={isYudanja}
  profileImageSource={profileImageSource}
  yudanjaEmblemFrame={yudanjaEmblemFrame}
  promotionBadgeText={promotionBadgeText}
/>

<TodayTrainingCard
  isYudanja={isYudanja}
  yudanjaProfileBg={yudanjaProfileBg}
  todayClassTitle={todayClassTitle}
  todayWeekProgressText={todayWeekProgressText}
  hasTodayCompletedSession={hasTodayCompletedSession}
  todayAttendanceButtonText={todayAttendanceButtonText}
  onPressDetail={handleTodayTrainingDetail}
  onPressAttendance={() => {
    if (hasTodayCompletedSession) return;
    router.push("/qr-attendance");
  }}
/>

<TrainingRecordBanner
  onPress={() => setTrainingRecordSheetVisible(true)}
/>

<AttendanceCalendar
  today={today}
  todayString={todayString}
  selectedDate={selectedDate}
  miniCalendarWeeks={miniCalendarWeeks}
  calendarMap={calendarMap}
  onPressDate={handlePressDate}
  onPressMore={() => router.push("/(tabs)/schedule")}
/>

        

<NoticeSummary
  noticeList={noticeList}
  onMorePress={() => router.push("/(tabs)/inquiry")}
  onNoticePress={(notice) =>
    router.push({
      pathname: "/notice/[noticeId]",
      params: {
        noticeId: String(notice.id),
      },
    })
  }
/>
</ScrollView>
<TrainingRecordModal
  visible={trainingRecordSheetVisible}
  onClose={() => setTrainingRecordSheetVisible(false)}
  onGongbeopPress={() => {
    setTrainingRecordSheetVisible(false);
    router.push({
      pathname: "/(tabs)/taegukwon",
      params: { tab: "gongbeop" },
    });
  }}
  onFormRecordPress={() => {
    setTrainingRecordSheetVisible(false);
    router.push({
      pathname: "/(tabs)/taegukwon",
      params: { tab: "formRecord" },
    });
  }}
/>
  <NoticeModal
  visible={noticeVisible}
  activeNotice={activeNotice}
  onClose={handleCloseNotice}
  onHideToday={handleHideNoticeToday}
  onDetail={handleNoticeDetail}
/>
    </>
  );
}
