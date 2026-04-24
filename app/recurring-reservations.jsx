import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useAuth } from "../src/contexts/AuthContext";
import {
  getRecurringReservations,
  saveRecurringReservations,
} from "../src/api/memberRecurringReservations";

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

  const canUseYudanja = true;

  const loadData = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);

      const result = await getRecurringReservations(token);
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
      <Text style={styles.title}>정기출석 설정</Text>
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

      {WEEKDAY_ROWS.map((day) => {
        const selectedTimeKeys = Array.isArray(selectedRecurringMap[day.value])
          ? selectedRecurringMap[day.value]
          : [];
        const timeOptions = TIME_OPTIONS_BY_WEEKDAY[day.value] || [];

        return (
          <View key={day.value} style={styles.card}>
            <View style={styles.dayHeaderRow}>
              <Text style={styles.cardTitle}>{day.label}</Text>
              <View style={styles.dayBadge}>
                <Text style={styles.dayBadgeText}>{day.shortLabel}</Text>
              </View>
            </View>

            <Text style={styles.helperText}>
              {day.value === 6
                ? "토요일은 오전 10시부 / 오후 1시 30분부를 선택할 수 있어요."
                : "평일은 오전 10시부 / 오후 4시부 / 오후 7시부를 여러 개 선택할 수 있어요."}
            </Text>

            <View style={styles.chipGroup}>
              <Pressable
                style={[
                  styles.choiceChip,
                  styles.clearChip,
                  selectedTimeKeys.length === 0 && styles.choiceChipActive,
                ]}
                onPress={() => clearWeekdayTime(day.value)}
              >
                <Text
                  style={[
                    styles.choiceChipText,
                    selectedTimeKeys.length === 0 &&
                      styles.choiceChipTextActive,
                  ]}
                >
                  선택 안 함
                </Text>
              </Pressable>

              {timeOptions.map((option) => {
                const active = selectedTimeKeys.includes(option.value);

                return (
                  <Pressable
                    key={`${day.value}-${option.value}`}
                    style={[
                      styles.choiceChip,
                      active && styles.choiceChipActive,
                    ]}
                    onPress={() => toggleWeekdayTime(day.value, option.value)}
                  >
                    <Text
                      style={[
                        styles.choiceChipText,
                        active && styles.choiceChipTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        );
      })}

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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8FA",
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    backgroundColor: "#F7F8FA",
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
    backgroundColor: "#EEF2FF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#C7D2FE",
  },
  summaryTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#312E81",
    marginBottom: 6,
  },
  summaryText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#3730A3",
    marginBottom: 4,
  },
  summarySubText: {
    fontSize: 13,
    color: "#4338CA",
    lineHeight: 19,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
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
    gap: 10,
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
  saveButton: {
    marginTop: 6,
    backgroundColor: "#111827",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFFFFF",
  },
});