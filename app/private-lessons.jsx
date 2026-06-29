import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
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
import ScreenHeader from "../src/components/ScreenHeader";

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
function formatTimeRange(lesson) {
  if (lesson?.startTime && lesson?.endTime) {
    return `${lesson.startTime} ~ ${lesson.endTime}`;
  }
  if (lesson?.startTime) return lesson.startTime;
  return "-";
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

  const currentPackage = data?.currentPackage;
  const recentLessons = data?.recentLessons || [];
  const history = data?.history || [];
  const latestLesson = recentLessons[0] || currentPackage?.latestLesson || null;

  const progressPercent = useMemo(() => {
    const total = Number(currentPackage?.totalCount || 0);
    const used = Number(currentPackage?.usedCount || 0);
    if (!total) return 0;
    return Math.min(100, Math.round((used / total) * 100));
  }, [currentPackage]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={styles.loadingText}>개인지도 정보를 불러오는 중입니다.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <ScreenHeader title={data?.menuLabel || "개인지도"} />

      <View style={styles.heroTitleRow}>
  <View>
    <Text style={styles.sectionEyebrow}>개인지도 이용 현황</Text>
  </View>

  <Image
    source={require("../assets/images/private-lesson-crane.png")}
    style={styles.heroCraneImage}
    resizeMode="contain"
  />
</View>

      {currentPackage ? (
        <View style={styles.darkStatusCard}>
          <View style={styles.darkCardTop}>
            <Text style={styles.darkCardTitle} numberOfLines={1}>
              {currentPackage.title}
            </Text>
            <View style={styles.statusBadgeDark}>
              <Text style={styles.statusBadgeDarkText}>
                {currentPackage.status === "active" ? "진행중" : "완료"}
              </Text>
            </View>
          </View>

          <View style={styles.darkCountRow}>
            <View style={styles.darkCountItem}>
              <Text style={styles.darkCountLabel}>결제 회차</Text>
              <Text style={styles.darkCountValue}>{currentPackage.totalCount}</Text>
              <Text style={styles.darkCountUnit}>회</Text>
            </View>

            <View style={styles.darkDivider} />

            <View style={styles.darkCountItem}>
              <Text style={styles.darkCountLabel}>사용 회차</Text>
              <Text style={styles.darkCountValue}>{currentPackage.usedCount}</Text>
              <Text style={styles.darkCountUnit}>회</Text>
            </View>

            <View style={styles.darkDivider} />

            <View style={styles.darkCountItem}>
              <Text style={styles.darkCountLabelGold}>잔여 회차</Text>
              <Text style={styles.darkCountValueGold}>
                {currentPackage.remainingCount}
              </Text>
              <Text style={styles.darkCountUnitGold}>회</Text>
            </View>
          </View>

          <View style={styles.darkBottomGrid}>
  <View style={styles.darkBottomItem}>
    <Text style={styles.darkBottomLabel}>최근 수업</Text>
    <Text style={styles.darkBottomValue}>
      {latestLesson ? formatDate(latestLesson.lessonDate) : "기록 없음"}
    </Text>
  </View>

  <View style={[styles.darkBottomItem, styles.darkBottomItemRight]}>
    <Text style={styles.darkBottomLabel}>다음 예정</Text>
    <Text style={styles.darkBottomValue}>
      {latestLesson?.nextReservationTime || "등록된 일정 없음"}
    </Text>
  </View>
</View>
        </View>
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>진행중인 개인지도는 없습니다.</Text>
          <Text style={styles.emptyText}>지난 개인지도 기록을 확인할 수 있어요.</Text>
        </View>
      )}

      {currentPackage ? (
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>현재 이용권</Text>

          <View style={styles.ticketCard}>
            <View style={styles.ticketHeader}>
  <Text style={styles.ticketTitle}>
    {currentPackage.title}
  </Text>

  <TouchableOpacity
    activeOpacity={0.8}
    onPress={() =>
      router.push({
        pathname: "/private-lessons/[packageId]",
        params: {
          packageId: currentPackage.id,
        },
      })
    }
  >
    <Text style={styles.ticketLink}>
      수업 보기 〉
    </Text>
  </TouchableOpacity>
</View>

            <View style={styles.ticketRows}>
              <View style={styles.ticketRow}>
                <Text style={styles.ticketLabel}>총 회차</Text>
                <Text style={styles.ticketValue}>{currentPackage.totalCount}회</Text>
              </View>
              <View style={styles.ticketRow}>
                <Text style={styles.ticketLabel}>사용 회차</Text>
                <Text style={styles.ticketValue}>{currentPackage.usedCount}회</Text>
              </View>
              <View style={styles.ticketRow}>
                <Text style={styles.ticketLabel}>잔여 회차</Text>
                <Text style={styles.ticketValueGold}>
                  {currentPackage.remainingCount}회
                </Text>
              </View>
              <View style={styles.ticketRow}>
                <Text style={styles.ticketLabel}>시작일</Text>
                <Text style={styles.ticketValue}>{formatDate(currentPackage.startDate)}</Text>
              </View>
              <View style={styles.ticketRow}>
                <Text style={styles.ticketLabel}>종료 예정일</Text>
                <Text style={styles.ticketValue}>
                  {formatDate(currentPackage.expectedEndDate)}
                </Text>
              </View>
            </View>

            <View style={styles.goalBox}>
              <Text style={styles.goalLabel}>개인지도 목표</Text>
              <Text style={styles.goalText}>
                {currentPackage.description || "등록된 개인지도 목표가 없습니다."}
              </Text>
            </View>
          </View>
        </View>
      ) : null}

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
              <View style={styles.historyTitleRow}>
                <Text style={styles.historyTitle}>{item.title}</Text>
                <View style={styles.doneBadge}>
                  <Text style={styles.doneBadgeText}>완료</Text>
                </View>
              </View>

              <Text style={styles.historyMeta}>
                총 {item.totalCount}회 · 사용 {item.usedCount}회
              </Text>
              <Text style={styles.historyMeta}>
                완료일 {formatDate(item.completedAt)}
              </Text>
              <Text style={styles.historyRecordLink}>지난 수업 기록 보기 〉</Text>
            </View>

            <Text style={styles.historyArrow}>〉</Text>
          </TouchableOpacity>
        ))
      ) : (
        <Text style={styles.emptyListText}>완료된 개인지도 기록이 없습니다.</Text>
      )}

      <View style={styles.illustrationCard}>
        <Text style={styles.illustrationTitle}>몸에 맞춘 세밀한 수련</Text>
        <Text style={styles.illustrationText}>
          개인지도 기록은 수련의 변화와 교정 포인트를 오래 남기기 위한 공간입니다.
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
    paddingBottom: 44,
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
  
heroTitleRow: {
  marginTop: 10,
  marginBottom: 2,
  flexDirection: "row",
  alignItems: "flex-end",
  justifyContent: "space-between",
  position: "relative",
  zIndex: 1,
},

heroCraneImage: {
  position: "absolute",
  right: -20,
  bottom: -26,
  width: 150,
  height: 84,
  opacity: 0.65,
  zIndex: 0,
},
sectionEyebrow: {
  fontSize: 19,
  fontFamily: fonts.title,
  marginLeft: 4,
  color: "#3A2C27",
  zIndex: 3,
},

darkStatusCard: {
  marginTop: 8,
  paddingHorizontal: 18,
  paddingTop: 17,
  paddingBottom: 16,
  borderRadius: 14,
  backgroundColor: "#4A3A2B",
  borderWidth: 1,
  borderColor: "rgba(200,158,106,0.45)",
  shadowColor: "#000",
  shadowOpacity: 0.18,
  shadowRadius: 14,
  shadowOffset: { width: 0, height: 8 },
  elevation: 4,
  overflow: "hidden",
  position: "relative",
  zIndex: 5,
},
  pageTitle: {
    marginTop: 6,
    fontSize: 22,
    fontWeight: "900",
    color: "#3A2C27",
  },
  craneText: {
    fontSize: 38,
    color: "rgba(200,158,106,0.55)",
    transform: [{ rotate: "-8deg" }],
  },
  
darkCardTop: {
  marginHorizontal: -18,
  marginTop: -17,
  paddingHorizontal: 18,
  paddingVertical: 16,
  borderTopLeftRadius: 14,
  borderTopRightRadius: 14,
  backgroundColor: "#2D211B",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
},

darkCardTitle: {
  flex: 1,
  fontSize: 21,
  fontFamily: fonts.titleSemi,
  color: "#FFF8EA",
},

statusBadgeDark: {
  paddingHorizontal: 10,
  paddingVertical: 5,
  borderRadius: 999,
  borderWidth: 1,
  borderColor: "#C89E6A",
  backgroundColor: "rgba(45,33,27,0.35)",
},
  statusBadgeDarkText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#E8C98F",
  },
  darkCountRow: {
  marginTop: 22,
  paddingBottom: 17,
  borderBottomWidth: 1,
  borderBottomColor: "rgba(255,255,255,0.13)",
  flexDirection: "row",
  alignItems: "center",
},

darkCountItem: {
  flex: 1,
  alignItems: "center",
},

darkCountLabel: {
  fontSize: 14,
  fontFamily: fonts.medium,
  color: "rgba(255,248,234,0.62)",
},

darkCountLabelGold: {
  fontSize: 12,
  fontFamily: fonts.semiBold,
  color: "#E8C98F",
},

darkCountValue: {
  marginTop: 9,
  fontSize: 31,
  lineHeight: 34,
  color: "#FFFFFF",
  fontFamily: fonts.semiBold,
},

darkCountValueGold: {
  marginTop: 9,
  fontSize: 29,
  lineHeight: 34,
  color: "#E9B866",
  fontFamily: fonts.bold,
},

darkCountUnit: {
  marginTop: 1,
  fontSize: 12,
  color: "rgba(255,248,234,0.72)",
  fontFamily: fonts.semiBold,
},

darkCountUnitGold: {
  marginTop: 1,
  fontSize: 12,
  color: "#E8C98F",
  fontFamily: fonts.semiBold,
},

darkDivider: {
  width: 1,
  height: 70,
  backgroundColor: "rgba(255,255,255,0.16)",
},

darkBottomGrid: {
  flexDirection: "row",
},

darkBottomItem: {
  flex: 1,
  paddingTop: 13,
},

darkBottomItemRight: {
  paddingLeft: 15,
  borderLeftWidth: 1,
  borderLeftColor: "rgba(255,255,255,0.12)",
},

darkBottomLabel: {
  fontSize: 12,
  color: "rgba(255,248,234,0.52)",
  fontFamily: fonts.medium,
},

darkBottomValue: {
  marginTop: 8,
  fontSize: 14,
  color: "#FFF8EA",
  fontFamily: fonts.medium,
},
  sectionBlock: {
    marginTop: 2,
  },
  sectionTitle: {
  marginTop: 24,
  marginBottom: 12,
  fontSize: 18,
  fontFamily: fonts.title,
  color: "#3A2C27",
},
  ticketCard: {
    padding: 18,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EFE5DE",
  },
  ticketHeader: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
},

ticketTitle: {
  flex: 1,
  fontSize: 17,
  fontFamily: fonts.title,
  color: "#3A2C27",
},

ticketLink: {
  fontSize: 13,
  fontFamily: fonts.semiBold,
  color: "#8A633A",
},
  ticketRows: {
    marginTop: 14,
    gap: 9,
  },
  ticketRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  ticketLabel: {
  fontSize: 15,
  fontFamily: fonts.medium,
  color: "#8A7568",
},

ticketValue: {
  fontSize: 15,
  fontFamily: fonts.medium,
  color: "#3A2C27",
},
  ticketValueGold: {
    fontSize: 15,
    color: "#C89E6A",
    fontWeight: "800",
  },
  goalBox: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#EFE5DE",
  },
  goalLabel: {
    fontSize: 13,
    color: "#3A2C27",
    fontWeight: "900",
  },
  goalText: {
  marginTop: 6,
  fontSize: 14,
  fontFamily: fonts.medium,
  color: "#7B665B",
  lineHeight: 22,
},
  sectionHeader: {
    marginTop: 22,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  linkText: {
    color: "#8A7568",
    fontWeight: "800",
    fontSize: 13,
  },
  lessonCard: {
    padding: 17,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EFE5DE",
    marginBottom: 10,
  },
  lessonTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
  },
  lessonDate: {
    flex: 1,
    fontSize: 14,
    color: "#3A2C27",
    fontWeight: "700",
  },
  lessonBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#F7EFE4",
  },
  lessonBadgeText: {
    fontSize: 13,
    color: "#9B7650",
    fontWeight: "900",
  },
  lessonTitle: {
  marginTop: 10,
  fontSize: 17,
  fontFamily: fonts.titleSemi,
  color: "#3A2C27",
},
  lessonSubjects: {
    marginTop: 14,
    fontSize: 14,
    lineHeight: 22,
    color: "#7B665B",
    fontWeight: "700",
  },
  lessonContent: {
    marginTop: 14,
    fontSize: 14,
    lineHeight: 23,
    fontWeight: "700",
    color: "#3A2C27",
  },
  lessonFooter: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#EFE5DE",
  },
  lessonFooterText: {
    fontSize: 14,
    color: "#7B665B",
    fontWeight: "800",
  },
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
  historyTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  historyTitle: {
    fontSize: 16,
    color: "#3A2C27",
    fontWeight: "900",
  },
  doneBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#F7EFE4",
  },
  doneBadgeText: {
    fontSize: 11,
    color: "#8A7568",
    fontWeight: "900",
  },
  historyMeta: {
    marginTop: 6,
    fontSize: 12,
    color: "#9A877D",
  },
  historyArrow: {
    fontSize: 24,
    color: "#C89E6A",
  },
  emptyCard: {
    marginTop: 18,
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
  },
  softEmptyCard: {
    padding: 18,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EFE5DE",
  },
  emptyListText: {
    color: "#9A877D",
    lineHeight: 21,
  },
  illustrationCard: {
    marginTop: 20,
    minHeight: 118,
    padding: 18,
    borderRadius: 24,
    backgroundColor: "rgba(247,239,228,0.65)",
    borderWidth: 1,
    borderColor: "rgba(200,158,106,0.25)",
  },
  illustrationTitle: {
    fontSize: 16,
    color: "#3A2C27",
    fontWeight: "700",
  },
  illustrationText: {
    marginTop: 8,
    maxWidth: "82%",
    fontSize: 13,
    lineHeight: 20,
    color: "#8A7568",
  },
  nextMemoText: {
  marginTop: 10,
  fontSize: 13,
  fontFamily: fonts.medium,
  color: "#8A7568",
  lineHeight: 20,
},

historyRecordLink: {
  marginTop: 8,
  fontSize: 13,
  fontFamily: fonts.semiBold,
  color: "#8A633A",
},
});