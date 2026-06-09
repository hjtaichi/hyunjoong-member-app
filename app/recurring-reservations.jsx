import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "../src/contexts/AuthContext";
import {
  getRecurringReservations,
  saveRecurringReservations,
} from "../src/api/memberRecurringReservations";
import { getMemberHome } from "../src/api/memberHome";

const WEEKDAY_ROWS = [
  { value: 2, label: "화요일", shortLabel: "화" },
  { value: 3, label: "수요일", shortLabel: "수" },
  { value: 4, label: "목요일", shortLabel: "목" },
  { value: 5, label: "금요일", shortLabel: "금" },
  { value: 6, label: "토요일", shortLabel: "토" },
];

const TIME_OPTIONS_BY_WEEKDAY = {
  2: [
    { value: "AM_10", label: "오전 10시부" },
    { value: "PM_4", label: "오후 4시부" },
    { value: "PM_7", label: "오후 7시부" },
  ],
  3: [
    { value: "AM_10", label: "오전 10시부" },
    { value: "PM_4", label: "오후 4시부" },
    { value: "PM_7", label: "오후 7시부" },
  ],
  4: [
    { value: "AM_10", label: "오전 10시부" },
    { value: "PM_4", label: "오후 4시부" },
    { value: "PM_7", label: "오후 7시부" },
  ],
  5: [
    { value: "AM_10", label: "오전 10시부" },
    { value: "PM_4", label: "오후 4시부" },
    { value: "PM_7", label: "오후 7시부" },
  ],
  6: [
    { value: "AM_10", label: "오전 10시부" },
    { value: "PM_130", label: "오후 1시 30분부" },
  ],
};

function makeInitialRecurringMap(items) {
  const map = {};

  for (const item of items) {
    const weekday = Number(item?.weekday);
    const sessionTimeKey = String(item?.sessionTimeKey || "");

    if (!weekday || !sessionTimeKey) continue;
    if (sessionTimeKey === "MON_YUDANJA") continue;

    if (!Array.isArray(map[weekday])) {
      map[weekday] = [];
    }

    if (!map[weekday].includes(sessionTimeKey)) {
      map[weekday].push(sessionTimeKey);
    }
  }

  return map;
}

export default function RecurringReservationsScreen() {
  const { token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [selectedRecurringMap, setSelectedRecurringMap] = useState({});
  const [isYudanjaEnabled, setIsYudanjaEnabled] = useState(false);

  const [canUseYudanja, setCanUseYudanja] = useState(false);
  const [activeDay, setActiveDay] = useState(null);

  const loadData = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);

      const result = await getRecurringReservations(token);
      const homeResult = await getMemberHome(token);
       setCanUseYudanja(homeResult?.member?.canAccessYudanjaClass === true);
      const items = Array.isArray(result?.items) ? result.items : [];

      const normalItems = items.filter(
        (item) => item.sessionTimeKey !== "MON_YUDANJA"
      );

      const yudanjaItem = items.find(
        (item) => item.sessionTimeKey === "MON_YUDANJA"
      );

      setSelectedRecurringMap(makeInitialRecurringMap(normalItems));
      setIsYudanjaEnabled(Boolean(yudanjaItem));
    } catch (error) {
      Alert.alert(
        "오류",
        error.message || "정기출석 설정을 불러오지 못했습니다."
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const selectedNormalCount = useMemo(() => {
    return Object.values(selectedRecurringMap).reduce((acc, arr) => {
      return acc + (Array.isArray(arr) ? arr.length : 0);
    }, 0);
  }, [selectedRecurringMap]);

  const toggleWeekdayTime = useCallback((weekday, sessionTimeKey) => {
    setSelectedRecurringMap((prev) => {
      const current = Array.isArray(prev[weekday]) ? prev[weekday] : [];
      const exists = current.includes(sessionTimeKey);

      let nextForDay;
      if (exists) {
        nextForDay = current.filter((item) => item !== sessionTimeKey);
      } else {
        nextForDay = [...current, sessionTimeKey];
      }

      const next = { ...prev };

      if (nextForDay.length === 0) {
        delete next[weekday];
      } else {
        next[weekday] = nextForDay;
      }

      return next;
    });
  }, []);

  const clearWeekdayTime = useCallback((weekday) => {
    setSelectedRecurringMap((prev) => {
      const next = { ...prev };
      delete next[weekday];
      return next;
    });
  }, []);
  
  const getSelectedLabelsForDay = useCallback(
  (weekday) => {
    const selectedTimeKeys = Array.isArray(selectedRecurringMap[weekday])
      ? selectedRecurringMap[weekday]
      : [];

    if (selectedTimeKeys.length === 0) {
      return "선택 안 함";
    }

    const options = TIME_OPTIONS_BY_WEEKDAY[weekday] || [];

    return selectedTimeKeys
      .map((key) => options.find((option) => option.value === key)?.label)
      .filter(Boolean)
      .join(" · ");
  },
  [selectedRecurringMap]
);

  const handleSave = useCallback(async () => {
    try {
      setSaving(true);

      const normalItems = Object.entries(selectedRecurringMap).flatMap(
        ([weekday, sessionTimeKeys]) => {
          const list = Array.isArray(sessionTimeKeys) ? sessionTimeKeys : [];
          return list.map((sessionTimeKey) => ({
            weekday: Number(weekday),
            sessionTimeKey: String(sessionTimeKey),
          }));
        }
      );

      const yudanjaItems =
        canUseYudanja && isYudanjaEnabled
          ? [
              {
                weekday: 1,
                sessionTimeKey: "MON_YUDANJA",
              },
            ]
          : [];

      const finalItems = [...normalItems, ...yudanjaItems];

      await saveRecurringReservations(token, {
        isEnabled: finalItems.length > 0,
        items: finalItems,
      });

      Alert.alert("완료", "정기출석 설정이 저장되었습니다.");
      await loadData();
    } catch (error) {
      Alert.alert(
        "오류",
        error.message || "정기출석 설정 저장에 실패했습니다."
      );
    } finally {
      setSaving(false);
    }
  }, [selectedRecurringMap, isYudanjaEnabled, canUseYudanja, token, loadData]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>정기출석 설정을 불러오는 중입니다.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.topHeader}>
  <Text style={styles.backButton} onPress={() => router.back()}>
    ‹
  </Text>

  <Text style={styles.topTitle}>정기출석 설정</Text>
</View>

      <Text style={styles.subtitle}>
        요일마다 여러 시간대를 선택할 수 있어요. 자주 가는 시간으로 저장해두면 자동 예약과 연결됩니다.
      </Text>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>일반 정기출석</Text>
        <Text style={styles.summaryText}>
          선택된 시간 수: {selectedNormalCount}개
        </Text>
        <Text style={styles.summarySubText}>
          같은 요일에 여러 시간대를 함께 선택할 수 있습니다.
        </Text>
      </View>

      <View style={styles.card}>
  <Text style={styles.cardTitle}>요일별 설정</Text>

  {WEEKDAY_ROWS.map((day, index) => {
    const selectedTimeKeys = Array.isArray(selectedRecurringMap[day.value])
      ? selectedRecurringMap[day.value]
      : [];

    const selectedText =
      selectedTimeKeys.length === 0
        ? "선택 안 함"
        : selectedTimeKeys
            .map((key) => {
              const option = TIME_OPTIONS_BY_WEEKDAY[day.value].find(
                (item) => item.value === key
              );
              return option?.label;
            })
            .filter(Boolean)
            .join(", ");

    return (
      <Pressable
        key={day.value}
        style={[
          styles.dayRow,
          index !== WEEKDAY_ROWS.length - 1 && styles.dayRowBorder,
        ]}
        onPress={() => setActiveDay(day)}
      >
        <View style={styles.dayRowMain}>
  <Text style={styles.dayRowTitle}>{day.label}</Text>

  <Text
    numberOfLines={1}
    style={[
      styles.dayRowValue,
      selectedTimeKeys.length > 0 && styles.dayRowValueActive,
    ]}
  >
    {selectedText}
  </Text>
</View>

<Text style={styles.dayRowArrow}>›</Text>
      </Pressable>
    );
  })}
</View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>월요일 유단자수련</Text>
        <Text style={styles.helperText}>
          유단자수련은 일반 정기출석과 별도로 관리합니다.
        </Text>

        {canUseYudanja ? (
          <Pressable
            style={[
              styles.toggleButton,
              isYudanjaEnabled && styles.toggleButtonActive,
            ]}
            onPress={() => setIsYudanjaEnabled((prev) => !prev)}
          >
            <Text
              style={[
                styles.toggleButtonText,
                isYudanjaEnabled && styles.toggleButtonTextActive,
              ]}
            >
              {isYudanjaEnabled
                ? "유단자수련 자동 예약 사용 중"
                : "유단자수련 자동 예약 사용 안 함"}
            </Text>
          </Pressable>
        ) : (
          <Text style={styles.blockedText}>
            유단자수련 권한이 있는 회원만 설정할 수 있습니다.
          </Text>
        )}
      </View>

      <Pressable
        style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={saving}
      >
        <Text style={styles.saveButtonText}>
          {saving ? "저장 중..." : "저장"}
        </Text>
      </Pressable>
      <Modal
  visible={!!activeDay}
  transparent
  animationType="slide"
  onRequestClose={() => setActiveDay(null)}
>
  <View style={styles.sheetOverlay}>
    <Pressable
      style={styles.sheetBackdrop}
      onPress={() => setActiveDay(null)}
    />

    <View style={styles.sheetContainer}>
      <View style={styles.sheetHandle} />

      <View style={styles.sheetHeaderRow}>
        <Text style={styles.sheetTitle}>
          {activeDay?.label || "요일"} 정기출석
        </Text>

        <Pressable onPress={() => setActiveDay(null)}>
          <Text style={styles.sheetCloseText}>닫기</Text>
        </Pressable>
      </View>

      <Text style={styles.sheetDesc}>
        같은 요일에 여러 시간대를 선택할 수 있어요.
      </Text>

      {activeDay ? (
        <>
          <Pressable
            style={[
              styles.sheetOption,
              !(selectedRecurringMap[activeDay.value]?.length > 0) &&
                styles.sheetOptionActive,
            ]}
            onPress={() => clearWeekdayTime(activeDay.value)}
          >
            <Text
              style={[
                styles.sheetOptionText,
                !(selectedRecurringMap[activeDay.value]?.length > 0) &&
                  styles.sheetOptionTextActive,
              ]}
            >
              선택 안 함
            </Text>
          </Pressable>

          {(TIME_OPTIONS_BY_WEEKDAY[activeDay.value] || []).map((option) => {
            const selectedTimeKeys = Array.isArray(
              selectedRecurringMap[activeDay.value]
            )
              ? selectedRecurringMap[activeDay.value]
              : [];

            const active = selectedTimeKeys.includes(option.value);

            return (
              <Pressable
                key={option.value}
                style={[
                  styles.sheetOption,
                  active && styles.sheetOptionActive,
                ]}
                onPress={() =>
                  toggleWeekdayTime(activeDay.value, option.value)
                }
              >
                <Text
                  style={[
                    styles.sheetOptionText,
                    active && styles.sheetOptionTextActive,
                  ]}
                >
                  {option.label}
                </Text>

                {active ? <Text style={styles.sheetCheckText}>✓</Text> : null}
              </Pressable>
            );
          })}
        </>
      ) : null}
    </View>
  </View>
</Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f3ee",
  },
  content: {
  paddingHorizontal: 20,
  paddingTop: 20,
  paddingBottom: 30,
},
  center: {
  flex: 1,
  backgroundColor: "#f6f3ee",
  alignItems: "center",
  justifyContent: "center",
},
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "#666",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#4B5563",
    lineHeight: 22,
    marginBottom: 20,
  },
  summaryCard: {
  backgroundColor: "#F8F5EF",
  borderRadius: 24,
  padding: 18,
  marginBottom: 14,
  borderWidth: 1,
  borderColor: "#E8E1D6",
},
summaryTitle: {
  fontSize: 17,
  fontWeight: "800",
  color: "#1F1A17",
  marginBottom: 6,
},
summaryText: {
  fontSize: 14,
  fontWeight: "800",
  color: "#8C6330",
  marginBottom: 4,
},
summarySubText: {
  fontSize: 13,
  color: "#7A7168",
  lineHeight: 19,
},
card: {
  backgroundColor: "#FFFEFC",
  borderRadius: 26,
  paddingHorizontal: 16,
  paddingVertical: 18,
  marginBottom: 18,
  borderWidth: 1,
  borderColor: "#ECE7DE",
},
saveButton: {
  marginTop: 6,
  backgroundColor: "#2A2624",
  borderRadius: 18,
  paddingVertical: 16,
  alignItems: "center",
},
  dayHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  dayBadge: {
    minWidth: 34,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
  },
  dayBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#374151",
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
  },
  helperText: {
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 18,
    marginBottom: 10,
  },
  chipGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  choiceChip: {
    minHeight: 42,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  clearChip: {
    backgroundColor: "#F9FAFB",
  },
  choiceChipActive: {
    backgroundColor: "#DCFCE7",
    borderColor: "#86EFAC",
  },
  choiceChipText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
  },
  choiceChipTextActive: {
    color: "#166534",
  },
  toggleButton: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  toggleButtonActive: {
    backgroundColor: "#DBEAFE",
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
  },
  toggleButtonTextActive: {
    color: "#1D4ED8",
  },
  blockedText: {
    fontSize: 13,
    color: "#B91C1C",
    lineHeight: 20,
  },

  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  rowItem: {
  flexDirection: "row",
  justifyContent: "space-between",
  paddingVertical: 14,
  borderBottomWidth: 1,
  borderBottomColor: "#eee",
},

rowTitle: {
  fontSize: 15,
  fontWeight: "600",
},

rowValue: {
  fontSize: 14,
  color: "#6B7280",
},
dayRow: {
  minHeight: 62,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  paddingVertical: 10,
},

dayRowMain: {
  flex: 1,
  flexDirection: "row",
  alignItems: "center",
  gap: 18,
},

dayRowValue: {
  flexShrink: 1,
  fontSize: 14,
  color: "#9A8F81",
},

dayRowBorder: {
  borderBottomWidth: 1,
  borderBottomColor: "#ECE7DE",
},
dayRowTitle: {
  fontSize: 16,
  fontWeight: "800",
  color: "#1F1A17",
},

dayRowValue: {
  marginTop: 5,
  fontSize: 13,
  lineHeight: 18,
  color: "#9A8F81",
},

dayRowValueActive: {
  color: "#8C6330",
  fontWeight: "800",
},

dayRowArrow: {
  fontSize: 12,
  fontWeight: "300",
  color: "#B7ADA1",
  marginLeft: 10,
},
sheetOverlay: {
  flex: 1,
  justifyContent: "flex-end",
  backgroundColor: "rgba(17, 24, 39, 0.25)",
},

sheetBackdrop: {
  flex: 1,
},

sheetContainer: {
  backgroundColor: "#FFFDF9",
  borderTopLeftRadius: 28,
  borderTopRightRadius: 28,
  paddingTop: 10,
  paddingHorizontal: 18,
  paddingBottom: 50,
  borderWidth: 1,
  borderColor: "#ECE7DE",
},

sheetHandle: {
  alignSelf: "center",
  width: 44,
  height: 5,
  borderRadius: 999,
  backgroundColor: "#D8D0C5",
  marginBottom: 14,
},

sheetHeaderRow: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 8,
},

sheetTitle: {
  fontSize: 22,
  fontWeight: "800",
  color: "#1F1A17",
},

sheetCloseText: {
  fontSize: 14,
  fontWeight: "800",
  color: "#8C6330",
},

sheetDesc: {
  fontSize: 13,
  lineHeight: 19,
  color: "#7A7168",
  marginBottom: 14,
},

sheetOption: {
  minHeight: 50,
  borderRadius: 16,
  paddingHorizontal: 14,
  marginBottom: 8,
  backgroundColor: "#F8F5EF",
  borderWidth: 1,
  borderColor: "#E8E1D6",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
},

sheetOptionActive: {
  backgroundColor: "#F6EFE3",
  borderColor: "#8C6330",
},

sheetOptionText: {
  fontSize: 15,
  fontWeight: "800",
  color: "#5F554B",
},

sheetOptionTextActive: {
  color: "#8C6330",
},

sheetCheckText: {
  fontSize: 18,
  fontWeight: "900",
  color: "#8C6330",
},
topHeader: {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 14,
},

backButton: {
  width: 28,
  fontSize: 30,
  lineHeight: 32,
  color: "#6b4f46",
  marginRight: 8,
},

topTitle: {
  fontSize: 24,
  fontWeight: "900",
  color: "#111827",
},
});