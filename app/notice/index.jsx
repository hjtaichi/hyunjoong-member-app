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
import { useAuth } from "../../src/contexts/AuthContext";
import { getMemberNoticeList } from "../../src/api/memberNotice";

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("ko-KR");
}

export default function NoticeListScreen() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notices, setNotices] = useState([]);

  const loadNotices = useCallback(async ({ silent = false } = {}) => {
    if (!token) return;

    try {
      if (!silent) setLoading(true);

      const result = await getMemberNoticeList(token);
      setNotices(Array.isArray(result) ? result : []);
    } catch (error) {
      Alert.alert("오류", error.message || "공지 목록을 불러오지 못했습니다.");
      setNotices([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    loadNotices();
  }, [loadNotices]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadNotices({ silent: true });
  }, [loadNotices]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>공지 목록을 불러오는 중입니다.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={styles.screenTitle}>공지사항</Text>

      {notices.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>등록된 공지가 없습니다.</Text>
        </View>
      ) : (
        notices.map((item) => (
          <Pressable
            key={item.id}
            style={styles.noticeCard}
            onPress={() =>
              router.push({
                pathname: "/notice/[noticeId]",
                params: { noticeId: String(item.id) },
              })
            }
          >
            <View style={styles.noticeHeader}>
              <Text style={styles.noticeTitle}>{item.title}</Text>

              {item.isPopup ? (
                <View style={styles.popupBadge}>
                  <Text style={styles.popupBadgeText}>팝업</Text>
                </View>
              ) : null}
            </View>

            <Text style={styles.noticeBody} numberOfLines={3}>
              {item.content}
            </Text>

            <Text style={styles.noticeDate}>
              {formatDate(item.publishedAt)}
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
    paddingHorizontal: 24,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "#6b6257",
  },
  screenTitle: {
    fontSize: 30,
    fontWeight: "800",
    color: "#2f2a24",
    marginBottom: 22,
  },
  emptyCard: {
    backgroundColor: "#fffdf9",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#ece4d8",
  },
  emptyText: {
    fontSize: 14,
    color: "#6b6257",
  },
  noticeCard: {
    backgroundColor: "#fffdf9",
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ece4d8",
  },
  noticeHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 10,
  },
  noticeTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "800",
    color: "#2f2a24",
  },
  noticeBody: {
    fontSize: 14,
    lineHeight: 22,
    color: "#4c4339",
    marginBottom: 10,
  },
  noticeDate: {
    fontSize: 12,
    color: "#8a7f72",
  },
  popupBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#f3ecdf",
  },
  popupBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#8c6330",
  },
});