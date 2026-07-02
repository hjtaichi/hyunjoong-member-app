import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import ScreenHeader from "../src/components/ScreenHeader";
import { colors, radius, shadow } from "../src/theme";

const fonts = {
  medium: "PretendardMedium",
  semiBold: "PretendardSemiBold",
  bold: "PretendardBold",
  titleSemi: "MaruBuriSemiBold",
};

export default function PrivateTrainingRequestCompleteScreen() {
  const { requestContent, preferredDate, preferredTime } = useLocalSearchParams();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <ScreenHeader title="상담 신청 완료" />

      <View style={styles.card}>
        <Text style={styles.icon}>✓</Text>

        <Text style={styles.title}>개인지도 상담 신청이{"\n"}완료되었습니다.</Text>

        <Text style={styles.desc}>
          관장님이 신청 내용을 확인한 뒤{"\n"}
          상담 일정과 진행 방법을 안내드릴 예정입니다.
        </Text>

        <View style={styles.infoBox}>
          <InfoRow label="희망 날짜" value={preferredDate || "-"} />
          <InfoRow label="희망 시간" value={preferredTime || "-"} />
          <InfoRow label="상담 내용" value={requestContent || "-"} />
        </View>

        <Pressable
          style={styles.primaryButton}
          onPress={() => router.replace("/(tabs)/taegukwon")}
        >
          <Text style={styles.primaryButtonText}>태극권 탭으로 돌아가기</Text>
        </Pressable>

        <Pressable
          style={styles.secondaryButton}
          onPress={() => router.replace("/(tabs)/mypage")}
        >
          <Text style={styles.secondaryButtonText}>내 정보로 이동</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function InfoRow({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{String(value)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background || "#FFFCFA",
  },
  content: {
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
    paddingHorizontal: 18,
    paddingTop: 24,
    paddingBottom: 110,
  },
  card: {
    marginTop: 28,
    borderRadius: radius.lg,
    backgroundColor: colors.card || "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.border || "#EFE5DE",
    paddingHorizontal: 22,
    paddingVertical: 30,
    alignItems: "center",
    ...shadow.card,
  },
  icon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#241E1A",
    color: "#E9C98A",
    textAlign: "center",
    lineHeight: 64,
    fontSize: 34,
    fontFamily: fonts.bold,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    lineHeight: 34,
    fontFamily: fonts.titleSemi,
    color: colors.textMain,
    textAlign: "center",
  },
  desc: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 22,
    fontFamily: fonts.medium,
    color: colors.textSub,
    textAlign: "center",
  },
  infoBox: {
    width: "100%",
    marginTop: 24,
    borderRadius: 18,
    backgroundColor: "#FFF8EF",
    borderWidth: 1,
    borderColor: "#E8D6BD",
    padding: 14,
  },
  infoRow: {
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: "#EFE4DA",
  },
  infoLabel: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: "#8C6330",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    lineHeight: 21,
    fontFamily: fonts.medium,
    color: colors.textMain,
  },
  primaryButton: {
    width: "100%",
    minHeight: 54,
    borderRadius: 16,
    backgroundColor: colors.warmBrown || "#815A4E",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
  },
  primaryButtonText: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: "#FFFFFF",
  },
  secondaryButton: {
    marginTop: 12,
    minHeight: 48,
    justifyContent: "center",
  },
  secondaryButtonText: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: "#8C6330",
  },
});