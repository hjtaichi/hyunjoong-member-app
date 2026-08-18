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

import { getProfileImageSource } from "../../src/features/home/homeImages";
import NoticeModal from "../../src/features/home/components/NoticeModal";
import TrainingRecordBanner from "../../src/features/home/components/TrainingRecordBanner";
import NoticeSummary from "../../src/features/home/components/NoticeSummary";
import TrainingRecordModal from "../../src/features/home/components/TrainingRecordModal";
import HomeHeader from "../../src/features/home/components/HomeHeader";
import TodayTrainingCard from "../../src/features/home/components/Today/TodayTrainingCard";
import AttendanceCalendar from "../../src/features/home/components/AttendanceCalendar";
import WeeklyGoalModal from "../../src/features/home/components/WeeklyGoalModal";

import {
  getPopupNotice,
  hideNoticeToday,
} from "../../src/api/memberNotice";

import { DEBUG_HOME, useHomeScreen } from "../../src/features/home/useHomeScreen";
import { useWeeklyGoal } from "../../src/features/home/useWeeklyGoal";


// HJTAICHI_YUDANJA_ATTENDANCE_BUTTON_LOCK_V1_1
function isActiveYudanjaScheduleForHomeTitle(schedule) {
  const sessionLabel = [
    schedule?.title,
    schedule?.className,
    schedule?.name,
  ]
    .filter(Boolean)
    .join(" ");
  const sessionTimeKey = String(
    schedule?.sessionTimeKey ||
      schedule?.recurringMeta?.sessionTimeKey ||
      schedule?.recurringMeta?.matchedSessionTimeKey ||
      "",
  );


  const isYudanjaSchedule =
    (
    sessionLabel.includes("유단자") ||
    sessionTimeKey === "MON_YUDANJA"
  );

  const isClosedHoliday =
    schedule?.isHoliday === true &&
    schedule?.isOpenHoliday !== true;

  const normalizedStatus = String(
    schedule?.status || "scheduled",
  ).toLowerCase();

  const isCancelled =
    normalizedStatus === "cancelled" ||
    normalizedStatus === "canceled" ||
    schedule?.isYudanjaClosed === true ||
    schedule?.closure?.isClosed === true;

  return (
    isYudanjaSchedule &&
    !isClosedHoliday &&
    !isCancelled
  );
}


export default function HomeScreen() {
  const { token, user, logout } = useAuth();
  const { attendanceResult, menuAction } = useLocalSearchParams();
  const scrollViewRef = useRef(null);
  const [menuTargetY, setMenuTargetY] = useState({
    today: 0,
    attendance: 0,
  });
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
  const [weeklyGoalModalVisible, setWeeklyGoalModalVisible] = useState(false);

  useEffect(() => {
    if (loading || !menuAction) return;

    const normalizedAction = Array.isArray(menuAction)
      ? menuAction[0]
      : String(menuAction);

    const timer = setTimeout(() => {
      if (normalizedAction === "weeklyGoal") {
        setWeeklyGoalModalVisible(true);
      }

      if (normalizedAction === "today") {
        scrollViewRef.current?.scrollTo({
          y: Math.max(0, Number(menuTargetY.today || 0) - 12),
          animated: true,
        });
      }

      if (normalizedAction === "attendance") {
        scrollViewRef.current?.scrollTo({
          y: Math.max(0, Number(menuTargetY.attendance || 0) - 12),
          animated: true,
        });
      }

      router.setParams({ menuAction: "" });
    }, 180);

    return () => clearTimeout(timer);
  }, [loading, menuAction, menuTargetY.attendance, menuTargetY.today]);

  const yudanjaEmblemFrame = require("../../assets/images/yudanja-emblem-frame.png");
  const yudanjaProfileBg = require("../../assets/images/yudanja-profile-card-bg.png");

const calendarMap = useMemo(() => {
  const scheduleByDate = calendarData?.scheduleByDate || {};
  const map = {};

  Object.entries(scheduleByDate).forEach(([date, schedules]) => {
    const hasPresent = schedules.some(
      (item) => item?.attendanceStatus === "present"
    );
    const hasYudanjaReserved = schedules.some((item) => {
      const title = String(item?.title || item?.name || "");
      const className = String(item?.className || "");
      const sessionTimeKey = String(
        item?.sessionTimeKey ||
          item?.recurringMeta?.sessionTimeKey ||
          item?.recurringMeta?.matchedSessionTimeKey ||
          ""
      );

      return (
        item?.attendanceStatus === "reserved" &&
        (
          title.includes("유단자") ||
          className.includes("유단자") ||
          sessionTimeKey === "MON_YUDANJA"
        )
      );
    });
map[date] = {
      date,
      attendanceStatus: hasPresent ? "present" : hasYudanjaReserved ? "reserved" : null,
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

const weeklyGoalMemberKey =
  homeData?.member?.id ||
  user?.memberId ||
  user?.id ||
  null;

const weeklyGoal = useWeeklyGoal({
  token,
  memberKey: weeklyGoalMemberKey,
  enabled: !isPausedMember,
});

useEffect(() => {
  if (!weeklyGoal.autoResumeMessage) return;

  Alert.alert(
    "주간 목표 안내",
    weeklyGoal.autoResumeMessage,
  );
  weeklyGoal.clearAutoResumeMessage();
}, [weeklyGoal.autoResumeMessage]);

useEffect(() => {
  const achievement =
    weeklyGoal.previousWeekAchievementPopup;

  if (!achievement) return;

  const resultText =
    achievement.exceeded === true
      ? `목표 ${achievement.goal}회를 넘어서 ${achievement.attendanceCount}회 출석했어요.`
      : `일반수련 ${achievement.attendanceCount}회로 목표 ${achievement.goal}회를 달성했어요.`;

  Alert.alert(
    "지난주 목표 달성!",
    `${resultText}\n이번 주도 힘차게 수련해봐요!`,
    [
      {
        text: "이번 주도 화이팅",
        onPress:
          weeklyGoal.clearPreviousWeekAchievementPopup,
      },
    ],
    {
      cancelable: false,
    },
  );
}, [
  weeklyGoal.previousWeekAchievementPopup,
  weeklyGoal.clearPreviousWeekAchievementPopup,
]);

const homeMemberBadges = useMemo(() => {
  const badges = Array.isArray(
    homeData?.member?.badges,
  )
    ? [...homeData.member.badges]
    : [];
  const achievement =
    weeklyGoal.previousWeekAchievement;

  if (
    achievement?.achieved === true &&
    !badges.some(
      (badge) =>
        badge?.code ===
        "PREVIOUS_WEEK_GOAL_ACHIEVED",
    )
  ) {
    badges.push({
      code: "PREVIOUS_WEEK_GOAL_ACHIEVED",
      title: "지난주 목표달성",
      description:
        `지난주 일반수련 목표 ${achievement.goal}회를 ` +
        `${achievement.attendanceCount}회 출석으로 달성해 ` +
        "이번 주 동안 표시되는 뱃지입니다.",
    });
  }

  const streak = Math.max(
    0,
    Math.trunc(
      Number(
        weeklyGoal.previousWeekAchievementStreak ||
          0,
      ),
    ),
  );
  const carryoverStreak = Math.max(
    0,
    Math.trunc(
      Number(
        weeklyGoal
          .previousWeekAchievementCarryoverStreak ||
          0,
      ),
    ),
  );
  const displayedStreak =
    streak >= 2
      ? streak
      : carryoverStreak;
  const isCarryoverReward =
    streak < 2 &&
    carryoverStreak >= 2;

  if (
    achievement?.achieved === true &&
    displayedStreak >= 2
  ) {
    const streakBadgeLevel = Math.min(
      displayedStreak,
      5,
    );
    const streakBadgeCode =
      streakBadgeLevel >= 5
        ? "WEEKLY_GOAL_STREAK_5_PLUS"
        : `WEEKLY_GOAL_STREAK_${streakBadgeLevel}`;

    if (
      !badges.some(
        (badge) =>
          badge?.code === streakBadgeCode,
      )
    ) {
      const seasonContinues =
        weeklyGoal
          .previousWeekAchievementStreakSeasonContinues ===
        true;
      const nextLevel =
        streakBadgeLevel < 5
          ? streakBadgeLevel + 1
          : null;
      const statusMessage =
        isCarryoverReward
          ? `지난달에서 이어진 달성 뱃지 : ${streakBadgeLevel}주\n이 뱃지는 이번 주까지 보여드립니다.\n이번 달 연속 기록은\n1주부터 새로 시작됐습니다.`
          : streakBadgeLevel >= 5
            ? "확정된 연속 기록 · 5주\n이번 달 최고 단계인 5주 연속달성 뱃지를 받았어요."
            : seasonContinues
              ? `확정된 연속 기록 · ${streakBadgeLevel}주\n이번 주도 목표를 달성하면 다음 주에 ${nextLevel}주 연속달성 뱃지를 받을 수 있어요.`
              : `확정된 연속 기록 · ${streakBadgeLevel}주\n새로운 달의 연속 기록은 첫 주부터 다시 시작됩니다.`;

      badges.push({
        code: streakBadgeCode,
        title:
          streakBadgeLevel >= 5
            ? "5주 연속달성"
            : `${streakBadgeLevel}주 연속달성`,
        description:
          "매주 설정한 일반수련 출석 목표를\n 연속으로 달성하면 받을 수 있는 뱃지입니다.\n\n" +
          "한 달 안에 최대 5주까지\n연속 달성할 수 있습니다.\n" +
          "새로운 달의 첫 주부터\n연속 기록은 다시 시작됩니다.\n\n" +
          statusMessage,
      });
    }
  }

  return badges;
}, [
  homeData?.member?.badges,
  weeklyGoal.previousWeekAchievement,
  weeklyGoal.previousWeekAchievementStreak,
  weeklyGoal.previousWeekAchievementCarryoverStreak,
  weeklyGoal.previousWeekAchievementStreakSeasonContinues,
]);

const joinDayCount = getJoinDayCountFromHome(homeData);

const attendanceCount =
  homeData?.member?.totalAttendanceSessionCount ??
  homeData?.member?.totalAttendanceCount ??
  0;

const isYudanja = homeData?.member?.canAccessYudanjaClass === true;
const rankLevel = Number(homeData?.member?.rankLevel || 0);

const trainingGoals = homeData?.trainingGoals || null;

const promotionGoal = trainingGoals?.promotion || null;

const promotionRemainingText =
  promotionGoal &&
  promotionGoal.isHighestRank !== true &&
  promotionGoal.isConfigured !== false &&
  promotionGoal.remainingCount != null &&
  promotionGoal.isEligible !== true
    ? String(
        promotionGoal.remainingCount
      )
    : null;

const promotionBadgeText =
  !promotionGoal
    ? null
    : promotionGoal.isHighestRank === true
      ? "9단 최고단"
      : promotionGoal.isConfigured === false
        ? null
        : promotionGoal.isEligible === true
          ? "승단심사 가능"
          : promotionRemainingText != null
            ? `승단까지 ${promotionRemainingText}회`
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
  const isYudanjaSession =
    isActiveYudanjaScheduleForHomeTitle(item);

  return (
    item?.attendanceStatus === "present" &&
    (
      isYudanjaSession ||
      isWithinTodayAttendanceLockWindow(item, todayString)
    )
  );
});

const hasTodayCompletedSession = !!todayCompletedSession;

const todayAttendanceButtonText = hasTodayCompletedSession
  ? `${getSessionDisplayLabel(todayCompletedSession)} 출석 완료`
  : "☑  출석하기";

  const todayClass = homeData?.todayClass || null;

const todayWeekday = today.getDay(); // 일 0, 월 1, 화 2...
const isMondayToday = todayWeekday === 1;

const hasActiveTodayYudanjaSession = useMemo(
  () =>
    isYudanja &&
    isMondayToday &&
    todaySchedules.some(
      isActiveYudanjaScheduleForHomeTitle,
    ),
  [
    isYudanja,
    isMondayToday,
    todaySchedules,
  ],
);

const todayTrainingLabel =
  hasActiveTodayYudanjaSession
    ? "지난주 수련"
    : "오늘의 수련";

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
    // HJTAICHI_HOME_YUDANJA_ITEM_SUMMARY_V1
    const itemNames = Array.isArray(yudanjaProgress?.items)
      ? yudanjaProgress.items
          .map(
            (progressItem) =>
              progressItem?.item?.name ||
              progressItem?.name ||
              null,
          )
          .filter(Boolean)
      : [];

    const uniqueItemNames = [...new Set(itemNames)];

    if (uniqueItemNames.length === 1) {
      return uniqueItemNames[0];
    }

    if (uniqueItemNames.length === 2) {
      return uniqueItemNames.join(" · ");
    }

    if (uniqueItemNames.length > 2) {
      return uniqueItemNames.slice(0, 2).join(" · ") + " 외 " + (uniqueItemNames.length - 2) + "개";
    }

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
  ref={scrollViewRef}
  style={styles.screen}
  contentContainerStyle={[
    styles.content,
    { paddingBottom: 80 },
  ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
<HomeHeader
  displayName={displayName}
  joinDayCount={joinDayCount}
  attendanceCount={attendanceCount}
  weeklyGoalSummary={weeklyGoal.summary}
  onPressWeeklyGoal={() => setWeeklyGoalModalVisible(true)}
  hasUnreadMemberNotification={hasUnreadMemberNotification}
  onPressNotification={() => router.push("/member-notifications")}
  rankLevel={rankLevel}
  isYudanja={isYudanja}
  profileImageSource={profileImageSource}
  yudanjaEmblemFrame={yudanjaEmblemFrame}
  promotionBadgeText={promotionBadgeText}
  memberBadges={homeMemberBadges} // HJTAICHI_HOME_BADGES_PROP_V1

  monthlyGoalCrown={weeklyGoal.monthlyGoalCrown}
/>

<View
  onLayout={(event) =>
    setMenuTargetY((previous) => ({
      ...previous,
      today: event.nativeEvent.layout.y,
    }))
  }
>
<TodayTrainingCard
  isYudanja={isYudanja}
  yudanjaProfileBg={yudanjaProfileBg}
  trainingLabel={todayTrainingLabel}
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
</View>

<TrainingRecordBanner
  onPress={() => setTrainingRecordSheetVisible(true)}
/>

<View
  onLayout={(event) =>
    setMenuTargetY((previous) => ({
      ...previous,
      attendance: event.nativeEvent.layout.y,
    }))
  }
>
<AttendanceCalendar
  today={today}
  todayString={todayString}
  selectedDate={selectedDate}
  miniCalendarWeeks={miniCalendarWeeks}
  calendarMap={calendarMap}
  showYudanjaReservation={isYudanja}
  onPressDate={handlePressDate}
  onPressMore={() => router.push("/(tabs)/schedule")}
/>
</View>

        

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
<WeeklyGoalModal
  visible={weeklyGoalModalVisible}
  loading={weeklyGoal.loading}
  attendanceCount={weeklyGoal.attendanceCount}
  currentGoal={weeklyGoal.currentGoal}
  currentMode={weeklyGoal.currentMode}
  isRestWeek={weeklyGoal.isRestWeek}
  recurringGoal={weeklyGoal.recurringGoal}
  pendingRecurringGoal={weeklyGoal.pendingRecurringGoal}
  onClose={() => setWeeklyGoalModalVisible(false)}
  onSave={async (draft) => {
    try {
      const result = await weeklyGoal.saveSettings(draft);
      setWeeklyGoalModalVisible(false);
      Alert.alert("목표 설정", result.message);
    } catch (error) {
      Alert.alert(
        "안내",
        error.message || "목표를 변경하지 못했습니다.",
      );
    }
  }}
/>
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
