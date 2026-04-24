import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "../../../src/contexts/AuthContext";
import { getMemberInquiries } from "../../../src/api/memberInquiry";
import { createMemberInquiry } from "../../../src/api/memberInquiryCreate";
import RecentNoticesSection from "../../../src/components/RecentNoticesSection";

function formatDateTime(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const period = hours < 12 ? "오전" : "오후";
  hours = hours % 12 === 0 ? 12 : hours % 12;

  return `${y}.${m}.${d} ${period} ${hours}:${minutes}`;
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
    return {
      badge: styles.badgeAnswered,
      text: styles.badgeTextAnswered,
    };
  }

  if (status === "open") {
    return {
      badge: styles.badgeOpen,
      text: styles.badgeTextOpen,
    };
  }

  if (status === "closed") {
    return {
      badge: styles.badgeClosed,
      text: styles.badgeTextClosed,
    };
  }

  if (status === "urgent") {
    return {
      badge: styles.badgeUrgent,
      text: styles.badgeTextUrgent,
    };
  }

  return {
    badge: styles.badgeDefault,
    text: styles.badgeTextDefault,
  };
}

export default function InquiryScreen() {
  const { token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [starting, setStarting] = useState(false);
  const [rooms, setRooms] = useState([]);
  const supportHoursText = "운영시간: 평일 오전 9시 ~ 오후 6시";
  const previewRooms = rooms.slice(0, 3);

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

  useEffect(() => {
    loadInquiries();
  }, [loadInquiries]);

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
        <Text style={styles.loadingText}>문의 내역을 불러오는 중입니다.</Text>
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
      <Text style={styles.title}>1:1 문의</Text>

<Text style={styles.subtitle}>
  강사님 또는 관리자와 문의 내용을 주고받을 수 있어요.
</Text>

<Text style={styles.meta}>
  운영시간: 평일 오전 9시 ~ 오후 6시
</Text>

      <RecentNoticesSection />

      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.cardTitle}>최근 문의</Text>
          <Text style={styles.countText}>총 {rooms.length}건</Text>
        </View>

        {rooms.length === 0 ? (
          <Text style={styles.emptyText}>아직 등록된 문의가 없습니다.</Text>
        ) : (
          previewRooms.map((room, index) => {
            const statusStyle = getStatusStyle(room.status);

            return (
              <Pressable
                key={room.roomId || index}
                style={[
                  styles.inquiryItem,
                  index === previewRooms.length - 1 && styles.inquiryItemLast,
                ]}
                onPress={() =>
                  router.push({
                    pathname: "/(tabs)/inquiry/[roomId]",
                    params: { roomId: String(room.roomId) },
                  })
                }
              >
                <View style={styles.rowBetween}>
  <Text style={styles.inquiryTitle}>
    {room.title || `문의 #${index + 1}`}
  </Text>

  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
    {/* 🔴 안읽음 뱃지 */}
    {room.unreadCount > 0 && (
      <View style={styles.unreadBadge}>
        <Text style={styles.unreadText}>{room.unreadCount}</Text>
      </View>
    )}

    {/* 상태 뱃지 */}
    <View style={[styles.badge, statusStyle.badge]}>
      <Text style={[styles.badgeText, statusStyle.text]}>
        {getStatusLabel(room.status)}
      </Text>
    </View>
  </View>
</View>

                <Text style={styles.inquiryMessage}>
                  {room.lastMessage || "최근 메시지가 없습니다."}
                </Text>

                {room.updatedAt ? (
                  <Text style={styles.inquiryMeta}>
                    최근 업데이트: {formatDateTime(room.updatedAt)}
                  </Text>
                ) : null}
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
          {starting ? "여는 중..." : "1:1 문의하기"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f3ee",
  },
  content: {
  paddingHorizontal: 20,
  paddingTop: 42,
  paddingBottom: 24,
},
  center: {
    flex: 1,
    backgroundColor: "#f6f3ee",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6b6257",
  },
  title: {
  fontSize: 28,
  fontWeight: "800",
  color: "#2f2a24",
  marginBottom: 10,
},
subtitle: {
  fontSize: 14,
  lineHeight: 21,
  color: "#6b6257",
  marginBottom: 10,
},
meta: {
  fontSize: 13,
  color: "#8a7f72",
  marginBottom: 18,
},
  card: {
    backgroundColor: "#fffdf9",
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ece4d8",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#2f2a24",
    marginBottom: 10,
  },
  cardText: {
    fontSize: 14,
    lineHeight: 21,
    color: "#4c4339",
    marginBottom: 4,
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  countText: {
    fontSize: 13,
    color: "#8a7f72",
    fontWeight: "700",
  },
  emptyText: {
    fontSize: 14,
    color: "#6b6257",
    lineHeight: 21,
  },
  inquiryItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#ece4d8",
  },
  inquiryItemLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  inquiryTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2f2a24",
  },
  inquiryMessage: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: "#4c4339",
  },
  inquiryMeta: {
    marginTop: 8,
    fontSize: 12,
    color: "#8a7f72",
  },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  badgeDefault: {
    backgroundColor: "#f0ece5",
  },
  badgeAnswered: {
    backgroundColor: "#e8e0d2",
  },
  badgeOpen: {
    backgroundColor: "#f3ecdf",
  },
  badgeClosed: {
    backgroundColor: "#ededed",
  },
  badgeUrgent: {
    backgroundColor: "#f3ddd5",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  badgeTextDefault: {
    color: "#6b6257",
  },
  badgeTextAnswered: {
    color: "#7c4f21",
  },
  badgeTextOpen: {
    color: "#8c6330",
  },
  badgeTextClosed: {
    color: "#7a6f61",
  },
  badgeTextUrgent: {
    color: "#9f3f28",
  },

  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#c95f4a",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  unreadText: {
    color: "#fffdf9",
    fontSize: 11,
    fontWeight: "700",
  },

  button: {
    backgroundColor: "#8c6330",
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fffdf9",
    fontSize: 18,
    fontWeight: "800",
  },
});