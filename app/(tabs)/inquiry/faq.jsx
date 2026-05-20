import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

const faqs = [
  {
    q: "처음 수련할 때 무엇을 준비하면 되나요?",
    a: "움직이기 편한 복장과 개인 물병을 준비해주세요. 수련복은 추후 도장 안내에 따라 준비하시면 됩니다.",
  },
  {
    q: "수련 예약은 꼭 해야 하나요?",
    a: "가능하면 앱에서 출석 예정으로 등록해주세요. 인원 파악과 수업 준비에 도움이 됩니다.",
  },
  {
    q: "당일 출석 취소가 가능한가요?",
    a: "앱에서 가능한 범위 안에서 취소할 수 있습니다. 수업 시작 이후에는 제한될 수 있습니다.",
  },
  {
    q: "휴식중 회원은 무엇을 이용할 수 있나요?",
    a: "휴식중에는 공지 확인과 1:1 문의 기능만 이용할 수 있습니다.",
  },
  {
    q: "회비 결제는 어떻게 하나요?",
    a: "내정보의 회비결제 메뉴에서 계좌 안내와 서울Pay+ 안내를 확인할 수 있습니다.",
  },
  {
    q: "유단자회 수련은 누구나 참여할 수 있나요?",
    a: "유단자회 권한이 있는 회원만 참여할 수 있습니다. 자세한 내용은 도장에 문의해주세요.",
  },
];

export default function FaqScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.subtitle}>자주 묻는 질문을 모았습니다.</Text>

      <View style={styles.list}>
        {faqs.map((item, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.question}>Q. {item.q}</Text>
            <Text style={styles.answer}>A. {item.a}</Text>
          </View>
        ))}
      </View>
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
  list: {
    marginTop: 20,
    gap: 12,
  },
  card: {
    backgroundColor: "#fffdf9",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ece4d8",
  },
  question: {
    fontSize: 15,
    fontWeight: "800",
    lineHeight: 22,
    color: "#2f2a24",
  },
  answer: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 22,
    color: "#5f554b",
  },
});