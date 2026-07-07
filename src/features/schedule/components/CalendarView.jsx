import React, { memo } from "react";
import { Pressable, Text, View } from "react-native";

function CalendarView({
  styles,
  currentYear,
  currentMonth,
  moveMonth,
  weeks,
  calendarMap,
  selectedDate,
  todayString,
  toDateString,
  handlePressDate,
}) {
  return (
    <View style={styles.calendarSection}>
      <View style={styles.calendarHeader}>
        <Pressable style={styles.monthButton} onPress={() => moveMonth(-1)}>
          <Text style={styles.monthButtonText}>‹</Text>
        </Pressable>

        <Text style={styles.monthTitle}>
          {currentYear}년 {currentMonth}월
        </Text>

        <Pressable style={styles.monthButton} onPress={() => moveMonth(1)}>
          <Text style={styles.monthButtonText}>›</Text>
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

      {weeks.map((week, rowIndex) => (
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
            const selected = selectedDate === dateString;
            const todayFlag = dateString === todayString;
            const isSunday = dateObj.getDay() === 0;
            const isOpenEvent = dayInfo?.isOpenHoliday === true;
            const isClosedHoliday =
              dayInfo?.isHoliday === true && !isOpenEvent;

            return (
              <Pressable
                key={dateString}
                style={styles.dayCell}
                onPress={() => handlePressDate(dateObj)}
              >
                {dayInfo?.holidayName ? (
                  <View
                    style={[
                      styles.eventDot,
                      dayInfo?.isOpenHoliday
                        ? styles.eventDotOpen
                        : styles.eventDotClosed,
                    ]}
                  />
                ) : null}

                <View
                  style={[
                    styles.dayInner,
                    selected && styles.dayInnerSelected,
                    todayFlag && styles.dayInnerToday,
                  ]}
                >
                  {dayInfo?.attendanceStatus === "present" ? (
                    <View style={styles.dayStampPresent}>
                      <Text style={styles.dayStampTextPresent}>
                        {dateObj.getDate()}
                      </Text>
                    </View>
                  ) : dayInfo?.attendanceStatus === "reserved" &&
                    dayInfo?.isHoliday !== true &&
                    dayInfo?.hasRecurringException !== true ? (
                    <View style={styles.dayStampReserved}>
                      <Text style={styles.dayStampTextReserved}>
                        {dateObj.getDate()}
                      </Text>
                    </View>
                  ) : (
                    <Text
                      style={[
                        styles.dayNumber,
                        (isSunday || isClosedHoliday) &&
                          styles.dayNumberSunday,
                        isOpenEvent && styles.dayNumberEvent,
                      ]}
                    >
                      {dateObj.getDate()}
                    </Text>
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}
export default memo(CalendarView);