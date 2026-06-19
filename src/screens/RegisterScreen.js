// src/screens/RegisterScreen.js

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
  ScrollView,
  Image,
  ImageBackground,
} from "react-native";
import { router } from "expo-router";
import { registerApi } from "../api/auth";

const registerBg = require("../../assets/images/register-bg.png");
const logoImage = require("../../assets/images/hyunjung-logo-black.png");
const personIcon = require("../../assets/images/person_clean.png");
const lockIcon = require("../../assets/images/lock_clean.png");

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

      Alert.alert("회원가입 신청 완료", "관리자 승인 후 앱을 이용할 수 있습니다.", [
        {
          text: "확인",
          onPress: () => router.replace("/login"),
        },
      ]);
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
    <ImageBackground
      source={registerBg}
      style={styles.bg}
      imageStyle={styles.bgImage}
      resizeMode="cover"
    >
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
            <View style={styles.header}>
              <Image source={logoImage} style={styles.logo} resizeMode="contain" />
              <Text style={styles.title}>회원가입 신청</Text>
              <Text style={styles.subtitle}>
                도장 수련생 확인 후 관리자 승인으로 가입이 완료됩니다.
              </Text>
            </View>

            <View style={styles.paperCard}>
              <Field label="성명" icon={personIcon}>
                <TextInput
                  style={styles.input}
                  placeholder="성명을 입력해주세요"
                  placeholderTextColor="#9A8F83"
                  value={name}
                  onChangeText={setName}
                />
              </Field>

              <Field label="아이디" icon={personIcon}>
                <TextInput
                  style={styles.input}
                  placeholder="예: taichi2026"
                  placeholderTextColor="#9A8F83"
                  autoCapitalize="none"
                  value={loginId}
                  onChangeText={setLoginId}
                />
              </Field>
              <Text style={styles.helperText}>
                로그인에 사용할 아이디입니다. 가입 후 직접 변경할 수 없습니다.
              </Text>

              <Field label="생년월일">
                <TextInput
                  style={styles.input}
                  placeholder="예: 20180602"
                  placeholderTextColor="#9A8F83"
                  keyboardType="number-pad"
                  value={birthDate}
                  onChangeText={(value) => setBirthDate(onlyNumbers(value))}
                  maxLength={8}
                />
              </Field>

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

              <Field label="휴대폰 번호(선택)">
                <TextInput
                  style={styles.input}
                  placeholder="- 없이 숫자만 입력해주세요"
                  placeholderTextColor="#9A8F83"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={(value) => setPhone(onlyNumbers(value))}
                  maxLength={11}
                />
              </Field>
              <Text style={styles.helperText}>도장 연락용으로만 사용됩니다.</Text>

              <Field label="비밀번호" icon={lockIcon}>
                <TextInput
                  style={styles.input}
                  placeholder="8자 이상, 영문/숫자 조합"
                  placeholderTextColor="#9A8F83"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </Field>

              <Field label="비밀번호 확인" icon={lockIcon}>
                <TextInput
                  style={styles.input}
                  placeholder="비밀번호를 한 번 더 입력해주세요"
                  placeholderTextColor="#9A8F83"
                  secureTextEntry
                  value={passwordConfirm}
                  onChangeText={setPasswordConfirm}
                />
              </Field>

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
                {isSubmitting ? "신청 중..." : "가입 신청하기"}
              </Text>
            </Pressable>

            <Text style={styles.noticeText}>
              신청 후 관리자 승인까지 시간이 걸릴 수 있습니다.
            </Text>

            <Pressable style={styles.loginButton} onPress={() => router.back()}>
              <Text style={styles.loginButtonText}>이미 계정이 있어요</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

function Field({ label, icon, children }) {
  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrap}>
        {icon ? (
          <Image source={icon} style={styles.inputIcon} resizeMode="contain" />
        ) : null}
        {children}
      </View>
    </View>
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
  bg: {
    flex: 1,
    backgroundColor: "#F7EFE3",
  },
  bgImage: {
    width: "100%",
    height: "100%",
  },
  keyboard: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 44,
  },
  container: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 42,
    paddingBottom: 30,
  },
  header: {
    alignItems: "center",
    marginBottom: 22,
  },
  logo: {
    width: 46,
    height: 46,
    marginBottom: 6,
    opacity: 0.9,
  },
  title: {
    fontSize: 34,
    fontFamily: "MaruBuriBold",
    color: "#2E261F",
    letterSpacing: 1.5,
  },
  subtitle: {
    marginTop: 8,
    textAlign: "center",
    fontSize: 14,
    lineHeight: 20,
    fontFamily: "PretendardMedium",
    color: "#756A60",
  },
  paperCard: {
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 22,
    backgroundColor: "rgba(255, 252, 246, 0.9)",
    borderWidth: 1,
    borderColor: "rgba(201, 177, 143, 0.42)",
    shadowColor: "#7B6244",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  fieldBlock: {
    marginBottom: 14,
  },
  label: {
    fontSize: 15,
    fontFamily: "PretendardSemiBold",
    color: "#2E261F",
    marginBottom: 8,
  },
  inputWrap: {
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DED2C4",
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.5)",
    paddingHorizontal: 14,
  },
  inputIcon: {
    width: 19,
    height: 19,
    tintColor: "#B9A078",
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 15,
    fontFamily: "PretendardMedium",
    color: "#3A2C27",
  },
  helperText: {
    marginTop: -8,
    marginBottom: 14,
    fontSize: 12,
    lineHeight: 17,
    fontFamily: "PretendardMedium",
    color: "#8A7D71",
  },
  genderRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  genderButton: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: "#DED2C4",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  genderButtonActive: {
    borderColor: "#2C251F",
    backgroundColor: "#2C251F",
  },
  genderText: {
    fontSize: 15,
    fontFamily: "PretendardSemiBold",
    color: "#5B5047",
  },
  genderTextActive: {
    color: "#FFFFFF",
  },
  agreementBox: {
    marginTop: 8,
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(222,210,196,0.9)",
    borderRadius: 18,
    padding: 14,
    backgroundColor: "rgba(255,255,255,0.42)",
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
    borderWidth: 1.4,
    borderColor: "#D2C2AD",
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFDF8",
  },
  checkboxChecked: {
    borderColor: "#B9955E",
    backgroundColor: "#B9955E",
  },
  checkMark: {
    width: 12,
    height: 8,
    borderLeftWidth: 3,
    borderBottomWidth: 3,
    borderColor: "#fff",
    transform: [{ rotate: "-45deg" }],
    marginTop: -3,
  },
  agreementText: {
    flex: 1,
    fontSize: 12,
    fontFamily: "PretendardMedium",
    color: "#4A4038",
  },
  agreementAllText: {
    fontFamily: "PretendardSemiBold",
  },
  viewText: {
    fontSize: 12,
    fontFamily: "PretendardSemiBold",
    color: "#8C6B3E",
    textDecorationLine: "underline",
  },
  agreementDivider: {
    height: 1,
    backgroundColor: "rgba(229,224,216,0.9)",
  },
  button: {
    marginTop: 22,
    height: 58,
    borderRadius: 15,
    backgroundColor: "#2C251F",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2C251F",
    shadowOpacity: 0.22,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  buttonText: {
    color: "#fff",
    fontSize: 19,
    fontFamily: "MaruBuriBold",
  },
  noticeText: {
    marginTop: 14,
    textAlign: "center",
    fontSize: 12,
    fontFamily: "PretendardMedium",
    color: "#776B61",
  },
  loginButton: {
    marginTop: 4,
    paddingVertical: 14,
    alignItems: "center",
  },
  loginButtonText: {
    fontSize: 14,
    fontFamily: "PretendardSemiBold",
    color: "#7B5B31",
  },
});