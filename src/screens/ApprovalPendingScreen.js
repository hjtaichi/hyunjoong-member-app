// src/screens/ApprovalPendingScreen.js

import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { router } from "expo-router";

export default function ApprovalPendingScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.icon}>⏳</Text>

        <Text style={styles.title}>관리자 승인 대기 중입니다</Text>

        <Text style={styles.description}>
          회원가입 신청은 완료되었습니다.{"\n"}
          도장 관리자 확인 후 앱을 이용할 수 있습니다.
        </Text>

        <Text style={styles.subText}>
          승인이 완료되면 가입한 휴대폰 번호로 로그인해주세요.
        </Text>

        <Pressable
          style={styles.button}
          onPress={() => router.replace("/login")}
        >
          <Text style={styles.buttonText}>로그인 화면으로 돌아가기</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  card: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  icon: {
    fontSize: 42,
    marginBottom: 18,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111",
    textAlign: "center",
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    lineHeight: 23,
    color: "#444",
    textAlign: "center",
    marginBottom: 14,
  },
  subText: {
    fontSize: 13,
    lineHeight: 20,
    color: "#777",
    textAlign: "center",
    marginBottom: 24,
  },
  button: {
    width: "100%",
    backgroundColor: "#111",
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
});