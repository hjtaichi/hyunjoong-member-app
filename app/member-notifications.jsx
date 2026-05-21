import React, { useCallback, useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "../src/contexts/AuthContext";
import {
  getMemberNotifications,
  markMemberNotificationRead,
} from "../src/api/memberNotifications";

export default function MemberNotificationsScreen() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);

  const loadNotifications = useCallback(async () => {
    if (!token) return;

    try {
      const data = await getMemberNotifications(token);
      setItems(data);
    } catch (error) {
      console.log("회원 알림 조회 실패:", error);
    }
  }, [token]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  async function handleOpen(item) {
  try {
    if (!item.isRead) {
      await markMemberNotificationRead(token, item.id);
    }

    if (item.type === "inquiry_reply") {
      const roomId = item.metadata?.roomId;

      if (roomId) {
        router.push({
          pathname: "/(tabs)/inquiry/[roomId]",
          params: { roomId: String(roomId) },
        });
        return;
      }
    }

    if (item.targetUrl?.startsWith("/coaching-detail")) {
      const query = item.targetUrl.split("?")[1] || "";
      const params = new URLSearchParams(query);
      const id = params.get("id");

      router.push({
        pathname: "/coaching-detail",
        params: { id },
      });
      return;
    }

    await loadNotifications();
  } catch (error) {
    console.log("알림 열기 실패:", error);
  }
}

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>‹</Text>
      </Pressable>

      <Text style={styles.title}>알림</Text>

      {items.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>도착한 알림이 없습니다.</Text>
        </View>
      ) : (
        items.map((item) => (
          <Pressable
            key={item.id}
            style={[styles.card, !item.isRead && styles.unreadCard]}
            onPress={() => handleOpen(item)}
          >
            <View style={styles.cardTop}>
              <Text style={styles.badge}>
                {item.type === "coaching_comment"
  ? "코칭"
  : item.type === "inquiry_reply"
  ? "문의"
  : "알림"}
              </Text>

              {!item.isRead ? <View style={styles.dot} /> : null}
            </View>

            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardMessage}>{item.message}</Text>

            <Text style={styles.dateText}>
              {item.createdAt
                ? new Date(item.createdAt).toLocaleString("ko-KR")
                : ""}
            </Text>
          </Pressable>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFCFA",
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 44,
    paddingBottom: 40,
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: "center",
    marginBottom: 4,
  },
  backText: {
    fontSize: 34,
    color: "#2B221D",
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: "#3A2C27",
    marginBottom: 18,
  },
  emptyBox: {
    padding: 24,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EFE5DE",
  },
  emptyText: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "700",
    color: "#9B8D84",
  },
  card: {
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EFE5DE",
    padding: 16,
    marginBottom: 12,
  },
  unreadCard: {
    backgroundColor: "#FFF8EA",
    borderColor: "#E7C98F",
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  badge: {
    backgroundColor: "#3A2C27",
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    overflow: "hidden",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#D34A2C",
    marginLeft: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#3A2C27",
    marginBottom: 6,
  },
  cardMessage: {
    fontSize: 14,
    lineHeight: 21,
    color: "#6B4F46",
    fontWeight: "600",
  },
  dateText: {
    marginTop: 10,
    fontSize: 11,
    color: "#A99F98",
  },
});