import React from "react";
import { ScrollView, Text, StyleSheet, Pressable, View } from "react-native";
import { router } from "expo-router";

export default function TermsScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>이용약관</Text>

      <Text style={styles.sectionTitle}>제1조 목적</Text>
<Text style={styles.text}>
  본 약관은 현중태극권 도장(이하 “도장”)이 제공하는 모바일 서비스의 이용 조건과
  절차를 정함을 목적으로 합니다.
</Text>

<Text style={styles.sectionTitle}>제2조 회원가입 및 이용</Text>
<Text style={styles.text}>
  본 서비스는 도장의 수련생 확인 및 관리자 승인 후 이용할 수 있습니다.
  도장 수련생이 아니거나 관리자 승인을 받지 않은 경우 서비스 이용이 제한될 수 있습니다.
</Text>

<Text style={styles.sectionTitle}>제3조 서비스 내용</Text>
<Text style={styles.text}>
  서비스는 수업 예약, 출석 관리, QR 출석, 정기예약, 공지사항 확인, 문의,
  회비 상태 확인, 수련 진도 확인 기능을 제공합니다.
</Text>

<Text style={styles.sectionTitle}>제4조 회원의 의무</Text>
<Text style={styles.text}>
  회원은 타인의 정보를 도용하거나 허위 정보를 입력해서는 안 되며,
  서비스 운영을 방해하는 행위를 해서는 안 됩니다. 수련비는 도장이 정한 기준에 따라
  납부하며, 휴식 또는 퇴관 시에는 도장에 알려야 합니다.
</Text>

<Text style={styles.sectionTitle}>제5조 휴식중 및 종료 회원</Text>
<Text style={styles.text}>
  장기간 미출석, 회비 미납, 연락 두절 등 운영상 필요한 경우 도장은 회원 상태를
  휴식중 또는 종료로 변경할 수 있습니다. 휴식중 회원은 공지 확인 및 문의 기능 등
  일부 기능만 이용할 수 있으며, 종료 회원은 앱 로그인이 제한될 수 있습니다.
</Text>

<Text style={styles.sectionTitle}>제6조 개인물품 처리</Text>
<Text style={styles.text}>
  회원은 휴식 또는 퇴관 시 도복, 신발 및 개인물품을 직접 정리해야 합니다.
  휴식 또는 퇴관 후 1개월 이내에 정리하지 않은 개인물품은 도장 운영 기준에 따라
  자체 처리될 수 있습니다.
</Text>

<Text style={styles.sectionTitle}>제7조 서비스 이용 제한</Text>
<Text style={styles.text}>
  도장 수련생이 아니거나 부정한 방법으로 서비스를 이용하는 경우, 또는 도장 운영에
  지장을 주는 행위를 하는 경우 서비스 이용이 제한될 수 있습니다.
</Text>

<Text style={styles.sectionTitle}>제8조 약관 변경</Text>
<Text style={styles.text}>
  본 약관은 서비스 운영 상황에 따라 변경될 수 있으며, 변경 시 앱 내 공지 등을 통해 안내합니다.
</Text>

      <Text style={styles.footer}>시행일: 2026년 4월 29일</Text>

      <Pressable style={styles.button} onPress={() => router.back()}>
        <Text style={styles.buttonText}>확인</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 24, paddingTop: 60, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: "800", marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginTop: 18, marginBottom: 8 },
  text: { fontSize: 14, lineHeight: 22, color: "#333" },
  footer: { fontSize: 13, color: "#777", marginTop: 28 },
  button: {
    marginTop: 28,
    backgroundColor: "#111",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});