import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import {
  toDateString,
  getDateDiffInDays,
  getMonthMatrix,
  getSessionDisplayLabel,
  getScheduleUiMeta,
  getScheduleCardStyle,
  shouldShowWeeklyAttendedSchedule,
} from "../../src/features/schedule/scheduleUtils";
import { router, useLocalSearchParams } from "expo-router";
import { useAuth } from "../../src/contexts/AuthContext";

import ScheduleBottomSheet from "../../src/features/schedule/components/ScheduleBottomSheet";
import CalendarView from "../../src/features/schedule/components/CalendarView";
import WeekListView from "../../src/features/schedule/components/WeekListView";
import SelectedScheduleSummary from "../../src/features/schedule/components/SelectedScheduleSummary";
import { useScheduleScreen } from "../../src/features/schedule/useScheduleScreen";
import { styles } from "../../src/features/schedule/scheduleStyles";

export default function ScheduleScreen() {
  const { token, user, logout } = useAuth();
  const { view, menuAction } = useLocalSearchParams();

  const {
    todayString,
    currentYear,
    currentMonth,
    selectedDate,
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
    yudanjaRecurringEnabled,

    isScheduleSheetVisible,
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
  } = useScheduleScreen({
    token,
    user,
    logout,
    toDateString,
    getMonthMatrix,
    getDateDiffInDays,
    });

  useEffect(() => {
    const normalizedView = Array.isArray(view) ? view[0] : String(view || "");

    if (normalizedView === "calendar" || normalizedView === "list") {
      setScheduleViewMode(normalizedView);
    }
  }, [view, setScheduleViewMode]);

  useEffect(() => {
    if (loading || !menuAction) return;

    const normalizedAction = Array.isArray(menuAction)
      ? menuAction[0]
      : String(menuAction);

    if (normalizedAction !== "yudanjaReservation") return;

    setScheduleViewMode("calendar");

    const timer = setTimeout(() => {
      if (isYudanjaMember) {
        Alert.alert(
          "유단자회 예약",
          "예약할 유단자회 수련 날짜를 달력에서 선택해주세요."
        );
      }

      router.setParams({ menuAction: "", view: "calendar" });
    }, 180);

    return () => clearTimeout(timer);
  }, [isYudanjaMember, loading, menuAction, setScheduleViewMode]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>일정 화면을 불러오는 중입니다.</Text>
      </View>
    );
  }

  return (
    <>
<ScrollView
  style={styles.screen}
  contentContainerStyle={[
    styles.content,
    { paddingBottom: 80 },
  ]}
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
      달력
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
    <CalendarView
  styles={styles}
  currentYear={currentYear}
  currentMonth={currentMonth}
  moveMonth={moveMonth}
  weeks={weeks}
  calendarMap={calendarMap}
  selectedDate={selectedDate}
  todayString={todayString}
  toDateString={toDateString}
  handlePressDate={handlePressDate}
/>

<SelectedScheduleSummary
  styles={styles}
  selectedDate={selectedDate}
  selectedDayInfo={selectedDayInfo}
  selectedMySchedules={selectedMySchedules}
  shouldShow={shouldShowSelectedSummary}
  canOpenSheet={canOpenSelectedScheduleSheet}
  isReservableDate={isReservableDate}
  getScheduleUiMeta={getScheduleUiMeta}
  getSessionDisplayLabel={getSessionDisplayLabel}
  openScheduleSheet={openScheduleSheet}
/>

{isYudanjaMember ? (
  <Pressable
    style={styles.recurringInfoBox}
    onPress={() => router.push("/recurring-reservations")}
  >
    <View style={styles.recurringInfoContent}>
      <Text style={styles.recurringInfoLabel}>유단자회 정기예약</Text>
      <Text numberOfLines={1} style={styles.recurringInfoText}>
        매주 월요일 유단자수련 자동 예약
      </Text>
    </View>

    <Text style={styles.recurringInfoStatus}>
      {yudanjaRecurringEnabled ? "사용 중" : "설정 안 함"}
    </Text>

    <View style={styles.recurringSettingButton}>
      <Image
        source={require("../../assets/images/goal-setting-icon.png")}
        style={styles.recurringSettingIcon}
        resizeMode="contain"
      />
    </View>
  </Pressable>
) : null}
 </>
) : (
  <WeekListView
  styles={styles}
  thisWeekDates={thisWeekDates}
  weekScheduleByDate={weekScheduleByDate}
  weeklyListLoading={weeklyListLoading}
  todayString={todayString}
  weekDayNames={weekDayNames}
  toDateString={toDateString}
  getScheduleUiMeta={getScheduleUiMeta}
  getSessionDisplayLabel={getSessionDisplayLabel}
  shouldShowWeeklyAttendedSchedule={
    shouldShowWeeklyAttendedSchedule
  }
  isYudanjaMember={isYudanjaMember}
  handlePressDate={handlePressDate}
/>
)}
      </ScrollView>

<ScheduleBottomSheet
  visible={isScheduleSheetVisible}
  selectedDate={selectedDate}
  selectedSchedules={selectedSchedules}
  calendarMap={calendarMap}
  isReservableDate={isReservableDate}
  isSelectedToday={isSelectedToday}
  styles={styles}
  closeScheduleSheet={closeScheduleSheet}
  getScheduleUiMeta={getScheduleUiMeta}
  getScheduleCardStyle={(tone) => getScheduleCardStyle(styles, tone)}
  getSessionDisplayLabel={getSessionDisplayLabel}
  canCancelAttendance={canCancelAttendance}
  canCheckInTodaySession={canCheckInTodaySession}
  handleScheduleAction={handleScheduleAction}
  submittingAttendance={submittingAttendance}
/>
    </>
  );
}
