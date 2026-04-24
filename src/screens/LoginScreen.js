// src/screens/LoginScreen.js

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "../contexts/AuthContext";

export default function LoginScreen() {
  const { login, isLoginLoading } = useAuth();

  const [email, setEmail] = useState("member1@hyunjoong.com");
  const [password, setPassword] = useState("1234");

  async function handleLogin() {
    if (!email.trim()) {
      Alert.alert("안내", "이메일을 입력해주세요.");
      return;
    }
    if (!password.trim()) {
      Alert.alert("안내", "비밀번호를 입력해주세요.");
      return;
    }

    const result = await login(email.trim(), password);

    if (!result.ok) {
      Alert.alert("로그인 실패", result.message || "다시 시도해주세요.");
      return;
    }

    router.replace("/(tabs)/home");
  }

  return (
    <KeyboardAvoidingView
      style={styles.keyboard}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.container}>
        <Text style={styles.title}>현중태극권 회원앱</Text>
        <Text style={styles.subtitle}>회원 계정으로 로그인해주세요.</Text>

        <View style={styles.form}>
          <Text style={styles.label}>이메일</Text>
          <TextInput
            style={styles.input}
            placeholder="이메일"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>비밀번호</Text>
          <TextInput
            style={styles.input}
            placeholder="비밀번호"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <Pressable
            style={[styles.button, isLoginLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoginLoading}
          >
            <Text style={styles.buttonText}>
              {isLoginLoading ? "로그인 중..." : "로그인"}
            </Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboard: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 32,
  },
  form: {
    gap: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: -4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  button: {
    marginTop: 12,
    backgroundColor: "#111",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});