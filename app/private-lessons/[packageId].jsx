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
import { useLocalSearchParams } from "expo-router";
import { useAuth } from "../../src/contexts/AuthContext";
import { getMyPrivateLessonDetail } from "../../src/api/privateLessons";
import { colors } from "../../src/theme";
import ScreenHeader from "../../src/components/ScreenHeader";

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("ko-KR");
}
const fonts = {
  regular: "PretendardRegular",
  medium: "PretendardMedium",
  semiBold: "PretendardSemiBold",
  bold: "PretendardBold",
  title: "MaruBuriBold",
  titleSemi: "MaruBuriSemiBold",
};
function formatTime(lesson) {
  if (lesson?.startTime && lesson?.endTime) {
    return `${lesson.startTime} ~ ${lesson.endTime}`;
  }
  if (lesson?.startTime) return lesson.startTime;
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
      <ScreenHeader title="수업 기록 상세" />

      <View style={styles.summaryCard}>
        <View style={styles.summaryTopRow}>
          <View style={styles.summaryTextWrap}>
            <Text style={styles.dateRange}>
              {formatDate(lessonPackage?.startDate)} ~{" "}
              {formatDate(lessonPackage?.expectedEndDate)}
            </Text>

            <Text style={styles.title}>{lessonPackage?.title || "개인지도 기록"}</Text>
          </View>

          <View style={styles.statusPill}>
            <Text style={styles.statusPillText}>
              {lessonPackage?.status === "active" ? "진행중" : "완료"}
            </Text>
          </View>
        </View>

        <View style={styles.summaryDivider} />

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>지도 목표</Text>
          <Text style={styles.infoValueMultiline}>
            {lessonPackage?.description || "등록된 목표 설명이 없습니다."}
          </Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>수업 기록</Text>
        <Text style={styles.sectionCount}>{records.length}건</Text>
      </View>

      {records.length > 0 ? (
        records.map((lesson, index) => (
          <View key={lesson.id} style={styles.recordCard}>
            <View style={styles.recordTopRow}>
              <View>
                <Text style={styles.recordDate}>
                  {formatDate(lesson.lessonDate)} {formatTime(lesson)}
                </Text>
                <Text style={styles.recordTitle}>{lessonPackage?.title || "개인지도"}</Text>
              </View>

              <View style={styles.lessonBadge}>
                <Text style={styles.lessonBadgeText}>
                  {records.length - index}회차
                </Text>
              </View>
            </View>

            <View style={styles.detailGrid}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>지도 시간</Text>
                <Text style={styles.detailValue}>{formatTime(lesson)}</Text>
              </View>
            </View>

            {lesson.subjects?.length > 0 ? (
              <View style={styles.block}>
                <Text style={styles.blockTitle}>지도 항목</Text>
                <View style={styles.subjectRow}>
                  {lesson.subjects.map((subject) => (
                    <Text key={subject} style={styles.subjectPill}>
                      {subject}
                    </Text>
                  ))}
                </View>
              </View>
            ) : null}

            <View style={styles.block}>
              <Text style={styles.blockTitle}>지도 내용 / 메모</Text>
              <Text style={styles.blockText}>
                {lesson.content || "등록된 지도내용이 없습니다."}
              </Text>
            </View>

            {lesson.homework ? (
              <View style={styles.block}>
                <Text style={styles.blockTitle}>다음 수련 포인트</Text>
                <Text style={styles.blockText}>{lesson.homework}</Text>
              </View>
            ) : null}

            {lesson.nextReservationTime ? (
  <View style={styles.block}>
    <Text style={styles.blockTitle}>다음 약속 메모</Text>
    <Text style={styles.blockText}>{lesson.nextReservationTime}</Text>
  </View>
) : null}

            <View style={styles.recordFooter}>
              <Text style={styles.recordFooterText}>
                사용 회차 {lesson.deductedCount || 0}회 차감
              </Text>
            </View>
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

      <View style={styles.noteCard}>
        <Text style={styles.noteTitle}>기록 안내</Text>
        <Text style={styles.noteText}>
          완료된 개인지도는 최근 순으로 표시됩니다. 지도 내용은 추후 수련을 되돌아보기 위한 개인 기록으로 남습니다.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background || "#FFFCFA",
  },
  content: {
    padding: 18,
    paddingBottom: 42,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background || "#FFFCFA",
  },
  loadingText: {
    marginTop: 10,
    color: "#8A7568",
  },
  summaryCard: {
    marginTop: 8,
    padding: 18,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EFE5DE",
  },
  summaryTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start",
  },
  summaryTextWrap: {
    flex: 1,
  },
  dateRange: {
  fontSize: 13,
  color: "#8A7568",
  fontFamily: fonts.medium,
},

title: {
  marginTop: 10,
  fontSize: 21,
  color: "#3A2C27",
  fontFamily: fonts.title,
  lineHeight: 29,
},
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "#F7EFE4",
  },
  statusPillText: {
  fontSize: 12,
  color: "#9B7650",
  fontFamily: fonts.semiBold,
},
  
  summaryDivider: {
    height: 1,
    backgroundColor: "#EFE5DE",
    marginVertical: 16,
  },
  infoRow: {
    marginBottom: 12,
  },
  infoLabel: {
  fontSize: 14,
  color: "#C89E6A",
  fontFamily: fonts.semiBold,
},
  infoValue: {
    marginTop: 5,
    fontSize: 14,
    color: "#3A2C27",
    fontWeight: "800",
  },
  infoValueMultiline: {
  marginTop: 5,
  fontSize: 14,
  lineHeight: 22,
  color: "#3A2C27",
  fontFamily: fonts.medium,
},
  sectionHeader: {
    marginTop: 24,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
  fontSize: 18,
  color: "#3A2C27",
  fontFamily: fonts.title,
},

sectionCount: {
  fontSize: 13,
  color: "#8A7568",
  fontFamily: fonts.semiBold,
},
  recordCard: {
    marginBottom: 14,
    padding: 17,
    borderRadius: 23,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EFE5DE",
  },
  recordTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  recordDate: {
  fontSize: 14,
  color: "#8A7568",
  fontFamily: fonts.medium,
},

recordTitle: {
  marginTop: 8,
  fontSize: 18,
  color: "#3A2C27",
  fontFamily: fonts.title,
},
  lessonBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#F7EFE4",
    alignSelf: "flex-start",
  },
  lessonBadgeText: {
  fontSize: 13,
  color: "#9B7650",
  fontFamily: fonts.semiBold,
},
  detailGrid: {
    marginTop: 16,
    gap: 8,
  },
  detailItem: {
    padding: 12,
    borderRadius: 16,
    backgroundColor: "#FFFCFA",
  },
  detailLabel: {
  fontSize: 13,
  color: "#B09A8C",
  fontFamily: fonts.semiBold,
},

detailValue: {
  marginTop: 5,
  fontSize: 16,
  color: "#3A2C27",
  fontFamily: fonts.semiBold,
},
  block: {
    marginTop: 16,
  },
  blockTitle: {
  fontSize: 14,
  color: "#3A2C27",
  fontFamily: fonts.semiBold,
},
blockText: {
  marginTop: 7,
  fontSize: 14,
  lineHeight: 23,
  color: "#3A2C27",
  fontFamily: fonts.medium,
},
  subjectRow: {
    marginTop: 8,
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
  fontFamily: fonts.semiBold,
},
  recordFooter: {
    marginTop: 15,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#EFE5DE",
  },
recordFooterText: {
  fontSize: 13,
  color: "#7B665B",
  fontFamily: fonts.semiBold,
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
  noteCard: {
    marginTop: 12,
    padding: 17,
    borderRadius: 22,
    backgroundColor: "rgba(247,239,228,0.65)",
    borderWidth: 1,
    borderColor: "rgba(200,158,106,0.25)",
  },
  noteTitle: {
  fontSize: 15,
  color: "#3A2C27",
  fontFamily: fonts.titleSemi,
},

noteText: {
  marginTop: 7,
  fontSize: 13,
  lineHeight: 20,
  color: "#8A7568",
  fontFamily: fonts.medium,
},
});