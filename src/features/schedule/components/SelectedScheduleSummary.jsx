import React, { memo } from "react";
import { Pressable, Text, View } from "react-native";

function SelectedScheduleSummary({
  styles,
  selectedDate,
  selectedMySchedules,
  isReservableDate,
  getScheduleUiMeta,
  getSessionDisplayLabel,
  openScheduleSheet,
}) {
  return (
    <View style={styles.selectedScheduleSummaryCard}>
      <View style={styles.selectedScheduleSummaryHeader}>
        <Text style={styles.selectedScheduleSummaryTitle}>
          {Number(selectedDate.slice(5, 7))}.
          {Number(selectedDate.slice(8, 10))} 일정
        </Text>

        <Pressable onPress={openScheduleSheet}>
          <Text style={styles.selectedScheduleSummaryMore}>자세히 보기</Text>
        </Pressable>
      </View>

      {selectedMySchedules.length === 0 ? (
        <Text style={styles.selectedScheduleEmptyText}>일정이 없습니다.</Text>
      ) : (
        selectedMySchedules.slice(0, 3).map((item, index) => {
          const uiMeta = getScheduleUiMeta(item, { isReservableDate });
          const sessionId = item?.sessionId || item?.id || `summary-${index}`;

          return (
            <Pressable
              key={sessionId}
              style={styles.selectedScheduleSummaryItem}
              onPress={openScheduleSheet}
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
  );
}
export default memo(SelectedScheduleSummary);