import React, { useMemo, useState } from "react";
import {
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
import { router } from "expo-router";

import { useAuth } from "../../src/contexts/AuthContext";
import { createMyCustomPractice } from "../../src/api/customPractices";

function todayText() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

export default function NewCustomPracticeScreen() {
  const { token } = useAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [mode, setMode] = useState("goal");
  const [targetCount, setTargetCount] = useState("30");
  const [hasEndDate, setHasEndDate] = useState(false);
  const [endDate, setEndDate] = useState("");
  const [saving, setSaving] = useState(false);

  const canSave = useMemo(() => {
    if (!name.trim()) return false;
    if (mode === "goal" && Number(targetCount) <= 0) return false;
    if (hasEndDate && !/^\d{4}-\d{2}-\d{2}$/.test(endDate.trim())) return false;
    return true;
  }, [endDate, hasEndDate, mode, name, targetCount]);

  async function handleSave() {
    if (!token || !canSave || saving) return;

    try {
      setSaving(true);

      const created = await createMyCustomPractice(
        {
          name: name.trim(),
          description: description.trim(),
          mode,
          targetCount: mode === "goal" ? Number(targetCount) : null,
          startDate: todayText(),
          endDate: hasEndDate ? endDate.trim() : null,
        },
        token
      );

      router.replace({
        pathname: "/custom-practices/[practiceId]",
        params: { practiceId: created.id },
      });
    } catch (error) {
      Alert.alert(
        "저장하지 못했습니다",
        error?.message || "새 수련을 만드는 중 오류가 발생했습니다."
      );
    } finally {
      setSaving(false);
    }
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
          <Text style={styles.headerTitle}>새 수련 만들기</Text>
          <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
            <MaterialCommunityIcons name="close" size={23} color="#554840" />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.stepLabel}>1. 수련 정보</Text>

          <View style={styles.formCard}>
            <Text style={styles.label}>수련 이름</Text>
            <TextInput
              value={name}
              onChangeText={(value) => setName(value.slice(0, 30))}
              placeholder="예) 운수 연습, 참장, 왼쪽 단편 보완"
              placeholderTextColor="#b1a69d"
              style={styles.input}
              maxLength={30}
            />
            <Text style={styles.counter}>{name.length}/30</Text>

            <Text style={[styles.label, styles.labelGap]}>설명 · 선택</Text>
            <TextInput
              value={description}
              onChangeText={(value) => setDescription(value.slice(0, 120))}
              placeholder="이 수련에서 집중할 내용을 간단히 적어보세요."
              placeholderTextColor="#b1a69d"
              style={[styles.input, styles.textarea]}
              multiline
              maxLength={120}
              textAlignVertical="top"
            />
            <Text style={styles.counter}>{description.length}/120</Text>
          </View>

          <Text style={[styles.stepLabel, styles.sectionGap]}>2. 기록 방식 선택</Text>

          <TouchableOpacity
            style={[
              styles.modeCard,
              mode === "goal" && styles.modeCardActive,
            ]}
            onPress={() => setMode("goal")}
            activeOpacity={0.88}
          >
            <View style={styles.modeIcon}>
              <MaterialCommunityIcons
                name="target"
                size={28}
                color={mode === "goal" ? "#9a6835" : "#9e9187"}
              />
            </View>
            <View style={styles.modeTextWrap}>
              <Text style={styles.modeTitle}>목표 달성형</Text>
              <Text style={styles.modeDesc}>
                목표 횟수를 정하고 진행률을 확인하며 수련해요.
              </Text>
            </View>
            <MaterialCommunityIcons
              name={
                mode === "goal"
                  ? "radiobox-marked"
                  : "radiobox-blank"
              }
              size={22}
              color={mode === "goal" ? "#a56f34" : "#b7aca3"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.modeCard,
              mode === "daily" && styles.modeCardActive,
            ]}
            onPress={() => setMode("daily")}
            activeOpacity={0.88}
          >
            <View style={styles.modeIcon}>
              <MaterialCommunityIcons
                name="calendar-check-outline"
                size={27}
                color={mode === "daily" ? "#9a6835" : "#9e9187"}
              />
            </View>
            <View style={styles.modeTextWrap}>
              <Text style={styles.modeTitle}>매일 실천형</Text>
              <Text style={styles.modeDesc}>
                매일 했는지를 중심으로 기록하고, 횟수는 선택해서 남겨요.
              </Text>
            </View>
            <MaterialCommunityIcons
              name={
                mode === "daily"
                  ? "radiobox-marked"
                  : "radiobox-blank"
              }
              size={22}
              color={mode === "daily" ? "#a56f34" : "#b7aca3"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.modeCard,
              mode === "free" && styles.modeCardActive,
            ]}
            onPress={() => setMode("free")}
            activeOpacity={0.88}
          >
            <View style={styles.modeIcon}>
              <MaterialCommunityIcons
                name="notebook-outline"
                size={27}
                color={mode === "free" ? "#9a6835" : "#9e9187"}
              />
            </View>
            <View style={styles.modeTextWrap}>
              <Text style={styles.modeTitle}>자유 기록형</Text>
              <Text style={styles.modeDesc}>
                목표 없이 내가 한 만큼 횟수를 차곡차곡 기록해요.
              </Text>
            </View>
            <MaterialCommunityIcons
              name={
                mode === "free"
                  ? "radiobox-marked"
                  : "radiobox-blank"
              }
              size={22}
              color={mode === "free" ? "#a56f34" : "#b7aca3"}
            />
          </TouchableOpacity>

          {mode === "goal" ? (
            <>
              <Text style={[styles.stepLabel, styles.sectionGap]}>3. 목표 설정</Text>

              <View style={styles.formCard}>
                <Text style={styles.label}>목표 횟수</Text>
                <View style={styles.numberInputRow}>
                  <TextInput
                    value={targetCount}
                    onChangeText={(value) =>
                      setTargetCount(value.replace(/\D/g, "").slice(0, 5))
                    }
                    placeholder="30"
                    placeholderTextColor="#b1a69d"
                    keyboardType="number-pad"
                    style={[styles.input, styles.numberInput]}
                  />
                  <Text style={styles.unit}>회</Text>
                </View>

                <TouchableOpacity
                  style={styles.checkRow}
                  onPress={() => {
                    setHasEndDate((current) => !current);
                    if (hasEndDate) setEndDate("");
                  }}
                >
                  <MaterialCommunityIcons
                    name={
                      hasEndDate
                        ? "checkbox-marked-circle"
                        : "checkbox-blank-circle-outline"
                    }
                    size={22}
                    color={hasEndDate ? "#a56f34" : "#a99d93"}
                  />
                  <View style={styles.checkTextWrap}>
                    <Text style={styles.checkTitle}>목표 종료일 정하기</Text>
                    <Text style={styles.checkDesc}>
                      선택하지 않으면 목표를 달성할 때까지 계속됩니다.
                    </Text>
                  </View>
                </TouchableOpacity>

                {hasEndDate ? (
                  <>
                    <Text style={[styles.label, styles.labelGap]}>종료일</Text>
                    <TextInput
                      value={endDate}
                      onChangeText={setEndDate}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor="#b1a69d"
                      style={styles.input}
                      maxLength={10}
                      keyboardType={
                        Platform.OS === "ios" ? "numbers-and-punctuation" : "default"
                      }
                    />
                  </>
                ) : null}
              </View>
            </>
          ) : null}

          {mode === "daily" ? (
            <>
              <Text style={[styles.stepLabel, styles.sectionGap]}>3. 매일 실천 설정</Text>
              <View style={styles.formCard}>
                <View style={styles.dailyGuideRow}>
                  <View style={styles.dailyGuideIcon}>
                    <MaterialCommunityIcons
                      name="calendar-check-outline"
                      size={25}
                      color="#9a6835"
                    />
                  </View>
                  <View style={styles.dailyGuideTextWrap}>
                    <Text style={styles.dailyGuideTitle}>매일 하는 수련으로 표시됩니다.</Text>
                    <Text style={styles.dailyGuideDesc}>
                      완료만 눌러도 되고, 그날의 횟수를 함께 입력해도 됩니다.
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.checkRow}
                  onPress={() => {
                    setHasEndDate((current) => !current);
                    if (hasEndDate) setEndDate("");
                  }}
                >
                  <MaterialCommunityIcons
                    name={
                      hasEndDate
                        ? "checkbox-marked-circle"
                        : "checkbox-blank-circle-outline"
                    }
                    size={22}
                    color={hasEndDate ? "#a56f34" : "#a99d93"}
                  />
                  <View style={styles.checkTextWrap}>
                    <Text style={styles.checkTitle}>실천 종료일 정하기</Text>
                    <Text style={styles.checkDesc}>
                      선택하지 않으면 매일 계속 표시됩니다.
                    </Text>
                  </View>
                </TouchableOpacity>

                {hasEndDate ? (
                  <>
                    <Text style={[styles.label, styles.labelGap]}>종료일</Text>
                    <TextInput
                      value={endDate}
                      onChangeText={setEndDate}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor="#b1a69d"
                      style={styles.input}
                      maxLength={10}
                    />
                  </>
                ) : null}
              </View>
            </>
          ) : null}

          <View style={styles.noticeCard}>
            <MaterialCommunityIcons
              name="information-outline"
              size={20}
              color="#8c663e"
            />
            <Text style={styles.noticeText}>
              {mode === "daily"
                ? "달력에서 완료 여부를 확인하고, 횟수는 필요할 때만 입력할 수 있습니다."
                : "수련을 만든 뒤 날짜별 횟수와 메모를 기록할 수 있습니다."}
            </Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.saveButton,
              (!canSave || saving) && styles.saveButtonDisabled,
            ]}
            disabled={!canSave || saving}
            onPress={handleSave}
            activeOpacity={0.88}
          >
            <Text style={styles.saveButtonText}>
              {saving ? "만드는 중..." : "수련 만들기"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f8f5ef" },
  flex: { flex: 1 },
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
    fontSize: 18,
    color: "#362b26",
    fontFamily: "PretendardSemiBold",
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    padding: 20,
    paddingBottom: 32,
  },
  stepLabel: {
    marginBottom: 10,
    fontSize: 14,
    color: "#7b512d",
    fontFamily: "PretendardSemiBold",
  },
  sectionGap: {
    marginTop: 24,
  },
  formCard: {
    padding: 17,
    borderRadius: 20,
    backgroundColor: "#fffdf9",
    borderWidth: 1,
    borderColor: "#e8dfd5",
  },
  label: {
    marginBottom: 8,
    fontSize: 13,
    color: "#64564d",
    fontFamily: "PretendardMedium",
  },
  labelGap: {
    marginTop: 17,
  },
  input: {
    minHeight: 48,
    paddingHorizontal: 14,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#ded4ca",
    backgroundColor: "#ffffff",
    fontSize: 14,
    color: "#3e332d",
    fontFamily: "PretendardRegular",
  },
  textarea: {
    minHeight: 96,
    paddingTop: 13,
    paddingBottom: 13,
  },
  counter: {
    marginTop: 5,
    textAlign: "right",
    fontSize: 10,
    color: "#a99d93",
    fontFamily: "PretendardRegular",
  },
  modeCard: {
    minHeight: 90,
    marginBottom: 10,
    padding: 15,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e4dbd1",
    backgroundColor: "#fffdf9",
  },
  modeCardActive: {
    borderColor: "#c89258",
    backgroundColor: "#fff9f0",
  },
  modeIcon: {
    width: 48,
    height: 48,
    marginRight: 13,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5eee6",
  },
  modeTextWrap: {
    flex: 1,
    paddingRight: 10,
  },
  modeTitle: {
    fontSize: 15,
    color: "#40342e",
    fontFamily: "PretendardSemiBold",
  },
  modeDesc: {
    marginTop: 5,
    fontSize: 12,
    lineHeight: 18,
    color: "#8b7e74",
    fontFamily: "PretendardRegular",
  },
  numberInputRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  numberInput: {
    flex: 1,
    textAlign: "right",
    fontSize: 18,
    fontFamily: "PretendardSemiBold",
  },
  unit: {
    marginLeft: 10,
    fontSize: 14,
    color: "#66594f",
    fontFamily: "PretendardMedium",
  },
  checkRow: {
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#e8dfd5",
    flexDirection: "row",
    alignItems: "flex-start",
  },
  checkTextWrap: {
    flex: 1,
    marginLeft: 10,
  },
  checkTitle: {
    fontSize: 14,
    color: "#4d413a",
    fontFamily: "PretendardMedium",
  },
  checkDesc: {
    marginTop: 4,
    fontSize: 11,
    lineHeight: 17,
    color: "#968980",
    fontFamily: "PretendardRegular",
  },
  dailyGuideRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  dailyGuideIcon: {
    width: 46,
    height: 46,
    marginRight: 12,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5eadb",
  },
  dailyGuideTextWrap: {
    flex: 1,
  },
  dailyGuideTitle: {
    fontSize: 14,
    color: "#4d3d33",
    fontFamily: "PretendardSemiBold",
  },
  dailyGuideDesc: {
    marginTop: 5,
    fontSize: 11,
    lineHeight: 17,
    color: "#93867c",
    fontFamily: "PretendardRegular",
  },
  noticeCard: {
    marginTop: 20,
    padding: 15,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fbf2e5",
  },
  noticeText: {
    flex: 1,
    marginLeft: 9,
    fontSize: 12,
    lineHeight: 18,
    color: "#725b46",
    fontFamily: "PretendardRegular",
  },
  footer: {
    padding: 16,
    paddingBottom: Platform.OS === "ios" ? 10 : 16,
    backgroundColor: "#fffdf9",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#e7ded3",
  },
  saveButton: {
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#a56f34",
  },
  saveButtonDisabled: {
    opacity: 0.45,
  },
  saveButtonText: {
    fontSize: 15,
    color: "#ffffff",
    fontFamily: "PretendardSemiBold",
  },
});
