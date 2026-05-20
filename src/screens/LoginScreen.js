// src/screens/LoginScreen.js

import React, { useEffect, useState } from "react";
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
import {
  getSavedLoginId,
  setSavedLoginId,
  removeSavedLoginId,
} from "../utils/storage";

export default function LoginScreen() {
  const { login, isLoginLoading } = useAuth();
  

  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [saveLoginId, setSaveLoginId] = useState(false);
  useEffect(() => {
  async function loadSavedLoginId() {
    const savedLoginId = await getSavedLoginId();

    if (savedLoginId) {
      setLoginId(savedLoginId);
      setSaveLoginId(true);
    }
  }

  loadSavedLoginId();
}, []);

  async function handleLogin() {
    if (!loginId.trim()) {
  Alert.alert("안내", "아이디를 입력해주세요.");
  return;
}
    if (!password.trim()) {
      Alert.alert("안내", "비밀번호를 입력해주세요.");
      return;
    }

    const result = await login(loginId.trim().toLowerCase(), password);
    if (saveLoginId) {
  await setSavedLoginId(loginId.trim().toLowerCase());
} else {
  await removeSavedLoginId();
}

    if (!result.ok) {
  const message = result.message || "다시 시도해주세요.";

  if (
    result.code === "APPROVAL_PENDING" ||
    message.includes("승인 대기")
  ) {
    router.replace("/approval-pending");
    return;
  }

  Alert.alert("로그인 실패", message);
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
          <Text style={styles.label}>아이디</Text>
<TextInput
  style={styles.input}
  placeholder="아이디를 입력해주세요"
  autoCapitalize="none"
  keyboardType="default"
  value={loginId}
  onChangeText={setLoginId}
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
  style={styles.optionRow}
  onPress={() => setSaveLoginId((prev) => !prev)}
>
  <View style={[styles.checkbox, saveLoginId && styles.checkboxChecked]}>
  {saveLoginId ? <View style={styles.checkMark} /> : null}
</View>

  <Text style={styles.optionText}>아이디 저장</Text>
</Pressable>

          <Pressable
            style={[styles.button, isLoginLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoginLoading}
          >
            <Text style={styles.buttonText}>
              {isLoginLoading ? "로그인 중..." : "로그인"}
            </Text>
          </Pressable>

          <Pressable
  style={styles.registerButton}
  onPress={() => router.push("/register")}
>
  <Text style={styles.registerButtonText}>회원가입 신청</Text>
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
  registerButton: {
  marginTop: 10,
  paddingVertical: 12,
  alignItems: "center",
},
registerButtonText: {
  fontSize: 14,
  fontWeight: "600",
  color: "#444",
},
optionRow: {
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
  marginTop: 2,
},

checkbox: {
  width: 22,
  height: 22,
  borderWidth: 1,
  borderColor: "#ccc",
  borderRadius: 6,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#fff",
},

checkboxChecked: {
  borderColor: "#314E67",
  backgroundColor: "#314E67",
},

checkbox: {
  width: 28,
  height: 28,
  borderWidth: 1.5,
  borderColor: "#D8D8D8",
  borderRadius: 8,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#fff",
},

checkboxChecked: {
  borderColor: "#111",
  backgroundColor: "#111",
},

checkMark: {
  width: 18,
  height: 16,
  position: "relative",
},

checkMark: {
  width: 16,
  height: 9,
  borderLeftWidth: 4,
  borderBottomWidth: 4,
  borderColor: "#fff",
  transform: [{ rotate: "-45deg" }],
  marginTop: -3,
},

optionText: {
  fontSize: 14,
  fontWeight: "600",
  color: "#444",
},
});