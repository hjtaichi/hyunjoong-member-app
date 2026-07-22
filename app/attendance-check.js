import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import { useAuth } from "../src/contexts/AuthContext";
import { markAttendance } from "../src/api/memberAttendance";

function normalizeQrToken(value) {
  const token = Array.isArray(value) ? value[0] : value;
  const cleanToken = String(token || "").trim();

  if (!cleanToken || cleanToken.length > 4096) {
    return "";
  }

  return /^[A-Za-z0-9._-]+$/.test(cleanToken) ? cleanToken : "";
}

export default function AttendanceCheckScreen() {
  const { token: qrTokenParam } = useLocalSearchParams();
  const { token, isAuthenticated, isBootLoading } = useAuth();
  const qrToken = normalizeQrToken(qrTokenParam);

  const [statusText, setStatusText] = useState("출석 정보를 확인하는 중입니다.");
  const [done, setDone] = useState(false);
  const submitStartedRef = useRef(false);
  const redirectTimerRef = useRef(null);

  useEffect(() => {
    if (isBootLoading || submitStartedRef.current) return;

    if (!qrToken) {
      submitStartedRef.current = true;
      setStatusText("출석 QR 정보가 올바르지 않습니다.");
      setDone(true);
      return;
    }

    if (!isAuthenticated || !token) {
      submitStartedRef.current = true;
      router.replace({
        pathname: "/login",
        params: {
          attendanceToken: qrToken,
        },
      });
      return;
    }

    submitStartedRef.current = true;

    async function submitAttendance() {
      try {
        setStatusText("출석 처리 중입니다.");

        await markAttendance(token, {
          qrToken,
        });

        setStatusText("출석되었습니다.");
        setDone(true);

        redirectTimerRef.current = setTimeout(() => {
          router.replace({
            pathname: "/(tabs)/home",
            params: {
              attendanceResult: "success",
            },
          });
        }, 1200);
      } catch (error) {
        setStatusText(error?.message || "출석 처리에 실패했습니다.");
        setDone(true);
      }
    }

    submitAttendance();

    return () => {
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
    };
  }, [isBootLoading, isAuthenticated, token, qrToken]);

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        {!done ? <ActivityIndicator size="large" /> : null}

        <Text style={styles.title}>
          {done ? "QR 출석" : "출석 처리 중"}
        </Text>

        <Text style={styles.message}>{statusText}</Text>

        {done ? (
          <Pressable
            style={styles.button}
            onPress={() => router.replace("/(tabs)/home")}
          >
            <Text style={styles.buttonText}>홈으로 이동</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8F5EF",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    padding: 28,
    alignItems: "center",
  },
  title: {
    marginTop: 16,
    fontSize: 24,
    fontWeight: "900",
    color: "#1F1A17",
  },
  message: {
    marginTop: 12,
    fontSize: 16,
    lineHeight: 24,
    color: "#6B6258",
    textAlign: "center",
  },
  button: {
    marginTop: 24,
    height: 48,
    paddingHorizontal: 24,
    borderRadius: 24,
    backgroundColor: "#1F2937",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },
});
