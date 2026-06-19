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
  ImageBackground,
  Image,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "../contexts/AuthContext";
import {
  getSavedLoginId,
  setSavedLoginId,
  removeSavedLoginId,
} from "../utils/storage";

const loginBg = require("../../assets/images/login-bg.png");
const loginLogo = require("../../assets/images/hyunjung-logo-black.png");
const personIcon = require("../../assets/images/person_clean.png");
const lockIcon = require("../../assets/images/lock_clean.png");
const signupIcon = require("../../assets/images/signup_person_plus_clean.png");

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

      if (result.code === "APPROVAL_PENDING" || message.includes("승인 대기")) {
        router.replace("/approval-pending");
        return;
      }

      Alert.alert("로그인 실패", message);
      return;
    }

    router.replace("/(tabs)/home");
  }

  return (
    <ImageBackground
  source={loginBg}
  style={styles.bg}
  imageStyle={styles.bgImage}
  resizeMode="cover"
>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.container}>
          <View style={styles.brandArea}>
            <Image source={loginLogo} style={styles.logoImage} resizeMode="contain" />
            <Text style={styles.title}>현중태극권</Text>
            <Text style={styles.subtitle}>회원 수련앱에 로그인해주세요.</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>아이디</Text>
            <View style={styles.inputWrap}>
  <Image
    source={personIcon}
    style={styles.inputIcon}
    resizeMode="contain"
  />

  <TextInput
    style={styles.inputWithIcon}
    placeholder="아이디"
    placeholderTextColor="#9A8F83"
    autoCapitalize="none"
    value={loginId}
    onChangeText={setLoginId}
  />
</View>

            <Text style={styles.label}>비밀번호</Text>
            <View style={styles.inputWrap}>
  <Image
    source={lockIcon}
    style={styles.inputIcon}
    resizeMode="contain"
  />

  <TextInput
    style={styles.inputWithIcon}
    placeholder="비밀번호"
    placeholderTextColor="#9A8F83"
    secureTextEntry
    value={password}
    onChangeText={setPassword}
  />
</View>

            <Pressable
              style={styles.optionRow}
              onPress={() => setSaveLoginId((prev) => !prev)}
            >
              <View style={[styles.checkbox, saveLoginId && styles.checkboxChecked]}>
                {saveLoginId ? <View style={styles.checkMark} /> : null}
              </View>
              <Text style={styles.optionText}>아이디 저장</Text>
            </Pressable>
          </View>

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
            <View style={styles.registerContent}>
  <Image
    source={signupIcon}
    style={styles.signupIcon}
    resizeMode="contain"
  />

  <Text style={styles.registerButtonText}>
    회원가입 신청
  </Text>
</View>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
  flex: 1,
  backgroundColor: "#F7EFE3",
},
  keyboard: {
    flex: 1,
  },
  container: {
  flex: 1,
  paddingHorizontal: 26,
  justifyContent: "center",
  paddingTop: 20,
  paddingBottom: 28,
},
  brandArea: {
    alignItems: "center",
    marginBottom: 34,
  },
  logoImage: {
  width: 60,
  height: 60,
  marginBottom: 6,
  opacity: 0.9,
},
  title: {
    fontSize: 38,
    fontFamily: "MaruBuriBold",
    color: "#2E261F",
    letterSpacing: 2,
  },
  subtitle: {
    marginTop: 7,
    fontSize: 15,
    fontFamily: "PretendardMedium",
    color: "#7E746B",
  },
  card: {
    borderRadius: 24,
    padding: 26,
    backgroundColor: "rgba(255, 252, 246, 0.88)",
    borderWidth: 1,
    borderColor: "rgba(201, 177, 143, 0.45)",
    shadowColor: "#7B6244",
    shadowOpacity: 0.17,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  label: {
    fontSize: 16,
    fontFamily: "PretendardSemiBold",
    color: "#3A2C27",
    marginBottom: 10,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#DED2C4",
    borderRadius: 16,
    paddingHorizontal: 20,
    fontSize: 18,
    fontFamily: "PretendardMedium",
    color: "#3A2C27",
    backgroundColor: "rgba(255,255,255,0.55)",
    marginBottom: 24,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 2,
  },
  checkbox: {
    width: 23,
    height: 23,
    borderWidth: 1.5,
    borderColor: "#D2C2AD",
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFDF8",
  },
  checkboxChecked: {
    borderColor: "#B9955E",
    backgroundColor: "#B9955E",
  },
  checkMark: {
    width: 11,
    height: 8,
    borderLeftWidth: 3,
    borderBottomWidth: 3,
    borderColor: "#fff",
    transform: [{ rotate: "-45deg" }],
    marginTop: -3,
  },
  optionText: {
    fontSize: 15,
    fontFamily: "PretendardSemiBold",
    color: "#4A4038",
  },
  button: {
    marginTop: 23,
    height: 58,
    borderRadius: 15,
    backgroundColor: "#2C251F",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2C251F",
    shadowOpacity: 0.24,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 19,
    fontFamily: "MaruBuriBold",
  },
  registerButton: {
    marginTop: 13,
    height: 56,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#C7A873",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 252, 246, 0.55)",
  },
  registerButtonText: {
    fontSize: 17,
    fontFamily: "PretendardSemiBold",
    color: "#B18A52",
  },
  bgImage: {
  width: "100%",
  height: "100%",
},
inputWrap: {
  flexDirection: "row",
  alignItems: "center",
  height: 50,
  borderWidth: 1,
  borderColor: "#DED2C4",
  borderRadius: 16,
  backgroundColor: "rgba(255,255,255,0.55)",
  paddingHorizontal: 16,
  marginBottom: 24,
},

inputIcon: {
  width: 24,
  height: 24,
  tintColor: "#C7B295",
  marginRight: 12,
},

inputWithIcon: {
  flex: 1,
  fontSize: 18,
  fontFamily: "PretendardMedium",
  color: "#3A2C27",
},

registerContent: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
},

signupIcon: {
  width: 24,
  height: 24,
  tintColor: "#B18A52",
  marginRight: 10,
},
});