import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "../contexts/AuthContext";
import { getMemberNoticeList } from "../api/memberNotice";

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("ko-KR");
}

export default function RecentNoticesSection() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [notices, setNotices] = useState([]);

  const loadNotices = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      const result = await getMemberNoticeList(token);
      setNotices(Array.isArray(result) ? result.slice(0, 2) : []);
    } catch (error) {
      console.log("최근 공지 조회 실패:", error?.message);
      setNotices([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadNotices();
  }, [loadNotices]);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>최근 공지</Text>

        <Pressable onPress={() => router.push("/notice")}>
          <Text style={styles.moreText}>전체 보기</Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="small" />
          <Text style={styles.loadingText}>공지 불러오는 중...</Text>
        </View>
      ) : notices.length === 0 ? (
        <Text style={styles.emptyText}>등록된 공지가 없습니다.</Text>
      ) : (
        <View style={styles.listWrap}>
          {notices.map((item, index) => (
            <Pressable
              key={item.id}
              style={[
                styles.noticeItem,
                index !== notices.length - 1 && styles.noticeItemBorder,
              ]}
              onPress={() =>
                router.push({
                  pathname: "/notice/[noticeId]",
                  params: { noticeId: String(item.id) },
                })
              }
            >
              <View style={styles.noticeTopRow}>
                <Text style={styles.noticeTitle} numberOfLines={1}>
                  {item.title}
                </Text>

                {item.isPopup ? (
                  <View style={styles.popupBadge}>
                    <Text style={styles.popupBadgeText}>팝업</Text>
                  </View>
                ) : null}
              </View>

              <Text style={styles.noticeContent} numberOfLines={2}>
                {item.content}
              </Text>

              <Text style={styles.noticeDate}>
                {formatDate(item.publishedAt)}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fffdf9",
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ece4d8",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: "#2f2a24",
  },
  moreText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#8c6330",
  },
  loadingWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
  },
  loadingText: {
    fontSize: 13,
    color: "#6b6257",
  },
  emptyText: {
    fontSize: 14,
    color: "#6b6257",
    paddingVertical: 8,
  },
  listWrap: {
    gap: 2,
  },
  noticeItem: {
    paddingVertical: 14,
  },
  noticeItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#ece4d8",
  },
  noticeTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  noticeTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: "800",
    color: "#2f2a24",
  },
  popupBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "#f3ecdf",
  },
  popupBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#8c6330",
  },
  noticeContent: {
    fontSize: 14,
    lineHeight: 21,
    color: "#4c4339",
    marginBottom: 8,
  },
  noticeDate: {
    fontSize: 12,
    color: "#8a7f72",
  },
});