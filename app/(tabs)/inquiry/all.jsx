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
import { Stack, router } from "expo-router";
import ScreenHeader from "../../../src/components/ScreenHeader";
import { colors, radius, shadow } from "../../../src/theme";
import { useAuth } from "../../../src/contexts/AuthContext";
import { getMemberInquiries } from "../../../src/api/memberInquiry";


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
  if (status === "closed") return "종료";
  return status || "확인중";
}

export default function InquiryAllScreen() {
  const { token } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadRooms = useCallback(
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
    loadRooms();
  }, [loadRooms]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadRooms({ silent: true });
  }, [loadRooms]);

 return (
  <>
    <Stack.Screen options={{ headerShown: false }} />

    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <ScreenHeader
  title="전체 문의"
  onBack={() =>
    router.replace({
      pathname: "/(tabs)/inquiry",
      params: { tab: "inquiry" },
    })
  }
/>

    <Text style={styles.subtitle}>총 {rooms.length}건의 문의가 있어요.</Text>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" />
          </View>
        ) : rooms.length === 0 ? (
          <View style={styles.card}>
            <Text style={styles.emptyText}>아직 등록된 문의가 없습니다.</Text>
          </View>
        ) : (
          <View style={styles.card}>
            {rooms.map((room, index) => (
              <Pressable
                key={room.roomId || index}
                style={[
                  styles.item,
                  index === rooms.length - 1 && styles.itemLast,
                ]}
                onPress={() =>
                  router.push({
                    pathname: "/(tabs)/inquiry/[roomId]",
                    params: { roomId: String(room.roomId) },
                  })
                }
              >
                <View style={styles.rowBetween}>
                  <Text style={styles.itemTitle}>
                    {room.title || `문의 #${index + 1}`}
                  </Text>

                  <View style={styles.rightWrap}>
                    {room.unreadCount > 0 ? (
                      <View style={styles.unreadBadge}>
                        <Text style={styles.unreadText}>
                          {room.unreadCount}
                        </Text>
                      </View>
                    ) : null}

                    <View style={styles.statusBadge}>
                      <Text style={styles.statusText}>
                        {getStatusLabel(room.status)}
                      </Text>
                    </View>
                  </View>
                </View>

                <Text style={styles.message}>
                  {room.lastMessage || "최근 메시지가 없습니다."}
                </Text>

                {room.updatedAt ? (
                  <Text style={styles.meta}>
                    최근 업데이트: {formatDateTime(room.updatedAt)}
                  </Text>
                ) : null}
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
       </>
  );
}

const styles = StyleSheet.create({
  container: {
  flex: 1,
  backgroundColor: colors.background,
},
content: {
  paddingHorizontal: 16,
  paddingTop: 24,
  paddingBottom: 40,
  width: "100%",
  maxWidth: 430,
  alignSelf: "center",
},
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#2f2a24",
    marginBottom: 8,
  },
subtitle: {
  marginTop: -6,
  marginBottom: 18,
  fontSize: 14,
  color: colors.textSub,
  textAlign: "center",
},
  center: {
    paddingVertical: 40,
    alignItems: "center",
  },
card: {
  backgroundColor: colors.card,
  borderRadius: radius.lg,
  padding: 16,
  borderWidth: 1,
  borderColor: colors.border,
  ...shadow.card,
},
  emptyText: {
    fontSize: 14,
    color: "#6b6257",
  },
  item: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#ece4d8",
  },
  itemLast: {
    borderBottomWidth: 0,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#2f2a24",
    flex: 1,
  },
  rightWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "#f3ecdf",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#8c6330",
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
    fontWeight: "800",
  },
  message: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: "#4c4339",
  },
  meta: {
    marginTop: 8,
    fontSize: 12,
    color: "#8a7f72",
  },
});