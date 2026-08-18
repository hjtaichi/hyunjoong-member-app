import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import client from "../src/api/client";
import ScreenHeader from "../src/components/ScreenHeader";
import { colors } from "../src/theme";
import FormHistoryTabs from "../src/features/records/FormHistoryTabs";
import {
  formatKoreaRecordDate,
  formatKoreaRecordTime,
  groupFormActivityByDate,
} from "../src/features/records/formActivityHistoryUtils";

export default function FormActivityByDateScreen() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const load = useCallback(async (refresh = false) => {
    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      setErrorMessage("");

      const response = await client.get(
        "/api/member/me/form-activity-history",
        {
          params: {
            limit: 500,
          },
        }
      );

      setItems(
        response.data?.data?.items || []
      );
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message ||
          error?.message ||
          "수련 기록을 불러오지 못했습니다."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const groups = useMemo(
    () => groupFormActivityByDate(items),
    [items]
  );

  return (
    <View style={styles.screen}>
      <View style={styles.headerWrap}>
        <ScreenHeader title="지난 기록" />
        <FormHistoryTabs activeTab="date" />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={styles.loadingText}>
            기록을 불러오는 중입니다.
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => load(true)}
            />
          }
        >
          <Text style={styles.description}>
            기록한 날짜와 시간을 기준으로 최신 수련부터 보여드립니다.
          </Text>

          {errorMessage ? (
            <View style={styles.noticeCard}>
              <Text style={styles.errorText}>
                {errorMessage}
              </Text>
            </View>
          ) : null}

          {!errorMessage &&
          groups.length === 0 ? (
            <View style={styles.noticeCard}>
              <Text style={styles.emptyTitle}>
                아직 수련 기록이 없습니다.
              </Text>
              <Text style={styles.emptyText}>
                투로 횟수를 기록하면 이곳에 날짜와 시간이 표시됩니다.
              </Text>
            </View>
          ) : null}

          {groups.map((group) => (
            <View
              key={group.key}
              style={styles.dayCard}
            >
              <View style={styles.dayHeader}>
                <Text style={styles.dayTitle}>
                  {formatKoreaRecordDate(
                    group.createdAt
                  )}
                </Text>
                <Text style={styles.daySummary}>
                  총 {group.totalCount}회 ·{" "}
                  {group.formCount}개 투로
                </Text>
              </View>

              <View style={styles.rows}>
                {group.items.map(
                  (item, index) => (
                    <View
                      key={item.id}
                      style={[
                        styles.row,
                        index === 0 &&
                          styles.firstRow,
                      ]}
                    >
                      <Text style={styles.time}>
                        {formatKoreaRecordTime(
                          item.createdAt
                        )}
                      </Text>

                      <Text
                        style={styles.formName}
                        numberOfLines={2}
                      >
                        {item.formName}
                      </Text>

                      <Text style={styles.count}>
                        +{Number(item.count || 0)}회
                      </Text>
                    </View>
                  )
                )}
              </View>
            </View>
          ))}

          {items.length >= 500 ? (
            <Text style={styles.limitText}>
              최근 500건까지 표시됩니다.
            </Text>
          ) : null}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerWrap: {
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  content: {
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  loadingText: {
    fontSize: 13,
    color: "#84786F",
  },
  description: {
    marginTop: 12,
    marginBottom: 14,
    fontSize: 12,
    lineHeight: 18,
    color: "#84786F",
  },
  noticeCard: {
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  errorText: {
    fontSize: 13,
    lineHeight: 20,
    color: "#A24C43",
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#3B332D",
  },
  emptyText: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 18,
    color: "#887B72",
  },
  dayCard: {
    marginBottom: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    overflow: "hidden",
  },
  dayHeader: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.card,
  },
  dayTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#3A312B",
  },
  daySummary: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "600",
    color: "#8A7568",
  },
  rows: {
    paddingHorizontal: 16,
  },
  row: {
    minHeight: 58,
    borderTopWidth: 1,
    borderTopColor: "#EEE6DE",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  firstRow: {
    borderTopWidth: 0,
  },
  time: {
    width: 48,
    fontSize: 12,
    fontWeight: "700",
    color: "#8C7D73",
  },
  formName: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700",
    color: "#423832",
  },
  count: {
    minWidth: 48,
    textAlign: "right",
    fontSize: 14,
    fontWeight: "900",
    color: "#775847",
  },
  limitText: {
    paddingVertical: 10,
    textAlign: "center",
    fontSize: 11,
    color: "#94877D",
  },
});