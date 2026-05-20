// src/screens/RegisterScreen.js

import React, { useState } from "react";
import { Image } from "react-native";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { registerApi } from "../api/auth";

export default function RegisterScreen() {
  const [name, setName] = useState("");
const [loginId, setLoginId] = useState("");
const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [confirmStudent, setConfirmStudent] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const allChecked = agreeTerms && agreePrivacy && confirmStudent;

  function onlyNumbers(value) {
    return value.replace(/[^0-9]/g, "");
  }

  async function handleRegister() {
    const cleanPhone = onlyNumbers(phone);
    const cleanLoginId = loginId.trim().toLowerCase();

    if (!name.trim()) {
      Alert.alert("안내", "성명을 입력해주세요.");
      return;
    }
    if (!/^[a-z0-9_]{4,20}$/.test(cleanLoginId)) {
  Alert.alert("안내", "아이디는 영문 소문자, 숫자, _ 조합 4~20자로 입력해주세요.");
  return;
}

    if (!birthDate.trim()) {
      Alert.alert("안내", "생년월일을 입력해주세요.");
      return;
    }

    if (!gender) {
      Alert.alert("안내", "성별을 선택해주세요.");
      return;
    }

    if (cleanPhone && !/^010\d{8}$/.test(cleanPhone)) {
  Alert.alert("안내", "휴대폰 번호는 010으로 시작하는 숫자 11자리여야 합니다.");
  return;
}

    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      Alert.alert("안내", "비밀번호는 8자 이상, 영문/숫자 조합이어야 합니다.");
      return;
    }

    if (password !== passwordConfirm) {
      Alert.alert("안내", "비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    if (!agreeTerms || !agreePrivacy || !confirmStudent) {
      Alert.alert("안내", "필수 약관에 모두 동의해주세요.");
      return;
    }

    try {
      setIsSubmitting(true);

      await registerApi({
  name: name.trim(),
  loginId: cleanLoginId,
  birthDate: birthDate.trim(),
        gender,
        phone: cleanPhone || null,
        password,
        passwordConfirm,
        agreeTerms,
        agreePrivacy,
        confirmStudent,
      });

      Alert.alert(
        "회원가입 신청 완료",
        "관리자 승인 후 앱을 이용할 수 있습니다.",
        [
          {
            text: "확인",
            onPress: () => router.replace("/login"),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        "회원가입 실패",
        error?.response?.data?.message || error?.message || "다시 시도해주세요."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
  style={styles.keyboard}
  behavior={Platform.OS === "ios" ? "padding" : "height"}
  keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
>
      <ScrollView
  contentContainerStyle={styles.scrollContent}
  keyboardShouldPersistTaps="handled"
  showsVerticalScrollIndicator={false}
>
      
        <View style={styles.container}>
  <Image
    source={require("../../assets/images/icon.png")}
    style={styles.logo}
    resizeMode="contain"
  />

  <Text style={styles.title}>회원가입 신청</Text>
  <Text style={styles.subtitle}>
    도장 수련생 확인 후 관리자가 승인합니다.
  </Text>

  <View style={styles.card}>
    <View style={styles.form}>
      <Text style={styles.label}>성명</Text>
      <TextInput
        style={styles.input}
        placeholder="성명을 입력해주세요"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>아이디</Text>
<TextInput
  style={styles.input}
  placeholder="예: taichi2026"
  autoCapitalize="none"
  value={loginId}
  onChangeText={setLoginId}
/>
<Text style={styles.helperText}>
  로그인에 사용할 아이디입니다. 가입 후 직접 변경할 수 없습니다.
</Text>

      <Text style={styles.label}>생년월일</Text>
      <TextInput
        style={styles.input}
        placeholder="예: 20180602"
        keyboardType="number-pad"
        value={birthDate}
        onChangeText={(value) => setBirthDate(onlyNumbers(value))}
        maxLength={8}
      />

      <Text style={styles.label}>성별</Text>
      <View style={styles.genderRow}>
        <Pressable
          style={[
            styles.genderButton,
            gender === "male" && styles.genderButtonActive,
          ]}
          onPress={() => setGender("male")}
        >
          <Text
            style={[
              styles.genderText,
              gender === "male" && styles.genderTextActive,
            ]}
          >
            남
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.genderButton,
            gender === "female" && styles.genderButtonActive,
          ]}
          onPress={() => setGender("female")}
        >
          <Text
            style={[
              styles.genderText,
              gender === "female" && styles.genderTextActive,
            ]}
          >
            여
          </Text>
        </Pressable>
      </View>

      <Text style={styles.label}>(선택)휴대폰 번호</Text>
      <TextInput
        style={styles.input}
        placeholder="휴대폰 번호는 선택사항입니다."
        keyboardType="phone-pad"
        value={phone}
        onChangeText={(value) => setPhone(onlyNumbers(value))}
        maxLength={11}
      />
      <Text style={styles.helperText}>도장 연락용으로만 사용됩니다.</Text>

      <Text style={styles.label}>비밀번호</Text>
      <TextInput
        style={styles.input}
        placeholder="8자 이상, 영문/숫자 조합"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Text style={styles.label}>비밀번호 확인</Text>
      <TextInput
        style={styles.input}
        placeholder="비밀번호를 한 번 더 입력해주세요"
        secureTextEntry
        value={passwordConfirm}
        onChangeText={setPasswordConfirm}
      />

      <View style={styles.agreementBox}>
        <AgreementRow
          checked={allChecked}
          onPress={() => {
            const next = !allChecked;
            setAgreeTerms(next);
            setAgreePrivacy(next);
            setConfirmStudent(next);
          }}
          text="모두 동의하기"
          textStyle={styles.agreementAllText}
        />

        <View style={styles.agreementDivider} />

        <AgreementRow
          checked={agreeTerms}
          onPress={() => setAgreeTerms((prev) => !prev)}
          text="(필수) 이용약관 동의"
          onView={() => router.push("/terms")}
        />

        <AgreementRow
          checked={agreePrivacy}
          onPress={() => setAgreePrivacy((prev) => !prev)}
          text="(필수) 개인정보 수집 및 이용 동의"
          onView={() => router.push("/privacy")}
        />

        <AgreementRow
          checked={confirmStudent}
          onPress={() => setConfirmStudent((prev) => !prev)}
          text="(필수) 본인은 도장 수련생임을 확인합니다."
        />
      </View>

      <Pressable
  style={[
    styles.button,
    (!allChecked || isSubmitting) && styles.buttonDisabled,
  ]}
  onPress={handleRegister}
  disabled={!allChecked || isSubmitting}
>
        <Text style={styles.buttonText}>
          {isSubmitting ? "신청 중..." : "회원가입 신청"}
        </Text>
      </Pressable>

      <Pressable style={styles.loginButton} onPress={() => router.back()}>
        <Text style={styles.loginButtonText}>이미 계정이 있어요</Text>
      </Pressable>
    </View>
  </View>
</View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function AgreementRow({ checked, onPress, text, onView, textStyle }) {
  return (
    <View style={styles.agreementRow}>
      <Pressable style={styles.checkboxWrap} onPress={onPress}>
        <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
  {checked ? <View style={styles.checkMark} /> : null}
</View>
        <Text style={[styles.agreementText, textStyle]}>{text}</Text>
      </Pressable>

      {onView ? (
        <Pressable onPress={onView}>
          <Text style={styles.viewText}>보기</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  keyboard: { flex: 1 },
  scrollContent: {
  flexGrow: 1,
  backgroundColor: "#f6f7fb", // ← 변경
  paddingBottom: 80,
},
  container: {
  flex: 1,
  paddingHorizontal: 20,
  paddingTop: 54,
  paddingBottom: 40,
  backgroundColor: "#f6f7fb",
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
  helperText: {
    fontSize: 12,
    color: "#777",
    marginTop: -6,
  },
  genderRow: {
    flexDirection: "row",
    gap: 10,
  },
  genderButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  genderButtonActive: {
    borderColor: "#111",
    backgroundColor: "#314E67",
  },
  genderText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#555",
  },
  genderTextActive: {
    color: "#fff",
  },
  agreementBox: {
    marginTop: 10,
    gap: 12,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 16,
    padding: 14,
    backgroundColor: "#fafafa",
  },
  agreementRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  checkboxWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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
    borderColor: "#111",
    backgroundColor: "#111",
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
  agreementText: {
    flex: 1,
    fontSize: 13,
    color: "#333",
  },
  viewText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111",
    textDecorationLine: "underline",
  },
  button: {
  marginTop: 12,
  backgroundColor: "#314E67",
  paddingVertical: 15,
  borderRadius: 14,
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
  loginButton: {
    paddingVertical: 12,
    alignItems: "center",
  },
  loginButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
  },
  agreementAllText: {
  fontWeight: "700",
},
card: {
  backgroundColor: "#fff",
  borderRadius: 24,
  padding: 20,
  borderWidth: 1,
  borderColor: "#eee",
},
logo: {
  width: 70,
  height: 70,
  alignSelf: "center",
  marginBottom: 10,
},
agreementDivider: {
  height: 1,
  backgroundColor: "#E5E0D8",
  marginVertical: 4,
},
});