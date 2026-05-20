import React from "react";
import { ScrollView, Text, StyleSheet, Pressable } from "react-native";
import { router } from "expo-router";

export default function PrivacyScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>개인정보 수집 및 이용 동의</Text>

      <Text style={styles.sectionTitle}>1. 수집 항목</Text>
<Text style={styles.text}>
  성명, 생년월일, 성별, 휴대전화번호, 아이디, 비밀번호, 출석 및 예약 정보,
  회비 납부 상태, 문의 내용, 수련 진도 및 도장 운영에 필요한 정보
</Text>

<Text style={styles.sectionTitle}>2. 수집 목적</Text>
<Text style={styles.text}>
  회원 식별, 수련생 확인, 수업 예약 및 출석 관리, 회비 관리, 공지 전달,
  문의 응대, 수련 진도 관리, 도장 운영 및 회원 관리
</Text>

<Text style={styles.sectionTitle}>3. 보유 및 이용 기간</Text>
<Text style={styles.text}>
  개인정보는 회원 탈퇴, 수련 종료 또는 이용 목적 달성 시까지 보관합니다.
  단, 회비 납부, 출석 기록, 문의 응대, 분쟁 대응 등 운영상 확인이 필요한
  정보는 수련 종료 후 최대 3년간 보관할 수 있으며, 보관 기간이 지나면
  지체 없이 파기합니다.
</Text>

<Text style={styles.sectionTitle}>4. 휴식 및 종료 회원 정보</Text>
<Text style={styles.text}>
  장기간 미출석, 회비 미납, 연락 두절 등의 사유로 회원 상태가 휴식중 또는
  종료로 변경될 수 있습니다. 휴식중 회원은 공지 확인 및 문의 기능 등 일부
  기능만 이용할 수 있으며, 종료 회원은 앱 로그인이 제한될 수 있습니다.
</Text>

<Text style={styles.sectionTitle}>5. 동의 거부 권리</Text>
<Text style={styles.text}>
  이용자는 개인정보 수집 및 이용에 대한 동의를 거부할 수 있습니다.
  다만 필수 항목에 동의하지 않을 경우 회원가입 및 서비스 이용이 제한될 수 있습니다.
</Text>

<Text style={styles.sectionTitle}>6. 개인정보 관리</Text>
<Text style={styles.text}>
  도장은 수집한 개인정보를 도장 운영 및 회원 관리 목적 외로 사용하지 않으며,
  개인정보가 안전하게 관리될 수 있도록 노력합니다.
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