import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { colors, radius, shadow, spacing } from "../src/theme";
import { useAuth } from "../src/contexts/AuthContext";
import { API_BASE_URL } from "../src/config/env";
import ScreenHeader from "../src/components/ScreenHeader";

export default function FormRecordHistoryScreen() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);

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
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "지난 투로 기록 불러오기 실패");
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ScreenHeader title="지난 투로 기록" />
      <Text style={styles.subtitle}>
        반기별로 쌓아온 투로 수련 기록을 확인합니다.
      </Text>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator />
          <Text style={styles.emptyText}>기록을 불러오는 중입니다.</Text>
        </View>
      ) : history.length === 0 ? (
        <View style={styles.historyCard}>
          <Text style={styles.emptyText}>아직 지난 기록이 없습니다.</Text>
        </View>
      ) : (
        history.map((period) => (
          <View
            key={`${period.periodYear}-${period.periodHalf}`}
            style={styles.historyCard}
          >
            <Text style={styles.periodTitle}>{period.periodLabel}</Text>
            <Text style={styles.periodSub}>{period.periodSub}</Text>

            {period.forms.map((item) => {
              const target = Number(item.targetCount || 0);
              const current = Number(item.currentCount || 0);
              const percent = target
                ? Math.min(Math.round((current / target) * 100), 100)
                : 0;

              return (
                <View key={item.formKey} style={styles.recordRow}>
                  <View style={styles.recordTopRow}>
                    <Text style={styles.recordName}>{item.name}</Text>
                    <Text style={styles.recordPercent}>{percent}%</Text>
                  </View>

                  <Text style={styles.recordCount}>
                    {current} / {target}회
                  </Text>
                  {item.completedAt ? (
  <Text style={styles.recordDate}>
    {new Date(item.completedAt).toLocaleDateString("ko-KR")} 완료
  </Text>
) : null}

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
        ))
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
  historyCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  periodTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.textMain,
  },
  periodSub: {
    marginTop: 4,
    fontSize: 13,
    color: colors.textSub,
    marginBottom: 14,
  },
  recordRow: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  recordTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  recordName: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: colors.textMain,
  },
  recordPercent: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.warmBrown,
  },
  recordCount: {
    marginTop: 5,
    fontSize: 13,
    color: colors.warmBrown,
    fontWeight: "800",
  },
  progressTrack: {
    height: 8,
    marginTop: 8,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "#EDE5DD",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: colors.bronzeGold,
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
  recordDate: {
  marginTop: 4,
  fontSize: 12,
  color: colors.textSub,
},
});