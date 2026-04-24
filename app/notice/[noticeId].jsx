import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useAuth } from "../../src/contexts/AuthContext";
import { getMemberNoticeDetail } from "../../src/api/memberNotice";

export default function NoticeDetailScreen() {
  const { noticeId } = useLocalSearchParams();
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
  async function fetchData() {
    if (!token || !noticeId) return;

    try {
      const result = await getMemberNoticeDetail(token, String(noticeId));
      setNotice(result);
    } catch (error) {
      Alert.alert("오류", error.message || "공지 상세를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }

  fetchData();
}, [token, noticeId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!notice) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>공지 정보를 찾을 수 없습니다.</Text>
      </View>
    );
  }

  return (
  <ScrollView style={styles.container} contentContainerStyle={styles.content}>
    <View style={styles.card}>
  <View style={styles.badge}>
    <Text style={styles.badgeText}>
      {notice.isPopup ? "팝업 공지" : "공지사항"}
    </Text>
  </View>

  <Text style={styles.title}>{notice.title}</Text>

  <Text style={styles.date}>
    {notice.publishedAt
      ? new Date(notice.publishedAt).toLocaleDateString("ko-KR")
      : ""}
  </Text>

  <Text style={styles.body}>{notice.content}</Text>
</View>
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
  card: {
    backgroundColor: "#fffdf9",
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: "#ece4d8",
  },
  center: {
    flex: 1,
    backgroundColor: "#f6f3ee",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#2f2a24",
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
    color: "#8a7f72",
    marginBottom: 18,
  },
  body: {
    fontSize: 15,
    lineHeight: 24,
    color: "#4c4339",
  },
  emptyText: {
  fontSize: 14,
  color: "#6b6257",
},
});