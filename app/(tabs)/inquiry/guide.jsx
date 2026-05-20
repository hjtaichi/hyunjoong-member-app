import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

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
    backgroundColor: "#f6f3ee",
  },
  content: {
    paddingHorizontal: 20,
      paddingTop: 10,
      paddingBottom: 28,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#2f2a24",
  },
  subtitle: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 21,
    color: "#6b6257",
  },
  card: {
    marginTop: 20,
    backgroundColor: "#fffdf9",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "#ece4d8",
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingVertical: 9,
  },
  checkbox: {
    width: 13,
    height: 13,
    marginTop: 4,
    borderWidth: 1.5,
    borderColor: "#5f554b",
    borderRadius: 2,
  },
  itemText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
    color: "#3f3831",
    fontWeight: "600",
  },
  footer: {
    marginTop: 22,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "800",
    color: "#4c4339",
  },
});