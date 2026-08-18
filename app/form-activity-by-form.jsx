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
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import client from "../src/api/client";
import ScreenHeader from "../src/components/ScreenHeader";
import { colors } from "../src/theme";
import FormHistoryTabs from "../src/features/records/FormHistoryTabs";
import {
  formatKoreaRecordShortDate,
  groupFormActivityByForm,
} from "../src/features/records/formActivityHistoryUtils";

export default function FormActivityByFormScreen() {
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
    () => groupFormActivityByForm(items),
    [items]
  );

  return (
    <View style={styles.screen}>
      <View style={styles.headerWrap}>
        <ScreenHeader title="지난 기록" />
        <FormHistoryTabs activeTab="form" />
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
            기록이 있는 투로를 선택하면 해당 투로의 날짜별 내역을 볼 수 있습니다.
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
            </View>
          ) : null}

          {groups.map((group) => (
            <TouchableOpacity
              key={group.formKey}
              style={styles.formCard}
              activeOpacity={0.82}
              onPress={() =>
                router.push({
                  pathname:
                    "/form-activity-by-form/[formKey]",
                  params: {
                    formKey: group.formKey,
                    formName:
                      group.formName,
                  },
                })
              }
            >
              <View style={styles.formTextWrap}>
                <Text style={styles.formName}>
                  {group.formName}
                </Text>
                <Text style={styles.formMeta}>
                  기록 합계 {group.totalCount}회 ·{" "}
                  {group.items.length}건
                </Text>
                <Text style={styles.formRecent}>
                  최근{" "}
                  {formatKoreaRecordShortDate(
                    group.latestAt
                  )}
                </Text>
              </View>

              <Text style={styles.arrow}>〉</Text>
            </TouchableOpacity>
          ))}

          {items.length >= 500 ? (
            <Text style={styles.limitText}>
              최근 500건을 기준으로 표시됩니다.
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
  formCard: {
    minHeight: 94,
    marginBottom: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingHorizontal: 17,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  formTextWrap: {
    flex: 1,
  },
  formName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#3A312B",
  },
  formMeta: {
    marginTop: 7,
    fontSize: 13,
    fontWeight: "700",
    color: "#745847",
  },
  formRecent: {
    marginTop: 4,
    fontSize: 12,
    color: "#8A7C72",
  },
  arrow: {
    fontSize: 22,
    color: "#8A6A58",
  },
  limitText: {
    paddingVertical: 10,
    textAlign: "center",
    fontSize: 11,
    color: "#94877D",
  },
});