import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ImageBackground,
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
import { LinearGradient } from "expo-linear-gradient";

const fonts = {
  regular: "PretendardRegular",
  medium: "PretendardMedium",
  semi: "PretendardSemiBold",
  semiBold: "PretendardSemiBold",
  bold: "PretendardBold",
  title: "MaruBuriBold",
  titleSemi: "MaruBuriSemiBold",
  hanja: "ZhaoKai",
};

const MENU = [
  {
    title: "유단자회 안내",
    desc: "소개 · 회칙",
    path: "/yudanja/content/intro",
    iconImage: require("../../assets/images/yudanja/menu-intro.png"),
    bgImage: require("../../assets/images/yudanja/menu-bamboo.png"),
  },
  {
    title: "수련항목",
    desc: "추수 · 발경",
    path: "/yudanja/training-items",
    iconImage: require("../../assets/images/yudanja/menu-training.png"),
    bgImage: require("../../assets/images/yudanja/menu-taiji-bg.png"),
  },
  {
    title: "자료실",
    desc: "문서 · 이론",
    path: "/yudanja/library",
    iconImage: require("../../assets/images/yudanja/menu-library.png"),
    bgImage: require("../../assets/images/yudanja/menu-book-bg.png"),
  },
  {
  title: "유단자회 앨범",
  desc: "사진 · 기록",
  path: "/yudanja/album",
  iconImage: require("../../assets/images/yudanja/menu-library.png"),
  bgImage: require("../../assets/images/yudanja/menu-bamboo-bg.png"),
},
  {
    title: "내 수련기록",
    desc: "출석 · 항목별 기록",
    path: "/yudanja/my-records",
    iconImage: require("../../assets/images/yudanja/menu-record.png"),
    bgImage: require("../../assets/images/yudanja/menu-bamboo-bg.png"),
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
      <Pressable
  style={styles.heroBackButton}
  onPress={() => router.back()}
  hitSlop={10}
>
  <Text style={styles.heroBackText}>‹</Text>
</Pressable>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
<View style={styles.heroCard}>
  <Image
    source={require("../../assets/images/yudanja/yudanja-dark-bg.png")}
    style={styles.heroBg}
    resizeMode="contain"
  />

  <Image
    source={require("../../assets/images/yudanja/yudanja-emblem.png")}
    style={styles.heroEmblem}
    resizeMode="contain"
  />

  <Text style={styles.heroTitle}>유단자회 전용 공간</Text>
  <Text style={styles.heroSubTitle}>玄中太極門 有段者會</Text>
  <LinearGradient
  colors={[
    "rgba(255,252,250,0)",
    "rgba(247,239,228,0.72)",
    "rgba(255,252,250,1)",
  ]}
  locations={[0, 0.55, 1]}
  style={styles.heroBottomGradient}
/>
  <View style={styles.heroDivider}>
    <View style={styles.heroDividerLine} />
    <Text style={styles.heroDividerIcon}>✥</Text>
    <View style={styles.heroDividerLine} />
  </View>

  <Text style={styles.heroDesc}>
    깊은 수련과 전통의 기록을 위한 공간
  </Text>

  <View style={styles.heroInfoPill}>
  <Text style={styles.heroInfoText}>{getDanLabel(homeData?.member)}</Text>
  <Text style={styles.heroInfoDivider}>|</Text>
  <Text style={styles.heroInfoText}>
    {homeData?.yearAttendanceCount ?? 0}회 출석
  </Text>
 
</View>

</View>

        {error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>불러오기 실패</Text>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        

        <Pressable
  style={styles.recentCard}

>
  <View style={styles.recentHeader}>
    <View style={styles.recentTitleWrap}>
  <Text style={styles.sectionLabel}>최근 수련</Text>

  {homeData?.latestProgress?.recordDate ? (
    <Text style={styles.recentDateInline}>
      {formatDate(homeData.latestProgress.recordDate)}
    </Text>
  ) : null}
</View>
  </View>

  <View style={styles.recentList}>
  {latestItems.length > 0 ? (
    latestItems.slice(0, 4).map((item) => (
      <View key={item.id || item.name} style={styles.recentListItem}>
        <Text style={styles.recentDot}>•</Text>
        <Text style={styles.recentListText} numberOfLines={1}>
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
  source={require("../../assets/images/yudanja/card-mountain.png")}
  style={styles.recentMountainImage}
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
<Image
  source={item.bgImage}
  style={styles.menuMountainImage}
  resizeMode="contain"
/>
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
  paddingTop: 0,
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
  height: 294,
  marginTop: 0,
  alignItems: "center",
  overflow: "hidden",
  backgroundColor: "#2B2118",
},

heroBg: {
  position: "absolute",
  width: "115%",
  height: "115%",
  top: 0,
},

heroEmblem: {
  width: 60,
  height: 60,
  marginBottom: 3,
  marginTop: 22,
  opacity: 0.9,
},

  heroLabel: {
    fontFamily: fonts.semi,
    fontSize: 11,
    color: "#A47C4F",
    letterSpacing: 1,
  },
heroTitle: {
  fontFamily: fonts.title,
  fontSize: 30,
  lineHeight: 48,
  color: "#F5E6D0",
  letterSpacing: 0.5,
},

heroSubTitle: {
  marginTop: 1,
  fontFamily: fonts.hanja,
  fontSize: 20,
  color: "#D9B982",
  letterSpacing: -0.5,
},

heroDivider: {
  marginTop: 10,
  flexDirection: "row",
  alignItems: "center",
  gap: 10,
},

heroDividerLine: {
  width: 118,
  height: 1,
  backgroundColor: "rgba(217,185,130,0.75)",
},

heroDividerIcon: {
  fontSize: 16,
  color: "#D9B982",
},

heroDesc: {
  marginTop: 5,
  fontFamily: fonts.medium,
  fontSize: 15,
  lineHeight: 22,
  color: "#F4E9DA",
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
  
  recentCard: {
  marginTop: 23,
  marginHorizontal: 18,
  borderRadius: 20,
  padding: 22,
  minHeight: 210,
  backgroundColor: "#FFFDF8",
  borderWidth: 0,
  overflow: "hidden",
  position: "relative",

  shadowColor: "#7A5B3D",
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.18,
  shadowRadius: 12,
  elevation: 4,
},
  recentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  recentTitleWrap: {
  flexDirection: "row",
  alignItems: "center",
  gap: 6,
  flex: 1,
  paddingRight: 12,
},
recentDateInline: {
  borderWidth: 1,
  borderColor: "#B98A52",
  paddingHorizontal: 8,
  paddingVertical: 3,
  fontFamily: fonts.hanja,
  fontSize: 13,
  color: "#8A6238",
},
sectionLabel: {
  fontFamily: fonts.title,
  fontSize: 23,
  lineHeight: 34,
  color: "#2F241F",
},

recentList: {
  marginTop: 16,
  gap: 14,
  paddingRight: 130,
},

recentListItem: {
  flexDirection: "row",
  alignItems: "center",
},

recentDot: {
  fontFamily: fonts.title,
  fontSize: 18,
  lineHeight: 18,
  color: "#3A2C27",
  marginRight: 8,
},

recentListText: {
  flex: 1,
  fontFamily: fonts.titleSemi,
  fontSize: 15,
  lineHeight: 16,
  color: "#3A2C27",
},

recentMountainImage: {
  position: "absolute",
  right: 5,
  bottom: -4,
  width: 205,
  height: 175,
  opacity: 0.72,
},

  recentTitle: {
    marginTop: 6,
    fontFamily: fonts.title,
    fontSize: 22,
    color: colors.textMain || "#3A2C27",
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
  marginHorizontal: 18,
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 10,
},
  menuCard: {
  width: "48.5%",
  minHeight: 128,
  borderRadius: 18,
  padding: 16,
  backgroundColor: "#FFFDF8",
  borderWidth: 0,
  overflow: "hidden",
  position: "relative",

  shadowColor: "#7A5B3D",
  shadowOffset: { width: 0, height: 7 },
  shadowOpacity: 0.1,
  shadowRadius: 14,
  elevation: 3,
},
menuIcon: {
  width: 40,
  height: 40,
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 10,
},

menuIconImage: {
  width: 36,
  height: 36,
},

menuTitle: {
  fontFamily: fonts.titleSemi,
  fontSize: 17,
  lineHeight: 24,
  color: "#2F241F",
},

menuDesc: {
  marginTop: 4,
  fontFamily: fonts.medium,
  fontSize: 13,
  lineHeight: 18,
  color: "#6F625A",
},

menuMountainImage: {
  position: "absolute",
  right: 2,
  bottom: 5,
  width: 65,
  height: 65,
  opacity: 0.25,
},
  heroBackButton: {
  position: "absolute",
  top: 18,
  left: 10,
  zIndex: 20,
  width: 40,
  height: 40,
  alignItems: "center",
  justifyContent: "center",
},

heroBackText: {
  fontSize: 34,
  lineHeight: 36,
  color: "#F5E6D0",
},
heroInfoPill: {
  flexDirection: "row",
  alignItems: "center",
  gap: 9,
  marginTop: 8,
  borderRadius: 10,
  paddingHorizontal: 14,
  paddingVertical: 7,
  backgroundColor: "rgba(255,255,255,0.9)",
  zIndex: 5,
},

heroInfoText: {
  fontFamily: fonts.semiBold,
  fontSize: 15,
  color: "#3A2C27",
},

heroInfoDivider: {
  fontFamily: fonts.medium,
  fontSize: 15,
  color: "#B98A52",
},
heroBottomFade: {
  position: "absolute",
  left: 0,
  right: 0,
  bottom: -10,
  height: 42,
  backgroundColor: "rgba(255,252,250,0.62)",
  
},
heroBottomGradient: {
  position: "absolute",
  left: 0,
  right: 0,
  bottom: 0,
  height: 30,
  zIndex: 1,
},
});