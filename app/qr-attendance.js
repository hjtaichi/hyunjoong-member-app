import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
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

  try {
    if (raw.startsWith("memberapp://")) {
      const url = new URL(raw);
      const sessionId = url.searchParams.get("sessionId");

      if (url.hostname === "attendance-check" && sessionId) {
        return { sessionId: String(sessionId) };
      }
    }
  } catch (error) {
    console.log("[parseQrData] deeplink parse error:", raw, error);
  }

  try {
    const parsed = JSON.parse(raw);

    if (parsed?.type === "attendance" && parsed?.sessionId) {
      return { sessionId: String(parsed.sessionId) };
    }

    return null;
  } catch (error) {
    console.log("[parseQrData] json parse error:", raw, error);
    return null;
  }
}

function showAlert(title, message, buttons) {
  if (Platform.OS === "web") {
    window.alert(`${title}\n\n${message}`);

    const actionButton =
      buttons?.find((button) => button.text === "확인") ||
      buttons?.find((button) => button.text === "다시 스캔") ||
      buttons?.[0];

    if (actionButton?.onPress) actionButton.onPress();

    return;
  }

  Alert.alert(title, message, buttons);
}

function WebQrScanner({ onScan, disabled }) {
  const scannerRef = useRef(null);
  const startedRef = useRef(false);
  const [webError, setWebError] = useState("");

  useEffect(() => {
    if (disabled) return;

    let mounted = true;

    async function startScanner() {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");

        if (!mounted || startedRef.current) return;

        const scanner = new Html5Qrcode("qr-reader");
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 260, height: 260 },
            aspectRatio: 1,
          },
          (decodedText) => {
            console.log("🔥 WEB QR RAW DATA:", decodedText);
            onScan({ data: decodedText });
          },
          () => {}
        );

        startedRef.current = true;
      } catch (error) {
        console.log("❌ web qr scanner error:", error);
        setWebError(
          error?.message ||
            "웹 QR 스캐너를 시작하지 못했습니다. 카메라 권한을 확인해주세요."
        );
      }
    }

    startScanner();

    return () => {
      mounted = false;

      if (scannerRef.current && startedRef.current) {
        scannerRef.current
          .stop()
          .then(() => scannerRef.current?.clear())
          .catch((error) => console.log("web qr scanner stop error:", error))
          .finally(() => {
            startedRef.current = false;
            scannerRef.current = null;
          });
      }
    };
  }, [disabled, onScan]);

  return (
    <View style={styles.webCameraBox}>
      <div
        id="qr-reader"
        style={{
          width: "100%",
          minHeight: 320,
          overflow: "hidden",
          borderRadius: 28,
        }}
      />

      {webError ? (
        <View style={styles.webErrorBox}>
          <Text style={styles.webErrorText}>{webError}</Text>
        </View>
      ) : null}
    </View>
  );
}

export default function QrAttendanceScreen() {
  const { token } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (Platform.OS === "web") return;
    if (!permission) return;

    if (!permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  async function handleBarcodeScanned({ data }) {
    console.log("🔥 QR RAW DATA:", data);

    if (scanned || submitting) return;

    const parsed = parseQrData(data);

    console.log("🔥 QR PARSED:", parsed);

    if (!parsed?.sessionId) {
      setScanned(true);
      showAlert("안내", "현중태극권 출석 QR이 아닙니다.", [
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

      showAlert("출석 완료", "출석이 정상 처리되었습니다.", [
        {
          text: "확인",
          onPress: () => router.replace("/(tabs)/home"),
        },
      ]);
    } catch (error) {
  showAlert("출석 실패", error.message || "출석 처리에 실패했습니다.", [
    {
      text: "확인",
      onPress: () => {
        setScanned(false);
        setSubmitting(false);
      },
    },
  ]);
} finally {
  setSubmitting(false);
}
  }

  if (Platform.OS !== "web" && !permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.helperText}>카메라 권한을 확인하는 중입니다.</Text>
      </View>
    );
  }

  if (Platform.OS !== "web" && !permission.granted) {
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
      {Platform.OS === "web" ? (
        <WebQrScanner onScan={handleBarcodeScanned} disabled={scanned} />
      ) : (
        <CameraView
          style={styles.camera}
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
          onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        />
      )}

      <View style={styles.overlay} pointerEvents="box-none">
        <View style={styles.topPanel}>
          <Text style={styles.title}>QR 출석</Text>
          <Text style={styles.helperText}>
            관리자 화면의 출석 QR을 카메라 중앙에 맞춰주세요.
          </Text>
        </View>

        {Platform.OS !== "web" ? <View style={styles.scanBox} /> : <View />}

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
  webCameraBox: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  webErrorBox: {
    marginTop: 16,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.92)",
    padding: 14,
  },
  webErrorText: {
    fontSize: 14,
    color: "#B91C1C",
    fontWeight: "700",
    textAlign: "center",
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