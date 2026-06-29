import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "../../src/contexts/AuthContext";
import { getMemberNoticeDetail } from "../../src/api/memberNotice";
import { colors, radius, shadow } from "../../src/theme";
import ScreenHeader from "../../src/components/ScreenHeader";
const fonts = {
  medium: "PretendardMedium",
  semiBold: "PretendardSemiBold",
  bold: "PretendardBold",
  title: "MaruBuriBold",
  titleSemi: "MaruBuriSemiBold",
};

export default function NoticeDetailScreen() {
  const { noticeId } = useLocalSearchParams();
  const router = useRouter();
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
  async function fetchData() {
    if (!noticeId) {
      setLoading(false);
      return;
    }

    if (!token) {
      return;
    }

    try {
      setLoading(true);
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
<ScreenHeader
  title="공지 상세"
  onBack={() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/member-notifications");
    }
  }}
/>

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

      <View style={styles.divider} />

      <Text style={styles.body}>{notice.content}</Text>
    </View>
  </ScrollView>
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
    paddingBottom: 110,
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
  },

  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },

  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.blushBeige,
    marginBottom: 14,
  },

  badgeText: {
    fontSize: 12,
    fontFamily: fonts.bold,
    color: colors.warmBrown,
  },

  title: {
    fontSize: 24,
    lineHeight: 32,
    fontFamily: fonts.titleSemi,
    color: colors.textMain,
    marginBottom: 8,
  },

  date: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colors.textMuted,
    marginBottom: 16,
  },

  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: 18,
  },

  body: {
    fontSize: 15,
    lineHeight: 25,
    fontFamily: fonts.medium,
    color: colors.textMain,
  },

  center: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyText: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.textSub,
  },
});