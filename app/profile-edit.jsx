import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";

import {
  getMyProfile,
  changeMyPassword,
  changeMyPhone,
} from "../src/api/member";
import { colors } from "../src/theme/colors";

function onlyNumbers(value) {
  return String(value || "").replace(/[^0-9]/g, "");
}

export default function ProfileEditScreen() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  const [phone, setPhone] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");

  const [submittingPhone, setSubmittingPhone] = useState(false);
  const [submittingPassword, setSubmittingPassword] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getMyProfile();
      const data = res?.data ?? res;

      setProfile(data);
      setPhone(data?.phone || "");
    } catch (error) {
      Alert.alert(
        "오류",
        error?.response?.data?.message ||
          error?.message ||
          "내정보를 불러오지 못했습니다."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  async function handleSavePhone() {
    const cleanPhone = onlyNumbers(phone);

    if (cleanPhone && !/^010\d{8}$/.test(cleanPhone)) {
      Alert.alert("안내", "휴대폰 번호는 010으로 시작하는 숫자 11자리여야 합니다.");
      return;
    }

    try {
      setSubmittingPhone(true);
      await changeMyPhone(cleanPhone || null);

      Alert.alert("완료", cleanPhone ? "연락처가 저장되었습니다." : "연락처가 삭제되었습니다.");
      await loadProfile();
    } catch (error) {
      Alert.alert(
        "오류",
        error?.response?.data?.message ||
          error?.message ||
          "연락처 저장에 실패했습니다."
      );
    } finally {
      setSubmittingPhone(false);
    }
  }

  async function handleChangePassword() {
    if (!currentPassword || !newPassword || !newPasswordConfirm) {
      Alert.alert("안내", "비밀번호를 모두 입력해주세요.");
      return;
    }

    if (
      newPassword.length < 8 ||
      !/[A-Za-z]/.test(newPassword) ||
      !/[0-9]/.test(newPassword)
    ) {
      Alert.alert("안내", "새 비밀번호는 8자 이상, 영문/숫자 조합이어야 합니다.");
      return;
    }

    if (newPassword !== newPasswordConfirm) {
      Alert.alert("안내", "새 비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    try {
      setSubmittingPassword(true);

      await changeMyPassword({
        currentPassword,
        newPassword,
        newPasswordConfirm,
      });

      Alert.alert("완료", "비밀번호가 변경되었습니다.");

      setCurrentPassword("");
      setNewPassword("");
      setNewPasswordConfirm("");
    } catch (error) {
      Alert.alert(
        "오류",
        error?.response?.data?.message ||
          error?.message ||
          "비밀번호 변경에 실패했습니다."
      );
    } finally {
      setSubmittingPassword(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>내정보를 불러오는 중입니다.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>‹</Text>
        </Pressable>

        <View>
          <Text style={styles.title}>내정보 수정</Text>
          <Text style={styles.subtitle}>계정 정보를 확인하고 관리합니다.</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>기본 정보</Text>

        <InfoRow label="아이디" value={profile?.loginId || "-"} />
        <Text style={styles.helpText}>아이디 변경은 관리자에게 문의해주세요.</Text>

        <View style={styles.divider} />

        <InfoRow label="성명" value={profile?.name || "-"} />
        <InfoRow label="생년월일" value={profile?.birthDate || "-"} />
        <InfoRow label="회원 등급" value={profile?.levelLabel || "일반회원"} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>연락처</Text>
        <Text style={styles.cardDesc}>
          휴대폰 번호는 선택사항이며, 도장 연락용으로만 사용됩니다.
        </Text>

        <TextInput
  style={styles.input}
  placeholder="01000000000"
  placeholderTextColor={colors.textMuted}
  keyboardType="phone-pad"
  value={phone}
  onChangeText={(value) => setPhone(onlyNumbers(value))}
  maxLength={11}
/>

        <Pressable
          style={[styles.button, submittingPhone && styles.buttonDisabled]}
          onPress={handleSavePhone}
          disabled={submittingPhone}
        >
          <Text style={styles.buttonText}>
            {submittingPhone ? "저장 중..." : "연락처 저장"}
          </Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>비밀번호 변경</Text>
        <Text style={styles.cardDesc}>
          임시 비밀번호로 로그인한 경우 새 비밀번호로 변경해주세요.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="현재 비밀번호"
          secureTextEntry
          value={currentPassword}
          onChangeText={setCurrentPassword}
        />

        <TextInput
          style={styles.input}
          placeholder="새 비밀번호"
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
        />

        <TextInput
          style={styles.input}
          placeholder="새 비밀번호 확인"
          secureTextEntry
          value={newPasswordConfirm}
          onChangeText={setNewPasswordConfirm}
        />

        <Pressable
          style={[styles.button, submittingPassword && styles.buttonDisabled]}
          onPress={handleChangePassword}
          disabled={submittingPassword}
        >
          <Text style={styles.buttonText}>
            {submittingPassword ? "변경 중..." : "비밀번호 변경"}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function InfoRow({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
  flex: 1,
  backgroundColor: colors.background,
},

content: {
  paddingHorizontal: 16,
  paddingTop: 44,
  paddingBottom: 30,
  gap: 14,
},

center: {
  flex: 1,
  backgroundColor: colors.background,
  alignItems: "center",
  justifyContent: "center",
},

loadingText: {
  marginTop: 10,
  fontSize: 14,
  color: colors.textSub,
},
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 4,
  },
  backButton: {
  width: 42,
  height: 42,
  borderRadius: 21,
  backgroundColor: colors.card,
  alignItems: "center",
  justifyContent: "center",
  borderWidth: 1,
  borderColor: colors.border,
},

backButtonText: {
  fontSize: 30,
  color: colors.warmBrown,
  marginTop: -2,
},

title: {
  fontSize: 26,
  fontWeight: "800",
  color: colors.textMain,
},

subtitle: {
  marginTop: 4,
  fontSize: 15,
  lineHeight: 21,
  color: colors.textSub,
},
  card: {
  backgroundColor: colors.card,
  borderRadius: 26,
  padding: 20,
  borderWidth: 1,
  borderColor: colors.border,
},

cardTitle: {
  fontSize: 21,
  fontWeight: "900",
  color: colors.textMain,
  marginBottom: 18,
},

cardDesc: {
  fontSize: 14,
  lineHeight: 20,
  color: colors.textSub,
  marginBottom: 14,
},
  infoRow: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingVertical: 7,
},

infoLabel: {
  fontSize: 15,
  fontWeight: "800",
  color: colors.textSub,
},

infoValue: {
  fontSize: 16,
  fontWeight: "900",
  color: colors.textMain,
},

helpText: {
  marginTop: 6,
  fontSize: 13,
  color: colors.textSub,
  textAlign: "right",
},

divider: {
  height: 1,
  backgroundColor: colors.border,
  marginVertical: 16,
},
 input: {
  minHeight: 56,
  borderRadius: 16,
  borderWidth: 1,
  borderColor: colors.border,
  backgroundColor: colors.white,
  paddingHorizontal: 16,
  fontSize: 16,
  color: colors.textMain,
  marginTop: 10,
},
  button: {
  minHeight: 56,
  borderRadius: 18,
  backgroundColor: colors.warmBrown,
  alignItems: "center",
  justifyContent: "center",
  marginTop: 18,
},

buttonDisabled: {
  opacity: 0.55,
},

buttonText: {
  fontSize: 17,
  fontWeight: "900",
  color: colors.white,
},
});