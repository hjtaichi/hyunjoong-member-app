import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";

import ScreenHeader from "../../src/components/ScreenHeader";
import { colors } from "../../src/theme";
import { useAuth } from "../../src/contexts/AuthContext";
import {
  createMyCustomPracticeRecord,
  getMyCustomPractices,
} from "../../src/api/customPractices";

const FILTERS = [
  { key: "all", label: "전체" },
  { key: "goal", label: "목표" },
  { key: "daily", label: "매일" },
  { key: "free", label: "자유" },
];

const WEEK_LABELS = ["월", "화", "수", "목", "금", "토", "일"];

function localDateText(date = new Date()) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function parseDateText(value) {
  return new Date(`${value}T12:00:00`);
}

function addDays(value, amount) {
  const date = typeof value === "string" ? parseDateText(value) : new Date(value);
  date.setDate(date.getDate() + amount);
  return localDateText(date);
}

function startOfWeek(value) {
  const date = typeof value === "string" ? parseDateText(value) : new Date(value);
  const day = date.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + offset);
  return localDateText(date);
}

function monthText(value) {
  const date = typeof value === "string" ? parseDateText(value) : new Date(value);
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
}

function shortDateText(value) {
  const date = parseDateText(value);
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
}

function formatDate(value) {
  if (!value) return "";
  return String(value).replaceAll("-", ".");
}

function modeLabel(mode) {
  if (mode === "goal") return "목표 달성형";
  if (mode === "daily") return "매일 실천형";
  return "자유 기록형";
}

function isPracticeActiveOn(practice, dateText) {
  if (practice.status === "archived") return false;
  if (practice.startDate && dateText < practice.startDate) return false;
  if (practice.endDate && dateText > practice.endDate) return false;
  return true;
}

function recordsOn(practice, dateText) {
  return (Array.isArray(practice.records) ? practice.records : []).filter(
    (record) => record.recordDate === dateText
  );
}

function buildCollapsedDates(todayText) {
  const thisWeek = startOfWeek(todayText);
  const first = addDays(thisWeek, -7);
  return Array.from({ length: 14 }, (_, index) => addDays(first, index));
}

function buildMonthDates(anchorText) {
  const anchor = parseDateText(anchorText);
  const firstOfMonth = new Date(anchor.getFullYear(), anchor.getMonth(), 1, 12);
  const lastOfMonth = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0, 12);
  const first = startOfWeek(firstOfMonth);
  const lastWeekStart = startOfWeek(lastOfMonth);
  const last = addDays(lastWeekStart, 6);
  const dates = [];
  let cursor = first;

  while (cursor <= last) {
    dates.push(cursor);
    cursor = addDays(cursor, 1);
  }

  return dates;
}

function WeekDots({ practice }) {
  const today = localDateText();
  const weekStart = startOfWeek(today);
  const dates = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));

  return (
    <View style={styles.weekDotWrap}>
      {dates.map((dateText, index) => {
        const completed = recordsOn(practice, dateText).length > 0;
        return (
          <View key={dateText} style={styles.weekDotItem}>
            <Text style={styles.weekDotLabel}>{WEEK_LABELS[index]}</Text>
            <View
              style={[
                styles.weekDot,
                completed && styles.weekDotCompleted,
                dateText === today && styles.weekDotToday,
              ]}
            >
              {completed ? (
                <MaterialCommunityIcons name="check" size={11} color="#ffffff" />
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

function PracticeCard({ practice }) {
  const isGoal = practice.mode === "goal";
  const isDaily = practice.mode === "daily";
  const isAdminCreated = practice.createdBy?.role === "admin";
  const progress = Number(practice.progressPercent || 0);
  const dailyStats = practice.dailyStats || {};

  return (
    <TouchableOpacity
      style={styles.practiceCard}
      activeOpacity={0.88}
      onPress={() =>
        router.push({
          pathname: "/custom-practices/[practiceId]",
          params: { practiceId: practice.id },
        })
      }
    >
      <View style={styles.cardTopRow}>
        <View style={styles.badgeRow}>
          <View style={isAdminCreated ? styles.adminBadge : styles.memberBadge}>
            <Text
              style={
                isAdminCreated ? styles.adminBadgeText : styles.memberBadgeText
              }
            >
              {isAdminCreated ? "관장님 지정" : "내가 만든 수련"}
            </Text>
          </View>

          <View style={styles.modeBadge}>
            <Text style={styles.modeBadgeText}>{modeLabel(practice.mode)}</Text>
          </View>
        </View>
        <Text style={styles.chevron}>〉</Text>
      </View>

      <Text style={styles.practiceName}>{practice.name}</Text>
      {practice.description ? (
        <Text style={styles.practiceDescription} numberOfLines={2}>
          {practice.description}
        </Text>
      ) : null}

      {isGoal ? (
        <>
          <View style={styles.countRow}>
            <Text style={styles.goalCaption}>
              목표 {Number(practice.targetCount || 0).toLocaleString("ko-KR")}회
            </Text>
            <Text style={styles.goalCount}>
              {Number(practice.currentCount || 0).toLocaleString("ko-KR")}
              <Text style={styles.goalCountSub}>
                {" "}/ {Number(practice.targetCount || 0).toLocaleString("ko-KR")}회
              </Text>
            </Text>
          </View>
          <View style={styles.progressRow}>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.max(0, Math.min(100, progress))}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>{progress}%</Text>
          </View>
        </>
      ) : isDaily ? (
        <View style={styles.dailySummaryBox}>
          <Text
            style={[
              styles.dailyTodayText,
              dailyStats.todayCompleted && styles.dailyTodayCompleted,
            ]}
          >
            {dailyStats.todayCompleted
              ? dailyStats.todayCount > 0
                ? `오늘 완료 · ${dailyStats.todayCount}회`
                : "오늘 완료"
              : "오늘 아직 기록하지 않았어요"}
          </Text>
          <WeekDots practice={practice} />
          <View style={styles.dailyStatRow}>
            <Text style={styles.dailyStatText}>
              이번 주 {Number(dailyStats.thisWeekCompletedDays || 0)}/7일
            </Text>
            <Text style={styles.dailyStatText}>
              연속 {Number(dailyStats.currentStreak || 0)}일
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.freeCountBox}>
          <Text style={styles.freeCountLabel}>누적 기록</Text>
          <Text style={styles.freeCount}>
            {Number(practice.currentCount || 0).toLocaleString("ko-KR")}회
          </Text>
        </View>
      )}

      <View style={styles.periodRow}>
        <MaterialCommunityIcons
          name="calendar-blank-outline"
          size={15}
          color="#9a8c80"
        />
        <Text style={styles.periodText}>
          {formatDate(practice.startDate)}
          {practice.endDate ? ` ~ ${formatDate(practice.endDate)}` : "부터"}
        </Text>
        {practice.status === "completed" ? (
          <Text style={styles.completedText}>목표 완료</Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

export default function CustomPracticesScreen() {
  const { token } = useAuth();
  const today = localDateText();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [practices, setPractices] = useState([]);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");
  const [calendarExpanded, setCalendarExpanded] = useState(false);
  const [calendarAnchor, setCalendarAnchor] = useState(today);
  const [selectedDate, setSelectedDate] = useState(today);
  const [recordingPractice, setRecordingPractice] = useState(null);
  const [recordCount, setRecordCount] = useState("");
  const [savingQuickRecord, setSavingQuickRecord] = useState(false);

  const load = useCallback(
    async ({ silent = false } = {}) => {
      if (!token) return;
      try {
        if (!silent) setLoading(true);
        setError("");
        const result = await getMyCustomPractices(token);
        setEnabled(result?.enabled === true);
        setPractices(Array.isArray(result?.practices) ? result.practices : []);
      } catch (loadError) {
        setError(loadError?.message || "개별수련 정보를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token]
  );

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const activePractices = useMemo(
    () => practices.filter((practice) => practice.status !== "archived"),
    [practices]
  );

  const visiblePractices = useMemo(() => {
    if (filter === "all") return activePractices;
    return activePractices.filter((practice) => practice.mode === filter);
  }, [activePractices, filter]);

  const calendarDates = useMemo(
    () =>
      calendarExpanded
        ? buildMonthDates(calendarAnchor)
        : buildCollapsedDates(today),
    [calendarAnchor, calendarExpanded, today]
  );

  const selectedDailyPractices = useMemo(
    () =>
      activePractices.filter(
        (practice) =>
          practice.mode === "daily" && isPracticeActiveOn(practice, selectedDate)
      ),
    [activePractices, selectedDate]
  );

  const selectedCompletedDailyCount = useMemo(
    () =>
      selectedDailyPractices.filter(
        (practice) => recordsOn(practice, selectedDate).length > 0
      ).length,
    [selectedDailyPractices, selectedDate]
  );

  function dateStatus(dateText) {
    const dueDaily = activePractices.filter(
      (practice) =>
        practice.mode === "daily" && isPracticeActiveOn(practice, dateText)
    );
    const completedDaily = dueDaily.filter(
      (practice) => recordsOn(practice, dateText).length > 0
    );
    const anyRecord = activePractices.some(
      (practice) => recordsOn(practice, dateText).length > 0
    );

    if (dueDaily.length > 0 && completedDaily.length === dueDaily.length) {
      return "complete";
    }
    if (anyRecord) return "partial";
    return "empty";
  }

  function moveMonth(amount) {
    const date = parseDateText(calendarAnchor);
    date.setMonth(date.getMonth() + amount, 1);
    const next = localDateText(date);
    setCalendarAnchor(next);
    setSelectedDate(next);
  }

  async function saveQuickRecord(countValue) {
    if (!token || !recordingPractice || savingQuickRecord) return;
    try {
      setSavingQuickRecord(true);
      const updated = await createMyCustomPracticeRecord(
        recordingPractice.id,
        {
          recordDate: selectedDate,
          count:
            countValue === null || countValue === ""
              ? null
              : Number(countValue),
          memo: "",
        },
        token
      );
      setPractices((current) =>
        current.map((practice) =>
          practice.id === updated.id ? updated : practice
        )
      );
      setRecordingPractice(null);
      setRecordCount("");
    } catch (saveError) {
      Alert.alert(
        "기록하지 못했습니다",
        saveError?.message || "수련 기록을 저장하지 못했습니다."
      );
    } finally {
      setSavingQuickRecord(false);
    }
  }

  function openQuickRecord(practice) {
    setRecordingPractice(practice);
    setRecordCount("");
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.headerShell}>
          <ScreenHeader title="개별수련" />
        </View>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#a56f34" />
          <Text style={styles.loadingText}>개별수련을 불러오는 중입니다.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!enabled) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.headerShell}>
          <ScreenHeader title="개별수련" />
        </View>
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>현재 열려 있는 개별수련방이 없습니다.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.headerShell}>
        <ScreenHeader title="개별수련" />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load({ silent: true });
            }}
            tintColor="#a56f34"
          />
        }
      >
        <View style={styles.calendarCard}>
          <View style={styles.calendarHeader}>
            {calendarExpanded ? (
              <TouchableOpacity style={styles.monthArrow} onPress={() => moveMonth(-1)}>
                <MaterialCommunityIcons name="chevron-left" size={22} color="#6e5540" />
              </TouchableOpacity>
            ) : (
              <View style={styles.monthArrow} />
            )}
            <Text style={styles.calendarTitle}>
              {calendarExpanded ? monthText(calendarAnchor) : monthText(today)}
            </Text>
            {calendarExpanded ? (
              <TouchableOpacity style={styles.monthArrow} onPress={() => moveMonth(1)}>
                <MaterialCommunityIcons name="chevron-right" size={22} color="#6e5540" />
              </TouchableOpacity>
            ) : (
              <View style={styles.monthArrow} />
            )}
          </View>

          <View style={styles.weekLabelRow}>
            {WEEK_LABELS.map((label) => (
              <Text key={label} style={styles.calendarWeekLabel}>{label}</Text>
            ))}
          </View>

          <View style={styles.calendarGrid}>
            {calendarDates.map((dateText) => {
              const date = parseDateText(dateText);
              const status = dateStatus(dateText);
              const selected = dateText === selectedDate;
              const currentMonth = date.getMonth() === parseDateText(calendarAnchor).getMonth();
              return (
                <TouchableOpacity
                  key={dateText}
                  style={styles.calendarDayCell}
                  onPress={() => setSelectedDate(dateText)}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.calendarDayCircle,
                      dateText === today && styles.calendarTodayCircle,
                      selected && styles.calendarSelectedCircle,
                    ]}
                  >
                    <Text
                      style={[
                        styles.calendarDayText,
                        calendarExpanded && !currentMonth && styles.calendarOtherMonthText,
                        selected && styles.calendarSelectedText,
                      ]}
                    >
                      {date.getDate()}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.calendarStatusDot,
                      status === "complete" && styles.calendarStatusComplete,
                      status === "partial" && styles.calendarStatusPartial,
                    ]}
                  />
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={styles.calendarToggle}
            onPress={() => {
              setCalendarExpanded((current) => !current);
              setCalendarAnchor(today);
            }}
          >
            <Text style={styles.calendarToggleText}>
              {calendarExpanded ? "2주만 보기" : "한 달 펼쳐보기"}
            </Text>
            <MaterialCommunityIcons
              name={calendarExpanded ? "chevron-up" : "chevron-down"}
              size={19}
              color="#8b6743"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.todayHeaderRow}>
          <View>
            <Text style={styles.todayTitle}>
              {selectedDate === today ? "오늘의 개별수련" : `${shortDateText(selectedDate)} 수련`}
            </Text>
            <Text style={styles.todayProgressText}>
              {selectedCompletedDailyCount} / {selectedDailyPractices.length}개 완료
            </Text>
          </View>
          {selectedDate !== today ? (
            <TouchableOpacity onPress={() => setSelectedDate(today)}>
              <Text style={styles.todayGoText}>오늘로</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {selectedDailyPractices.length > 0 ? (
          <View style={styles.todayList}>
            {selectedDailyPractices.map((practice) => {
              const dayRecords = recordsOn(practice, selectedDate);
              const completed = dayRecords.length > 0;
              const countValue = dayRecords.reduce(
                (sum, record) => sum + Number(record.count || 0),
                0
              );
              return (
                <View key={practice.id} style={styles.todayPracticeCard}>
                  <TouchableOpacity
                    style={styles.todayPracticeInfo}
                    onPress={() =>
                      router.push({
                        pathname: "/custom-practices/[practiceId]",
                        params: { practiceId: practice.id },
                      })
                    }
                  >
                    <View style={[styles.todayCheck, completed && styles.todayCheckDone]}>
                      {completed ? (
                        <MaterialCommunityIcons name="check" size={18} color="#ffffff" />
                      ) : null}
                    </View>
                    <View style={styles.todayPracticeTextWrap}>
                      <Text style={styles.todayPracticeName}>{practice.name}</Text>
                      <Text style={styles.todayPracticeState}>
                        {completed
                          ? countValue > 0
                            ? `완료 · ${countValue}회`
                            : "완료"
                          : "아직 기록하지 않았어요"}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {selectedDate <= today && practice.canRecord ? (
                    completed ? (
                      <TouchableOpacity
                        style={styles.todayEditButton}
                        onPress={() => {
                          setRecordingPractice(practice);
                          setRecordCount(countValue > 0 ? String(countValue) : "");
                        }}
                      >
                        <Text style={styles.todayEditButtonText}>수정</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={styles.todayCompleteButton}
                        onPress={() => openQuickRecord(practice)}
                      >
                        <Text style={styles.todayCompleteButtonText}>했어요</Text>
                      </TouchableOpacity>
                    )
                  ) : null}
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.noTodayCard}>
            <Text style={styles.noTodayText}>이 날짜에 예정된 매일 수련이 없습니다.</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.createButton}
          activeOpacity={0.88}
          onPress={() => router.push("/custom-practices/new")}
        >
          <MaterialCommunityIcons name="plus" size={21} color="#ffffff" />
          <Text style={styles.createButtonText}>새 수련 만들기</Text>
        </TouchableOpacity>

        <View style={styles.filterRow}>
          {FILTERS.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={[
                styles.filterButton,
                filter === item.key && styles.filterButtonActive,
              ]}
              onPress={() => setFilter(item.key)}
            >
              <Text
                style={[
                  styles.filterText,
                  filter === item.key && styles.filterTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {visiblePractices.length > 0 ? (
          <View style={styles.list}>
            {visiblePractices.map((practice) => (
              <PracticeCard key={practice.id} practice={practice} />
            ))}
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>아직 등록된 개별수련이 없습니다.</Text>
            <Text style={styles.emptyDesc}>새 수련을 만들어 기록을 시작해보세요.</Text>
          </View>
        )}
      </ScrollView>

      <Modal
        transparent
        visible={Boolean(recordingPractice)}
        animationType="fade"
        onRequestClose={() => setRecordingPractice(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{recordingPractice?.name}</Text>
            <Text style={styles.modalDesc}>
              완료만 기록하거나, 오늘 한 횟수를 함께 남길 수 있습니다.
            </Text>
            <Text style={styles.modalLabel}>횟수 · 선택</Text>
            <View style={styles.modalInputRow}>
              <TextInput
                value={recordCount}
                onChangeText={(value) =>
                  setRecordCount(value.replace(/\D/g, "").slice(0, 3))
                }
                placeholder="예) 50"
                placeholderTextColor="#b5a99f"
                keyboardType="number-pad"
                style={styles.modalInput}
              />
              <Text style={styles.modalUnit}>회</Text>
            </View>
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setRecordingPractice(null);
                  setRecordCount("");
                }}
              >
                <Text style={styles.modalCancelText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveButton}
                disabled={savingQuickRecord}
                onPress={() => saveQuickRecord(recordCount)}
              >
                <Text style={styles.modalSaveText}>
                  {savingQuickRecord
                    ? "저장 중..."
                    : recordCount
                      ? `${recordCount}회 기록`
                      : "횟수 없이 완료"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  headerShell: {
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  content: {
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingTop: 0,
    paddingBottom: 110,
  },
  center: { flex: 1, paddingHorizontal: 32, alignItems: "center", justifyContent: "center" },
  loadingText: { marginTop: 14, fontSize: 14, color: "#74675e", fontFamily: "PretendardRegular" },
  calendarCard: {
    padding: 16,
    borderRadius: 22,
    backgroundColor: "#fffdf9",
    borderWidth: 1,
    borderColor: "#e7ddd1",
  },
  calendarHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  monthArrow: { width: 38, height: 34, alignItems: "center", justifyContent: "center" },
  calendarTitle: { fontSize: 17, color: "#49372b", fontFamily: "PretendardSemiBold" },
  weekLabelRow: { marginTop: 12, flexDirection: "row" },
  calendarWeekLabel: { width: "14.2857%", textAlign: "center", fontSize: 11, color: "#9a8d82", fontFamily: "PretendardMedium" },
  calendarGrid: { marginTop: 7, flexDirection: "row", flexWrap: "wrap" },
  calendarDayCell: { width: "14.2857%", height: 46, alignItems: "center", justifyContent: "center" },
  calendarDayCircle: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  calendarTodayCircle: { borderWidth: 1, borderColor: "#c89963" },
  calendarSelectedCircle: { backgroundColor: "#a96f31", borderColor: "#a96f31" },
  calendarDayText: { fontSize: 12, color: "#594a40", fontFamily: "PretendardMedium" },
  calendarSelectedText: { color: "#ffffff", fontFamily: "PretendardSemiBold" },
  calendarOtherMonthText: { color: "#c6bbb1" },
  calendarStatusDot: { width: 5, height: 5, marginTop: 2, borderRadius: 3, backgroundColor: "transparent" },
  calendarStatusComplete: { backgroundColor: "#a86f34" },
  calendarStatusPartial: { backgroundColor: "#d3aa78" },
  calendarToggle: { marginTop: 8, paddingTop: 11, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "#eadfd4", flexDirection: "row", alignItems: "center", justifyContent: "center" },
  calendarToggleText: { marginRight: 3, fontSize: 12, color: "#8b6743", fontFamily: "PretendardMedium" },
  todayHeaderRow: { marginTop: 22, marginBottom: 10, flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" },
  todayTitle: { fontSize: 17, color: "#3f3129", fontFamily: "PretendardSemiBold" },
  todayProgressText: { marginTop: 4, fontSize: 12, color: "#9a8b80", fontFamily: "PretendardRegular" },
  todayGoText: { fontSize: 12, color: "#9a6835", fontFamily: "PretendardSemiBold" },
  todayList: { gap: 9 },
  todayPracticeCard: { minHeight: 70, padding: 13, borderRadius: 17, flexDirection: "row", alignItems: "center", backgroundColor: "#fffdf9", borderWidth: 1, borderColor: "#e8dfd5" },
  todayPracticeInfo: { flex: 1, flexDirection: "row", alignItems: "center" },
  todayCheck: { width: 34, height: 34, marginRight: 11, borderRadius: 17, alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderColor: "#c9bbae", backgroundColor: "#ffffff" },
  todayCheckDone: { borderColor: "#a66f35", backgroundColor: "#a66f35" },
  todayPracticeTextWrap: { flex: 1 },
  todayPracticeName: { fontSize: 15, color: "#43352d", fontFamily: "PretendardSemiBold" },
  todayPracticeState: { marginTop: 4, fontSize: 11, color: "#93857a", fontFamily: "PretendardRegular" },
  todayCompleteButton: { height: 36, paddingHorizontal: 15, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: "#a86f32" },
  todayCompleteButtonText: { fontSize: 12, color: "#ffffff", fontFamily: "PretendardSemiBold" },
  todayEditButton: { height: 36, paddingHorizontal: 14, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: "#f5ede4" },
  todayEditButtonText: { fontSize: 12, color: "#8b5d30", fontFamily: "PretendardSemiBold" },
  noTodayCard: { padding: 17, borderRadius: 17, backgroundColor: "#fffaf2", borderWidth: 1, borderColor: "#eadbc8" },
  noTodayText: { textAlign: "center", fontSize: 12, color: "#8f7c6d", fontFamily: "PretendardRegular" },
  createButton: { height: 52, marginTop: 18, borderRadius: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#a56f34" },
  createButtonText: { marginLeft: 6, fontSize: 15, color: "#ffffff", fontFamily: "PretendardSemiBold" },
  filterRow: { marginTop: 20, flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#e5ddd3" },
  filterButton: { flex: 1, paddingVertical: 12, alignItems: "center", borderBottomWidth: 2, borderBottomColor: "transparent" },
  filterButtonActive: { borderBottomColor: "#9a6835" },
  filterText: { fontSize: 12, color: "#9a8e84", fontFamily: "PretendardMedium" },
  filterTextActive: { color: "#6d4726", fontFamily: "PretendardSemiBold" },
  list: { marginTop: 16, gap: 12 },
  practiceCard: { padding: 18, borderRadius: 20, backgroundColor: "#fffdf9", borderWidth: 1, borderColor: "#e8dfd5", shadowColor: "#6c543c", shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 1 },
  cardTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  adminBadge: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 999, backgroundColor: "#f4e4cc" },
  adminBadgeText: { fontSize: 10, color: "#8b5c2e", fontFamily: "PretendardSemiBold" },
  memberBadge: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 999, backgroundColor: "#f0ece7" },
  memberBadgeText: { fontSize: 10, color: "#74685e", fontFamily: "PretendardSemiBold" },
  modeBadge: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 999, backgroundColor: "#fff8ed", borderWidth: 1, borderColor: "#eedcc2" },
  modeBadgeText: { fontSize: 10, color: "#9a6835", fontFamily: "PretendardMedium" },
  chevron: { fontSize: 24, color: "#a4968a", fontFamily: "PretendardRegular" },
  practiceName: { marginTop: 14, fontSize: 19, color: "#362b26", fontFamily: "PretendardSemiBold" },
  practiceDescription: { marginTop: 6, fontSize: 13, lineHeight: 19, color: "#81746a", fontFamily: "PretendardRegular" },
  countRow: { marginTop: 17, flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" },
  goalCaption: { fontSize: 12, color: "#8f8176", fontFamily: "PretendardRegular" },
  goalCount: { fontSize: 20, color: "#75491f", fontFamily: "PretendardBold" },
  goalCountSub: { fontSize: 13, color: "#796b61", fontFamily: "PretendardMedium" },
  progressRow: { marginTop: 10, flexDirection: "row", alignItems: "center" },
  progressTrack: { flex: 1, height: 10, overflow: "hidden", borderRadius: 999, backgroundColor: "#ede5dc" },
  progressFill: { height: "100%", borderRadius: 999, backgroundColor: "#c58b4b" },
  progressText: { width: 46, marginLeft: 10, textAlign: "right", fontSize: 14, color: "#4d4038", fontFamily: "PretendardSemiBold" },
  dailySummaryBox: { marginTop: 15, padding: 14, borderRadius: 16, backgroundColor: "#f8f3ec" },
  dailyTodayText: { fontSize: 13, color: "#8e7f73", fontFamily: "PretendardMedium" },
  dailyTodayCompleted: { color: "#825328", fontFamily: "PretendardSemiBold" },
  weekDotWrap: { marginTop: 13, flexDirection: "row", justifyContent: "space-between" },
  weekDotItem: { alignItems: "center" },
  weekDotLabel: { marginBottom: 5, fontSize: 9, color: "#9d9086", fontFamily: "PretendardRegular" },
  weekDot: { width: 19, height: 19, borderRadius: 10, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#d8ccc0", backgroundColor: "#ffffff" },
  weekDotCompleted: { borderColor: "#b78045", backgroundColor: "#b78045" },
  weekDotToday: { borderWidth: 2 },
  dailyStatRow: { marginTop: 12, paddingTop: 11, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "#e5dbd0", flexDirection: "row", justifyContent: "space-between" },
  dailyStatText: { fontSize: 11, color: "#76675c", fontFamily: "PretendardMedium" },
  freeCountBox: { marginTop: 16, padding: 14, borderRadius: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#f8f3ec" },
  freeCountLabel: { fontSize: 13, color: "#87796e", fontFamily: "PretendardRegular" },
  freeCount: { fontSize: 19, color: "#75491f", fontFamily: "PretendardBold" },
  periodRow: { marginTop: 15, paddingTop: 13, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "#e8dfd5", flexDirection: "row", alignItems: "center" },
  periodText: { marginLeft: 6, flex: 1, fontSize: 12, color: "#8c7f74", fontFamily: "PretendardRegular" },
  completedText: { fontSize: 11, color: "#8a5b2f", fontFamily: "PretendardSemiBold" },
  emptyCard: { marginTop: 22, paddingVertical: 44, paddingHorizontal: 24, borderRadius: 20, alignItems: "center", backgroundColor: "#fffdf9", borderWidth: 1, borderColor: "#e8dfd5" },
  emptyTitle: { marginTop: 8, textAlign: "center", fontSize: 16, color: "#4d4038", fontFamily: "PretendardSemiBold" },
  emptyDesc: { marginTop: 7, textAlign: "center", fontSize: 13, lineHeight: 19, color: "#8c7f74", fontFamily: "PretendardRegular" },
  errorText: { marginTop: 15, textAlign: "center", fontSize: 13, color: "#b44444", fontFamily: "PretendardMedium" },
  modalBackdrop: { flex: 1, padding: 24, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(38, 29, 24, 0.42)" },
  modalCard: { width: "100%", maxWidth: 430, padding: 20, borderRadius: 22, backgroundColor: "#fffdf9" },
  modalTitle: { fontSize: 19, color: "#3f3129", fontFamily: "PretendardSemiBold" },
  modalDesc: { marginTop: 7, fontSize: 12, lineHeight: 18, color: "#8d7e73", fontFamily: "PretendardRegular" },
  modalLabel: { marginTop: 18, marginBottom: 8, fontSize: 12, color: "#66564b", fontFamily: "PretendardMedium" },
  modalInputRow: { flexDirection: "row", alignItems: "center" },
  modalInput: { flex: 1, height: 50, paddingHorizontal: 14, borderRadius: 13, borderWidth: 1, borderColor: "#ded3c8", backgroundColor: "#ffffff", textAlign: "right", fontSize: 18, color: "#4b3b31", fontFamily: "PretendardSemiBold" },
  modalUnit: { marginLeft: 10, fontSize: 14, color: "#6e5e53", fontFamily: "PretendardMedium" },
  modalButtonRow: { marginTop: 20, flexDirection: "row", gap: 9 },
  modalCancelButton: { flex: 1, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: "#f0ebe5" },
  modalCancelText: { fontSize: 13, color: "#74675d", fontFamily: "PretendardSemiBold" },
  modalSaveButton: { flex: 2, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: "#a56f34" },
  modalSaveText: { fontSize: 13, color: "#ffffff", fontFamily: "PretendardSemiBold" },
});
