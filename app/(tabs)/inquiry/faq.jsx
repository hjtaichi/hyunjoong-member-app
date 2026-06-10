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

const faqs = [
  {
    q: "처음 수련할 때 무엇을 준비하면 되나요?",
    a: "편한 복장으로 오시면 됩니다. 도복,수련화등은 신체 사이즈에 맞게 도장에서 준비해 드립니다. 땀을 닦거나 세면/샤워에 필요한 수건등 세면도구는 개별 지참.(도장내 샤워시설 있고 세면비누와 샴푸 구비)",
  },
  {
    q: "수련 예약은 꼭 해야 하나요?",
    a: "가능하면 앱에서 출석 예정으로 등록해주세요. 인원 파악과 수업 준비에 도움이 됩니다.",
  },
  {
    q: "당일 출석 취소가 가능한가요?",
    a: "앱에서 가능한 범위 안에서 취소할 수 있습니다.",
  },
  {
    q: "수련을 일정기간 중지하면 앱에서 무엇을 이용할 수 있나요?",
    a: "수련 중지기간을 사유와 함께 관장에게 알려 주시면 해당기간 내에는 공지 확인과 1:1 문의 기능만 이용할 수 있습니다.  단, 중지 기간이 지나도 복귀가 없으면 자동 탈퇴 됩니다.",
  },
  {
    q: "회비 결제는 어떻게 하나요?",
    a: "회비는 매월 입관일(또는 관장과 협의된 일자)에 납입하며 앱에서는 내 정보의 회비결제 메뉴를 선택하시면 계좌 안내와 서울Pay+ 안내를 확인할 수 있습니다.",
  },
  {
    q: "앱 내에 유단자회 수련은 무엇이고 이용 자격이 있나요??",
    a: "유단자중 유단자 수련회에 가입한 회원만 이용 가능하며 자세한 내용은 관장에게 문의해주세요.",
  },
];

export default function FaqScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <ScreenHeader title="FAQ" />

      <Text style={styles.subtitle}>자주 묻는 질문을 모았습니다.</Text>

      <View style={styles.list}>
        {faqs.map((item, index) => (
          <View key={index} style={styles.card}>
            <View style={styles.questionRow}>
              <Text style={styles.qLabel}>Q.</Text>
              <Text style={styles.question}>{item.q}</Text>
            </View>

            <View style={styles.answerBox}>
              <Text style={styles.answerLabel}>A.</Text>
              <Text style={styles.answer}>{item.a}</Text>
            </View>
          </View>
        ))}
      </View>
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

  subtitle: {
    fontSize: 14,
    lineHeight: 22,
    fontFamily: fonts.medium,
    color: colors.textSub,
    marginBottom: 14,
  },

  list: {
    gap: 12,
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

  questionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 7,
  },

  qLabel: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: fonts.bold,
    color: colors.warmBrown,
  },

  question: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    fontFamily: fonts.bold,
    color: colors.textMain,
  },

  answerBox: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 7,
  },

  answerLabel: {
    fontSize: 15,
    lineHeight: 24,
    fontFamily: fonts.semiBold,
    color: colors.softBrown,
  },

  answer: {
    flex: 1,
    fontSize: 15,
    lineHeight: 24,
    fontFamily: fonts.medium,
    color: colors.textSub,
  },
});