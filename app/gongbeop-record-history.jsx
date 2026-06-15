import React, { useCallback, useEffect, useState } from "react";
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

const GONGBEOP_LABELS = {
  ilsimyangui: { name: "일심양의", unit: "회" },
  yobujeonsa: { name: "요부전사", unit: "회" },
  duyoMinutes: { name: "두요", unit: "분" },
  ohaengjeonsa: { name: "오행전사", unit: "회" },
};

function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("ko-KR");
}

export default function GongbeopRecordHistoryScreen() {
  const { token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [completedGoals, setCompletedGoals] = useState([]);

  const loadCompletedGoals = useCallback(async () => {
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
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "완료 기록 불러오기 실패");
      }

      setCompletedGoals(result.data?.completedGoals || []);
    } catch (error) {
      console.log("공력 완료 기록 불러오기 실패:", error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadCompletedGoals();
  }, [loadCompletedGoals]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.85}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>완료 공력 기록</Text>

        <View style={{ width: 24 }} />
      </View>

      <Text style={styles.description}>
        목표를 달성한 공력 수련 기록을 확인합니다.
      </Text>

      {loading ? (
        <View style={styles.emptyCard}>
          <ActivityIndicator />
        </View>
      ) : completedGoals.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>아직 완료 기록이 없습니다.</Text>
        </View>
      ) : (
        <>
          <View style={styles.recordList}>
            {completedGoals.map((item) => {
              const info = GONGBEOP_LABELS[item.type] || {
                name: item.type,
                unit: "회",
              };

              return (
                <View key={item.id} style={styles.recordCard}>
                  <View>
                    <Text style={styles.recordTitle}>{info.name}</Text>
                    <Text style={styles.recordDate}>
                      {formatDate(item.completedAt)} 완료
                    </Text>
                  </View>

                  <Text style={styles.recordCount}>
                    {item.current} / {item.target}
                    <Text style={styles.recordUnit}>{info.unit}</Text>
                  </Text>
                </View>
              );
            })}
          </View>

          <TouchableOpacity
            activeOpacity={0.88}
            style={styles.statsButton}
            onPress={() => router.push("/gongbeop-stats")}
          >
            <Text style={styles.statsButtonText}>내 위치 보기</Text>
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
    fontFamily: fonts.medium,
    color: colors.textSub,
  },

  emptyCard: {
    minHeight: 46,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#EFE0D4",
    backgroundColor: "#FFFDF9",
    alignItems: "center",
    justifyContent: "center",
  },

  emptyText: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colors.textSub,
  },

  recordList: {
    gap: 10,
  },

  recordCard: {
    minHeight: 72,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#EFE0D4",
    backgroundColor: "#FFFDF9",
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  recordTitle: {
    fontSize: 17,
    fontFamily: fonts.semiBold,
    color: colors.textMain,
  },

  recordDate: {
    marginTop: 5,
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors.textSub,
  },

  recordCount: {
    fontSize: 18,
    fontFamily: fonts.semiBold,
    color: colors.warmBrown,
  },

  recordUnit: {
    fontSize: 13,
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