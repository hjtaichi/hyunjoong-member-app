import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { colors, spacing, radius, shadow } from "../../../src/theme";
import { useAuth } from "../../../src/contexts/AuthContext";
import { getMemberInquiries } from "../../../src/api/memberInquiry";
import { createMemberInquiry } from "../../../src/api/memberInquiryCreate";
import RecentNoticesSection from "../../../src/components/RecentNoticesSection";

const TABS = [
  { key: "notice", label: "도장 소식" },
  { key: "guide", label: "도장 안내" },
  { key: "inquiry", label: "문의" },
];

function formatDateTime(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");

  return `${y}.${m}.${d}`;
}

function getStatusLabel(status) {
  if (status === "answered") return "답변완료";
  if (status === "open") return "진행중";
  if (status === "urgent") return "긴급";
  if (status === "closed") return "종료";
  return status || "확인중";
}

function getStatusStyle(status) {
  if (status === "answered") {
    return { badge: styles.badgeAnswered, text: styles.badgeTextAnswered };
  }

  if (status === "open") {
    return { badge: styles.badgeOpen, text: styles.badgeTextOpen };
  }

  if (status === "closed") {
    return { badge: styles.badgeClosed, text: styles.badgeTextClosed };
  }

  if (status === "urgent") {
    return { badge: styles.badgeUrgent, text: styles.badgeTextUrgent };
  }

  return { badge: styles.badgeDefault, text: styles.badgeTextDefault };
}

export default function InquiryScreen() {
  const { token, user, logout } = useAuth();
  const { tab } = useLocalSearchParams();

  const authUser = user || {};
  const memberStatus = authUser?.memberStatus || authUser?.status;
  const isPausedMember = memberStatus === "paused";

  const [activeTab, setActiveTab] = useState(
    tab === "inquiry" ? "inquiry" : "notice"
  );

  useEffect(() => {
    if (tab === "inquiry") {
      setActiveTab("inquiry");
    }
  }, [tab]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [starting, setStarting] = useState(false);
  const [rooms, setRooms] = useState([]);


  const activeRooms = rooms.filter((room) => room.status !== "closed");
const previewRooms = activeRooms.slice(0, 1);

  async function handleLogout() {
  try {
    await logout();
    router.replace("/login");
  } catch (error) {
    console.log("로그아웃 실패:", error);
    router.replace("/login");
  }
}

  const loadInquiries = useCallback(
    async ({ silent = false } = {}) => {
      if (!token) {
  setLoading(false);
  setRefreshing(false);
  return;
}

      try {
        if (!silent) setLoading(true);

        const result = await getMemberInquiries(token);
        setRooms(Array.isArray(result) ? result : []);
      } catch (error) {
        Alert.alert("오류", error.message || "문의 목록을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token]
  );

  useEffect(() => {
  loadInquiries();
}, [loadInquiries]);

// useFocusEffect(
//   useCallback(() => {
//     loadInquiries({ silent: true });
//   }, [loadInquiries])
// );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadInquiries({ silent: true });
  }, [loadInquiries]);

  const handleStartInquiry = useCallback(async () => {
    try {
      setStarting(true);

      const reusableRoom = rooms.find(
        (room) => room.status === "open" || room.status === "answered"
      );

      if (reusableRoom?.roomId) {
        router.push({
          pathname: "/(tabs)/inquiry/[roomId]",
          params: { roomId: String(reusableRoom.roomId) },
        });
        return;
      }

      const result = await createMemberInquiry(token, {
        title: "1:1 문의",
        inquiryType: "general",
      });

      const createdRoomId = result?.room?.id || result?.room?.roomId;

      if (!createdRoomId) {
        throw new Error("문의방 생성에 실패했습니다.");
      }

      await loadInquiries({ silent: true });

      router.push({
        pathname: "/(tabs)/inquiry/[roomId]",
        params: { roomId: String(createdRoomId) },
      });
    } catch (error) {
      Alert.alert("오류", error.message || "문의방을 열지 못했습니다.");
    } finally {
      setStarting(false);
    }
  }, [rooms, token, loadInquiries]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>공지와 문의를 불러오는 중입니다.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.segment}>
  {TABS.map((tab) => {
    const selected = activeTab === tab.key;

    return (
      <Pressable
        key={tab.key}
        style={[styles.segmentButton, selected && styles.segmentActive]}
        onPress={() => setActiveTab(tab.key)}
      >
        <Text
          style={[
            styles.segmentText,
            selected && styles.segmentTextActive,
          ]}
        >
          {tab.label}
        </Text>
      </Pressable>
    );
  })}
</View>

      {isPausedMember ? (
        <View style={styles.pausedBox}>
          <Text style={styles.pausedTitle}>휴식중 회원</Text>
          <Text style={styles.pausedText}>
            현재는 공지 확인 및 문의만 이용 가능합니다.
          </Text>

          <Pressable style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>로그아웃</Text>
          </Pressable>
        </View>
      ) : null}

      {activeTab === "notice" ? (
        <View style={styles.section}>
          <View style={styles.noticeHero}>
  <View style={styles.noticeHeroText}>
    <View style={styles.noticeTitleBlock}>
  <Text style={styles.sectionTitle}>중요 공지</Text>
  <Text style={styles.sectionInlineDesc}>중요 공지를 먼저 확인해요</Text>
</View>
  </View>

  <Image
    source={require("../../../assets/images/notice-bg.png")}
    style={styles.noticeHeroImage}
    resizeMode="contain"
  />
</View>

<RecentNoticesSection />

<Pressable
  style={styles.albumBanner}
  onPress={() => router.push("/dojang-album")}
>
  <Image
    source={require("../../../assets/images/dojang-album-banner.png")}
    style={styles.albumBannerImage}
    resizeMode="contain"
  />

  <View style={styles.albumBannerText}>
    <Text style={styles.albumBannerLabel}>도장 앨범</Text>
    <Text style={styles.albumBannerTitle}>함께 수련한 시간들</Text>

    <View style={styles.albumBannerCta}>
      <Text style={styles.albumBannerCtaText}>앨범 보기</Text>
    </View>
  </View>

  <Text style={styles.albumBannerArrow}>›</Text>
</Pressable>
        </View>
      ) : null}

      {activeTab === "guide" ? (
  <View style={styles.section}>
    <View style={styles.noticeHero}>
      <View style={styles.noticeTitleBlock}>
        <Text style={styles.sectionTitle}>도장 안내</Text>
        <Text style={styles.sectionInlineDesc}>
          수련 전 자주 확인하는 안내를 모아두었어요.
        </Text>
      </View>

      <Image
        source={require("../../../assets/images/notice-bg.png")}
        style={styles.noticeHeroImage}
        resizeMode="contain"
      />
    </View>

    <View style={styles.guideCard}>
  <Pressable
    style={styles.guideItem}
    onPress={() => router.push("/(tabs)/inquiry/guide")}
  >
    <View style={styles.guideIconCircle}>
      <Image
        source={require("../../../assets/images/inquiry-guide-icon.png")}
        style={styles.guideIconImage}
        resizeMode="contain"
      />
    </View>

    <View style={styles.guideTextBlock}>
      <Text style={styles.guideTitle}>수련 가이드</Text>
      <Text style={styles.guideText}>도장 이용과 수련 예절 안내</Text>
    </View>

    <Text style={styles.chevron}>›</Text>
  </Pressable>

  <View style={styles.divider} />

  <Pressable
    style={styles.guideItem}
    onPress={() => router.push("/(tabs)/inquiry/schedule")}
  >
    <View style={styles.guideIconCircle}>
      <Image
        source={require("../../../assets/images/inquiry-schedule-icon.png")}
        style={styles.guideIconImage}
        resizeMode="contain"
      />
    </View>

    <View style={styles.guideTextBlock}>
      <Text style={styles.guideTitle}>수련 시간표</Text>
      <Text style={styles.guideText}>요일별 정규 수련 시간 확인</Text>
    </View>

    <Text style={styles.chevron}>›</Text>
  </Pressable>

  <View style={styles.divider} />

  <Pressable
    style={styles.guideItem}
    onPress={() => router.push("/(tabs)/inquiry/faq")}
  >
    <View style={styles.guideIconCircle}>
      <Image
        source={require("../../../assets/images/inquiry-faq-icon.png")}
        style={styles.guideIconImage}
        resizeMode="contain"
      />
    </View>

    <View style={styles.guideTextBlock}>
      <Text style={styles.guideTitle}>FAQ</Text>
      <Text style={styles.guideText}>자주 묻는 질문 모음</Text>
    </View>

    <Text style={styles.chevron}>›</Text>
  </Pressable>


</View>
<Pressable
  style={styles.shopMiniCard}
  onPress={() => router.push("/shop")}
>
  <Image
    source={require("../../../assets/images/shop-mini-card.png")}
    style={styles.shopMiniBg}
    resizeMode="stretch"
  />

  <View style={styles.shopMiniTextBox}>
    <Text style={styles.shopMiniTitle}>수련용품 shop</Text>
    <Text style={styles.shopMiniDesc}>
      수련에 필요한 도장 물품과{"\n"}현중 굿즈를 안내해드려요.
    </Text>
  </View>

  <Text style={styles.shopMiniTopLink}>둘러보기 →</Text>
</Pressable>
  </View>
) : null}

      {activeTab === "inquiry" ? (
        <View style={styles.section}>
          <View style={styles.noticeHero}>
  <View style={styles.noticeTitleBlock}>
    <Text style={styles.sectionTitle}>문의</Text>
    <Text style={styles.sectionInlineDesc}>
      관리자와 주고받은 1:1 문의 기록입니다.
    </Text>
  </View>

  <Image
    source={require("../../../assets/images/notice-bg.png")}
    style={styles.noticeHeroImage}
    resizeMode="contain"
  />
</View>

<View style={styles.inquiryHeaderRow}>
  <Text style={styles.countText}>문의 {rooms.length}건</Text>

  <Pressable onPress={() => router.push("/(tabs)/inquiry/all")}>
    <Text style={styles.allInquiryLink}>전체 문의 보기 ›</Text>
  </Pressable>
</View>

          <View style={styles.inquiryCard}>
            {activeRooms.length === 0 ? (
              <Text style={styles.emptyText}>
                현재 진행 중인 문의가 없습니다.{"\n"}
                새 문의가 있다면 아래 버튼을 눌러주세요.
              </Text>
            ) : (
              previewRooms.map((room, index) => {
                const statusStyle = getStatusStyle(room.status);

                return (
                  <Pressable
                    key={room.roomId || index}
                    style={[
                      styles.inquiryItem,
                      index === previewRooms.length - 1 &&
                        styles.inquiryItemLast,
                    ]}
                    onPress={() =>
                      router.push({
                        pathname: "/(tabs)/inquiry/[roomId]",
                        params: { roomId: String(room.roomId) },
                      })
                    }
                  >
                    <View style={styles.inquiryItemContent}>
  <View style={styles.inquiryLeft}>
    <Text style={styles.inquiryTitle} numberOfLines={1}>
      {room.title || `문의 #${index + 1}`}
    </Text>

    <Text style={styles.inquiryMessage} numberOfLines={2}>
      {room.lastMessage || "최근 메시지가 없습니다."}
    </Text>
  </View>

  <View style={styles.inquiryRightMeta}>
    <View style={[styles.badge, statusStyle.badge]}>
      <Text style={[styles.badgeText, statusStyle.text]}>
        {getStatusLabel(room.status)}
      </Text>
    </View>

    {room.updatedAt ? (
      <Text style={styles.inquiryRightDate}>
        {formatDateTime(room.updatedAt)}
      </Text>
    ) : null}
  </View>
                    </View>
                  </Pressable>
                );
              })
            )}
          </View>

          <Pressable
            style={[styles.button, starting && styles.buttonDisabled]}
            onPress={handleStartInquiry}
            disabled={starting}
          >
            <Text style={styles.buttonText}>
              {starting ? "여는 중..." : "문의 남기기"}
            </Text>
          </Pressable>
        </View>
      ) : null}
    </ScrollView>
  );
}
const fonts = {
  regular: "PretendardRegular",
  medium: "PretendardMedium",
  semiBold: "PretendardSemiBold",
  bold: "PretendardBold",
  title: "MaruBuriBold",
  titleSemi: "MaruBuriSemiBold",
};

const styles = StyleSheet.create({
  container: {
  flex: 1,
  backgroundColor: colors.background,
},
  content: {
  paddingHorizontal: 16,
  paddingTop: 28,
  paddingBottom: 110,
  width: "100%",
  maxWidth: 430,
  alignSelf: "center",
},
  center: {
  flex: 1,
  backgroundColor: colors.background,
  alignItems: "center",
  justifyContent: "center",
},
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#7a6f66",
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#342a24",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: "#81756b",
    marginBottom: 22,
  },

  segment: {
  flexDirection: "row",
  backgroundColor: colors.card,
  borderRadius: radius.md,
  padding: 3,
  borderWidth: 1,
  borderColor: colors.border,
  marginBottom: 22,
},

segmentButton: {
  flex: 1,
  height: 40,
  borderRadius: 10,
  alignItems: "center",
  justifyContent: "center",
},

segmentActive: {
  backgroundColor: colors.warmBrown,
},

segmentText: {
  fontSize: 14,
  fontFamily: fonts.semiBold,
  color: colors.softBrown,
},

segmentTextActive: {
  color: colors.white,
},

  section: {
    gap: 12,
  },
  sectionTitle: {
  fontSize: 26,
  fontFamily: fonts.title,
  color: colors.textMain,
  marginLeft: 4,
  marginBottom: 3,
},
  sectionDesc: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 19,
    color: "#8b7f75",
  },

  guideCard: {
  backgroundColor: colors.card,
  borderRadius: 24,
  paddingHorizontal: 20,
  paddingVertical: 10,
  borderWidth: 0.4,
  borderColor: colors.border,

  shadowColor: "#BFA79B",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.05,
  shadowRadius: 12,
  elevation: 2,
},

guideItem: {
  minHeight: 74,
  flexDirection: "row",
  alignItems: "center",
},
guideIconCircle: {
  width: 50,
  height: 50,
  borderRadius: 32,
  backgroundColor: "transparent",
  alignItems: "center",
  justifyContent: "center",
  marginRight: 18,
},

guideIconText: {
  fontSize: 20,
  fontWeight: "800",
  color: colors.warmBrown,
},
guideTextBlock: {
  flex: 1,
},
guideTitle: {
  fontSize: 18,
  fontFamily: fonts.bold,
  color: colors.textMain,
},

guideText: {
  marginTop: 5,
  fontSize: 13,
  fontWeight: "500",
  lineHeight: 18,
  color: colors.textSub,
},

chevron: {
  fontSize: 13,
  color: colors.softBrown,
  marginLeft: 12,
  marginTop: -2,
},

divider: {
  height: 1,
  backgroundColor: colors.border,
},

  inquiryCard: {
  backgroundColor: colors.card,
  borderRadius: radius.lg,
  paddingHorizontal: 18,
  borderWidth: 1,
  borderColor: colors.border,
  ...shadow.card,
},
  inquiryItem: {
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#eee3d6",
  },
  inquiryItemLast: {
    borderBottomWidth: 0,
  },
  
  inquiryMeta: {
    marginTop: 8,
    fontSize: 12,
    color: "#9b8c80",
  },

  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  emptyText: {
    paddingVertical: 24,
    fontSize: 14,
    lineHeight: 22,
    color: "#7a6f66",
  },

  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  badgeDefault: {
    backgroundColor: "#f0ebe3",
  },
  badgeAnswered: {
    backgroundColor: "#efe3d2",
  },
  badgeOpen: {
    backgroundColor: "#f5eddf",
  },
  badgeClosed: {
    backgroundColor: "#ece8e2",
  },
  badgeUrgent: {
    backgroundColor: "#f1dcd3",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "800",
  },
  badgeTextDefault: {
    color: "#7a6f66",
  },
  badgeTextAnswered: {
    color: "#8a5f27",
  },
  badgeTextOpen: {
    color: "#8a5f27",
  },
  badgeTextClosed: {
    color: "#7a6f66",
  },
  badgeTextUrgent: {
    color: "#9b4a38",
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#9b4a38",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  unreadText: {
    color: "#fffdf9",
    fontSize: 11,
    fontWeight: "800",
  },

  button: {
  marginTop: 8,
  height: 48,
  borderRadius: 14,
  backgroundColor: colors.warmBrown,
  alignItems: "center",
  justifyContent: "center",
},
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fffdf9",
    fontSize: 16,
    fontWeight: "800",
  },

  pausedBox: {
    backgroundColor: "#fff7ed",
    borderWidth: 1,
    borderColor: "#ead2ba",
    borderRadius: 20,
    padding: 16,
    marginBottom: 18,
  },
  pausedTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#8a4a24",
  },
  pausedText: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 20,
    color: "#7c4d30",
  },
  logoutButton: {
    marginTop: 12,
    alignSelf: "flex-start",
    backgroundColor: "#8a4a24",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  logoutButtonText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "800",
  },
  sectionTitleRow: {
  flexDirection: "row",
  alignItems: "flex-end",
  gap: 10,
},
noticeTitleBlock: {
  zIndex: 2,
},

sectionInlineDesc: {
  fontSize: 14,
  fontFamily: fonts.medium,
  color: colors.textSub,
  marginLeft: 4,
},
noticeHero: {
  position: "relative",
  minHeight: 92,
  marginBottom: -4,
  justifyContent: "flex-start",
},

noticeHeroText: {
  zIndex: 2,
},

noticeHeroImage: {
  position: "absolute",
  right: -6,
  top: -10,
  width: 190,
  height: 120,
  opacity: 0.62,
},
guideIconImage: {
  width: 50,
  height: 50,
},

inquiryItemContent: {
  flexDirection: "row",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 14,
},

inquiryLeft: {
  flex: 1,
  paddingTop: 2,
},

inquiryRightMeta: {
  width: 92,
  alignItems: "flex-end",
  gap: 8,
},

inquiryTitle: {
  fontSize: 18,
  fontFamily: fonts.bold,
  color: colors.textMain,
},

inquiryMessage: {
  marginTop: 18,
  fontSize: 14,
  lineHeight: 21,
  color: colors.textSub,
},

inquiryRightDate: {
  fontSize: 12,
  fontWeight: "600",
  color: colors.textMuted,
},
shopMiniCard: {
  position: "relative",
  height: 88,
  borderRadius: 21,
  overflow: "hidden",
  marginTop: 6,
  marginBottom: 8,
  borderWidth: 1,
  borderColor: "#E6D7CB",
  backgroundColor: "#FFF9EF",
},

shopMiniBg: {
  ...StyleSheet.absoluteFillObject,
  width: "100%",
  height: "100%",
},

shopMiniLeft: {
  flex: 1,
},

shopMiniTitle: {
  fontSize: 19,
  lineHeight: 23,
  fontFamily: fonts.titleSemi,
  color: "#3A2A20",
},

shopMiniOverlay: {
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
},

shopMiniTextBox: {
  position: "absolute",
  left: 55,
  top: 19,
  zIndex: 3,
},

shopMiniDesc: {
  marginTop: 4,
  fontSize: 10,
  lineHeight: 14,
  fontFamily: fonts.medium,
  color: "#5E4A3C",
},

shopMiniTopLink: {
  position: "absolute",
  right: 15,
  top: 8,
  zIndex: 4,
  fontSize: 11,
  lineHeight: 16,
  fontFamily: fonts.bold,
  color: "#5A3B29",
},

inquiryHeaderRow: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginTop: -16,
  marginBottom: 4,
  paddingHorizontal: 4,
},

countText: {
  fontSize: 14,
  fontFamily: fonts.bold,
  color: colors.warmBrown,
},

allInquiryLink: {
  fontSize: 13,
  fontFamily: fonts.semiBold,
  color: colors.warmBrown,
},
albumBanner: {
  marginTop: 6,
  minHeight: 85,
  borderRadius: 26,
  padding: 18,
  backgroundColor: "#FFF9EF",
  borderWidth: 1,
  borderColor: "#E8D6B8",
  flexDirection: "row",
  alignItems: "center",
  overflow: "hidden",

  shadowColor: "#BFA79B",
  shadowOffset: { width: 0, height: 5 },
  shadowOpacity: 0.08,
  shadowRadius: 14,
  elevation: 3,
},

albumBannerImage: {
  position: "absolute",
  right: -35,
  bottom: -20,
  width: 260,
  height: 150,
  opacity: 0.5,
},

albumBannerText: {
  flex: 1,
  zIndex: 2,
  paddingRight: 118,
},

albumBannerLabel: {
  marginTop: 7,
  fontSize: 15,
  fontFamily: fonts.semiBold,
  color: colors.warmBrown,
},

albumBannerTitle: {
  marginTop: 7,
  fontSize: 21,
  fontFamily: fonts.titleSemi,
  color: colors.textMain,
},

albumBannerDesc: {
  marginTop: 7,
  fontSize: 13,
  lineHeight: 19,
  fontFamily: fonts.medium,
  color: colors.textSub,
},

albumBannerCta: {
  marginTop: 9,
  alignSelf: "flex-start",
  borderRadius: 999,
  backgroundColor: "#2B2118",
  paddingHorizontal: 14,
  paddingVertical: 7,
},

albumBannerCtaText: {
  fontSize: 13,
  fontFamily: fonts.bold,
  color: "#F7E5C3",
},

albumBannerArrow: {
  position: "absolute",
  right: 16,
  top: 16,
  zIndex: 3,
  fontSize: 25,
  color: colors.softBrown,
},
});