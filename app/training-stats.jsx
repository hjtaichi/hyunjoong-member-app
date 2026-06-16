import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "../src/contexts/AuthContext";
import { getMemberHome } from "../src/api/memberHome";
import { colors } from "../src/theme/colors";
import ScreenHeader from "../src/components/ScreenHeader";

function formatDate(value) {
  if (!value) return "-";
  return String(value).slice(0, 10);
}

export default function TrainingStatsScreen() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [homeData, setHomeData] = useState(null);
  const [chartWidth, setChartWidth] = useState(0);

  useEffect(() => {
    async function load() {
      if (!token) return;

      try {
        const result = await getMemberHome(token);
        setHomeData(result);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [token]);

  const member = homeData?.member || {};
  const trainingStats = homeData?.trainingStats || {};

  const attendanceCount =
    member?.totalAttendanceCount ??
    member?.attendanceCount ??
    homeData?.totalAttendanceCount ??
    0;

  const monthlyData = useMemo(() => {
    return trainingStats.monthlyAttendanceTrend || [];
  }, [trainingStats]);

  const maxMonthCount = Math.max(
    1,
    ...monthlyData.map((item) => Number(item.count || 0))
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>수련 통계를 불러오는 중입니다.</Text>
      </View>
    );
  }

  return (
    <View style={styles.bg}>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <ScreenHeader title="내 수련 통계" />

<Text style={styles.subtitle}>최근 1년간의 수련 흐름</Text>

        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>총 출석일</Text>
            <Text style={styles.summaryValue}>{attendanceCount}일</Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>예상 수련 시간</Text>
            <Text style={styles.summaryValue}>
              {Math.floor(attendanceCount * 1.5)}시간
            </Text>
          </View>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>이번 달 출석</Text>
            <Text style={styles.infoValue}>
              {trainingStats.monthlyAttendanceCount ?? "-"}일
            </Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>최근 출석일</Text>
            <Text style={styles.infoValue}>
              {formatDate(trainingStats.recentAttendanceDate)}
            </Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>최다 요일</Text>
            <Text style={styles.infoValue}>
              {trainingStats.favoriteWeekdayLabel || "-"}
            </Text>
          </View>
        </View>

        <View style={styles.chartCard}>
          <Text style={styles.sectionTitle}>최근 12개월 출석</Text>
          <Text style={styles.sectionDesc}>
            월별 출석일을 한눈에 확인할 수 있어요.
          </Text>

          {monthlyData.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>
                아직 월별 통계 데이터가 없습니다.
              </Text>
            </View>
          ) : (
            <View
  style={styles.barChart}
  onLayout={(event) => {
    setChartWidth(event.nativeEvent.layout.width);
  }}
>
  <View style={styles.chartLineLayer} pointerEvents="none">
  {chartWidth > 0 &&
    monthlyData.map((item, index) => {
      if (index === monthlyData.length - 1) return null;

      const current = Number(item.count || 0);
      const next = Number(monthlyData[index + 1]?.count || 0);

      const chartHeight = 130;
      const itemCount = monthlyData.length;
      const pointGap = itemCount > 1 ? chartWidth / itemCount : 0;

      const currentY =
        chartHeight - Math.max(6, (current / maxMonthCount) * chartHeight);
      const nextY =
        chartHeight - Math.max(6, (next / maxMonthCount) * chartHeight);

      const dx = pointGap;
      const dy = nextY - currentY;
      const length = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);

      return (
        <View
          key={`line-${index}`}
          style={[
            styles.chartLine,
            {
              left: index * pointGap + pointGap / 2,
              top: currentY + 4,
              width: length,
              transform: [{ rotate: `${angle}rad` }],
            },
          ]}
        />
      );
    })}
</View>

  {monthlyData.map((item) => {
    const count = Number(item.count || 0);
    const height = Math.max(6, (count / maxMonthCount) * 130);

    return (
      <View key={item.month} style={styles.barItem}>
        <View style={styles.barTrack}>
          <View style={[styles.barFill, { height }]} />
        </View>
        <Text style={styles.barValue}>{count}</Text>
        <Text style={styles.barLabel}>{item.month}</Text>
      </View>
    );
  })}
</View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: "#F7F1E8",
  },
  screen: {
    flex: 1,
  },
  content: {
  paddingHorizontal: 16,
  paddingTop: 22,
  paddingBottom: 40,
  gap: 16,
},
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F7F1E8",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: colors.textSub,
  },
  subtitle: {
  marginTop: -14,
  marginBottom: 10,
  fontSize: 14,
  color: colors.textSub,
  textAlign: "center",
},
  summaryCard: {
    flexDirection: "row",
    borderRadius: 28,
    backgroundColor: "rgba(255, 253, 249, 0.94)",
    borderWidth: 1,
    borderColor: "rgba(232, 222, 210, 0.95)",
    paddingVertical: 20,
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryDivider: {
    width: 1,
    backgroundColor: "rgba(232, 222, 210, 0.9)",
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.textSub,
  },
  summaryValue: {
    marginTop: 6,
    fontSize: 25,
    fontWeight: "700",
    color: colors.textMain,
  },
  infoGrid: {
    flexDirection: "row",
    gap: 8,
  },
  infoBox: {
    flex: 1,
    borderRadius: 22,
    backgroundColor: "rgba(255, 253, 249, 0.9)",
    borderWidth: 1,
    borderColor: "rgba(232, 222, 210, 0.8)",
    paddingVertical: 15,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 11,
    color: colors.textSub,
  },
  infoValue: {
    marginTop: 6,
    fontSize: 15,
    fontWeight: "700",
    color: colors.textMain,
    textAlign: "center",
  },
  chartCard: {
    borderRadius: 28,
    backgroundColor: "rgba(255, 253, 249, 0.94)",
    borderWidth: 1,
    borderColor: "rgba(232, 222, 210, 0.95)",
    padding: 18,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "900",
    color: colors.textMain,
  },
  sectionDesc: {
    marginTop: 5,
    fontSize: 13,
    color: colors.textSub,
  },
  emptyBox: {
    marginTop: 18,
    borderRadius: 22,
    backgroundColor: "rgba(250, 246, 238, 0.88)",
    paddingVertical: 36,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 13,
    color: colors.textSub,
  },
  barChart: {
    marginTop: 20,
    height: 190,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 5,
  },
  barItem: {
    flex: 1,
    alignItems: "center",
  },
  barTrack: {
    height: 130,
    width: "100%",
    borderRadius: 999,
    backgroundColor: "rgba(232, 222, 210, 0.55)",
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  barFill: {
    width: "100%",
    borderRadius: 999,
    backgroundColor: "#D6AA55",
  },
  barValue: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: "900",
    color: colors.textMain,
  },
  barLabel: {
    marginTop: 3,
    fontSize: 10,
    color: colors.textSub,
  },
  chartLineLayer: {
  position: "absolute",
  left: 0,
  right: 0,
  top: 0,
  height: 130,
  zIndex: 5,
},

chartLine: {
  position: "absolute",
  height: 2,
  borderRadius: 999,
  backgroundColor: "#B88A35",
  transformOrigin: "left center",
},
});