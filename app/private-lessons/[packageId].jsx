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
import { router, useLocalSearchParams } from "expo-router";
import { useAuth } from "../../src/contexts/AuthContext";
import { getMyPrivateLessonDetail } from "../../src/api/privateLessons";
import { colors } from "../../src/theme";

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("ko-KR");
}

function formatTime(lesson) {
  if (lesson.startTime && lesson.endTime) {
    return `${lesson.startTime} ~ ${lesson.endTime}`;
  }
  if (lesson.startTime) return lesson.startTime;
  return "-";
}

export default function PrivateLessonDetailScreen() {
  const { packageId } = useLocalSearchParams();
  const { token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [detail, setDetail] = useState(null);

  const loadData = useCallback(async () => {
    if (!token || !packageId) return;

    try {
      const result = await getMyPrivateLessonDetail(packageId, token);
      setDetail(result);
    } catch (error) {
      Alert.alert("오류", error.message || "개인지도 상세를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, packageId]);

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
        <Text style={styles.loadingText}>수업 기록을 불러오는 중입니다.</Text>
      </View>
    );
  }

  const lessonPackage = detail?.package;
  const records = detail?.records || [];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>‹ 개인지도</Text>
      </TouchableOpacity>

      <Text style={styles.kicker}>LESSON RECORD</Text>
      <Text style={styles.title}>{lessonPackage?.title || "개인지도 기록"}</Text>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryDesc}>
          {lessonPackage?.description || "등록된 목표 설명이 없습니다."}
        </Text>

        <View style={styles.countRow}>
          <Text style={styles.countText}>
            총 {lessonPackage?.totalCount || 0}회
          </Text>
          <Text style={styles.countText}>
            사용 {lessonPackage?.usedCount || 0}회
          </Text>
          <Text style={styles.countTextStrong}>
            잔여 {lessonPackage?.remainingCount || 0}회
          </Text>
        </View>

        <Text style={styles.metaText}>
          지도자 {lessonPackage?.teacherName || "-"}
        </Text>
        <Text style={styles.metaText}>
          {formatDate(lessonPackage?.startDate)} ~{" "}
          {formatDate(lessonPackage?.expectedEndDate)}
        </Text>
      </View>

      <Text style={styles.sectionTitle}>수업 기록</Text>

      {records.length > 0 ? (
        records.map((lesson, index) => (
          <View key={lesson.id} style={styles.recordCard}>
            <View style={styles.recordHeader}>
              <View>
                <Text style={styles.recordIndex}>{records.length - index}회차</Text>
                <Text style={styles.recordDate}>{formatDate(lesson.lessonDate)}</Text>
              </View>

              <View style={styles.deductBadge}>
                <Text style={styles.deductText}>
                  {lesson.deductedCount || 0}회 차감
                </Text>
              </View>
            </View>

            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>시간</Text>
                <Text style={styles.infoValue}>{formatTime(lesson)}</Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>장소</Text>
                <Text style={styles.infoValue}>{lesson.place || "-"}</Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>지도자</Text>
                <Text style={styles.infoValue}>{lesson.teacherName || "-"}</Text>
              </View>
            </View>

            {lesson.subjects?.length > 0 ? (
              <View style={styles.subjectRow}>
                {lesson.subjects.map((subject) => (
                  <Text key={subject} style={styles.subjectPill}>
                    {subject}
                  </Text>
                ))}
              </View>
            ) : null}

            <Text style={styles.blockLabel}>지도내용</Text>
            <Text style={styles.blockText}>
              {lesson.content || "등록된 지도내용이 없습니다."}
            </Text>

            {lesson.homework ? (
              <>
                <Text style={styles.blockLabel}>다음 수련 포인트</Text>
                <Text style={styles.blockText}>{lesson.homework}</Text>
              </>
            ) : null}
          </View>
        ))
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>아직 수업 기록이 없습니다.</Text>
          <Text style={styles.emptyText}>
            관리자가 수업 기록을 입력하면 이곳에 표시됩니다.
          </Text>
        </View>
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
    fontSize: 27,
    color: "#3A2C27",
    fontWeight: "900",
    lineHeight: 35,
  },
  summaryCard: {
    marginTop: 20,
    padding: 20,
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EFE5DE",
  },
  summaryDesc: {
    fontSize: 14,
    color: "#7B665B",
    lineHeight: 22,
  },
  countRow: {
    marginTop: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  countText: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#FFFCFA",
    color: "#7B665B",
    fontWeight: "800",
    fontSize: 12,
  },
  countTextStrong: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#3A2C27",
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 12,
  },
  metaText: {
    marginTop: 8,
    fontSize: 12,
    color: "#9A877D",
  },
  sectionTitle: {
    marginTop: 26,
    marginBottom: 12,
    fontSize: 18,
    color: "#3A2C27",
    fontWeight: "900",
  },
  recordCard: {
    marginBottom: 14,
    padding: 18,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EFE5DE",
  },
  recordHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  recordIndex: {
    fontSize: 13,
    color: "#C89E6A",
    fontWeight: "900",
  },
  recordDate: {
    marginTop: 4,
    fontSize: 18,
    color: "#3A2C27",
    fontWeight: "900",
  },
  deductBadge: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "#FFFCFA",
  },
  deductText: {
    fontSize: 12,
    color: "#8A7568",
    fontWeight: "800",
  },
  infoGrid: {
    marginTop: 16,
    gap: 8,
  },
  infoItem: {
    padding: 12,
    borderRadius: 16,
    backgroundColor: "#FFFCFA",
  },
  infoLabel: {
    fontSize: 11,
    color: "#B09A8C",
    fontWeight: "800",
  },
  infoValue: {
    marginTop: 4,
    fontSize: 14,
    color: "#3A2C27",
    fontWeight: "700",
  },
  subjectRow: {
    marginTop: 14,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  subjectPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(200,158,106,0.12)",
    color: "#9B7650",
    fontSize: 12,
    fontWeight: "800",
  },
  blockLabel: {
    marginTop: 16,
    fontSize: 12,
    color: "#C89E6A",
    fontWeight: "900",
  },
  blockText: {
    marginTop: 6,
    fontSize: 15,
    lineHeight: 23,
    color: "#3A2C27",
  },
  emptyCard: {
    padding: 22,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EFE5DE",
  },
  emptyTitle: {
    fontSize: 17,
    color: "#3A2C27",
    fontWeight: "800",
  },
  emptyText: {
    marginTop: 6,
    color: "#8A7568",
    lineHeight: 21,
  },
});