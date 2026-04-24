import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
  Alert,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { useFocusEffect } from "@react-navigation/native";
import { getMemberHomeApi } from "../api/memberHome";
import { getMemberCalendarApi } from "../api/memberCalendar";
import { checkAttendanceApi } from "../api/memberAttendance";
import LoadingScreen from "../components/LoadingScreens";
import { useAuth } from "../contexts/AuthContext";

function pad2(n) {
  return String(n).padStart(2, "0");
}

function formatMonthKey(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}`;
}

function formatDateKey(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function getPaymentStatusText(status, daysLeft) {
  if (status === "DUE_SOON") {
    if (typeof daysLeft === "number") {
      return `납부 예정 (${daysLeft}일 남음)`;
    }
    return "납부 예정";
  }

  if (status === "NORMAL") {
    return "정상";
  }

  return "-";
}

function getAttendanceStatusText(status) {
  if (status === "present") return "출석 완료";
  if (status === "pending") return "미출석";
  if (status === "reserved") return "예약됨";
  return "-";
}

export default function HomeScreen() {
  const { user, logout } = useAuth();

  const today = new Date();
  const todayKey = formatDateKey(today);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [home, setHome] = useState(null);
  const [calendarData, setCalendarData] = useState(null);

  const [selectedMonth, setSelectedMonth] = useState(formatMonthKey(today));
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [submittingAttendanceId, setSubmittingAttendanceId] = useState(null);

  async function fetchHomeSummary() {
    const data = await getMemberHomeApi();
    setHome(data);
  }

  async function fetchCalendar(month) {
    const data = await getMemberCalendarApi(month);
    setCalendarData(data);
  }

  async function fetchAll(isRefresh = false, month = selectedMonth) {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      await Promise.all([fetchHomeSummary(), fetchCalendar(month)]);
    } catch (error) {
      console.error("home/calendar fetch error:", error?.response?.data || error.message);

      if (error?.response?.status === 401) {
        Alert.alert("세션 만료", "다시 로그인해주세요.");
        await logout();
        return;
      }

      Alert.alert(
        "불러오기 실패",
        error?.response?.data?.message || "홈 정보를 불러오지 못했습니다."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchAll(false, selectedMonth);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchAll(true, selectedMonth);
    }, [selectedMonth])
  );

  function handleLogout() {
    Alert.alert("로그아웃", "로그아웃 하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "로그아웃",
        style: "destructive",
        onPress: logout,
      },
    ]);
  }

  async function handleAttendance(item) {
    if (!item?.id) {
      Alert.alert("안내", "출석할 수업 정보가 없습니다.");
      return;
    }

    try {
      setSubmittingAttendanceId(item.id);

      const result = await checkAttendanceApi(item.id);

      Alert.alert("출석 완료", result?.message || "출석이 완료되었습니다.");

      await fetchAll(true, selectedMonth);
    } catch (error) {
      console.error("checkAttendance error:", error?.response?.data || error.message);

      if (error?.response?.status === 401) {
        Alert.alert("세션 만료", "다시 로그인해주세요.");
        await logout();
        return;
      }

      Alert.alert(
        "출석 실패",
        error?.response?.data?.message || "출석 처리에 실패했습니다."
      );
    } finally {
      setSubmittingAttendanceId(null);
    }
  }

  const homePayload = useMemo(() => home?.data || {}, [home]);
  const calendarPayload = useMemo(() => calendarData?.data || {}, [calendarData]);

  const academyName = homePayload?.academyName || "현중태극권";
  const memberName = homePayload?.member?.name || user?.name || "회원님";
  const notices = homePayload?.recentNotices || [];
  const payment = homePayload?.payment || null;
  const progress = homePayload?.progress || null;

  const scheduleByDate = calendarPayload?.scheduleByDate || {};
  const attendanceDates = calendarPayload?.attendanceDates || [];

  const selectedSchedules = scheduleByDate[selectedDate] || [];

  const markedDates = useMemo(() => {
    const marks = {};

    attendanceDates.forEach((date) => {
      marks[date] = {
        ...(marks[date] || {}),
        marked: true,
        dotColor: "#2563EB",
      };
    });

    Object.keys(scheduleByDate).forEach((date) => {
      if (!marks[date]) {
        marks[date] = {};
      }

      if ((scheduleByDate[date] || []).length > 0 && !marks[date].marked) {
        marks[date].marked = true;
        marks[date].dotColor = "#9CA3AF";
      }
    });

    marks[todayKey] = {
      ...(marks[todayKey] || {}),
      today: true,
    };

    marks[selectedDate] = {
      ...(marks[selectedDate] || {}),
      selected: true,
      selectedColor: "#111827",
      selectedTextColor: "#FFFFFF",
    };

    return marks;
  }, [attendanceDates, scheduleByDate, selectedDate, todayKey]);

  async function handleMonthChange(monthObj) {
    const nextMonth = `${monthObj.year}-${pad2(monthObj.month)}`;
    const nextSelectedDate = `${monthObj.year}-${pad2(monthObj.month)}-01`;

    setSelectedMonth(nextMonth);
    setSelectedDate(nextSelectedDate);

    await fetchAll(true, nextMonth);
  }

  console.log("🔥 진짜 HomeScreen 렌더링됨");

  if (loading) {
    return <LoadingScreen text="홈 화면 불러오는 중..." />;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => fetchAll(true, selectedMonth)} />
      }
    >
      <View style={styles.headerCard}>
        <Text style={styles.academyName}>{academyName}</Text>
        <Text style={styles.greeting}>{memberName}님 안녕하세요</Text>
        <Text style={styles.subText}>이번 달 출석 현황을 한눈에 확인해보세요.</Text>

        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>로그아웃</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🔥 달력 홈 테스트</Text>
        <Calendar
          current={selectedDate}
          markedDates={markedDates}
          onDayPress={(day) => setSelectedDate(day.dateString)}
          onMonthChange={handleMonthChange}
          theme={{
            todayTextColor: "#2563EB",
            arrowColor: "#2563EB",
            textDayFontSize: 15,
            textMonthFontSize: 17,
            textDayHeaderFontSize: 13,
          }}
        />
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#2563EB" }]} />
            <Text style={styles.legendText}>출석한 날</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#9CA3AF" }]} />
            <Text style={styles.legendText}>수업 있는 날</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>선택한 날짜</Text>
        <Text style={styles.selectedDateText}>{selectedDate}</Text>

        {selectedSchedules.length === 0 ? (
          <Text style={styles.emptyText}>이 날짜에는 수업 또는 출석 기록이 없습니다.</Text>
        ) : (
          selectedSchedules.map((item, idx) => {
            const isSubmitting = submittingAttendanceId === item.id;
            const canAttendToday =
              selectedDate === todayKey && item.attendanceStatus !== "present";

            return (
              <View key={item.id || idx} style={styles.itemBox}>
                <Text style={styles.itemTitle}>
                  {item.name || item.className || item.title || "수업"}
                </Text>
                <Text style={styles.itemDesc}>
                  시작 시간: {item.startTime || item.startDateTime || "-"}
                </Text>
                <Text style={styles.itemDesc}>
                  출석 상태: {getAttendanceStatusText(item.attendanceStatus)}
                </Text>

                {canAttendToday && (
                  <Pressable
                    style={[
                      styles.attendanceButton,
                      isSubmitting && styles.attendanceButtonDisabled,
                    ]}
                    onPress={() => handleAttendance(item)}
                    disabled={isSubmitting}
                  >
                    <Text style={styles.attendanceButtonText}>
                      {isSubmitting ? "처리 중..." : "출석하기"}
                    </Text>
                  </Pressable>
                )}
              </View>
            );
          })
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>최근 공지</Text>
        {notices.length === 0 ? (
          <Text style={styles.emptyText}>등록된 공지가 없습니다.</Text>
        ) : (
          notices.map((notice, idx) => (
            <View key={notice.id || idx} style={styles.itemBox}>
              <Text style={styles.itemTitle}>{notice.title || "공지사항"}</Text>
              <Text style={styles.itemDesc} numberOfLines={3}>
                {notice.content || ""}
              </Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>내 진도</Text>
        {!progress ? (
          <Text style={styles.emptyText}>진도 정보가 없습니다.</Text>
        ) : (
          <>
            <Text style={styles.infoText}>
              현재 단계: {progress.currentStep || 0} / {progress.totalSteps || 0}
            </Text>
            <Text style={styles.infoText}>
              최근 수업 메모: {progress.lastLessonNote || "-"}
            </Text>
          </>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>회비 상태</Text>
        {!payment ? (
          <Text style={styles.emptyText}>회비 정보가 없습니다.</Text>
        ) : (
          <>
            <Text style={styles.infoText}>
              상태: {getPaymentStatusText(payment.status, payment.daysLeft)}
            </Text>
            <Text style={styles.infoText}>
              마감일: {payment.dueDate || "-"}
            </Text>
            {typeof payment.daysLeft === "number" && (
              <Text style={styles.infoText}>남은 기간: {payment.daysLeft}일</Text>
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F7FB",
  },
  content: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },
  headerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
  },
  academyName: {
    fontSize: 13,
    color: "#2563EB",
    fontWeight: "700",
    marginBottom: 8,
  },
  greeting: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
  },
  subText: {
    marginTop: 6,
    color: "#6B7280",
    fontSize: 14,
    lineHeight: 20,
  },
  logoutButton: {
    marginTop: 16,
    alignSelf: "flex-start",
    backgroundColor: "#111827",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  logoutButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 12,
    color: "#111827",
  },
  legendRow: {
    marginTop: 12,
    flexDirection: "row",
    gap: 16,
    flexWrap: "wrap",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  legendText: {
    fontSize: 12,
    color: "#6B7280",
  },
  selectedDateText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  itemBox: {
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#EEE",
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
    color: "#111827",
  },
  itemDesc: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 2,
  },
  attendanceButton: {
    marginTop: 10,
    alignSelf: "flex-start",
    backgroundColor: "#2563EB",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  attendanceButtonDisabled: {
    opacity: 0.6,
  },
  attendanceButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  infoText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 6,
    lineHeight: 21,
  },
  emptyText: {
    fontSize: 14,
    color: "#888",
    lineHeight: 20,
  },
});