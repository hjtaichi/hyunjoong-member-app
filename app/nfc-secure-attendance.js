import React, {
  useEffect,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  router,
  useLocalSearchParams,
} from "expo-router";

import { useAuth } from "../src/contexts/AuthContext";
import {
  markSecureNfcAttendance,
} from "../src/api/memberAttendance";

function normalizeProofToken(value) {
  const token =
    Array.isArray(value) ? value[0] : value;

  const cleanToken =
    String(token || "").trim();

  if (
    !cleanToken ||
    cleanToken.length > 4096 ||
    !/^[A-Za-z0-9_-]+$/.test(cleanToken)
  ) {
    return "";
  }

  return cleanToken;
}

export default function NfcSecureAttendanceScreen() {
  const {
    proof: proofParam,
  } = useLocalSearchParams();

  const {
    token,
    isAuthenticated,
    isBootLoading,
  } = useAuth();

  const proofToken =
    normalizeProofToken(proofParam);

  const [statusText, setStatusText] =
    useState(
      "NFC 출석 정보를 확인하는 중입니다."
    );

  const [done, setDone] =
    useState(false);

  const submitStartedRef =
    useRef(false);

  const redirectTimerRef =
    useRef(null);

  useEffect(() => {
    if (
      isBootLoading ||
      submitStartedRef.current
    ) {
      return;
    }

    if (!proofToken) {
      submitStartedRef.current = true;

      setStatusText(
        "NFC 출석 정보가 올바르지 않습니다. 다시 태그해주세요."
      );

      setDone(true);
      return;
    }

    if (!isAuthenticated || !token) {
      submitStartedRef.current = true;

      router.replace({
        pathname: "/login",
        params: {
          nfcAttendanceProof:
            proofToken,
        },
      });

      return;
    }

    submitStartedRef.current = true;

    async function submitAttendance() {
      try {
        setStatusText(
          "NFC 출석 처리 중입니다."
        );

        await markSecureNfcAttendance(
          token,
          proofToken
        );

        setStatusText(
          "출석되었습니다."
        );

        setDone(true);

        redirectTimerRef.current =
          setTimeout(() => {
            router.replace({
              pathname: "/(tabs)/home",
              params: {
                attendanceResult:
                  "success",
              },
            });
          }, 1200);
      } catch (error) {
        setStatusText(
          error?.message ||
            "NFC 출석 처리에 실패했습니다."
        );

        setDone(true);
      }
    }

    submitAttendance();

    return () => {
      if (redirectTimerRef.current) {
        clearTimeout(
          redirectTimerRef.current
        );
      }
    };
  }, [
    isBootLoading,
    isAuthenticated,
    token,
    proofToken,
  ]);

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        {!done ? (
          <ActivityIndicator
            size="large"
          />
        ) : null}

        <Text style={styles.title}>
          {done
            ? "NFC 출석"
            : "출석 처리 중"}
        </Text>

        <Text style={styles.message}>
          {statusText}
        </Text>

        {done ? (
          <Pressable
            style={styles.button}
            onPress={() =>
              router.replace(
                "/(tabs)/home"
              )
            }
          >
            <Text
              style={styles.buttonText}
            >
              홈으로 이동
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: "#f7f5ef",
  },
  card: {
    width: "100%",
    maxWidth: 420,
    alignItems: "center",
    paddingHorizontal: 28,
    paddingVertical: 36,
    borderRadius: 22,
    backgroundColor: "#ffffff",
  },
  title: {
    marginTop: 18,
    fontSize: 22,
    fontWeight: "700",
    color: "#2d332e",
  },
  message: {
    marginTop: 12,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    color: "#667067",
  },
  button: {
    marginTop: 24,
    minWidth: 140,
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#596b5d",
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#ffffff",
  },
});