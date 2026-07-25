import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
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
import {
  formatRecordCount,
  formatRecordDate,
  groupFormHistory,
} from "../src/features/records/recordHistoryUtils";

export default function FormRecordHistoryScreen() {
  const { token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [expandedGroups, setExpandedGroups] = useState({});

  const groupedHistory = useMemo(
    () => groupFormHistory(history),
    [history]
  );

  const loadHistory = useCallback(async () => {
    if (!token) {
      return;
    }

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
        throw new Error(
          result.message || "지난 투로 기록 불러오기 실패"
        );
      }

      setHistory(result.data || []);
    } catch (error) {
      console.log("지난 투로 기록 불러오기 실패:", error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const toggleGroup = useCallback((groupId) => {
    setExpandedGroups((previous) => ({
      ...previous,
      [groupId]: !previous[groupId],
    }));
  }, []);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <ScreenHeader title="지난 투로 기록" />

      <Text style={styles.subtitle}>
        반기별로 쌓아온 투로 수련 기록을 확인합니다.
      </Text>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator />
          <Text style={styles.emptyText}>
            기록을 불러오는 중입니다.
          </Text>
        </View>
      ) : groupedHistory.length === 0 ? (
        <View style={styles.historyCard}>
          <Text style={styles.emptyText}>
            아직 지난 기록이 없습니다.
          </Text>
        </View>
      ) : (
        <>
          {groupedHistory.map((period) => (
            <View
              key={`${period.periodYear}-${period.periodHalf}`}
              style={styles.historyCard}
            >
              <View style={styles.periodHeader}>
                <View style={styles.periodHeading}>
                  <Text style={styles.periodTitle}>
                    {period.periodLabel}
                  </Text>

                  <Text style={styles.periodSub}>
                    {period.periodSub}
                  </Text>
                </View>

                <View style={styles.periodBadge}>
                  <Text style={styles.periodBadgeText}>
                    {period.totalRecords}건 완료
                  </Text>
                </View>
              </View>

              <View style={styles.recordList}>
                {period.formGroups.map((group, groupIndex) => {
                  const groupId = [
                    period.periodYear,
                    period.periodHalf,
                    group.key,
                  ].join("-");

                  const records = group.records;
                  const latestRecord = group.latestRecord;
                  const hasMultipleRecords = records.length > 1;
                  const isExpanded = Boolean(
                    expandedGroups[groupId]
                  );

                  return (
                    <View
                      key={groupId}
                      style={[
                        styles.recordRow,
                        groupIndex === 0 &&
                          styles.firstRecordRow,
                      ]}
                    >
                      <TouchableOpacity
                        activeOpacity={
                          hasMultipleRecords ? 0.72 : 1
                        }
                        disabled={!hasMultipleRecords}
                        onPress={() => toggleGroup(groupId)}
                        style={styles.recordSummary}
                      >
                        <View style={styles.recordTopRow}>
                          <Text style={styles.recordName}>
                            {group.name}
                          </Text>

                          <View style={styles.completedBadge}>
                            <Text style={styles.completedCheck}>
                              ✓
                            </Text>

                            <Text
                              style={styles.completedBadgeText}
                            >
                              {hasMultipleRecords
                                ? `${records.length}회 완료`
                                : "완료"}
                            </Text>
                          </View>
                        </View>

                        {latestRecord ? (
                          <View style={styles.recordMetaRow}>
                            <Text style={styles.recordCount}>
                              {formatRecordCount(
                                latestRecord.currentCount,
                                latestRecord.targetCount,
                                "회"
                              )}
                            </Text>

                            {latestRecord.completedAt ? (
                              <Text style={styles.recordDate}>
                                {hasMultipleRecords
                                  ? "최근 "
                                  : ""}
                                {formatRecordDate(
                                  latestRecord.completedAt
                                )}
                              </Text>
                            ) : null}
                          </View>
                        ) : null}

                        {hasMultipleRecords ? (
                          <View style={styles.expandRow}>
                            <Text style={styles.expandText}>
                              {isExpanded
                                ? "세부 기록 접기"
                                : "세부 기록 펼쳐보기"}
                            </Text>

                            <Text style={styles.expandIcon}>
                              {isExpanded ? "⌃" : "⌄"}
                            </Text>
                          </View>
                        ) : null}
                      </TouchableOpacity>

                      {hasMultipleRecords && isExpanded ? (
                        <View style={styles.detailBox}>
                          {records.map(
                            (record, recordIndex) => (
                              <View
                                key={record.recordKey}
                                style={[
                                  styles.detailRow,
                                  recordIndex === 0 &&
                                    styles.firstDetailRow,
                                ]}
                              >
                                <Text
                                  style={styles.detailCount}
                                >
                                  {formatRecordCount(
                                    record.currentCount,
                                    record.targetCount,
                                    "회"
                                  )}
                                </Text>

                                <Text
                                  style={styles.detailDate}
                                >
                                  {record.completedAt
                                    ? `${formatRecordDate(
                                        record.completedAt
                                      )} 완료`
                                    : "완료일 없음"}
                                </Text>
                              </View>
                            )
                          )}
                        </View>
                      ) : null}
                    </View>
                  );
                })}
              </View>
            </View>
          ))}

          <TouchableOpacity
            activeOpacity={0.88}
            style={styles.statsButton}
            onPress={() => router.push("/form-stats")}
          >
            <Text style={styles.statsButtonText}>
              내 위치 보기
            </Text>
          </TouchableOpacity>
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
    paddingBottom: 80,
    gap: 14,
  },

  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.textSub,
  },

  historyCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: 4,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },

  periodHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    paddingBottom: 14,
  },

  periodHeading: {
    flex: 1,
  },

  periodTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textMain,
  },

  periodSub: {
    marginTop: 4,
    fontSize: 13,
    color: colors.textSub,
  },

  periodBadge: {
    minHeight: 28,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "#F3E9DF",
    alignItems: "center",
    justifyContent: "center",
  },

  periodBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.warmBrown,
  },

  recordList: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  recordRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  firstRecordRow: {
    borderTopWidth: 0,
  },

  recordSummary: {
    paddingVertical: 15,
  },

  recordTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  recordName: {
    flex: 1,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "700",
    color: colors.textMain,
  },

  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  completedCheck: {
    fontSize: 13,
    fontWeight: "900",
    color: colors.bronzeGold,
  },

  completedBadgeText: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.warmBrown,
  },

  recordMetaRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  recordCount: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.warmBrown,
  },

  recordDate: {
    fontSize: 12,
    color: colors.textSub,
  },

  expandRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  expandText: {
    fontSize: 12,
    color: colors.textSub,
  },

  expandIcon: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.softBrown,
  },

  detailBox: {
    marginBottom: 14,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    backgroundColor: "#F8F2EC",
  },

  detailRow: {
    minHeight: 42,
    borderTopWidth: 1,
    borderTopColor: "#E9DDD3",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  firstDetailRow: {
    borderTopWidth: 0,
  },

  detailCount: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.textMain,
  },

  detailDate: {
    fontSize: 12,
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

  statsButton: {
    marginTop: 2,
    height: 52,
    borderRadius: 18,
    backgroundColor: colors.warmBrown,
    alignItems: "center",
    justifyContent: "center",
  },

  statsButtonText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFFFFF",
  },
});