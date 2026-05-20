import React, { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
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
import { router } from "expo-router";
import { colors } from "../../../src/theme/colors";
import { useAuth } from "../../../src/contexts/AuthContext";
import { getMemberInquiries } from "../../../src/api/memberInquiry";
import { createMemberInquiry } from "../../../src/api/memberInquiryCreate";
import RecentNoticesSection from "../../../src/components/RecentNoticesSection";

const TABS = [
  { key: "notice", label: "공지" },
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
  const authUser = user || {};
  const memberStatus = authUser?.memberStatus || authUser?.status;
  const isPausedMember = memberStatus === "paused";

  const [activeTab, setActiveTab] = useState("notice");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [starting, setStarting] = useState(false);
  const [rooms, setRooms] = useState([]);

  const previewRooms = rooms.slice(0, 3);

  async function handleLogout() {
    Alert.alert("로그아웃", "로그아웃하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "로그아웃",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/login");
        },
      },
    ]);
  }

  const loadInquiries = useCallback(
    async ({ silent = false } = {}) => {
      if (!token) return;

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

  useFocusEffect(
    useCallback(() => {
      loadInquiries({ silent: true });
    }, [loadInquiries])
  );

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
  <Text style={styles.sectionTitle}>최근 공지</Text>
  <Text style={styles.sectionInlineDesc}>가장 최근 안내를 먼저 확인해요</Text>
</View>
  </View>

  <Image
    source={require("../../../assets/images/notice-bg.png")}
    style={styles.noticeHeroImage}
    resizeMode="contain"
  />
</View>

<RecentNoticesSection />
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

      <View style={styles.divider} />

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
    </View>
  </View>
) : null}

      {activeTab === "inquiry" ? (
        <View style={styles.section}>
          <View style={styles.rowBetween}>
            <View>
              <Text style={styles.sectionTitle}>문의</Text>
              <Text style={styles.sectionDesc}>
                관리자와 주고받은 1:1 문의 기록입니다.
              </Text>
            </View>

            <Text style={styles.countText}>{rooms.length}건</Text>
          </View>

          <View style={styles.inquiryCard}>
            {rooms.length === 0 ? (
              <Text style={styles.emptyText}>
                아직 남긴 문의가 없습니다.{"\n"}
                궁금한 점이 있다면 문답을 남겨주세요.
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

const styles = StyleSheet.create({
  container: {
  flex: 1,
  backgroundColor: colors.background,
},
  content: {
  paddingHorizontal: 20,
  paddingTop: 46,
  paddingBottom: 110,
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
  borderRadius: 12,
  padding: 3,
  borderWidth: 1,
  borderColor: colors.border,
  marginBottom: 24,
},
  segmentButton: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentActive: {
  backgroundColor: colors.warmBrown,
},
  segmentText: {
  fontSize: 15,
  fontWeight: "800",
  color: colors.softBrown,
},
  segmentTextActive: {
  color: colors.white,
},

  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 30,
    fontWeight: "800",
    color: "#342a24",
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
  minHeight: 82,
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
  fontSize: 20,
  fontWeight: "700",
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
    backgroundColor: "#fffdf9",
    borderRadius: 24,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: "#eadfd4",
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
  countText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#9a6f3a",
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
    marginTop: 6,
    height: 56,
    borderRadius: 20,
    backgroundColor: "#735247",
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
  marginBottom: 3,
  fontSize: 13,
  fontWeight: "500",
  color: "#8b7f75",
},
noticeHero: {
  position: "relative",
  minHeight: 78,
  marginBottom: -8,
  justifyContent: "flex-start",
},

noticeHeroText: {
  zIndex: 2,
},

noticeHeroImage: {
  position: "absolute",
  right: -20,
  top: -30,

  width: 200,
  height: 130,

  opacity: 0.7,
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
  fontWeight: "800",
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
});