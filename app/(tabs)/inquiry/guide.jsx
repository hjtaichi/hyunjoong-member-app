import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, radius, shadow } from "../../../src/theme";
import ScreenHeader from "../../../src/components/ScreenHeader";

const fonts = {
  medium: "PretendardMedium",
  semiBold: "PretendardSemiBold",
  bold: "PretendardBold",
  titleSemi: "MaruBuriSemiBold",
};

const items = [
  "수련 전 따뜻한 차로 몸 속을 덥혀 줍니다.",
  "수련은 느긋한 마음으로 꾸준히 합니다.",
  "수련 중에는 약간 헐렁한 긴 소매 상의를 착용합니다.",
  "동작을 시작하면 목표를 채울 때까지 지속합니다.",
  "선배의 동작을 흉내내기보다 내 몸의 변화를 지켜봅니다.",
  "수련 중이나 수련 전후에는 직접적인 찬바람을 쐬지 않습니다.",
  "샤워는 수련 약 15~20분 이후 온수로 합니다.",
  "선배·후배·동료 상호 간 수련지도는 하지 않습니다.",
  "수련복은 땀 냄새가 나지 않게 정기적으로 세탁합니다.",
  "사용한 컵은 각자 씻어서 제자리에 비치합니다.",
  "소지품은 개인 책임하에 잘 간수합니다.",
  "일상생활에서 상온이나 따뜻한 음료를 즐기도록 합니다.",
  "결석보다는 잠깐의 출석이 건강비급입니다.",
];

export default function GuideScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
  <ScreenHeader title="수련 가이드" />

  <Text style={styles.subtitle}>
        현중태극권 수련 시 함께 지키는 기본 안내입니다.
      </Text>

      <View style={styles.card}>
        {items.map((item, index) => (
          <View key={index} style={styles.itemRow}>
            <View style={styles.checkbox} />
            <Text style={styles.itemText}>{item}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.footer}>한국현중태극권총회</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
screen: {
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
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#2f2a24",
  },
 subtitle: {
  fontSize: 14,
  lineHeight: 22,
  fontFamily: fonts.medium,
  color: colors.textSub,
  marginBottom: 14,
},

card: {
  backgroundColor: colors.card,
  borderRadius: radius.lg,
  paddingHorizontal: 18,
  paddingVertical: 16,
  borderWidth: 1,
  borderColor: colors.border,
  ...shadow.card,
},

itemRow: {
  flexDirection: "row",
  alignItems: "flex-start",
  gap: 10,
  paddingVertical: 9,
},

checkbox: {
  width: 14,
  height: 14,
  marginTop: 5,
  borderWidth: 1.4,
  borderColor: colors.softBrown,
  borderRadius: 3,
},
itemText: {
  flex: 1,
  fontSize: 15,
  lineHeight: 24,
  fontFamily: fonts.medium,
  color: colors.textMain,
},

footer: {
  marginTop: 22,
  textAlign: "center",
  fontSize: 16,
  fontFamily: fonts.titleSemi,
  color: colors.textMain,
},
});