import React, { memo, useMemo } from "react";
import { Pressable, Text, View } from "react-native";

function WeekListView({
  styles,
  thisWeekDates,
  weekScheduleByDate,
  weeklyListLoading,
  todayString,
  weekDayNames,
  toDateString,
  getScheduleUiMeta,
  getSessionDisplayLabel,
  shouldShowWeeklyAttendedSchedule,
  isYudanjaMember,
  handlePressDate,
}) {
  const attendedDays = useMemo(() => {
    return thisWeekDates
      .map((dateObj) => {
        const dateString = toDateString(dateObj);
        const schedules =
          weekScheduleByDate?.[dateString] || [];

        const visibleSchedules = schedules.filter(
          (item) =>
            shouldShowWeeklyAttendedSchedule(item, {
              isYudanjaMember,
            })
        );

        return {
          dateObj,
          dateString,
          visibleSchedules,
        };
      })
      .filter(
        (day) => day.visibleSchedules.length > 0
      );
  }, [
    thisWeekDates,
    weekScheduleByDate,
    toDateString,
    shouldShowWeeklyAttendedSchedule,
    isYudanjaMember,
  ]);

  return (
    <View style={styles.weekListCard}>
      <Text style={styles.weekListTitle}>
        이번 주 참여 수업
      </Text>

      {weeklyListLoading &&
      attendedDays.length === 0 ? (
        <Text style={styles.weekEmptyText}>
          이번 주 참여 수업을 불러오는 중입니다.
        </Text>
      ) : attendedDays.length === 0 ? (
        <Text style={styles.weekEmptyText}>
          이번 주 참여한 수업이 없습니다.
        </Text>
      ) : (
        attendedDays.map(
          ({
            dateObj,
            dateString,
            visibleSchedules,
          }) => {
            const isToday =
              dateString === todayString;

            return (
              <View
                key={dateString}
                style={styles.weekDaySection}
              >
                <Text style={styles.weekDayTitle}>
                  {dateObj.getMonth() + 1}월{" "}
                  {dateObj.getDate()}일{" "}
                  {
                    weekDayNames[
                      dateObj.getDay()
                    ]
                  }
                  요일
                  {isToday ? " (오늘)" : ""}
                </Text>

                {visibleSchedules.map(
                  (item, index) => {
                    const uiMeta =
                      getScheduleUiMeta(item, {
                        isReservableDate: false,
                      });

                    const sessionId =
                      item?.sessionId ||
                      item?.id ||
                      `${dateString}-${index}`;

                    return (
                      <Pressable
                        key={sessionId}
                        style={
                          styles.weekScheduleRow
                        }
                        onPress={() =>
                          handlePressDate(dateObj)
                        }
                      >
                        <Text
                          style={
                            styles.weekScheduleTime
                          }
                        >
                          {item?.startTime ||
                            item?.timeLabel ||
                            "시간 미정"}
                        </Text>

                        <Text
                          style={
                            styles.weekScheduleName
                          }
                        >
                          {getSessionDisplayLabel(
                            item
                          )}
                        </Text>

                        {uiMeta.label ? (
                          <View
                            style={[
                              styles.weekScheduleStatusChip,
                              uiMeta.tone ===
                                "done" &&
                                styles.weekScheduleStatusChipDone,
                            ]}
                          >
                            <Text
                              style={[
                                styles.weekScheduleStatusText,
                                uiMeta.tone ===
                                  "done" &&
                                  styles.weekScheduleStatusTextDone,
                              ]}
                            >
                              {uiMeta.label}
                            </Text>
                          </View>
                        ) : null}
                      </Pressable>
                    );
                  }
                )}
              </View>
            );
          }
        )
      )}
    </View>
  );
}

export default memo(WeekListView);
