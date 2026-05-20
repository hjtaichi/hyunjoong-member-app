import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { router } from "expo-router";

import { useAuth } from "../src/contexts/AuthContext";
import { markAttendance } from "../src/api/memberAttendance";

function parseQrData(data) {
  const raw = String(data || "").trim();

  // 1) 딥링크 QR 지원
  // 예: memberapp://attendance-check?sessionId=xxxx
  try {
    if (raw.startsWith("memberapp://")) {
      const url = new URL(raw);
      const sessionId = url.searchParams.get("sessionId");

      if (url.hostname === "attendance-check" && sessionId) {
        return {
          sessionId: String(sessionId),
        };
      }
    }
  } catch (error) {
    console.log("[parseQrData] deeplink parse error:", error);
  }

  // 2) 기존 JSON QR도 계속 지원
  try {
    const parsed = JSON.parse(raw);

    if (parsed?.type === "attendance" && parsed?.sessionId) {
      return {
        sessionId: String(parsed.sessionId),
      };
    }

    return null;
  } catch {
    return null;
  }
}

export default function QrAttendanceScreen() {
  const { token } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!permission) return;

    if (!permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  async function handleBarcodeScanned({ data }) {
    if (scanned || submitting) return;

    const parsed = parseQrData(data);

    if (!parsed?.sessionId) {
      setScanned(true);
      Alert.alert("안내", "현중태극권 출석 QR이 아닙니다.", [
        {
          text: "다시 스캔",
          onPress: () => setScanned(false),
        },
      ]);
      return;
    }

    try {
      setScanned(true);
      setSubmitting(true);

      await markAttendance(token, {
        sessionId: parsed.sessionId,
      });

      Alert.alert("출석 완료", "출석이 정상 처리되었습니다.", [
        {
          text: "확인",
          onPress: () => router.replace("/(tabs)/home"),
        },
      ]);
    } catch (error) {
      Alert.alert("출석 실패", error.message || "출석 처리에 실패했습니다.", [
        {
          text: "다시 스캔",
          onPress: () => {
            setScanned(false);
            setSubmitting(false);
          },
        },
        {
          text: "홈으로",
          onPress: () => router.replace("/(tabs)/home"),
        },
      ]);
    } finally {
      setSubmitting(false);
    }
  }

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.helperText}>카메라 권한을 확인하는 중입니다.</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>카메라 권한이 필요합니다</Text>
        <Text style={styles.helperText}>
          QR 출석을 위해 카메라 접근을 허용해주세요.
        </Text>

        <Pressable style={styles.primaryButton} onPress={requestPermission}>
          <Text style={styles.primaryButtonText}>권한 허용하기</Text>
        </Pressable>

        <Pressable style={styles.secondaryButton} onPress={() => router.back()}>
          <Text style={styles.secondaryButtonText}>돌아가기</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
      />

      <View style={styles.overlay}>
        <View style={styles.topPanel}>
          <Text style={styles.title}>QR 출석</Text>
          <Text style={styles.helperText}>
            관리자 화면의 출석 QR을 카메라 중앙에 맞춰주세요.
          </Text>
        </View>

        <View style={styles.scanBox} />

        <View style={styles.bottomPanel}>
          {submitting ? (
            <Text style={styles.processingText}>출석 처리 중...</Text>
          ) : (
            <Text style={styles.bottomText}>QR을 스캔하면 자동 출석됩니다.</Text>
          )}

          <Pressable style={styles.closeButton} onPress={() => router.back()}>
            <Text style={styles.closeButtonText}>닫기</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#000",
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    paddingHorizontal: 24,
    paddingTop: 70,
    paddingBottom: 40,
    justifyContent: "space-between",
  },
  topPanel: {
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.92)",
    padding: 18,
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: "#1F1A17",
  },
  helperText: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: "#6B6258",
  },
  scanBox: {
    alignSelf: "center",
    width: 250,
    height: 250,
    borderRadius: 28,
    borderWidth: 4,
    borderColor: "#FFFFFF",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  bottomPanel: {
    alignItems: "center",
  },
  bottomText: {
    marginBottom: 14,
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  processingText: {
    marginBottom: 14,
    fontSize: 14,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  closeButton: {
    minWidth: 120,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1F1A17",
  },
  center: {
    flex: 1,
    backgroundColor: "#F8F5EF",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  primaryButton: {
    marginTop: 20,
    minWidth: 160,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#314E67",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  secondaryButton: {
    marginTop: 10,
    minWidth: 160,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#D9D0C2",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: "#4B4038",
    fontSize: 15,
    fontWeight: "800",
  },
});