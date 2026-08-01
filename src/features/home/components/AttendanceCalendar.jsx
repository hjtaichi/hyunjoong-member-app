import React from "react";
import { Pressable, Text, View } from "react-native";

import {
  toDateString,
  getStatusMeta,
} from "../homeUtils";

import { styles } from "../homeStyles";

export default function AttendanceCalendar({
  today,
  todayString,
  selectedDate,
  miniCalendarWeeks,
  calendarMap,
  showYudanjaReservation,
  onPressDate,
  onPressMore,
}) {
  return (
    <View style={styles.card}>
      <View style={styles.miniCalendarHeader}>
        <Text style={styles.miniCalendarTitle}>
          {today.getMonth() + 1}월 출석 현황
        </Text>

        <Pressable onPress={onPressMore}>
          <View style={styles.moreLinkRow}>
            <Text style={styles.miniCalendarMore}>더보기</Text>
          </View>
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

      {miniCalendarWeeks.map((week, rowIndex) => (
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
            const attendanceCountForDay =
              dayInfo?.presentCount ||
              dayInfo?.attendanceCount ||
              dayInfo?.presentSessionCount ||
              (dayInfo?.attendanceStatus === "present" ? 1 : 0);

            const selected = selectedDate === dateString;
            const todayFlag = dateString === todayString;
            const visibleDayInfo =

              !showYudanjaReservation &&

              dayInfo?.attendanceStatus === "reserved"

                ? { ...dayInfo, attendanceStatus: null }

                : dayInfo;

            const statusMeta = getStatusMeta(visibleDayInfo);
            const isSunday = dateObj.getDay() === 0;
            const isOpenEvent = dayInfo?.isOpenHoliday === true;
            const isClosedHoliday =
              dayInfo?.isHoliday === true && !isOpenEvent;

            return (
              <Pressable
                key={dateString}
                style={[
                  styles.dayCell,
                  selected && styles.dayCellSelected,
                  todayFlag && styles.dayCellToday,
                ]}
                onPress={() => onPressDate(dateObj)}
              >
                {dayInfo?.attendanceStatus === "present" ? (
                  <View
                    style={[
                      styles.dayStampPresent,
                      attendanceCountForDay >= 2 &&
                        styles.dayStampPresentTwo,
                      attendanceCountForDay >= 3 &&
                        styles.dayStampPresentThree,
                    ]}
                  >
                    <Text style={styles.dayStampTextPresent}>
                      {dateObj.getDate()}
                    </Text>
                  </View>
) : dayInfo?.attendanceStatus === "reserved" &&
  dayInfo?.isHoliday !== true ? (
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
                      selected && styles.dayNumberSelected,
                    ]}
                  >
                    {dateObj.getDate()}
                  </Text>
                )}
              </Pressable>
            );
          })}
        </View>
      ))}

      <View style={styles.calendarLegend}>
        <View style={styles.legendItem}>
          <View style={styles.legendDotPresent} />
          <Text style={styles.legendText}>출석</Text>
        </View>
          {showYudanjaReservation ? (
            <View style={styles.legendItem}>
              <View style={styles.legendDotReserved} />
              <Text style={styles.legendText}>유단자회 예약</Text>
            </View>
          ) : null}
      </View>
    </View>
  );
}