import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { colors, radius, shadow, spacing } from "../src/theme";
import { useAuth } from "../src/contexts/AuthContext";
import { API_BASE_URL } from "../src/config/env";
import ScreenHeader from "../src/components/ScreenHeader";

function getPositionPercent(myCount, average) {
  const mine = Number(myCount || 0);
  const avg = Number(average || 0);

  if (avg <= 0) return 50;

  const ratio = mine / avg;

  if (ratio <= 0.5) return 12;
  if (ratio >= 1.5) return 88;

  return 12 + ((ratio - 0.5) / 1) * 76;
}

function getEncouragingMessage(diff, unit) {
  if (diff > 0) {
    return `평균보다 ${diff}${unit} 더 수련했습니다. 꾸준한 흐름을 잘 이어가고 있어요.`;
  }

  if (diff < 0) {
    return `평균까지 ${Math.abs(diff)}${unit} 남았습니다. 조금씩 쌓아가면 충분히 따라갈 수 있어요.`;
  }

  return "현재 그룹 평균과 같은 흐름으로 수련하고 있습니다.";
}

export default function FormStatsScreen() {
  const { token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [activeFormKey, setActiveFormKey] = useState(null);

  const loadHistory = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/api/member/me/form-record-history?t=${Date.now()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "투로 통계 불러오기 실패");
      }

      const data = result.data || [];
      setHistory(data);

      const firstForm = data?.[0]?.forms?.[0];
      if (firstForm?.formKey) {
        setActiveFormKey(firstForm.formKey);
      }
    } catch (error) {
      console.log("투로 통계 불러오기 실패:", error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const forms = useMemo(() => {
    const map = new Map();

    for (const period of history) {
      for (const form of period.forms || []) {
        if (!map.has(form.formKey)) {
          map.set(form.formKey, {
            ...form,
            periodLabel: period.periodLabel,
            periodSub: period.periodSub,
          });
        }
      }
    }

    return [...map.values()];
  }, [history]);

  const activeForm = useMemo(() => {
    return forms.find((item) => item.formKey === activeFormKey) || forms[0] || null;
  }, [forms, activeFormKey]);

  const stats = activeForm?.groupStats || null;

  const myCount = Number(stats?.myCount || activeForm?.currentCount || 0);
  const average = Number(stats?.groupAverage || 0);
  const diff = myCount - average;
  const myPosition = getPositionPercent(myCount, average);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ScreenHeader title="투로 통계" />

      <Text style={styles.subtitle}>
        같은 입관 기간 그룹의 평균과 비교해 내 투로 기록의 위치를 확인합니다.
      </Text>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator />
          <Text style={styles.emptyText}>통계를 불러오는 중입니다.</Text>
        </View>
      ) : forms.length === 0 ? (
        <View style={styles.historyCard}>
          <Text style={styles.emptyText}>아직 완료한 투로 기록이 없습니다.</Text>
        </View>
      ) : (
        <>
          <View style={styles.tabWrap}>
            {forms.map((item) => {
              const active = item.formKey === activeForm?.formKey;

              return (
                <TouchableOpacity
                  key={item.formKey}
                  activeOpacity={0.88}
                  style={[styles.tabButton, active && styles.tabButtonActive]}
                  onPress={() => setActiveFormKey(item.formKey)}
                >
                  <Text style={[styles.tabText, active && styles.tabTextActive]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {!activeForm || !stats ? (
            <View style={styles.historyCard}>
              <Text style={styles.emptyText}>통계 정보가 아직 없습니다.</Text>
            </View>
          ) : (
            <>
              <View style={styles.historyCard}>
                <Text style={styles.groupLabel}>{stats.groupLabel}</Text>
                <Text style={styles.formTitle}>{activeForm.name}</Text>
                <Text style={styles.periodText}>
                  {activeForm.periodLabel} · {activeForm.periodSub}
                </Text>

                <View style={styles.summaryGrid}>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryValue}>
                      {myCount}
                      <Text style={styles.summaryUnit}>회</Text>
                    </Text>
                    <Text style={styles.summaryLabel}>내 기록</Text>
                  </View>

                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryValue}>
                      {average}
                      <Text style={styles.summaryUnit}>회</Text>
                    </Text>
                    <Text style={styles.summaryLabel}>
                      {stats.groupLabel} 평균
                    </Text>
                  </View>
                </View>

                <Text style={styles.messageText}>
                  {getEncouragingMessage(diff, "회")}
                </Text>
              </View>

              <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>평균 기준 내 위치</Text>

                <View style={styles.positionChart}>
                  <View style={styles.positionLine} />

                  <View style={styles.averageMarker}>
                    <Text style={styles.averageMarkerText}>평균</Text>
                    <View style={styles.averageMarkerLine} />
                  </View>

                  <View
                    style={[
                      styles.myMarker,
                      {
                        left: `${myPosition}%`,
                      },
                    ]}
                  >
                    <Text style={styles.myMarkerText}>내 위치</Text>
                    <View style={styles.myMarkerLine} />
                  </View>
                </View>

                <View style={styles.axisRow}>
                  <Text style={styles.axisText}>적음</Text>
                  <Text style={styles.axisText}>평균</Text>
                  <Text style={styles.axisText}>많음</Text>
                </View>

                <View style={styles.rangeRow}>
                  <Text style={styles.rangeText}>평균의 50%</Text>
                  <Text style={styles.rangeText}>평균</Text>
                  <Text style={styles.rangeText}>평균의 150%</Text>
                </View>

                <Text style={styles.chartHint}>
                  순위가 아니라 평균과의 거리만 부드럽게 보여주는 참고 지표입니다.
                </Text>
              </View>
            </>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 110,
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
    gap: 14,
  },

  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.textSub,
  },

  loadingBox: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    gap: 8,
    ...shadow.card,
  },

  emptyText: {
    fontSize: 14,
    color: colors.textSub,
    textAlign: "center",
  },

  tabWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  tabButton: {
    paddingHorizontal: 13,
    height: 36,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
  },

  tabButtonActive: {
    backgroundColor: colors.warmBrown,
    borderColor: colors.warmBrown,
  },

  tabText: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.textSub,
  },

  tabTextActive: {
    color: "#FFFFFF",
  },

  historyCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },

  groupLabel: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "#F5E6D6",
    fontSize: 12,
    fontWeight: "800",
    color: colors.warmBrown,
    marginBottom: 10,
  },

  formTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.textMain,
  },

  periodText: {
    marginTop: 5,
    fontSize: 12,
    color: colors.textSub,
    marginBottom: 14,
  },

  summaryGrid: {
    flexDirection: "row",
    gap: 10,
  },

  summaryItem: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: "#FFFAF4",
    padding: 12,
  },

  summaryValue: {
    fontSize: 19,
    fontWeight: "800",
    color: colors.warmBrown,
  },

  summaryUnit: {
    fontSize: 12,
    color: colors.textSub,
  },

  summaryLabel: {
    marginTop: 5,
    fontSize: 12,
    color: colors.textSub,
  },

  messageText: {
    marginTop: 14,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSub,
  },

  chartCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: spacing.lg,
    ...shadow.card,
  },

  chartTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.textMain,
    marginBottom: 16,
  },

  positionChart: {
    height: 96,
    borderRadius: 18,
    backgroundColor: "#FFFAF4",
    position: "relative",
    overflow: "visible",
    marginBottom: 10,
  },

  positionLine: {
    position: "absolute",
    left: 22,
    right: 22,
    bottom: 30,
    height: 8,
    borderRadius: 999,
    backgroundColor: "#E7D8C9",
  },

  averageMarker: {
    position: "absolute",
    left: "50%",
    bottom: 30,
    alignItems: "center",
    transform: [{ translateX: -12 }],
  },

  averageMarkerText: {
    marginBottom: 4,
    fontSize: 11,
    color: colors.textSub,
  },

  averageMarkerLine: {
    width: 1,
    height: 52,
    backgroundColor: "#BFAF9F",
  },

  myMarker: {
    position: "absolute",
    bottom: 30,
    alignItems: "center",
    transform: [{ translateX: -18 }],
  },

  myMarkerText: {
    marginBottom: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: "#FFFAF4",
    fontSize: 11,
    fontWeight: "800",
    color: colors.warmBrown,
  },

  myMarkerLine: {
    width: 2,
    height: 58,
    backgroundColor: colors.warmBrown,
    borderRadius: 999,
  },

  axisRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 6,
    marginBottom: 6,
  },

  axisText: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.textSub,
  },

  rangeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 2,
  },

  rangeText: {
    fontSize: 10,
    color: "#B7A295",
  },

  chartHint: {
    marginTop: 12,
    fontSize: 11,
    lineHeight: 16,
    color: colors.textSub,
  },
});