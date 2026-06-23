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
import { router } from "expo-router";
import ScreenHeader from "../../src/components/ScreenHeader";
import { useAuth } from "../../src/contexts/AuthContext";
import { getYudanjaHome } from "../../src/api/yudanjaContent";
import { colors } from "../../src/theme";

const fonts = {
  title: "MaruBuriBold",
  semi: "PretendardSemiBold",
  medium: "PretendardMedium",
};

const MENU = [
  {
    title: "유단자회 소개",
    desc: "소개 · 회칙",
    path: "/yudanja/content/intro",
    iconImage: require("../../assets/images/yudanja/menu-intro.png"),
  },
  {
    title: "수련항목",
    desc: "추수 · 발경",
    path: "/yudanja/training-items",
    iconImage: require("../../assets/images/yudanja/menu-training.png"),
  },
  {
    title: "자료실",
    desc: "문서 · 이론",
    path: "/yudanja/library",
    iconImage: require("../../assets/images/yudanja/menu-library.png"),
  },
  {
    title: "내 수련기록",
    desc: "출석 · 항목별 기록",
    path: "/yudanja/my-records",
    iconImage: require("../../assets/images/yudanja/menu-record.png"),
  },
];

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("ko-KR");
}

function getDanLabel(member) {
  const rank = Number(member?.rankLevel || 0);

  if (rank > 0) return `${rank}단`;
  if (member?.level) return member.level;

  return "-";
}

export default function YudanjaHomeScreen() {
  const { token } = useAuth();

  const [homeData, setHomeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const latestItems = useMemo(() => {
    return homeData?.latestProgress?.items || [];
  }, [homeData]);

  const loadData = useCallback(
    async ({ silent = false } = {}) => {
      if (!token) return;

      try {
        if (!silent) setLoading(true);
        setError("");

        const result = await getYudanjaHome(token);
        setHomeData(result || null);
      } catch (err) {
        setError(err?.message || "유단자회 정보를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token],
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
        <Text style={styles.loadingText}>유단자회 정보를 불러오는 중입니다.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="유단자회" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.heroCard}>
  <Text style={styles.heroTitle}>유단자 전용 공간</Text>
  <Text style={styles.heroDesc}>
    함께 배우는 심화 수련과 기록을 확인하세요.
  </Text>

  <Image
    source={require("../../assets/images/yudanja/yudanja-hero.png")}
    style={styles.heroImage}
    resizeMode="contain"
  />

  <View style={styles.heroSeal}>
    <Text style={styles.heroSealText}>丹</Text>
  </View>
</View>

        {error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>불러오기 실패</Text>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.statRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>나의 단수</Text>
            <Text style={styles.statValue}>{getDanLabel(homeData?.member)}</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>올해 출석</Text>
            <Text style={styles.statValue}>
              {homeData?.yearAttendanceCount ?? 0}
              <Text style={styles.statUnit}>회</Text>
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>최근 참석일</Text>
            <Text style={styles.statDate}>
              {formatDate(homeData?.latestAttendanceDate)}
            </Text>
          </View>
        </View>

        <Pressable
  style={styles.recentCard}
  onPress={() => router.push("/yudanja/my-records")}
>
  <View style={styles.recentHeader}>
    <View style={styles.recentTitleWrap}>
  <Text style={styles.sectionLabel}>최근 유단자회 수련</Text>

  {homeData?.latestProgress?.recordDate ? (
    <Text style={styles.recentDate}>
      {formatDate(homeData.latestProgress.recordDate)}
    </Text>
  ) : null}
</View>

    <Text style={styles.recentArrow}>›</Text>
  </View>

  <View style={styles.recentChipWrap}>
    {latestItems.length > 0 ? (
      latestItems.slice(0, 6).map((item) => (
        <View key={item.id || item.name} style={styles.recentChip}>
          <Text style={styles.recentChipText} numberOfLines={1}>
            {item.name}
          </Text>
        </View>
      ))
    ) : (
      <Text style={styles.recentEmptyText}>
        최근 수련 기록이 없습니다.
      </Text>
    )}
  </View>
  <Image
  source={require("../../assets/images/yudanja/yudanja-circle-person.png")}
  style={styles.recentPersonImage}
  resizeMode="contain"
/>
</Pressable>

        <View style={styles.menuGrid}>
          {MENU.map((item) => (
            <Pressable
              key={item.path}
              style={styles.menuCard}
              onPress={() => router.push(item.path)}
            >
              <View style={styles.menuIcon}>
  <Image
    source={item.iconImage}
    style={styles.menuIconImage}
    resizeMode="contain"
  />
</View>

              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuDesc}>{item.desc}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background || "#FFFCFA",
    paddingHorizontal: 18,
    paddingTop: 12,
  },
  content: {
    paddingBottom: 40,
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
  position: "relative",
  minHeight: 178,
  paddingHorizontal: 4,
  paddingTop: 10,
  paddingBottom: 18,
  backgroundColor: "transparent",
  borderWidth: 0,
  overflow: "visible",
},
  heroLabel: {
    fontFamily: fonts.semi,
    fontSize: 11,
    color: "#A47C4F",
    letterSpacing: 1,
  },
heroTitle: {
  fontFamily: fonts.title,
  fontSize: 26,
  color: colors.textMain || "#3A2C27",
  lineHeight: 34,
  zIndex: 2,
},

heroDesc: {
  marginTop: 8,
  width: "54%",
  fontFamily: fonts.medium,
  fontSize: 14,
  lineHeight: 21,
  color: "#6F625A",
  zIndex: 2,
},

heroImage: {
  position: "absolute",
  right: -18,
  bottom: -90,
  width: 450,
  height: 250,
  opacity: 0.95,
},

heroSeal: {
  position: "absolute",
  right: 14,
  top: 14,
  width: 54,
  height: 54,
  borderRadius: 27,
  borderWidth: 1,
  borderColor: "#D8BE9D",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "rgba(255,255,255,0.35)",
},

heroSealText: {
  fontFamily: fonts.title,
  fontSize: 30,
  color: "#8A6238",
},

  errorCard: {
    marginTop: 12,
    borderRadius: 20,
    padding: 14,
    backgroundColor: "#FFF1F1",
    borderWidth: 1,
    borderColor: "#F2CACA",
  },
  errorTitle: {
    fontFamily: fonts.semi,
    fontSize: 14,
    color: "#9A3C3C",
  },
  errorText: {
    marginTop: 4,
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 18,
    color: "#9A3C3C",
  },
  statRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 32,
  },
  statCard: {
    flex: 1,
    minHeight: 72,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EEE3D8",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  statLabel: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: "#8A7A68",
  },
  statValue: {
    marginTop: 5,
    fontFamily: fonts.title,
    fontSize: 24,
    color: "#5A3428",
  },
  statUnit: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: "#5A3428",
  },
  statDate: {
    marginTop: 7,
    fontFamily: fonts.semi,
    fontSize: 17,
    color: "#5A3428",
  },
  recentCard: {
  marginTop: 14,
  borderRadius: 26,
  padding: 18,
  backgroundColor: "#FFFFFF",
  borderWidth: 1,
  borderColor: "#EEE3D8",
  overflow: "hidden",
  position: "relative",
},
  recentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  recentTitleWrap: {
    flex: 1,
    paddingRight: 12,
  },
  sectionLabel: {
    fontFamily: fonts.semi,
    fontSize: 20,
    color: "#3A2C27",
  },
  recentTitle: {
    marginTop: 6,
    fontFamily: fonts.title,
    fontSize: 22,
    color: colors.textMain || "#3A2C27",
  },
  recentDate: {
    marginTop: 5,
    fontFamily: fonts.medium,
    fontSize: 14,
    color: "#8A7A68",
  },
  recentArrow: {
    fontSize: 30,
    color: "#B7A89B",
  },
  recentChipWrap: {
  marginTop: 16,
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 8,
  paddingRight: 110,
},

recentChip: {
  width: "100%",
  maxWidth: 145,
  borderRadius: 999,
  paddingHorizontal: 12,
  paddingVertical: 7,
  backgroundColor: "#F7EFE4",
  borderWidth: 1,
  borderColor: "#E8D8C4",
},

recentPersonImage: {
  position: "absolute",
  right: -8,
  bottom: -2,
  width: 230,
  height: 230,
  opacity: 0.82,
},

recentChipText: {
  fontFamily: fonts.semi,
  fontSize: 12,
  color: "#6A4428",
},
recentEmptyText: {
  fontFamily: fonts.medium,
  fontSize: 13,
  color: "#8A7A68",
},
  recentItemTextWrap: {
    flex: 1,
  },
  recentText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 19,
    color: "#6F625A",
  },

  menuGrid: {
    marginTop: 14,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  menuCard: {
    width: "48.5%",
    minHeight: 118,
    borderRadius: 24,
    padding: 15,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EEE3D8",
  },
  menuIcon: {
  width: 42,
  height: 42,
  borderRadius: 15,
  backgroundColor: "#F8EFE4",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 10,
},

menuIconImage: {
  width: 25,
  height: 25,
  tintColor: "#8A6238",
},
  menuTitle: {
    fontFamily: fonts.semi,
    fontSize: 15,
    color: colors.textMain || "#3A2C27",
  },
  menuDesc: {
    marginTop: 5,
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 17,
    color: "#7A6C63",
  },
});