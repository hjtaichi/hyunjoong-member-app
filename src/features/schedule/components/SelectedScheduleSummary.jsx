import React, { memo } from "react";
import { Pressable, Text, View } from "react-native";

function SelectedScheduleSummary({
  styles,
  selectedDate,
  selectedDayInfo,
  selectedMySchedules,
  shouldShow,
  canOpenSheet,
  isReservableDate,
  getScheduleUiMeta,
  getSessionDisplayLabel,
  openScheduleSheet,
}) {
  if (!shouldShow) {
    return null;
  }

  const hasHolidayNotice = Boolean(selectedDayInfo?.holidayName);

  return (
    <View style={styles.selectedScheduleSummaryCard}>
      <View style={styles.selectedScheduleSummaryHeader}>
        <Text style={styles.selectedScheduleSummaryTitle}>
          {Number(selectedDate.slice(5, 7))}.
          {Number(selectedDate.slice(8, 10))} 일정
        </Text>

        {canOpenSheet ? (
          <Pressable onPress={openScheduleSheet}>
            <Text style={styles.selectedScheduleSummaryMore}>자세히 보기</Text>
          </Pressable>
        ) : null}
      </View>

      {hasHolidayNotice ? (
        <View
          style={[
            styles.selectedEventNotice,
            selectedDayInfo?.isOpenHoliday
              ? styles.selectedEventNoticeOpen
              : styles.selectedEventNoticeClosed,
          ]}
        >
          <Text
            style={[
              styles.selectedEventNoticeTitle,
              selectedDayInfo?.isOpenHoliday
                ? styles.selectedEventNoticeTitleOpen
                : styles.selectedEventNoticeTitleClosed,
            ]}
          >
            {selectedDayInfo?.isOpenHoliday ? "도장 일정" : "휴관 안내"}
          </Text>

          <Text style={styles.selectedEventNoticeText}>
            {selectedDayInfo?.holidayName}
          </Text>
        </View>
      ) : null}

      {selectedMySchedules.map((item, index) => {
        const uiMeta = getScheduleUiMeta(item, { isReservableDate });
        const sessionId = item?.sessionId || item?.id || `summary-${index}`;

        return (
          <Pressable
            key={sessionId}
            disabled={!canOpenSheet}
            style={styles.selectedScheduleSummaryItem}
            onPress={canOpenSheet ? openScheduleSheet : undefined}
          >
            <View>
              <Text style={styles.selectedScheduleTime}>
                {item?.startTime || item?.timeLabel || "시간 미정"}
              </Text>

              <Text style={styles.selectedScheduleName}>
                {getSessionDisplayLabel(item)}
              </Text>
            </View>

            {uiMeta.label ? (
              <View style={styles.selectedScheduleStatusChip}>
                <Text style={styles.selectedScheduleStatusText}>
                  {uiMeta.label}
                </Text>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

export default memo(SelectedScheduleSummary);
