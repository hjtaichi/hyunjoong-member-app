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
import { colors } from "../src/theme";
import { useAuth } from "../src/contexts/AuthContext";
import { API_BASE_URL } from "../src/config/env";
import {
  formatNumber,
  groupGongbeopGoals,
} from "../src/features/records/recordHistoryUtils";

const fonts = {
  medium: "PretendardMedium",
  semiBold: "PretendardSemiBold",
  title: "MaruBuriBold",
};

const GONGBEOP_LABELS = {
  ilsimyangui: {
    name: "일심양의",
    unit: "회",
  },
  yobujeonsa: {
    name: "요부전사",
    unit: "회",
  },
  duyoMinutes: {
    name: "두요",
    unit: "분",
  },
  ohaengjeonsa: {
    name: "오행전사",
    unit: "회",
  },
};

export default function GongbeopRecordHistoryScreen() {
  const { token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [completedGoals, setCompletedGoals] = useState([]);

  const groupedGoals = useMemo(
    () => groupGongbeopGoals(completedGoals),
    [completedGoals]
  );

  const loadCompletedGoals = useCallback(async () => {
    if (!token) {
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/api/member/me/gongbeop-goals?t=${Date.now()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "완료 기록 불러오기 실패"
        );
      }

      setCompletedGoals(
        result.data?.completedGoals || []
      );
    } catch (error) {
      console.log(
        "공력 완료 기록 불러오기 실패:",
        error
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadCompletedGoals();
  }, [loadCompletedGoals]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.85}
          style={styles.backButton}
        >
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          완료 공력 기록
        </Text>

        <View style={styles.headerSpacer} />
      </View>

      <Text style={styles.description}>
        목표를 달성한 공력 수련 기록을 확인합니다.
      </Text>

      {loading ? (
        <View style={styles.emptyCard}>
          <ActivityIndicator />

          <Text style={styles.emptyText}>
            기록을 불러오는 중입니다.
          </Text>
        </View>
      ) : groupedGoals.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>
            아직 완료 기록이 없습니다.
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.monthList}>
            {groupedGoals.map((monthGroup) => (
              <View
                key={monthGroup.key}
                style={styles.monthCard}
              >
                <View style={styles.monthHeader}>
                  <Text style={styles.monthTitle}>
                    {monthGroup.monthLabel}
                  </Text>

                  <View style={styles.monthBadge}>
                    <Text style={styles.monthBadgeText}>
                      {monthGroup.totalRecords}건 완료
                    </Text>
                  </View>
                </View>

                <View style={styles.dateList}>
                  {monthGroup.dateGroups.map(
                    (dateGroup, dateIndex) => (
                      <View
                        key={dateGroup.key}
                        style={[
                          styles.dateSection,
                          dateIndex === 0 &&
                            styles.firstDateSection,
                        ]}
                      >
                        <Text style={styles.dateLabel}>
                          {dateGroup.dateLabel}
                        </Text>

                        <View style={styles.dateRecords}>
                          {dateGroup.items.map(
                            (item, itemIndex) => {
                              const info =
                                GONGBEOP_LABELS[
                                  item.type
                                ] || {
                                  name: item.type,
                                  unit: "회",
                                };

                              const itemKey =
                                item.id ||
                                [
                                  dateGroup.key,
                                  item.type,
                                  item.current,
                                  item.target,
                                  itemIndex,
                                ].join("-");

                              return (
                                <View
                                  key={itemKey}
                                  style={[
                                    styles.recordRow,
                                    itemIndex === 0 &&
                                      styles.firstRecordRow,
                                  ]}
                                >
                                  <Text
                                    style={
                                      styles.recordTitle
                                    }
                                  >
                                    {info.name}
                                  </Text>

                                  <View
                                    style={
                                      styles.recordValue
                                    }
                                  >
                                    <Text
                                      style={
                                        styles.recordCount
                                      }
                                    >
                                      {formatNumber(
                                        item.current
                                      )}

                                      <Text
                                        style={
                                          styles.recordDivider
                                        }
                                      >
                                        {" / "}
                                      </Text>

                                      {formatNumber(
                                        item.target
                                      )}
                                    </Text>

                                    <Text
                                      style={
                                        styles.recordUnit
                                      }
                                    >
                                      {info.unit}
                                    </Text>
                                  </View>
                                </View>
                              );
                            }
                          )}
                        </View>
                      </View>
                    )
                  )}
                </View>
              </View>
            ))}
          </View>

          <TouchableOpacity
            activeOpacity={0.88}
            style={styles.statsButton}
            onPress={() =>
              router.push("/gongbeop-stats")
            }
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
    paddingBottom: 40,
  },

  headerRow: {
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backButton: {
    width: 24,
    height: 44,
    alignItems: "flex-start",
    justifyContent: "center",
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

  headerSpacer: {
    width: 24,
  },

  description: {
    marginTop: 24,
    marginBottom: 14,
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colors.textSub,
  },

  emptyCard: {
    minHeight: 84,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#EFE0D4",
    backgroundColor: "#FFFDF9",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  emptyText: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colors.textSub,
    textAlign: "center",
  },

  monthList: {
    gap: 12,
  },

  monthCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#EFE0D4",
    backgroundColor: "#FFFDF9",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
  },

  monthHeader: {
    paddingBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  monthTitle: {
    flex: 1,
    fontSize: 18,
    fontFamily: fonts.semiBold,
    color: colors.textMain,
  },

  monthBadge: {
    minHeight: 28,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "#F3E9DF",
    alignItems: "center",
    justifyContent: "center",
  },

  monthBadgeText: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: colors.warmBrown,
  },

  dateList: {
    borderTopWidth: 1,
    borderTopColor: "#EFE0D4",
  },

  dateSection: {
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: "#EFE0D4",
  },

  firstDateSection: {
    borderTopWidth: 0,
  },

  dateLabel: {
    marginBottom: 7,
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: colors.textSub,
  },

  dateRecords: {
    paddingLeft: 2,
  },

  recordRow: {
    minHeight: 40,
    borderTopWidth: 1,
    borderTopColor: "#F2E8E0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  firstRecordRow: {
    borderTopWidth: 0,
  },

  recordTitle: {
    flex: 1,
    fontSize: 15,
    fontFamily: fonts.semiBold,
    color: colors.textMain,
  },

  recordValue: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 3,
  },

  recordCount: {
    fontSize: 15,
    fontFamily: fonts.semiBold,
    color: colors.warmBrown,
  },

  recordDivider: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colors.textSub,
  },

  recordUnit: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors.textSub,
  },

  statsButton: {
    marginTop: 16,
    height: 52,
    borderRadius: 18,
    backgroundColor: colors.warmBrown,
    alignItems: "center",
    justifyContent: "center",
  },

  statsButtonText: {
    fontSize: 15,
    fontFamily: fonts.semiBold,
    color: "#FFFFFF",
  },
});