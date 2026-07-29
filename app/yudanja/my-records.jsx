import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import ScreenHeader from "../../src/components/ScreenHeader";
import { useAuth } from "../../src/contexts/AuthContext";
import { getMyYudanjaRecords } from "../../src/api/yudanjaContent";
import { colors } from "../../src/theme";

const recordsMountain = require("../../assets/images/yudanja/records-mountain.png");
const iconLotus = require("../../assets/images/yudanja/records-lotus.png");
const iconMountain = require("../../assets/images/yudanja/records-small-mountain.png");
const iconDragon = require("../../assets/images/yudanja/records-dragon.png");
const iconSword = require("../../assets/images/yudanja/records-sword.png");
const iconWave = require("../../assets/images/yudanja/records-wave.png");
const iconScroll = require("../../assets/images/yudanja/records-scroll.png");
const iconFan = require("../../assets/images/yudanja/records-fan.png");
const decoBamboo = require("../../assets/images/yudanja/deco-bamboo.png");

const fonts = {
  title: "MaruBuriBold",
  titleSemi: "MaruBuriSemiBold",
  semi: "PretendardSemiBold",
  medium: "PretendardMedium",
  hanja: "ZhaoKai",
};

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("ko-KR");
}

function getIconImage(index) {
  const icons = [iconLotus, iconMountain, iconWave, iconDragon, iconSword];
  return icons[index % icons.length];
}

export default function MyYudanjaRecordsScreen() {
  const { token } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [recentPage, setRecentPage] = useState(1);

  const RECENT_PAGE_SIZE = 5;

  const itemSummary = useMemo(() => data?.itemSummary || [], [data]);
  const categorySummary = useMemo(() => data?.categorySummary || [], [data]);
  const recentRecords = useMemo(() => data?.recentRecords || [], [data]);
  const recentSessions = useMemo(() => {
  const map = new Map();

  recentRecords.forEach((record) => {
    const dateKey = record.recordDate
      ? new Date(record.recordDate).toISOString().slice(0, 10)
      : "unknown";

    const key = record.progressId || `${dateKey}-${record.progress?.title || "유단자회"}`;

    if (!map.has(key)) {
      map.set(key, {
        key,
        recordDate: record.recordDate,
        title: record.progress?.title || "유단자회 수련",
        items: [],
      });
    }

    map.get(key).items.push({
      id: record.id,
      name: record.item?.name || "항목 없음",
      categoryName: record.item?.category?.name || "기타",
    });
  });

  return Array.from(map.values());
}, [recentRecords]);

const recentTotalPages = Math.max(
  1,
  Math.ceil(
    recentSessions.length / RECENT_PAGE_SIZE,
  ),
);

const pagedRecentSessions = useMemo(() => {
  const start =
    (recentPage - 1) * RECENT_PAGE_SIZE;

  return recentSessions.slice(
    start,
    start + RECENT_PAGE_SIZE,
  );
}, [recentSessions, recentPage]);

useEffect(() => {
  setRecentPage(1);
  setExpandedRecordKey(null);
}, [selectedYear]);

useEffect(() => {
  if (recentPage > recentTotalPages) {
    setRecentPage(recentTotalPages);
  }
}, [recentPage, recentTotalPages]);

    const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [expandedRecordKey, setExpandedRecordKey] = useState(null);
  
  const availableYears = useMemo(() => {
  if (Array.isArray(data?.availableYears) && data.availableYears.length > 0) {
    return data.availableYears;
  }

  return [selectedYear];
}, [data, selectedYear]);


  const loadData = useCallback(
    async ({ silent = false } = {}) => {
      if (!token) return;

      try {
        if (!silent) setLoading(true);
        setError("");

        const result = await getMyYudanjaRecords(token, selectedYear);
        setData(result || null);
      } catch (err) {
        setError(err?.message || "내 수련기록을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token, selectedYear],
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData({ silent: true });
  }, [loadData]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={styles.loadingText}>내 수련기록을 불러오는 중입니다.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="기록" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>
  {selectedYear}년 {"\n"}유단자회 수련기록
</Text>
          <Text style={styles.heroDesc}>
  {selectedYear}년 유단자회에서{"\n"}
  내 수련 기록을 확인합니다.
</Text>

          <Image
  source={recordsMountain}
  style={styles.heroMountain}
  resizeMode="contain"
/>
        </View>

{availableYears.length > 1 ? (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.yearTabs}
  >
    {availableYears.map((year) => {
      const active = Number(year) === Number(selectedYear);

      return (
        <Text
          key={year}
          onPress={() => setSelectedYear(Number(year))}
          style={[styles.yearTab, active && styles.yearTabActive]}
        >
          {year}년
        </Text>
      );
    })}
  </ScrollView>
) : null}

        {error ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>불러오기 실패</Text>
            <Text style={styles.emptyText}>{error}</Text>
          </View>
        ) : !data ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>기록이 없습니다.</Text>
            <Text style={styles.emptyText}>
              유단자회 출석과 진도 기록이 저장되면 이곳에 표시됩니다.
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.statGrid}>
              <View style={styles.statCard}>
  <View style={styles.statIconCircle}>
    <Image source={iconScroll} style={styles.statIconImage} resizeMode="contain" />
  </View>

  <Text style={styles.statLabel}>총 수련일수</Text>

  <View style={styles.statBigValueWrap}>
    <Text style={styles.statBigValue}>{data.totalTrainingDays || 0}</Text>
<Text style={styles.statBigUnit}>일</Text>
  </View>

  <Image source={decoBamboo} style={styles.statBambooDeco} resizeMode="contain" />
</View>

              <View style={styles.statCard}>
  <View style={styles.statIconCircle}>
    <Image source={iconFan} style={styles.statIconImage} resizeMode="contain" />
  </View>

  <Text style={styles.statLabel}>수련항목</Text>

  <View style={styles.statBigValueWrap}>
    <Text style={styles.statBigValue}>{data.totalItemKinds || 0}</Text>
    <Text style={styles.statBigUnit}>종</Text>
  </View>

  <Image source={decoBamboo} style={styles.statBambooDeco} resizeMode="contain" />
</View>
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>항목별 누적</Text>

              {itemSummary.length === 0 ? (
                <Text style={styles.emptyInlineText}>아직 항목 기록이 없습니다.</Text>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.itemMedalRow}>
                    {itemSummary.map((item, index) => (
                      <View key={item.itemId} style={styles.medalCard}>
                        <Image
  source={getIconImage(index)}
  style={styles.medalIconImage}
  resizeMode="contain"
/>
                        <View style={styles.medalCircle}>
                          <Text style={styles.medalCount}>{item.count}</Text>
                          <Text style={styles.medalUnit}>회</Text>
                        </View>
                        <Text style={styles.medalName} numberOfLines={2}>
                          {item.itemName}
                        </Text>
                        <Text style={styles.medalCategory} numberOfLines={1}>
                          {item.categoryName}
                        </Text>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              )}
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>카테고리별 기록</Text>

              {categorySummary.length === 0 ? (
                <Text style={styles.emptyInlineText}>아직 카테고리 기록이 없습니다.</Text>
              ) : (
                <View style={styles.categoryWrap}>
                  {categorySummary.map((item, index) => (
                    <View key={item.categoryName} style={styles.categoryPill}>
                      <Image
  source={getIconImage(index)}
  style={styles.categoryIconImage}
  resizeMode="contain"
/>
                      <Text style={styles.categoryName}>{item.categoryName}</Text>
                      <Text style={styles.categoryCount}>{item.count}회</Text>
                    </View>
                  ))}
                </View>
              )}

              <Image source={recordsMountain} style={styles.statBambooImage} resizeMode="contain" />
            </View>

            <View style={styles.timelineCard}>
              <Text style={styles.sectionTitle}>최근 수련기록</Text>

              {recentRecords.length === 0 ? (
                <Text style={styles.emptyInlineText}>최근 기록이 없습니다.</Text>
              ) : (
                <View style={styles.timelineList}>
                  {pagedRecentSessions.map((session, index) => {
  const expanded = expandedRecordKey === session.key;

  return (
    <View key={session.key}>
      <Pressable
        style={styles.timelineRow}
        onPress={() =>
          setExpandedRecordKey(expanded ? null : session.key)
        }
      >
        <View style={styles.timelineMarkWrap}>
          <View
            style={index === 0 ? styles.timelineDotActive : styles.timelineDot}
          />
          {index < pagedRecentSessions.length - 1 ? (
            <View style={styles.timelineLine} />
          ) : null}
        </View>

        <Text style={styles.timelineDate}>
          {formatDate(session.recordDate)}
        </Text>

        <View style={styles.timelineTextWrap}>
          <Text style={styles.timelineTitle} numberOfLines={1}>
            유단자회 수련
          </Text>
          <Text style={styles.timelineSub} numberOfLines={1}>
            {session.items.length}개 항목 수련
          </Text>
        </View>

        <Text style={styles.timelineArrow}>{expanded ? "︿" : "﹀"}</Text>
      </Pressable>

      {expanded ? (
        <View style={styles.sessionDetailBox}>
          {session.items.map((item) => (
            <Text key={item.id} style={styles.sessionDetailText}>
              · {item.name} <Text style={styles.sessionDetailCategory}>{item.categoryName}</Text>
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
})}
                </View>
              )}

              {recentSessions.length >
              RECENT_PAGE_SIZE ? (
                <View style={styles.recordPagination}>
                  {Array.from(
                    {
                      length: recentTotalPages,
                    },
                    (_, index) => index + 1,
                  ).map((pageNumber) => {
                    const active =
                      pageNumber === recentPage;

                    return (
                      <React.Fragment
                        key={pageNumber}
                      >
                        {pageNumber > 1 ? (
                          <Text
                            style={
                              styles.recordPageDivider
                            }
                          >
                            |
                          </Text>
                        ) : null}

                        <Pressable
                          style={[
                            styles.recordPageButton,
                            active &&
                              styles.recordPageButtonActive,
                          ]}
                          onPress={() => {
                            setRecentPage(
                              pageNumber,
                            );
                            setExpandedRecordKey(
                              null,
                            );
                          }}
                        >
                          <Text
                            style={[
                              styles.recordPageText,
                              active &&
                                styles.recordPageTextActive,
                            ]}
                          >
                            {pageNumber}
                          </Text>
                        </Pressable>
                      </React.Fragment>
                    );
                  })}
                </View>
              ) : null}

              <Image
  pointerEvents="none"
  source={recordsMountain}
  style={styles.categoryBgImage}
  resizeMode="contain"
/>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background || "#FFFCFA",
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  content: {
    paddingBottom: 44,
  },
  center: {
    flex: 1,
    backgroundColor: colors.background || "#FFFCFA",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 10,
    fontFamily: fonts.medium,
    color: "#7A6C63",
  },

  heroCard: {
    minHeight: 190,
    borderRadius: 24,
    padding: 24,
    backgroundColor: "#FFFDF8",
    overflow: "hidden",
    position: "relative",
    shadowColor: "#7A5B3D",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 14,
  },
  heroLabel: {
    fontFamily: fonts.hanja,
    fontSize: 16,
    letterSpacing: 2,
    color: "#A47C4F",
    zIndex: 2,
  },
  heroTitle: {
    marginTop: 10,
    fontFamily: fonts.title,
    fontSize: 28,
    lineHeight: 40,
    color: "#3A2C27",
    zIndex: 2,
  },
  heroDesc: {
    marginTop: 12,
    fontFamily: fonts.medium,
    fontSize: 16,
    lineHeight: 23,
    color: "#5E524B",
    zIndex: 2,
  },
heroMountain: {
  position: "absolute",
  right: -30,
  bottom: -10,
  width: 280,
  height: 210,
  opacity: 0.55,
},
  
  statGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  statCard: {
  flex: 1,
  minHeight: 95,
  borderRadius: 20,
  padding: 8,
  backgroundColor: "#FFFDF8",
  borderWidth: 1,
  borderColor: "#EADCCB",
  overflow: "hidden",
  position: "relative",
},

statIconCircle: {
  width: 38,
  height: 38,
  borderRadius: 21,
  borderWidth: 1,
  borderColor: "#C9A46F",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#F8EFE2",
  zIndex: 2,
  marginTop: 7,
  marginLeft: 7,
},
  statIcon: {
    fontFamily: fonts.hanja,
    fontSize: 22,
    color: "#9A744D",
  },
  statIconImage: {
  width: 38,
  height: 38,
},
  statLabel: {
  position: "absolute",
  left: 14,
  bottom: 15,
  fontFamily: fonts.semi,
  fontSize: 14,
  color: "#3A2C27",
  zIndex: 3,
},
  statBigValueWrap: {
  position: "absolute",
  left: 98,
  top: 21,
  flexDirection: "row",
  alignItems: "flex-end",
  zIndex: 3,
},

statBigValue: {
  fontFamily: fonts.title,
  fontSize: 30,
  lineHeight: 48,
  color: "#3A2C27",
},

statBigUnit: {
  marginBottom: 8,
  marginLeft: 3,
  fontFamily: fonts.semi,
  fontSize: 16,
  color: "#3A2C27",
},
  statBgImage: {
    position: "absolute",
    right: -14,
    bottom: -16,
    width: 130,
    height: 90,
    opacity: 0.28,
  },
  statBambooImage: {
    position: "absolute",
    right: -4,
    bottom: -16,
    width: 220,
    height: 190,
    opacity: 0.25,
  },

sectionCard: {
  borderRadius: 22,
  paddingHorizontal: 16,
  paddingTop: 14,
  paddingBottom: 14,
  backgroundColor: "#FFFDF8",
  borderWidth: 1,
  borderColor: "#EADCCB",
  marginBottom: 12,
  overflow: "hidden",
  position: "relative",
},

sectionTitle: {
  fontFamily: fonts.title,
  fontSize: 21,
  lineHeight: 28,
  color: "#3A2C27",
  marginBottom: 10,
},

itemMedalRow: {
   flexDirection: "row",
   gap: 10,
   paddingBottom: 2,
  },

  medalCard: {
  width: 90,
  minHeight: 115,
  borderRadius: 15,
  padding: 5,
  alignItems: "center",
  paddingTop: 13,
  backgroundColor: "rgba(255,255,255,0.72)",
  borderWidth: 1,
  borderColor: "#E3D3C1",
},
  medalIcon: {
    fontFamily: fonts.hanja,
    fontSize: 24,
    color: "#B98A52",
    marginBottom: 4,
  },
  medalCircle: {
  width: 46,
  height: 46,
  borderRadius: 23,
  borderWidth: 2,
  borderColor: "#C9A46F",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "row",
  backgroundColor: "#FFFDF8",
  marginBottom: 8,
},
  medalCount: {
    fontFamily: fonts.title,
    fontSize: 23,
    color: "#3A2C27",
  },
  medalUnit: {
    marginTop: 5,
    marginLeft: 1,
    fontFamily: fonts.medium,
    fontSize: 12,
    color: "#5E524B",
  },
  medalName: {
    fontFamily: fonts.titleSemi,
    fontSize: 14,
    lineHeight: 20,
    color: "#3A2C27",
    textAlign: "center",
  },
  medalCategory: {
    marginTop: 2,
    fontFamily: fonts.medium,
    fontSize: 13,
    color: "#8A7A68",
    textAlign: "center",
  },

  categoryWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingRight: 40,
  },
  categoryPill: {
    minWidth: 132,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "rgba(255,255,255,0.72)",
    borderWidth: 1,
    borderColor: "#E3D3C1",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  categoryIcon: {
    fontFamily: fonts.hanja,
    fontSize: 17,
    color: "#B98A52",
  },
  categoryName: {
    flex: 1,
    fontFamily: fonts.semi,
    fontSize: 14,
    color: "#3A2C27",
  },
  categoryCount: {
    fontFamily: fonts.semi,
    fontSize: 13,
    color: "#8A6238",
  },
  categoryBgImage: {
    position: "absolute",
    right: -4,
    bottom: -16,
    width: 220,
    height: 190,
    opacity: 0.25,
  },

  timelineCard: {
    borderRadius: 22,
    padding: 18,
    backgroundColor: "#FFFDF8",
    borderWidth: 1,
    borderColor: "#EADCCB",
    overflow: "hidden",
    position: "relative",
  },
  timelineList: {
    gap: 0,
  },
  timelineRow: {
  minHeight: 60,
  flexDirection: "row",
  alignItems: "center",
  position: "relative",
  zIndex: 3,
},
  timelineMarkWrap: {
    width: 22,
    alignSelf: "stretch",
    alignItems: "center",
  },
  timelineDotActive: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: "#B98A52",
    marginTop: 24,
    zIndex: 2,
  },
  timelineDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: "#B98A52",
    backgroundColor: "#FFFDF8",
    marginTop: 26,
    zIndex: 2,
  },
  timelineLine: {
    width: 1,
    flex: 1,
    backgroundColor: "#C9A46F",
    marginTop: -1,
  },
  timelineDate: {
    width: 88,
    fontFamily: fonts.medium,
    fontSize: 13,
    color: "#7A6C63",
  },
  timelineTextWrap: {
    flex: 1,
  },
  timelineTitle: {
    fontFamily: fonts.titleSemi,
    fontSize: 17,
    lineHeight: 24,
    color: "#3A2C27",
  },
  timelineSub: {
    marginTop: 2,
    fontFamily: fonts.medium,
    fontSize: 13,
    color: "#8A7A68",
  },
  timelineArrow: {
    fontSize: 16,
    color: "#3A2C27",
    marginLeft: 8,
  },
  timelineBgImage: {
    position: "absolute",
    right: -20,
    bottom: -20,
    width: 170,
    height: 120,
    opacity: 0.18,
  },

  recordPagination: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  recordPageButton: {
    minWidth: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  recordPageButtonActive: {
    backgroundColor: "#3A2C27",
  },
  recordPageText: {
    fontFamily: fonts.semi,
    fontSize: 14,
    color: "#7A6C63",
  },
  recordPageTextActive: {
    color: "#FFFFFF",
  },
  recordPageDivider: {
    marginHorizontal: 4,
    fontFamily: fonts.medium,
    fontSize: 13,
    color: "#C8B7A6",
  },

  emptyCard: {
    borderRadius: 24,
    padding: 24,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EEE3D8",
    alignItems: "center",
  },
  emptyTitle: {
    fontFamily: fonts.semi,
    fontSize: 17,
    color: "#3A2C27",
  },
  emptyText: {
    marginTop: 8,
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 22,
    color: "#7A6C63",
    textAlign: "center",
  },
  emptyInlineText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 22,
    color: "#8A7A68",
  },
medalIconImage: {
  width: 33,
  height: 33,
  marginBottom: 2,
},

categoryIconImage: {
  width: 20,
  height: 20,
},
statInlineRow: {
  marginTop: 6,
  flexDirection: "row",
  alignItems: "flex-end",
  gap: 4,
},

statInlineValue: {
  fontFamily: fonts.title,
  fontSize: 24,
  lineHeight: 28,
  color: "#3A2C27",
},

statInlineUnit: {
  marginBottom: 3,
  fontFamily: fonts.medium,
  fontSize: 12,
  color: "#5E524B",
},
statBambooDeco: {
  position: "absolute",
  right: -10,
  bottom: -6,
  width: 86,
  height: 75,
  opacity: 0.45,
},
yearTabs: {
  gap: 8,
  paddingBottom: 14,
},

yearTab: {
  overflow: "hidden",
  borderRadius: 999,
  paddingHorizontal: 14,
  paddingVertical: 8,
  backgroundColor: "#FFFFFF",
  borderWidth: 1,
  borderColor: "#EEE3D8",
  fontFamily: fonts.semi,
  fontSize: 13,
  color: "#6F625A",
},

yearTabActive: {
  backgroundColor: "#3A2C27",
  borderColor: "#3A2C27",
  color: "#FFFFFF",
},
sessionDetailBox: {
  marginLeft: 110,
  marginBottom: 10,
  paddingVertical: 8,
  paddingHorizontal: 10,
  borderRadius: 14,
  backgroundColor: "rgba(255,255,255,0.68)",
  borderWidth: 1,
  borderColor: "#EADCCB",
  zIndex: 3,
},

sessionDetailText: {
  fontFamily: fonts.medium,
  fontSize: 13,
  lineHeight: 22,
  color: "#3A2C27",
},

sessionDetailCategory: {
  color: "#8A7A68",
},
});