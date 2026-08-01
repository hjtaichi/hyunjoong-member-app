import React, { memo } from "react";
import { Modal, Pressable, ScrollView, Text, View, ActivityIndicator } from "react-native";
function ScheduleBottomSheet({
  visible,
  selectedDate,
  selectedSchedules,
  calendarMap,
  isReservableDate,
  isSelectedToday,
  styles,
  closeScheduleSheet,
  getScheduleUiMeta,
  getScheduleCardStyle,
  getSessionDisplayLabel,
  canCancelAttendance,
  canCheckInTodaySession,
  handleScheduleAction,
  submittingAttendance,
}) {
  return (
    <Modal
      visible={visible}
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
                {calendarMap[selectedDate]?.isOpenHoliday
                  ? "도장 일정"
                  : "휴관 안내"}
              </Text>

              <Text style={styles.selectedEventNoticeText}>
                {calendarMap[selectedDate]?.holidayName}
              </Text>

              {!calendarMap[selectedDate]?.isOpenHoliday ? (
                <Text style={styles.selectedEventNoticeSubText}>
                  이 날은 수업이 운영되지 않습니다.
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
                  } else if (
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
                  finalUiMeta.tone === "disabled" ||
                  finalUiMeta.tone === "cancelled";

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

                          {finalUiMeta.label ? (
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
                          ) : null}
                        </View>

                        {showHelperText && finalUiMeta.helperText ? (
                          <Text style={styles.compactHelperText}>
                            {finalUiMeta.helperText}
                          </Text>
                        ) : null}
                      </View>

                      {finalUiMeta.actionLabel ? (
                        <Pressable
                          disabled={submittingAttendance}
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
{submittingAttendance ? (
  <ActivityIndicator size="small" />
) : (
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
)}
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
  );
}
export default memo(ScheduleBottomSheet);