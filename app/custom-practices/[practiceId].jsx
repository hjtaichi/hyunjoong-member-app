import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { Calendar, LocaleConfig } from "react-native-calendars";

import ScreenHeader from "../../src/components/ScreenHeader";
import { colors } from "../../src/theme";
import { useAuth } from "../../src/contexts/AuthContext";
import {
  createMyCustomPracticeRecord,
  deleteMyCustomPractice,
  deleteMyCustomPracticeRecord,
  getMyCustomPractice,
  updateMyCustomPractice,
} from "../../src/api/customPractices";

LocaleConfig.locales.ko = {
  monthNames: [
    "1월",
    "2월",
    "3월",
    "4월",
    "5월",
    "6월",
    "7월",
    "8월",
    "9월",
    "10월",
    "11월",
    "12월",
  ],
  monthNamesShort: [
    "1월",
    "2월",
    "3월",
    "4월",
    "5월",
    "6월",
    "7월",
    "8월",
    "9월",
    "10월",
    "11월",
    "12월",
  ],
  dayNames: [
    "일요일",
    "월요일",
    "화요일",
    "수요일",
    "목요일",
    "금요일",
    "토요일",
  ],
  dayNamesShort: ["일", "월", "화", "수", "목", "금", "토"],
  today: "오늘",
};
LocaleConfig.defaultLocale = "ko";

function todayText() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function displayDate(value) {
  if (!value) return "";
  return String(value).replaceAll("-", ".");
}

export default function CustomPracticeDetailScreen() {
  const { practiceId } = useLocalSearchParams();
  const { token } = useAuth();
  const [practice, setPractice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingRecord, setSavingRecord] = useState(false);
  const [deletingRecordId, setDeletingRecordId] = useState("");
  const [deletingPractice, setDeletingPractice] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [count, setCount] = useState("1");
  const [recordDate, setRecordDate] = useState(todayText());
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [memo, setMemo] = useState("");
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editTargetCount, setEditTargetCount] = useState("");
  const [editEndDate, setEditEndDate] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const load = useCallback(async () => {
    if (!token || !practiceId) return;

    try {
      setLoading(true);
      const result = await getMyCustomPractice(String(practiceId), token);
      setPractice(result);
      setEditName(result?.name || "");
      setEditDescription(result?.description || "");
      setEditTargetCount(
        result?.targetCount ? String(result.targetCount) : ""
      );
      setEditEndDate(result?.endDate || "");
      setCount(result?.mode === "daily" ? "" : "1");
    } catch (error) {
      Alert.alert(
        "불러오지 못했습니다",
        error?.message || "개별수련 정보를 불러오지 못했습니다.",
        [{ text: "확인", onPress: () => router.back() }]
      );
    } finally {
      setLoading(false);
    }
  }, [practiceId, token]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const isGoal = practice?.mode === "goal";
  const isDaily = practice?.mode === "daily";
  const dailyStats = practice?.dailyStats || {};
  const progress = Number(practice?.progressPercent || 0);

  const recordGroups = useMemo(() => {
    const records = Array.isArray(practice?.records) ? practice.records : [];
    const groups = new Map();

    records.forEach((record) => {
      const month = String(record.recordDate || "").slice(0, 7);
      if (!groups.has(month)) groups.set(month, []);
      groups.get(month).push(record);
    });

    return [...groups.entries()];
  }, [practice?.records]);

  async function handleSaveRecord() {
    if (!token || !practice || savingRecord) return;

    const normalizedCount = String(count || "").trim();
    const numericCount = normalizedCount ? Number(normalizedCount) : null;

    if (!isDaily && !normalizedCount) {
      Alert.alert("확인", "오늘 수련 횟수를 입력해주세요.");
      return;
    }

    if (
      normalizedCount &&
      (!/^\d+$/.test(normalizedCount) ||
        !Number.isInteger(numericCount) ||
        numericCount <= 0 ||
        numericCount > 999)
    ) {
      Alert.alert("확인", "수련 횟수는 1회 이상 999회 이하로 입력해주세요.");
      return;
    }

    try {
      setSavingRecord(true);
      const updated = await createMyCustomPracticeRecord(
        practice.id,
        {
          recordDate,
          count: numericCount,
          memo: memo.trim(),
        },
        token
      );

      setPractice(updated);
      setCount(isDaily ? "" : "1");
      setMemo("");
    } catch (error) {
      Alert.alert(
        "기록하지 못했습니다",
        error?.message || "수련 기록 저장 중 오류가 발생했습니다."
      );
    } finally {
      setSavingRecord(false);
    }
  }

  function confirmDeleteRecord(record) {
    Alert.alert(
      "기록 삭제",
      `${displayDate(record.recordDate)}의 ${
        Number(record.count || 0) > 0 ? `${record.count}회` : "완료"
      } 기록을 삭제할까요?`,
      [
        { text: "취소", style: "cancel" },
        {
          text: "삭제",
          style: "destructive",
          onPress: async () => {
            if (!token) return;

            try {
              setDeletingRecordId(record.id);
              await deleteMyCustomPracticeRecord(record.id, token);
              await load();
            } catch (error) {
              Alert.alert(
                "삭제하지 못했습니다",
                error?.message || "기록 삭제 중 오류가 발생했습니다."
              );
            } finally {
              setDeletingRecordId("");
            }
          },
        },
      ]
    );
  }

  function confirmDeletePractice() {
    if (!practice?.canDelete || deletingPractice) return;
    setDeleteConfirmVisible(true);
  }

  async function handleDeletePractice() {
    if (!token || !practice?.id || deletingPractice) return;

    try {
      setDeletingPractice(true);
      await deleteMyCustomPractice(practice.id, token);
      setDeleteConfirmVisible(false);
      router.replace("/custom-practices");
    } catch (error) {
      Alert.alert(
        "삭제하지 못했습니다",
        error?.message || "수련 삭제 중 오류가 발생했습니다."
      );
    } finally {
      setDeletingPractice(false);
    }
  }

  async function handleSaveEdit() {
    if (!token || !practice || savingEdit) return;

    if (!editName.trim()) {
      Alert.alert("확인", "수련 이름을 입력해주세요.");
      return;
    }

    if (isGoal && Number(editTargetCount) <= 0) {
      Alert.alert("확인", "목표 횟수를 입력해주세요.");
      return;
    }

    try {
      setSavingEdit(true);

      const updated = await updateMyCustomPractice(
        practice.id,
        {
          name: editName.trim(),
          description: editDescription.trim(),
          targetCount: isGoal ? Number(editTargetCount) : null,
          endDate: editEndDate.trim() || null,
        },
        token
      );

      setPractice(updated);
      setEditing(false);
    } catch (error) {
      Alert.alert(
        "저장하지 못했습니다",
        error?.message || "수련 설정 저장 중 오류가 발생했습니다."
      );
    } finally {
      setSavingEdit(false);
    }
  }

  if (loading || !practice) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.headerShell}>
          <ScreenHeader title="개별수련" />
        </View>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#a56f34" />
          <Text style={styles.loadingText}>수련 기록을 불러오는 중입니다.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.screenHeaderWrap}>
          <ScreenHeader title="개별수련" />
          {practice.canEdit ? (
            <TouchableOpacity
              style={styles.headerEditButton}
              onPress={() => setEditing((value) => !value)}
            >
              <MaterialCommunityIcons
                name={editing ? "close" : "pencil-outline"}
                size={22}
                color="#5e4f45"
              />
            </TouchableOpacity>
          ) : null}
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.heroCard}>
            <View style={styles.heroBadgeRow}>
              <View style={styles.sourceBadge}>
                <Text style={styles.sourceBadgeText}>
                  {practice.createdBy?.role === "admin"
                    ? "관장님 지정 수련"
                    : "내가 만든 수련"}
                </Text>
              </View>
              <View style={styles.modeBadge}>
                <Text style={styles.modeBadgeText}>
                  {isGoal
                    ? "목표 달성형"
                    : isDaily
                      ? "매일 실천형"
                      : "자유 기록형"}
                </Text>
              </View>
            </View>

            <Text style={styles.practiceName}>{practice.name}</Text>
            {practice.description ? (
              <Text style={styles.description}>{practice.description}</Text>
            ) : null}

            {isGoal ? (
              <>
                <View style={styles.goalRow}>
                  <Text style={styles.goalLabel}>
                    목표 {Number(practice.targetCount || 0).toLocaleString("ko-KR")}회
                  </Text>
                  <Text style={styles.goalValue}>
                    {Number(practice.currentCount || 0).toLocaleString("ko-KR")}
                    <Text style={styles.goalValueSub}>
                      {" "}
                      / {Number(practice.targetCount || 0).toLocaleString("ko-KR")}회
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
              <View style={styles.dailyHeroBox}>
                <View style={styles.dailyHeroTopRow}>
                  <View>
                    <Text style={styles.dailyHeroLabel}>이번 주 실천</Text>
                    <Text style={styles.dailyHeroValue}>
                      {Number(dailyStats.thisWeekCompletedDays || 0)} / 7일
                    </Text>
                  </View>
                  <View style={styles.dailyHeroRight}>
                    <Text style={styles.dailyHeroLabel}>현재 연속</Text>
                    <Text style={styles.dailyHeroValue}>
                      {Number(dailyStats.currentStreak || 0)}일
                    </Text>
                  </View>
                </View>
                <View style={styles.dailyHeroDivider} />
                <View style={styles.dailyHeroBottomRow}>
                  <Text style={styles.dailyHeroBottomText}>
                    총 {Number(dailyStats.completedDays || 0)}일 실천
                  </Text>
                  <Text style={styles.dailyHeroBottomText}>
                    최장 연속 {Number(dailyStats.bestStreak || 0)}일
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.freeCountBox}>
                <Text style={styles.freeCountLabel}>지금까지 기록</Text>
                <Text style={styles.freeCount}>
                  {Number(practice.currentCount || 0).toLocaleString("ko-KR")}회
                </Text>
              </View>
            )}

            <View style={styles.metaRow}>
              <MaterialCommunityIcons
                name="calendar-blank-outline"
                size={16}
                color="#96877c"
              />
              <Text style={styles.metaText}>
                {displayDate(practice.startDate)}
                {practice.endDate
                  ? ` ~ ${displayDate(practice.endDate)}`
                  : "부터 계속"}
              </Text>
            </View>
          </View>

          {editing ? (
            <View style={styles.editCard}>
              <Text style={styles.sectionTitle}>수련 설정</Text>

              <Text style={styles.fieldLabel}>수련 이름</Text>
              <TextInput
                value={editName}
                onChangeText={(value) => setEditName(value.slice(0, 30))}
                style={styles.input}
                maxLength={30}
              />

              <Text style={styles.fieldLabel}>설명</Text>
              <TextInput
                value={editDescription}
                onChangeText={(value) =>
                  setEditDescription(value.slice(0, 120))
                }
                style={[styles.input, styles.textarea]}
                multiline
                maxLength={120}
                textAlignVertical="top"
              />

              {isGoal ? (
                <>
                  <Text style={styles.fieldLabel}>목표 횟수</Text>
                  <TextInput
                    value={editTargetCount}
                    onChangeText={(value) =>
                      setEditTargetCount(
                        value.replace(/\D/g, "").slice(0, 5)
                      )
                    }
                    style={styles.input}
                    keyboardType="number-pad"
                  />
                </>
              ) : null}

              <Text style={styles.fieldLabel}>종료일 · 선택</Text>
              <TextInput
                value={editEndDate}
                onChangeText={setEditEndDate}
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#b2a69d"
                maxLength={10}
              />

              <TouchableOpacity
                style={styles.smallSaveButton}
                onPress={handleSaveEdit}
                disabled={savingEdit}
              >
                <Text style={styles.smallSaveButtonText}>
                  {savingEdit ? "저장 중..." : "설정 저장"}
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {practice.canRecord && practice.status !== "archived" ? (
            <View style={styles.recordCard}>
              <Text style={styles.sectionTitle}>
                {isDaily ? "오늘 실천 기록" : "오늘 수련 기록"}
              </Text>
              {isDaily ? (
                <Text style={styles.dailyRecordGuide}>
                  횟수는 선택입니다. 완료만 기록해도 실천일에 표시됩니다.
                </Text>
              ) : null}

              <Text style={styles.fieldLabel}>
                {isDaily ? "오늘 수련 횟수 · 선택" : "오늘 수련 횟수"}
              </Text>
              <View style={styles.countInputWrap}>
                <TextInput
                  value={count}
                  onChangeText={(value) =>
                    setCount(value.replace(/\D/g, "").slice(0, 3))
                  }
                  style={styles.countInput}
                  keyboardType="number-pad"
                  inputMode="numeric"
                  placeholder={isDaily ? "횟수를 입력하지 않아도 완료로 기록됩니다." : "횟수 입력"}
                  placeholderTextColor="#b2a69d"
                  maxLength={3}
                />
                <Text style={styles.countInputUnit}>회</Text>
              </View>

              <Text style={styles.fieldLabel}>수련일</Text>
              <TouchableOpacity
                style={[styles.input, styles.datePickerButton]}
                onPress={() => setDatePickerVisible(true)}
                activeOpacity={0.85}
              >
                <Text style={styles.datePickerText}>
                  {displayDate(recordDate)}
                </Text>
                <MaterialCommunityIcons
                  name="calendar-month-outline"
                  size={21}
                  color="#8c6744"
                />
              </TouchableOpacity>

              <Text style={styles.fieldLabel}>메모 · 선택</Text>
              <TextInput
                value={memo}
                onChangeText={(value) => setMemo(value.slice(0, 100))}
                style={[styles.input, styles.textarea]}
                placeholder="오늘 수련 내용이나 느낌을 적어보세요."
                placeholderTextColor="#b2a69d"
                multiline
                maxLength={100}
                textAlignVertical="top"
              />
              <Text style={styles.memoCounter}>{memo.length}/100</Text>


              <TouchableOpacity
                style={styles.recordButton}
                onPress={handleSaveRecord}
                disabled={savingRecord}
                activeOpacity={0.88}
              >
                <MaterialCommunityIcons
                  name="check"
                  size={20}
                  color="#ffffff"
                />
                <Text style={styles.recordButtonText}>
                  {savingRecord
                    ? "기록 중..."
                    : isDaily
                      ? count
                        ? `${count}회 기록`
                        : "오늘 완료 기록"
                      : "기록하기"}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.readOnlyCard}>
              <MaterialCommunityIcons
                name="shield-check-outline"
                size={22}
                color="#8a663f"
              />
              <Text style={styles.readOnlyText}>
                이 수련은 관리자가 기록하는 방식으로 설정되어 있습니다.
              </Text>
            </View>
          )}

          <View style={styles.historyHeader}>
            <Text style={styles.sectionTitle}>기록 내역</Text>
            <Text style={styles.historyCount}>
              총 {practice.records?.length || 0}건
            </Text>
          </View>

          {recordGroups.length > 0 ? (
            recordGroups.map(([month, records]) => (
              <View key={month} style={styles.monthGroup}>
                <Text style={styles.monthTitle}>
                  {month.replace("-", "년 ")}월
                </Text>

                <View style={styles.historyCard}>
                  {records.map((record, index) => (
                    <View
                      key={record.id}
                      style={[
                        styles.historyRow,
                        index === records.length - 1 && styles.historyRowLast,
                      ]}
                    >
                      <View style={styles.historyDateWrap}>
                        <Text style={styles.historyDate}>
                          {displayDate(record.recordDate).slice(5)}
                        </Text>
                        <Text style={styles.historySource}>
                          {record.createdBy?.role === "admin"
                            ? "관장님 기록"
                            : "내가 기록"}
                        </Text>
                      </View>

                      <View style={styles.historyContent}>
                        <Text style={styles.historyValue}>
                          {Number(record.count || 0) > 0
                            ? `${record.count}회`
                            : "완료"}
                        </Text>
                        {record.memo ? (
                          <Text style={styles.historyMemo}>{record.memo}</Text>
                        ) : null}
                      </View>

                      {record.canDelete ? (
                        <TouchableOpacity
                          style={styles.deleteButton}
                          disabled={deletingRecordId === record.id}
                          onPress={() => confirmDeleteRecord(record)}
                        >
                          <MaterialCommunityIcons
                            name="trash-can-outline"
                            size={20}
                            color="#b5675d"
                          />
                        </TouchableOpacity>
                      ) : null}
                    </View>
                  ))}
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyHistory}>
              <Text style={styles.emptyHistoryText}>
                아직 기록된 수련이 없습니다.
              </Text>
            </View>
          )}

          {practice.canDelete ? (
            <TouchableOpacity
              style={styles.deletePracticeButton}
              onPress={confirmDeletePractice}
              disabled={deletingPractice}
              activeOpacity={0.85}
            >
              <MaterialCommunityIcons
                name="trash-can-outline"
                size={19}
                color="#b05f58"
              />
              <Text style={styles.deletePracticeButtonText}>
                {deletingPractice ? "삭제 중..." : "수련 삭제"}
              </Text>
            </TouchableOpacity>
          ) : null}
        </ScrollView>

        <Modal
          visible={deleteConfirmVisible}
          transparent
          animationType="fade"
          onRequestClose={() => {
            if (!deletingPractice) setDeleteConfirmVisible(false);
          }}
        >
          <View style={styles.deleteOverlay}>
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              activeOpacity={1}
              disabled={deletingPractice}
              onPress={() => setDeleteConfirmVisible(false)}
            />
            <View style={styles.deleteModalCard}>
              <Text style={styles.deleteModalTitle}>수련 삭제</Text>
              <Text style={styles.deleteModalText}>
                “{practice.name}” 수련을 삭제할까요?{"\n\n"}
                이 수련에 작성한 모든 기록도 함께 삭제되며 되돌릴 수 없습니다.
              </Text>

              <TouchableOpacity
                style={[
                  styles.deleteModalConfirmButton,
                  deletingPractice && styles.deleteModalButtonDisabled,
                ]}
                onPress={handleDeletePractice}
                disabled={deletingPractice}
                activeOpacity={0.86}
              >
                <Text style={styles.deleteModalConfirmText}>
                  {deletingPractice ? "삭제 중..." : "삭제하기"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteModalCancelButton}
                onPress={() => setDeleteConfirmVisible(false)}
                disabled={deletingPractice}
                activeOpacity={0.86}
              >
                <Text style={styles.deleteModalCancelText}>취소</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal
          visible={datePickerVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setDatePickerVisible(false)}
        >
          <View style={styles.calendarOverlay}>
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              activeOpacity={1}
              onPress={() => setDatePickerVisible(false)}
            />
            <View style={styles.calendarModal}>
              <View style={styles.calendarModalHeader}>
                <Text style={styles.calendarModalTitle}>수련일 선택</Text>
                <TouchableOpacity
                  style={styles.calendarCloseButton}
                  onPress={() => setDatePickerVisible(false)}
                >
                  <MaterialCommunityIcons
                    name="close"
                    size={22}
                    color="#5d4e45"
                  />
                </TouchableOpacity>
              </View>

              <Calendar
                current={recordDate}
                minDate={practice.startDate || undefined}
                maxDate={todayText()}
                firstDay={1}
                onDayPress={(day) => {
                  setRecordDate(day.dateString);
                  setDatePickerVisible(false);
                }}
                markedDates={{
                  [recordDate]: {
                    selected: true,
                    selectedColor: "#a56f34",
                    selectedTextColor: "#ffffff",
                  },
                }}
                theme={{
                  backgroundColor: "#fffdf9",
                  calendarBackground: "#fffdf9",
                  textSectionTitleColor: "#8a7a6e",
                  selectedDayBackgroundColor: "#a56f34",
                  selectedDayTextColor: "#ffffff",
                  todayTextColor: "#a56f34",
                  dayTextColor: "#44372f",
                  textDisabledColor: "#d1c8c0",
                  arrowColor: "#8b5c2e",
                  monthTextColor: "#43352d",
                  textDayFontFamily: "PretendardRegular",
                  textMonthFontFamily: "PretendardSemiBold",
                  textDayHeaderFontFamily: "PretendardMedium",
                  textDayFontSize: 14,
                  textMonthFontSize: 16,
                  textDayHeaderFontSize: 12,
                }}
              />

              <TouchableOpacity
                style={styles.todayDateButton}
                onPress={() => {
                  setRecordDate(todayText());
                  setDatePickerVisible(false);
                }}
              >
                <Text style={styles.todayDateButtonText}>오늘 날짜 선택</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  headerShell: {
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 13,
    color: "#786a60",
    fontSize: 13,
    fontFamily: "PretendardRegular",
  },
  screenHeaderWrap: {
    position: "relative",
    zIndex: 70,
    elevation: 70,
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  headerEditButton: {
    position: "absolute",
    top: 29,
    right: 16,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 80,
    elevation: 80,
  },
  content: {
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingTop: 0,
    paddingBottom: 110,
  },
  heroCard: {
    padding: 20,
    borderRadius: 22,
    backgroundColor: "#fffdf9",
    borderWidth: 1,
    borderColor: "#e7dcd0",
  },
  heroBadgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
  },
  sourceBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "#f3e3cb",
  },
  sourceBadgeText: {
    fontSize: 10,
    color: "#8d5b2b",
    fontFamily: "PretendardSemiBold",
  },
  modeBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#ead9c1",
    backgroundColor: "#fff9ef",
  },
  modeBadgeText: {
    fontSize: 10,
    color: "#9c6d3c",
    fontFamily: "PretendardMedium",
  },
  practiceName: {
    marginTop: 15,
    fontSize: 23,
    color: "#352a24",
    fontFamily: "PretendardBold",
  },
  description: {
    marginTop: 7,
    fontSize: 13,
    lineHeight: 20,
    color: "#817369",
    fontFamily: "PretendardRegular",
  },
  goalRow: {
    marginTop: 22,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  goalLabel: {
    fontSize: 12,
    color: "#8e8075",
    fontFamily: "PretendardRegular",
  },
  goalValue: {
    fontSize: 22,
    color: "#74461f",
    fontFamily: "PretendardBold",
  },
  goalValueSub: {
    fontSize: 13,
    color: "#796c62",
    fontFamily: "PretendardMedium",
  },
  progressRow: {
    marginTop: 11,
    flexDirection: "row",
    alignItems: "center",
  },
  progressTrack: {
    flex: 1,
    height: 11,
    overflow: "hidden",
    borderRadius: 999,
    backgroundColor: "#ece4db",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#c58b4b",
  },
  progressText: {
    width: 47,
    textAlign: "right",
    fontSize: 14,
    color: "#4d4038",
    fontFamily: "PretendardSemiBold",
  },
  dailyHeroBox: {
    marginTop: 18,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#f8f3ec",
  },
  dailyHeroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dailyHeroRight: {
    alignItems: "flex-end",
  },
  dailyHeroLabel: {
    fontSize: 11,
    color: "#928378",
    fontFamily: "PretendardRegular",
  },
  dailyHeroValue: {
    marginTop: 4,
    fontSize: 20,
    color: "#75491f",
    fontFamily: "PretendardBold",
  },
  dailyHeroDivider: {
    marginVertical: 13,
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#e3d8cd",
  },
  dailyHeroBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dailyHeroBottomText: {
    fontSize: 11,
    color: "#78695e",
    fontFamily: "PretendardMedium",
  },
  freeCountBox: {
    marginTop: 20,
    padding: 16,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8f2ea",
  },
  freeCountLabel: {
    fontSize: 13,
    color: "#87786d",
    fontFamily: "PretendardRegular",
  },
  freeCount: {
    fontSize: 22,
    color: "#74461f",
    fontFamily: "PretendardBold",
  },
  metaRow: {
    marginTop: 17,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#e7ddd3",
    flexDirection: "row",
    alignItems: "center",
  },
  metaText: {
    marginLeft: 7,
    fontSize: 12,
    color: "#8e8075",
    fontFamily: "PretendardRegular",
  },
  editCard: {
    marginTop: 14,
    padding: 18,
    borderRadius: 20,
    backgroundColor: "#fffdf9",
    borderWidth: 1,
    borderColor: "#e7ddd3",
  },
  recordCard: {
    marginTop: 14,
    padding: 18,
    borderRadius: 20,
    backgroundColor: "#fffdf9",
    borderWidth: 1,
    borderColor: "#e7ddd3",
  },
  sectionTitle: {
    fontSize: 16,
    color: "#45372f",
    fontFamily: "PretendardSemiBold",
  },
  fieldLabel: {
    marginTop: 17,
    marginBottom: 8,
    fontSize: 12,
    color: "#71645a",
    fontFamily: "PretendardMedium",
  },
  input: {
    minHeight: 46,
    paddingHorizontal: 13,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#ded4ca",
    backgroundColor: "#ffffff",
    fontSize: 14,
    color: "#3e332d",
    fontFamily: "PretendardRegular",
  },
  textarea: {
    minHeight: 85,
    paddingTop: 12,
    paddingBottom: 12,
  },
  smallSaveButton: {
    height: 46,
    marginTop: 17,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#7e5938",
  },
  smallSaveButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontFamily: "PretendardSemiBold",
  },
  countInputWrap: {
    minHeight: 54,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#ded4ca",
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
  },
  countInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 20,
    color: "#3e332d",
    fontFamily: "PretendardSemiBold",
  },
  countInputUnit: {
    marginLeft: 8,
    fontSize: 14,
    color: "#75685e",
    fontFamily: "PretendardMedium",
  },
  datePickerButton: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  datePickerText: {
    fontSize: 14,
    color: "#3e332d",
    fontFamily: "PretendardRegular",
  },
  memoCounter: {
    marginTop: 5,
    textAlign: "right",
    fontSize: 10,
    color: "#aaa097",
    fontFamily: "PretendardRegular",
  },
  dailyRecordGuide: {
    marginTop: 6,
    marginBottom: 14,
    fontSize: 11,
    lineHeight: 17,
    color: "#95877c",
    fontFamily: "PretendardRegular",
  },
  recordButton: {
    height: 52,
    marginTop: 18,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#a56f34",
  },
  recordButtonText: {
    marginLeft: 6,
    color: "#ffffff",
    fontSize: 15,
    fontFamily: "PretendardSemiBold",
  },
  readOnlyCard: {
    marginTop: 14,
    padding: 16,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fbf2e5",
  },
  readOnlyText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 12,
    lineHeight: 18,
    color: "#735d49",
    fontFamily: "PretendardRegular",
  },
  historyHeader: {
    marginTop: 26,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  historyCount: {
    fontSize: 12,
    color: "#9a8d83",
    fontFamily: "PretendardRegular",
  },
  monthGroup: {
    marginBottom: 15,
  },
  monthTitle: {
    marginBottom: 7,
    fontSize: 12,
    color: "#8b7c71",
    fontFamily: "PretendardMedium",
  },
  historyCard: {
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: "#fffdf9",
    borderWidth: 1,
    borderColor: "#e7ddd3",
  },
  historyRow: {
    minHeight: 76,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e7ddd3",
  },
  historyRowLast: {
    borderBottomWidth: 0,
  },
  historyDateWrap: {
    width: 78,
  },
  historyDate: {
    fontSize: 13,
    color: "#5a4d45",
    fontFamily: "PretendardSemiBold",
  },
  historySource: {
    marginTop: 5,
    fontSize: 10,
    color: "#a09186",
    fontFamily: "PretendardRegular",
  },
  historyContent: {
    flex: 1,
  },
  historyValue: {
    fontSize: 15,
    color: "#70461f",
    fontFamily: "PretendardBold",
  },
  historyMemo: {
    marginTop: 5,
    fontSize: 12,
    lineHeight: 17,
    color: "#82746a",
    fontFamily: "PretendardRegular",
  },
  deleteButton: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  deletePracticeButton: {
    height: 48,
    marginTop: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e3c4c0",
    backgroundColor: "#fff8f7",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  deletePracticeButtonText: {
    marginLeft: 7,
    fontSize: 13,
    color: "#b05f58",
    fontFamily: "PretendardSemiBold",
  },
  deleteOverlay: {
    flex: 1,
    backgroundColor: "rgba(43,34,29,0.28)",
    justifyContent: "flex-end",
  },
  deleteModalCard: {
    backgroundColor: "#FFFCFA",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 28,
  },
  deleteModalTitle: {
    fontSize: 18,
    color: "#3A2C27",
    fontFamily: "MaruBuriSemiBold",
  },
  deleteModalText: {
    marginTop: 10,
    marginBottom: 18,
    fontSize: 14,
    lineHeight: 21,
    color: "#6B4F46",
    fontFamily: "PretendardMedium",
  },
  deleteModalConfirmButton: {
    height: 48,
    borderRadius: 14,
    backgroundColor: "#C45A4A",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteModalConfirmText: {
    fontSize: 15,
    color: "#FFFFFF",
    fontFamily: "PretendardBold",
  },
  deleteModalCancelButton: {
    height: 46,
    borderRadius: 14,
    backgroundColor: "#F4EDE6",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  deleteModalCancelText: {
    fontSize: 15,
    color: "#6B4F46",
    fontFamily: "PretendardBold",
  },
  deleteModalButtonDisabled: {
    opacity: 0.55,
  },
  calendarOverlay: {
    flex: 1,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(40, 31, 25, 0.42)",
  },
  calendarModal: {
    width: "100%",
    maxWidth: 420,
    padding: 16,
    borderRadius: 22,
    backgroundColor: "#fffdf9",
  },
  calendarModalHeader: {
    paddingHorizontal: 4,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  calendarModalTitle: {
    fontSize: 17,
    color: "#40332c",
    fontFamily: "PretendardSemiBold",
  },
  calendarCloseButton: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  todayDateButton: {
    height: 46,
    marginTop: 10,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5eadb",
  },
  todayDateButtonText: {
    fontSize: 13,
    color: "#83582f",
    fontFamily: "PretendardSemiBold",
  },
  emptyHistory: {
    paddingVertical: 36,
    borderRadius: 18,
    alignItems: "center",
    backgroundColor: "#fffdf9",
    borderWidth: 1,
    borderColor: "#e7ddd3",
  },
  emptyHistoryText: {
    fontSize: 13,
    color: "#978a80",
    fontFamily: "PretendardRegular",
  },
});
