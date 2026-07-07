import React from "react";
import {
  ActivityIndicator,
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
  formatRecurringReservations,
  getSessionDisplayLabel,
  getScheduleUiMeta,
  getScheduleCardStyle,
} from "../../src/features/schedule/scheduleUtils";
import { router } from "expo-router";
import { useAuth } from "../../src/contexts/AuthContext";

import ScheduleBottomSheet from "../../src/features/schedule/components/ScheduleBottomSheet";
import CalendarView from "../../src/features/schedule/components/CalendarView";
import WeekListView from "../../src/features/schedule/components/WeekListView";
import SelectedScheduleSummary from "../../src/features/schedule/components/SelectedScheduleSummary";
import { useScheduleScreen } from "../../src/features/schedule/useScheduleScreen";
import { styles } from "../../src/features/schedule/scheduleStyles";

export default function ScheduleScreen() {
  const { token, user, logout } = useAuth();

  const {
    todayString,
    currentYear,
    currentMonth,
    selectedDate,
    setSelectedDate,
    scheduleViewMode,
    setScheduleViewMode,

    loading,
    refreshing,

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
  } = useScheduleScreen({
    token,
    user,
    logout,
    toDateString,
    getMonthMatrix,
    getDateDiffInDays,
    formatRecurringReservations,
  });

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
  selectedMySchedules={selectedMySchedules}
  isReservableDate={isReservableDate}
  getScheduleUiMeta={getScheduleUiMeta}
  getSessionDisplayLabel={getSessionDisplayLabel}
  openScheduleSheet={openScheduleSheet}
/>

{recurringInfoText ? (
  <Pressable
    style={styles.recurringInfoBox}
    onPress={() => router.push("/recurring-reservations")}
  >
    <Text style={styles.recurringInfoLabel}>정기출석</Text>

    <Text numberOfLines={1} style={styles.recurringInfoText}>
      {recurringInfoText}
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
  calendarData={calendarData}
  todayString={todayString}
  weekDayNames={weekDayNames}
  toDateString={toDateString}
  getScheduleUiMeta={getScheduleUiMeta}
  getSessionDisplayLabel={getSessionDisplayLabel}
  setSelectedDate={setSelectedDate}
  setIsScheduleSheetVisible={setIsScheduleSheetVisible}
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
/>
    </>
  );
}
