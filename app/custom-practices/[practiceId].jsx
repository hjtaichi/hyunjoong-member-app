import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
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

import { useAuth } from "../../src/contexts/AuthContext";
import {
  createMyCustomPracticeRecord,
  deleteMyCustomPracticeRecord,
  getMyCustomPractice,
  updateMyCustomPractice,
} from "../../src/api/customPractices";

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
  const [count, setCount] = useState(1);
  const [recordDate, setRecordDate] = useState(todayText());
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

    try {
      setSavingRecord(true);
      const updated = await createMyCustomPracticeRecord(
        practice.id,
        {
          recordDate,
          count,
          memo: memo.trim(),
        },
        token
      );

      setPractice(updated);
      setCount(1);
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
      `${displayDate(record.recordDate)}의 ${record.count}회 기록을 삭제할까요?`,
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
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {practice.name}
          </Text>
          {practice.canEdit ? (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setEditing((value) => !value)}
            >
              <MaterialCommunityIcons
                name={editing ? "close" : "pencil-outline"}
                size={22}
                color="#5e4f45"
              />
            </TouchableOpacity>
          ) : (
            <View style={styles.headerSpacer} />
          )}
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
                  {isGoal ? "목표 달성형" : "자유 기록형"}
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
              <Text style={styles.sectionTitle}>오늘 수련 기록</Text>

              <View style={styles.counterRow}>
                <TouchableOpacity
                  style={styles.counterButton}
                  onPress={() => setCount((value) => Math.max(1, value - 1))}
                >
                  <Text style={styles.counterButtonText}>−</Text>
                </TouchableOpacity>

                <View style={styles.counterCenter}>
                  <Text style={styles.counterValue}>{count}</Text>
                  <Text style={styles.counterUnit}>회</Text>
                </View>

                <TouchableOpacity
                  style={styles.counterButton}
                  onPress={() => setCount((value) => Math.min(999, value + 1))}
                >
                  <Text style={styles.counterButtonText}>＋</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.quickRow}>
                {[1, 2, 3, 5].map((value) => (
                  <TouchableOpacity
                    key={value}
                    style={styles.quickButton}
                    onPress={() => setCount(value)}
                  >
                    <Text style={styles.quickButtonText}>+{value}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.fieldLabel}>수련일</Text>
              <TextInput
                value={recordDate}
                onChangeText={setRecordDate}
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#b2a69d"
                maxLength={10}
              />

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
                  {savingRecord ? "기록 중..." : "기록하기"}
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
                        <Text style={styles.historyValue}>{record.count}회</Text>
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
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f8f5ef" },
  flex: { flex: 1 },
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
  header: {
    height: 58,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fffdf9",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e7ded3",
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  backText: {
    marginTop: -4,
    fontSize: 38,
    color: "#493a32",
    fontFamily: "PretendardRegular",
  },
  headerTitle: {
    flex: 1,
    paddingHorizontal: 8,
    textAlign: "center",
    fontSize: 18,
    color: "#362b26",
    fontFamily: "PretendardSemiBold",
  },
  editButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerSpacer: { width: 40 },
  content: {
    padding: 20,
    paddingBottom: 48,
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
  counterRow: {
    marginTop: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  counterButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f2ece4",
  },
  counterButtonText: {
    fontSize: 27,
    color: "#73563c",
    fontFamily: "PretendardRegular",
  },
  counterCenter: {
    width: 120,
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
  },
  counterValue: {
    fontSize: 34,
    color: "#392e28",
    fontFamily: "PretendardBold",
  },
  counterUnit: {
    marginLeft: 5,
    fontSize: 14,
    color: "#75685e",
    fontFamily: "PretendardMedium",
  },
  quickRow: {
    marginTop: 15,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  quickButton: {
    minWidth: 48,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
    alignItems: "center",
    backgroundColor: "#f8f2ea",
    borderWidth: 1,
    borderColor: "#e4d8ca",
  },
  quickButtonText: {
    fontSize: 12,
    color: "#7d5938",
    fontFamily: "PretendardSemiBold",
  },
  memoCounter: {
    marginTop: 5,
    textAlign: "right",
    fontSize: 10,
    color: "#aaa097",
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
