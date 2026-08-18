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
import {
  useLocalSearchParams,
} from "expo-router";
import client from "../../src/api/client";
import ScreenHeader from "../../src/components/ScreenHeader";
import { colors } from "../../src/theme";
import {
  formatKoreaRecordDate,
  formatKoreaRecordTime,
} from "../../src/features/records/formActivityHistoryUtils";

export default function OneFormActivityScreen() {
  const params = useLocalSearchParams();
  const formKey = String(
    params.formKey || ""
  );
  const paramFormName = String(
    params.formName || ""
  );

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const load = useCallback(async (refresh = false) => {
    if (!formKey) {
      return;
    }

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
            formKey,
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
  }, [formKey]);

  useEffect(() => {
    load();
  }, [load]);

  const formName =
    items[0]?.formName ||
    paramFormName ||
    formKey;

  const totalCount = useMemo(
    () =>
      items.reduce(
        (sum, item) =>
          sum + Number(item?.count || 0),
        0
      ),
    [items]
  );

  return (
    <View style={styles.screen}>
      <View style={styles.headerWrap}>
        <ScreenHeader title={formName || "투로 수련 기록"} />
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
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>
              기록 합계
            </Text>
            <Text style={styles.summaryCount}>
              {totalCount}
              <Text style={styles.summaryUnit}>
                회
              </Text>
            </Text>
            <Text style={styles.summaryMeta}>
              총 {items.length}건의 수련 기록
            </Text>
          </View>

          {errorMessage ? (
            <View style={styles.noticeCard}>
              <Text style={styles.errorText}>
                {errorMessage}
              </Text>
            </View>
          ) : null}

          {!errorMessage &&
          items.length === 0 ? (
            <View style={styles.noticeCard}>
              <Text style={styles.emptyTitle}>
                아직 이 투로의 기록이 없습니다.
              </Text>
            </View>
          ) : null}

          <View style={styles.listCard}>
            {items.map((item, index) => (
              <View
                key={item.id}
                style={[
                  styles.row,
                  index === 0 &&
                    styles.firstRow,
                ]}
              >
                <View style={styles.dateWrap}>
                  <Text style={styles.date}>
                    {formatKoreaRecordDate(
                      item.createdAt
                    )}
                  </Text>
                  <Text style={styles.time}>
                    {formatKoreaRecordTime(
                      item.createdAt
                    )}
                  </Text>
                </View>

                <Text style={styles.count}>
                  +{Number(item.count || 0)}회
                </Text>
              </View>
            ))}
          </View>

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
  summaryCard: {
    marginTop: 14,
    marginBottom: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 18,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#86766C",
  },
  summaryCount: {
    marginTop: 4,
    fontSize: 28,
    fontWeight: "900",
    color: "#49382E",
  },
  summaryUnit: {
    fontSize: 15,
    fontWeight: "800",
  },
  summaryMeta: {
    marginTop: 5,
    fontSize: 12,
    color: "#8A7C72",
  },
  noticeCard: {
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    marginBottom: 12,
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
  listCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    overflow: "hidden",
  },
  row: {
    minHeight: 68,
    borderTopWidth: 1,
    borderTopColor: "#EEE6DE",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  firstRow: {
    borderTopWidth: 0,
  },
  dateWrap: {
    flex: 1,
  },
  date: {
    fontSize: 13,
    fontWeight: "700",
    color: "#443A34",
  },
  time: {
    marginTop: 4,
    fontSize: 12,
    color: "#8A7C72",
  },
  count: {
    fontSize: 15,
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