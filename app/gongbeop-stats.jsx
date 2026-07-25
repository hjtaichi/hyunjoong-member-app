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
import { colors } from "../src/theme";
import { useAuth } from "../src/contexts/AuthContext";
import { API_BASE_URL } from "../src/config/env";

const fonts = {
  medium: "PretendardMedium",
  semiBold: "PretendardSemiBold",
  title: "MaruBuriBold",
};

const GONGBEOP_TYPES = [
  { key: "ilsimyangui", name: "일심양의", unit: "회" },
  { key: "yobujeonsa", name: "요부전사", unit: "회" },
  { key: "duyoMinutes", name: "두요", unit: "분" },
  { key: "ohaengjeonsa", name: "오행전사", unit: "회" },
];

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

export default function GongbeopStatsScreen() {
  const { token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [completedGoals, setCompletedGoals] = useState([]);
  const [activeType, setActiveType] = useState("ilsimyangui");

  const loadStats = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/api/member/me/gongbeop-goals?t=${Date.now()}`,
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
        throw new Error(result.message || "공력 통계 불러오기 실패");
      }

      setCompletedGoals(result.data?.completedGoals || []);
    } catch (error) {
      console.log("공력 통계 불러오기 실패:", error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const activeMeta = useMemo(() => {
    return (
      GONGBEOP_TYPES.find((item) => item.key === activeType) ||
      GONGBEOP_TYPES[0]
    );
  }, [activeType]);

  const activeGoal = useMemo(() => {
    return completedGoals.find((item) => item.type === activeType) || null;
  }, [completedGoals, activeType]);

  const stats = activeGoal?.groupStats || null;

  const myCount = Number(stats?.myCount || activeGoal?.current || 0);
  const average = Number(stats?.groupAverage || 0);
  const diff = myCount - average;
  const myPosition = getPositionPercent(myCount, average);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.85}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>공력 통계</Text>

        <View style={{ width: 24 }} />
      </View>

      <Text style={styles.description}>
        같은 입관 기간 그룹의 평균과 비교해 내 수련 위치를 확인합니다.
      </Text>

      <View style={styles.tabWrap}>
        {GONGBEOP_TYPES.map((item) => {
          const active = item.key === activeType;

          return (
            <TouchableOpacity
              key={item.key}
              activeOpacity={0.88}
              style={[styles.tabButton, active && styles.tabButtonActive]}
              onPress={() => setActiveType(item.key)}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {loading ? (
        <View style={styles.emptyCard}>
          <ActivityIndicator />
        </View>
      ) : !activeGoal || !stats ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>
            아직 {activeMeta.name} 완료 기록이 없습니다.
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.summaryCard}>
            <Text style={styles.groupLabel}>{stats.groupLabel}</Text>
            <Text style={styles.summaryTitle}>{activeMeta.name}</Text>

            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>
                  {myCount}
                  <Text style={styles.summaryUnit}>{activeMeta.unit}</Text>
                </Text>
                <Text style={styles.summaryLabel}>내 기록</Text>
              </View>

              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>
                  {average}
                  <Text style={styles.summaryUnit}>{activeMeta.unit}</Text>
                </Text>
                <Text style={styles.summaryLabel}>{stats.groupLabel} 평균</Text>
              </View>
            </View>

            <Text style={styles.messageText}>
              {getEncouragingMessage(diff, activeMeta.unit)}
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 40,
  },

  headerRow: {
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backText: {
    fontSize: 28,
    color: colors.softBrown,
  },

  headerTitle: {
    fontSize: 22,
    fontFamily: fonts.title,
    color: colors.textMain,
  },

  description: {
    marginTop: 24,
    marginBottom: 14,
    fontSize: 13,
    lineHeight: 20,
    fontFamily: fonts.medium,
    color: colors.textSub,
  },

  tabWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 14,
  },

  tabButton: {
    paddingHorizontal: 13,
    height: 36,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#EFE0D4",
    backgroundColor: "#FFFDF9",
    alignItems: "center",
    justifyContent: "center",
  },

  tabButtonActive: {
    backgroundColor: colors.warmBrown,
    borderColor: colors.warmBrown,
  },

  tabText: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: colors.textSub,
  },

  tabTextActive: {
    color: "#FFFFFF",
  },

  emptyCard: {
    minHeight: 80,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#EFE0D4",
    backgroundColor: "#FFFDF9",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },

  emptyText: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colors.textSub,
  },

  summaryCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#EFE0D4",
    backgroundColor: "#FFFDF9",
    padding: 16,
    marginBottom: 12,
  },

  groupLabel: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "#F5E6D6",
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: colors.warmBrown,
    marginBottom: 10,
  },

  summaryTitle: {
    fontSize: 18,
    fontFamily: fonts.title,
    color: colors.textMain,
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
    fontFamily: fonts.semiBold,
    color: colors.warmBrown,
  },

  summaryUnit: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors.textSub,
  },

  summaryLabel: {
    marginTop: 5,
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors.textSub,
  },

  messageText: {
    marginTop: 14,
    fontSize: 13,
    lineHeight: 19,
    fontFamily: fonts.medium,
    color: colors.textSub,
  },

  chartCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#EFE0D4",
    backgroundColor: "#FFFDF9",
    padding: 16,
  },

  chartTitle: {
    fontSize: 17,
    fontFamily: fonts.semiBold,
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
    fontFamily: fonts.medium,
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
    fontFamily: fonts.semiBold,
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
    fontFamily: fonts.semiBold,
    color: colors.textSub,
  },

  rangeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 2,
  },

  rangeText: {
    fontSize: 10,
    fontFamily: fonts.medium,
    color: "#B7A295",
  },

  chartHint: {
    marginTop: 12,
    fontSize: 11,
    lineHeight: 16,
    fontFamily: fonts.medium,
    color: colors.textSub,
  },
});