import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import { useAuth } from "../src/contexts/AuthContext";
import { markAttendance } from "../src/api/memberAttendance";

export default function AttendanceCheckScreen() {
  const { sessionId } = useLocalSearchParams();
  const { token, isAuthenticated, isBootLoading } = useAuth();

  const [statusText, setStatusText] = useState("출석 정보를 확인하는 중입니다.");
  const [done, setDone] = useState(false);

  useEffect(() => {
    async function submitAttendance() {
      if (isBootLoading) return;

      if (!isAuthenticated || !token) {
        Alert.alert("로그인이 필요합니다", "로그인 후 다시 QR을 스캔해주세요.", [
          {
            text: "로그인",
            onPress: () => router.replace("/login"),
          },
        ]);
        return;
      }

      if (!sessionId) {
        setStatusText("출석 QR 정보가 올바르지 않습니다.");
        setDone(true);
        return;
      }

      try {
        setStatusText("출석 처리 중입니다.");

        await markAttendance(token, {
          sessionId: String(sessionId),
        });

        setStatusText("출석되었습니다.");
        setDone(true);

        setTimeout(() => {
          router.replace("/(tabs)/home");
        }, 1200);
      } catch (error) {
        setStatusText(error.message || "출석 처리에 실패했습니다.");
        setDone(true);
      }
    }

    submitAttendance();
  }, [isBootLoading, isAuthenticated, token, sessionId]);

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