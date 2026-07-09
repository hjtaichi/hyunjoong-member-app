import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

export default function CoachingUploadCompleteScreen() {
  const params = useLocalSearchParams();

const uploadedDate = params.uploadedAt
  ? new Date(String(params.uploadedAt)).toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  : "-";

const fileSizeText = params.size
  ? Number(params.size) >= 1024 * 1024
    ? `${(Number(params.size) / 1024 / 1024).toFixed(1)}MB`
    : `${(Number(params.size) / 1024).toFixed(1)}KB`
  : "-";
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Pressable style={styles.backButton} onPress={() => router.replace("/coaching-videos")}>
        <Text style={styles.backText}>‹</Text>
      </Pressable>

      <View style={styles.hero}>
        <View style={styles.checkCircle}>
          <Text style={styles.checkText}>✓</Text>
        </View>

        <Text style={styles.title}>영상이 업로드되었습니다.</Text>
        <Text style={styles.desc}>
          관장님께서 확인 후 코칭 댓글을 남겨주실 예정입니다.
        </Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>업로드 정보</Text>

        <InfoRow label="수련 과정" value={params.curriculum || "-"} />
<InfoRow label="세부 동작" value={params.movement || "-"} />
<InfoRow label="파일명" value={params.originalName || "-"} />
<InfoRow label="업로드 시간" value={uploadedDate} />
<InfoRow label="파일 크기" value={fileSizeText} />
      </View>

      <View style={styles.noticeBox}>
        <Text style={styles.noticeIcon}>▣</Text>
        <Text style={styles.noticeText}>
          코칭이 등록되면 알림 또는 마이페이지에서 확인하실 수 있습니다.
        </Text>
      </View>

      <Pressable
        style={styles.confirmButton}
        onPress={() => router.replace("/coaching-videos")}
      >
        <Text style={styles.confirmButtonText}>확인</Text>
      </Pressable>
    </ScrollView>
  );
}

function InfoRow({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFCFA",
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 15,
    paddingBottom: 34,
    minHeight: "100%",
  },

  backButton: {
    width: 34,
    height: 34,
    justifyContent: "center",
  },

  backText: {
    fontSize: 34,
    color: "#2B221D",
  },

  hero: {
    alignItems: "center",
    paddingTop: 36,
    paddingBottom: 40,
  },

  checkCircle: {
    width: 60,
    height: 60,
    borderRadius: 43,
    borderWidth: 3,
    borderColor: "#4A2F1E",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },

  checkText: {
    fontSize: 30,
    fontWeight: "900",
    color: "#4A2F1E",
  },

  title: {
    fontSize: 23,
    fontWeight: "800",
    color: "#3A2C27",
    marginBottom: 8,
  },

  desc: {
    fontSize: 13,
    lineHeight: 22,
    fontWeight: "600",
    color: "#8A7A72",
    textAlign: "center",
  },

  infoCard: {
    backgroundColor: "#F7F0E6",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },

  infoTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#3A2C27",
    marginBottom: 14,
  },

  infoRow: {
    flexDirection: "row",
    marginBottom: 12,
  },

  infoLabel: {
    width: 92,
    fontSize: 13,
    fontWeight: "700",
    color: "#8A7A72",
  },

  infoValue: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    color: "#4A2F1E",
  },

  noticeBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#F8F0E4",
    borderRadius: 14,
    padding: 14,
    marginBottom: 30,
  },

  noticeIcon: {
    fontSize: 18,
    color: "#C89E6A",
  },

  noticeText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "700",
    color: "#6B4F46",
  },

  confirmButton: {
    height: 56,
    borderRadius: 14,
    backgroundColor: "#4A2F1E",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "auto",
  },

  confirmButtonText: {
    fontSize: 17,
    fontWeight: "900",
    color: "#FFFFFF",
  },
});