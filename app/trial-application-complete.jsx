import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { colors } from "../src/theme/colors";

export default function TrialApplicationCompleteScreen() {
  const params = useLocalSearchParams();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.backText}>‹</Text>
        </Pressable>

        <Text style={styles.headerTitle}>체험 신청 완료</Text>

        <View style={{ width: 28 }} />
      </View>

      <View style={styles.completeIconWrap}>
        <View style={styles.brushCircle}>
          <Text style={styles.checkText}>✓</Text>
        </View>
      </View>

      <Text style={styles.title}>체험 신청이 완료되었습니다.</Text>

      <Text style={styles.desc}>
        빠른 시일 내에 도장에서{"\n"}
        연락드리겠습니다.
      </Text>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>신청 정보 요약</Text>

        <InfoRow label="이름" value={params.name || "-"} />
        <InfoRow label="성별" value={params.gender || "-"} />
        <InfoRow label="연락처" value={params.phone || "-"} />
        <InfoRow label="희망 날짜" value={params.hopeDate || "-"} />
        <InfoRow label="신발 사이즈" value={params.shoeSize ? `${params.shoeSize} mm` : "-"} />
        <InfoRow label="키" value={params.height ? `${params.height} cm` : "-"} />
        <InfoRow label="메모" value={params.memo || "-"} />
      </View>

      <View style={styles.thanksBox}>
        <Text style={styles.thanksTitle}>추천해주셔서 감사합니다.</Text>
        <Text style={styles.thanksText}>
          함께 수련하는 즐거움을 나누어 주세요.
        </Text>
      </View>

      <Pressable
        style={styles.confirmButton}
        onPress={() => router.replace("/(tabs)/mypage")}
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
    backgroundColor: colors.background,
  },

  content: {
    paddingHorizontal: 18,
    paddingTop: 44,
    paddingBottom: 120,
  },

  header: {
    height: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backText: {
    fontSize: 34,
    color: "#241E1A",
    fontWeight: "300",
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#241E1A",
  },

  completeIconWrap: {
    marginTop: 38,
    alignItems: "center",
  },

  brushCircle: {
    width: 132,
    height: 132,
    borderRadius: 66,
    borderWidth: 16,
    borderColor: "#2B2522",
    backgroundColor: "#FFFEFC",
    alignItems: "center",
    justifyContent: "center",
  },

  checkText: {
    fontSize: 56,
    fontWeight: "900",
    color: "#B58745",
    marginTop: -4,
  },

  title: {
    marginTop: 34,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "900",
    color: "#241E1A",
  },

  desc: {
    marginTop: 16,
    textAlign: "center",
    fontSize: 15,
    lineHeight: 24,
    color: "#5F554B",
  },

  summaryCard: {
    marginTop: 34,
    borderRadius: 22,
    backgroundColor: "#FFFEFC",
    borderWidth: 1,
    borderColor: "#E8DED2",
    paddingHorizontal: 18,
    paddingVertical: 18,
  },

  summaryTitle: {
    marginBottom: 14,
    fontSize: 16,
    fontWeight: "900",
    color: "#9A6A33",
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 7,
    gap: 14,
  },

  infoLabel: {
    width: 82,
    fontSize: 13,
    fontWeight: "900",
    color: "#241E1A",
  },

  infoValue: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
    color: "#3A312B",
  },

  thanksBox: {
    marginTop: 18,
    borderRadius: 18,
    backgroundColor: "#F4E6D0",
    borderWidth: 1,
    borderColor: "#E8D6BD",
    paddingHorizontal: 16,
    paddingVertical: 15,
  },

  thanksTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#8C6330",
  },

  thanksText: {
    marginTop: 5,
    fontSize: 13,
    lineHeight: 19,
    color: "#6F5E4D",
  },

  confirmButton: {
    marginTop: 24,
    minHeight: 58,
    borderRadius: 18,
    backgroundColor: "#241E1A",
    alignItems: "center",
    justifyContent: "center",
  },

  confirmButtonText: {
    fontSize: 17,
    fontWeight: "900",
    color: "#E9C98A",
  },
});