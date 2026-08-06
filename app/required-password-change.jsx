import React, { useState } from "react";
import { Alert, Pressable, SafeAreaView, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../src/contexts/AuthContext";
import { completeRequiredPasswordChangeApi } from "../src/api/auth";

export default function RequiredPasswordChangeScreen() {
  const router = useRouter();
  const { token, logout } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      Alert.alert("확인", "영문과 숫자를 포함한 8자 이상의 새 비밀번호를 입력해주세요.");
      return;
    }
    if (password !== confirm) {
      Alert.alert("확인", "새 비밀번호 확인이 일치하지 않습니다.");
      return;
    }
    try {
      setSaving(true);
      await completeRequiredPasswordChangeApi({
        accessToken: token,
        newPassword: password,
        newPasswordConfirm: confirm,
      });
      await logout();
      Alert.alert("변경 완료", "새 비밀번호로 다시 로그인해주세요.", [
        { text: "확인", onPress: () => router.replace("/login") },
      ]);
    } catch (error) {
      Alert.alert("변경 실패", error?.response?.data?.message || "비밀번호 변경에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fffaf7" }}>
      <View style={{ flex: 1, justifyContent: "center", padding: 24 }}>
        <Text style={{ fontSize: 25, fontWeight: "800", color: "#292524" }}>새 비밀번호 설정</Text>
        <Text style={{ marginTop: 10, marginBottom: 24, lineHeight: 22, color: "#78716c" }}>
          관리자가 발급한 임시 비밀번호로 로그인했습니다. 계속 이용하려면 새 비밀번호를 설정해주세요.
        </Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="새 비밀번호"
          style={{ height: 52, borderWidth: 1, borderColor: "#d6d3d1", borderRadius: 14, paddingHorizontal: 16, backgroundColor: "white" }}
        />
        <TextInput
          value={confirm}
          onChangeText={setConfirm}
          secureTextEntry
          placeholder="새 비밀번호 확인"
          style={{ height: 52, marginTop: 12, borderWidth: 1, borderColor: "#d6d3d1", borderRadius: 14, paddingHorizontal: 16, backgroundColor: "white" }}
        />
        <Pressable
          onPress={submit}
          disabled={saving}
          style={{ marginTop: 20, height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: "#292524", opacity: saving ? 0.6 : 1 }}
        >
          <Text style={{ color: "white", fontSize: 16, fontWeight: "700" }}>{saving ? "변경 중..." : "비밀번호 변경"}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
