import React, { memo } from "react";
import { Pressable, Text, View } from "react-native";

function WeekListView({
  styles,
  thisWeekDates,
  calendarData,
  todayString,
  weekDayNames,
  toDateString,
  getScheduleUiMeta,
  getSessionDisplayLabel,
  setSelectedDate,
  setIsScheduleSheetVisible,
}) {
  return (
    <View style={styles.weekListCard}>
      <Text style={styles.weekListTitle}>이번주 수련 일정</Text>

      {thisWeekDates.map((dateObj) => {
        const dateString = toDateString(dateObj);
        const schedules = calendarData?.scheduleByDate?.[dateString] || [];

        const visibleSchedules = schedules;

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
                const uiMeta = getScheduleUiMeta(item, {
                  isReservableDate: true,
                });

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

                    {uiMeta.label ? (
                      <View
                        style={[
                          styles.weekScheduleStatusChip,
                          uiMeta.tone === "done" &&
                            styles.weekScheduleStatusChipDone,
                          uiMeta.tone === "reserved" &&
                            styles.weekScheduleStatusChipReserved,
                        ]}
                      >
                        <Text
                          style={[
                            styles.weekScheduleStatusText,
                            uiMeta.tone === "done" &&
                              styles.weekScheduleStatusTextDone,
                            uiMeta.tone === "reserved" &&
                              styles.weekScheduleStatusTextReserved,
                          ]}
                        >
                          {uiMeta.label}
                        </Text>
                      </View>
                    ) : null}
                  </Pressable>
                );
              })
            )}
          </View>
        );
      })}
    </View>
  );
}

export default memo(WeekListView);