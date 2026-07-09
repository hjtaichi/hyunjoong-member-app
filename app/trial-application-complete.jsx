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

      <Text style={styles.title}>체험 추천이 접수되었습니다.</Text>

      <Text style={styles.desc}>
        추천해주신 내용을 확인한 뒤{"\n"}
        도장에서 안내드리겠습니다.
      </Text>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>신청 정보 요약</Text>

        <InfoRow label="성별" value={params.gender || "-"} />
<InfoRow label="희망 날짜" value={params.hopeDate || "-"} />
<InfoRow label="희망 시간" value={params.hopeTime || "-"} />
<InfoRow
  label="신발 사이즈"
  value={params.shoeSize ? `${params.shoeSize} mm` : "-"}
/>
<InfoRow
  label="키"
  value={params.height ? `${params.height} cm` : "-"}
/>
<InfoRow label="메모" value={params.memo || "-"} />
      </View>

      <View style={styles.thanksBox}>
        <Text style={styles.thanksTitle}>추천이 접수되었습니다.</Text>
<Text style={styles.thanksText}>
  개인정보는 받지 않고, 체험 준비에 필요한 정보만 전달됩니다.
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
    width: 90,
    height: 90,
    borderRadius: 66,
    borderWidth: 6,
    borderColor: "#2B2522",
    backgroundColor: "#FFFEFC",
    alignItems: "center",
    justifyContent: "center",
  },

  checkText: {
    fontSize: 50,
    fontWeight: "900",
    color: "#B58745",
    marginTop: -4,
  },

  title: {
    marginTop: 30,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "700",
    color: "#241E1A",
  },

  desc: {
    marginTop: 10,
    textAlign: "center",
    fontSize: 15,
    lineHeight: 22,
    color: "#5F554B",
  },

  summaryCard: {
    marginTop: 24,
    borderRadius: 22,
    backgroundColor: "#FFFEFC",
    borderWidth: 1,
    borderColor: "#E8DED2",
    paddingHorizontal: 18,
    paddingVertical: 18,
  },

  summaryTitle: {
    marginBottom: 14,
    fontSize: 17,
    fontWeight: "800",
    color: "#9A6A33",
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 6,
    gap: 14,
  },

  infoLabel: {
    width: 82,
    fontSize: 14,
    fontWeight: "800",
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
    marginTop: 16,
    borderRadius: 18,
    backgroundColor: "#F4E6D0",
    borderWidth: 1,
    borderColor: "#E8D6BD",
    paddingHorizontal: 14,
    paddingVertical: 13,
  },

  thanksTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#8C6330",
  },

  thanksText: {
    marginTop: 5,
    fontSize: 12,
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
    color: "#f1e9d7",
  },
});