import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "../src/contexts/AuthContext";
import { getMyPrivateLessons } from "../src/api/privateLessons";
import { colors } from "../src/theme";

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("ko-KR");
}

export default function PrivateLessonsScreen() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState(null);

  const loadData = useCallback(async () => {
    if (!token) return;

    try {
      const result = await getMyPrivateLessons(token);
      setData(result);
    } catch (error) {
      Alert.alert("오류", error.message || "개인지도 정보를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={styles.loadingText}>개인지도 정보를 불러오는 중입니다.</Text>
      </View>
    );
  }

  const currentPackage = data?.currentPackage;
  const recentLessons = data?.recentLessons || [];
  const history = data?.history || [];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>‹ 태극권</Text>
      </TouchableOpacity>

      <Text style={styles.kicker}>PRIVATE LESSON</Text>
      <Text style={styles.title}>{data?.menuLabel || "개인지도"}</Text>
      <Text style={styles.subtitle}>
        개인지도 이용 현황과 수업 기록을 확인할 수 있습니다.
      </Text>

      {currentPackage ? (
        <View style={styles.heroCard}>
          <Text style={styles.packageTitle}>{currentPackage.title}</Text>
          <Text style={styles.packageDesc}>
            {currentPackage.description || "등록된 개인지도 목표가 없습니다."}
          </Text>

          <View style={styles.countRow}>
            <View style={styles.countBox}>
              <Text style={styles.countLabel}>총 회차</Text>
              <Text style={styles.countValue}>{currentPackage.totalCount}</Text>
            </View>
            <View style={styles.countBox}>
              <Text style={styles.countLabel}>사용</Text>
              <Text style={styles.countValue}>{currentPackage.usedCount}</Text>
            </View>
            <View style={styles.countBoxActive}>
              <Text style={styles.countLabelActive}>잔여</Text>
              <Text style={styles.countValueActive}>
                {currentPackage.remainingCount}
              </Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaText}>지도자 {currentPackage.teacherName || "-"}</Text>
            <Text style={styles.metaText}>
              {formatDate(currentPackage.startDate)} ~{" "}
              {formatDate(currentPackage.expectedEndDate)}
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>진행중인 개인지도는 없습니다.</Text>
          <Text style={styles.emptyText}>지난 개인지도 기록을 확인할 수 있어요.</Text>
        </View>
      )}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>최근 수업</Text>
        {currentPackage ? (
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/private-lessons/[packageId]",
                params: { packageId: currentPackage.id },
              })
            }
          >
            <Text style={styles.linkText}>전체보기 〉</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {recentLessons.length > 0 ? (
        recentLessons.map((lesson) => (
          <TouchableOpacity
            key={lesson.id}
            style={styles.lessonCard}
            activeOpacity={0.86}
            onPress={() =>
              router.push({
                pathname: "/private-lessons/[packageId]",
                params: { packageId: lesson.packageId },
              })
            }
          >
            <Text style={styles.lessonDate}>{formatDate(lesson.lessonDate)}</Text>
            <Text style={styles.lessonContent} numberOfLines={3}>
              {lesson.content || "지도내용이 없습니다."}
            </Text>
            <Text style={styles.lessonMeta}>
              {lesson.teacherName || "-"} · {lesson.deductedCount || 0}회 차감
            </Text>
          </TouchableOpacity>
        ))
      ) : (
        <Text style={styles.emptyListText}>아직 수업 기록이 없습니다.</Text>
      )}

      <Text style={styles.sectionTitle}>지난 개인지도</Text>

      {history.length > 0 ? (
        history.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.historyCard}
            activeOpacity={0.86}
            onPress={() =>
              router.push({
                pathname: "/private-lessons/[packageId]",
                params: { packageId: item.id },
              })
            }
          >
            <View>
              <Text style={styles.historyTitle}>{item.title}</Text>
              <Text style={styles.historyMeta}>
                총 {item.totalCount}회 · 지도자 {item.teacherName || "-"}
              </Text>
            </View>
            <Text style={styles.historyArrow}>〉</Text>
          </TouchableOpacity>
        ))
      ) : (
        <Text style={styles.emptyListText}>완료된 개인지도 기록이 없습니다.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background || "#FFFCFA" },
  content: { padding: 20, paddingBottom: 42 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background || "#FFFCFA",
  },
  loadingText: { marginTop: 10, color: "#8A7568" },
  backButton: { marginBottom: 16 },
  backText: { fontSize: 15, color: "#8A7568", fontWeight: "700" },
  kicker: {
    fontSize: 12,
    letterSpacing: 2,
    color: "#C89E6A",
    fontWeight: "800",
  },
  title: {
    marginTop: 8,
    fontSize: 28,
    color: "#3A2C27",
    fontWeight: "900",
  },
  subtitle: { marginTop: 8, fontSize: 14, color: "#8A7568", lineHeight: 21 },
  heroCard: {
    marginTop: 22,
    padding: 20,
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EFE5DE",
  },
  packageTitle: { fontSize: 22, fontWeight: "900", color: "#3A2C27" },
  packageDesc: { marginTop: 10, fontSize: 14, color: "#7B665B", lineHeight: 22 },
  countRow: { flexDirection: "row", gap: 10, marginTop: 20 },
  countBox: {
    flex: 1,
    padding: 14,
    borderRadius: 18,
    backgroundColor: "#FFFCFA",
    alignItems: "center",
  },
  countBoxActive: {
    flex: 1,
    padding: 14,
    borderRadius: 18,
    backgroundColor: "#3A2C27",
    alignItems: "center",
  },
  countLabel: { fontSize: 12, color: "#9A877D", fontWeight: "700" },
  countValue: { marginTop: 4, fontSize: 24, color: "#3A2C27", fontWeight: "900" },
  countLabelActive: { fontSize: 12, color: "#EAD8BF", fontWeight: "700" },
  countValueActive: { marginTop: 4, fontSize: 24, color: "#FFFFFF", fontWeight: "900" },
  metaRow: { marginTop: 16, gap: 4 },
  metaText: { fontSize: 12, color: "#9A877D" },
  emptyCard: {
    marginTop: 22,
    padding: 22,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EFE5DE",
  },
  emptyTitle: { fontSize: 17, color: "#3A2C27", fontWeight: "800" },
  emptyText: { marginTop: 6, color: "#8A7568" },
  sectionHeader: {
    marginTop: 26,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    marginTop: 26,
    marginBottom: 12,
    fontSize: 18,
    color: "#3A2C27",
    fontWeight: "900",
  },
  linkText: { color: "#C89E6A", fontWeight: "800" },
  lessonCard: {
    padding: 16,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EFE5DE",
    marginBottom: 10,
  },
  lessonDate: { fontSize: 13, color: "#C89E6A", fontWeight: "800" },
  lessonContent: { marginTop: 8, fontSize: 15, color: "#3A2C27", lineHeight: 22 },
  lessonMeta: { marginTop: 8, fontSize: 12, color: "#9A877D" },
  historyCard: {
    padding: 16,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EFE5DE",
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  historyTitle: { fontSize: 16, color: "#3A2C27", fontWeight: "800" },
  historyMeta: { marginTop: 5, fontSize: 12, color: "#9A877D" },
  historyArrow: { fontSize: 24, color: "#C89E6A" },
  emptyListText: { color: "#9A877D", lineHeight: 21 },
});