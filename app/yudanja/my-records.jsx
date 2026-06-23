import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import ScreenHeader from "../../src/components/ScreenHeader";
import { useAuth } from "../../src/contexts/AuthContext";
import { getMyYudanjaRecords } from "../../src/api/yudanjaContent";
import { colors } from "../../src/theme";

const fonts = {
  title: "MaruBuriBold",
  semi: "PretendardSemiBold",
  medium: "PretendardMedium",
};

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("ko-KR");
}

export default function MyYudanjaRecordsScreen() {
  const { token } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const itemSummary = useMemo(() => data?.itemSummary || [], [data]);
  const categorySummary = useMemo(() => data?.categorySummary || [], [data]);
  const recentRecords = useMemo(() => data?.recentRecords || [], [data]);

  const maxItemCount = useMemo(() => {
    return Math.max(...itemSummary.map((item) => Number(item.count || 0)), 1);
  }, [itemSummary]);

  const loadData = useCallback(
    async ({ silent = false } = {}) => {
      if (!token) return;

      try {
        if (!silent) setLoading(true);
        setError("");

        const result = await getMyYudanjaRecords(token);
        setData(result || null);
      } catch (err) {
        setError(err?.message || "내 수련기록을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token],
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData({ silent: true });
  }, [loadData]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={styles.loadingText}>내 수련기록을 불러오는 중입니다.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="내 수련기록" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>MY YUDANJA RECORDS</Text>
          <Text style={styles.heroTitle}>나의 유단자회 기록</Text>
          <Text style={styles.heroDesc}>
            출석한 유단자회에서 어떤 항목을 얼마나 수련했는지 확인합니다.
          </Text>
        </View>

        {error ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>불러오기 실패</Text>
            <Text style={styles.emptyText}>{error}</Text>
          </View>
        ) : !data ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>기록이 없습니다.</Text>
            <Text style={styles.emptyText}>
              유단자회 출석과 진도 기록이 저장되면 이곳에 표시됩니다.
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.statGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>총 수련기록</Text>
                <Text style={styles.statValue}>{data.totalRecords || 0}</Text>
                <Text style={styles.statUnit}>건</Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statLabel}>수련항목</Text>
                <Text style={styles.statValue}>{data.totalItemKinds || 0}</Text>
                <Text style={styles.statUnit}>종</Text>
              </View>
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>항목별 누적</Text>

              {itemSummary.length === 0 ? (
                <Text style={styles.emptyInlineText}>아직 항목 기록이 없습니다.</Text>
              ) : (
                <View style={styles.summaryList}>
                  {itemSummary.map((item) => {
                    const percent = Math.max(
                      6,
                      Math.round((Number(item.count || 0) / maxItemCount) * 100),
                    );

                    return (
                      <View key={item.itemId} style={styles.summaryRow}>
                        <View style={styles.summaryTopRow}>
                          <View style={styles.summaryTextWrap}>
                            <Text style={styles.summaryName}>{item.itemName}</Text>
                            <Text style={styles.summaryCategory}>
                              {item.categoryName}
                            </Text>
                          </View>

                          <Text style={styles.summaryCount}>{item.count}회</Text>
                        </View>

                        <View style={styles.progressTrack}>
                          <View
                            style={[
                              styles.progressFill,
                              { width: `${percent}%` },
                            ]}
                          />
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>카테고리별 기록</Text>

              {categorySummary.length === 0 ? (
                <Text style={styles.emptyInlineText}>아직 카테고리 기록이 없습니다.</Text>
              ) : (
                <View style={styles.categoryWrap}>
                  {categorySummary.map((item) => (
                    <View key={item.categoryName} style={styles.categoryPill}>
                      <Text style={styles.categoryName}>{item.categoryName}</Text>
                      <Text style={styles.categoryCount}>{item.count}회</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>최근 수련기록</Text>

              {recentRecords.length === 0 ? (
                <Text style={styles.emptyInlineText}>최근 기록이 없습니다.</Text>
              ) : (
                <View style={styles.recentList}>
                  {recentRecords.map((record) => (
                    <View key={record.id} style={styles.recentRow}>
                      <View>
                        <Text style={styles.recentDate}>
                          {formatDate(record.recordDate)}
                        </Text>
                        <Text style={styles.recentTitle}>
                          {record.item?.name || "항목 없음"}
                        </Text>
                        <Text style={styles.recentSub}>
                          {record.item?.category?.name || "기타"}
                        </Text>
                      </View>

                      <Text style={styles.recentProgressTitle} numberOfLines={1}>
                        {record.progress?.title || "유단자회"}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background || "#FFFCFA",
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  content: {
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    backgroundColor: colors.background || "#FFFCFA",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 10,
    fontFamily: fonts.medium,
    color: "#7A6C63",
  },
  heroCard: {
    borderRadius: 28,
    padding: 22,
    backgroundColor: "#F7EFE4",
    borderWidth: 1,
    borderColor: "#E8D8C4",
    marginBottom: 16,
  },
  heroLabel: {
    fontFamily: fonts.semi,
    fontSize: 11,
    letterSpacing: 1,
    color: "#A47C4F",
  },
  heroTitle: {
    marginTop: 8,
    fontFamily: fonts.title,
    fontSize: 26,
    lineHeight: 34,
    color: colors.textMain || "#3A2C27",
  },
  heroDesc: {
    marginTop: 8,
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 22,
    color: "#6F625A",
  },
  statGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 24,
    padding: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EEE3D8",
  },
  statLabel: {
    fontFamily: fonts.semi,
    fontSize: 12,
    color: "#8A7A68",
  },
  statValue: {
    marginTop: 8,
    fontFamily: fonts.title,
    fontSize: 34,
    color: "#3A2C27",
    lineHeight: 40,
  },
  statUnit: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: "#8A7A68",
  },
  sectionCard: {
    borderRadius: 24,
    padding: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EEE3D8",
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: fonts.title,
    fontSize: 21,
    color: "#3A2C27",
    marginBottom: 14,
  },
  summaryList: {
    gap: 14,
  },
  summaryRow: {
    gap: 8,
  },
  summaryTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  summaryTextWrap: {
    flex: 1,
  },
  summaryName: {
    fontFamily: fonts.semi,
    fontSize: 15,
    color: "#3A2C27",
  },
  summaryCategory: {
    marginTop: 3,
    fontFamily: fonts.medium,
    fontSize: 12,
    color: "#8A7A68",
  },
  summaryCount: {
    fontFamily: fonts.semi,
    fontSize: 14,
    color: "#8A6238",
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: "#F1E8DE",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#C89E6A",
  },
  categoryWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryPill: {
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 8,
    backgroundColor: "#F7EFE4",
    borderWidth: 1,
    borderColor: "#E8D8C4",
    flexDirection: "row",
    gap: 6,
  },
  categoryName: {
    fontFamily: fonts.semi,
    fontSize: 13,
    color: "#3A2C27",
  },
  categoryCount: {
    fontFamily: fonts.semi,
    fontSize: 13,
    color: "#8A6238",
  },
  recentList: {
    gap: 0,
  },
  recentRow: {
    paddingVertical: 13,
    borderTopWidth: 1,
    borderTopColor: "#F1E8DE",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 14,
  },
  recentDate: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: "#A79A90",
  },
  recentTitle: {
    marginTop: 4,
    fontFamily: fonts.semi,
    fontSize: 15,
    color: "#3A2C27",
  },
  recentSub: {
    marginTop: 3,
    fontFamily: fonts.medium,
    fontSize: 12,
    color: "#8A7A68",
  },
  recentProgressTitle: {
    maxWidth: 120,
    alignSelf: "center",
    fontFamily: fonts.medium,
    fontSize: 12,
    color: "#8A7A68",
    textAlign: "right",
  },
  emptyCard: {
    borderRadius: 24,
    padding: 24,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EEE3D8",
    alignItems: "center",
  },
  emptyTitle: {
    fontFamily: fonts.semi,
    fontSize: 17,
    color: "#3A2C27",
  },
  emptyText: {
    marginTop: 8,
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 22,
    color: "#7A6C63",
    textAlign: "center",
  },
  emptyInlineText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 22,
    color: "#8A7A68",
  },
});