import { stopWebCamera } from "../src/utils/stopWebCamera";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
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

function isAllowedMemberAppUrl(url) {
  if (url.protocol !== "https:") return false;
  if (url.hostname === "app.hjtaichi.com") return true;

  if (typeof window !== "undefined") {
    return url.hostname === window.location.hostname;
  }

  return false;
}

function parseQrData(data) {
  const raw = String(data || "").trim();

  try {
    const url = new URL(raw);
    const normalizedPath = url.pathname.replace(/\/$/, "");
    const qrToken = url.searchParams.get("token");

    if (
      isAllowedMemberAppUrl(url) &&
      normalizedPath === "/attendance-check" &&
      qrToken
    ) {
      return { qrToken: String(qrToken) };
    }

    if (url.protocol === "memberapp:") {
      const sessionId = url.searchParams.get("sessionId");
      if (url.hostname === "attendance-check" && sessionId) {
        return { sessionId: String(sessionId) };
      }
    }
  } catch {}

  try {
    const parsed = JSON.parse(raw);
    if (parsed?.type === "attendance" && parsed?.sessionId) {
      return { sessionId: String(parsed.sessionId) };
    }
  } catch {}

  return null;
}

function showAlert(title, message, buttons) {
  if (Platform.OS === "web") {
    window.alert(`${title}\n\n${message}`);
    const actionButton =
      buttons?.find((button) => button.text === "확인") ||
      buttons?.find((button) => button.text === "다시 스캔") ||
      buttons?.[0];
    actionButton?.onPress?.();
    return;
  }

  Alert.alert(title, message, buttons);
}

export function getWebCameraErrorMessage(error) {
  const name = String(error?.name || "");

  if (name === "NotAllowedError" || name === "PermissionDeniedError") {
    return "카메라 권한이 거부되어 있습니다. 브라우저 주소창의 사이트 설정에서 카메라 권한을 '허용'으로 변경한 뒤 다시 시도해주세요.";
  }

  if (name === "NotFoundError" || name === "DevicesNotFoundError") {
    return "사용할 수 있는 카메라를 찾지 못했습니다. 기기에 카메라가 연결되어 있는지 확인해주세요.";
  }

  if (name === "NotReadableError" || name === "TrackStartError") {
    return "카메라를 사용할 수 없습니다. 다른 앱에서 카메라를 사용 중인지 확인한 뒤 다시 시도해주세요.";
  }

  if (name === "SecurityError") {
    return "보안 연결에서만 카메라를 사용할 수 있습니다. 앱을 정상 주소로 다시 열어주세요.";
  }

  return "카메라를 시작하지 못했습니다. 브라우저의 사이트 설정에서 카메라 권한을 확인한 뒤 다시 시도해주세요.";
}

function WebQrScanner({ onScan, disabled }) {
  const videoRef = useRef(null);
  const controlsRef = useRef(null);
  const [webError, setWebError] = useState("");

  useEffect(() => {
    const videoElement = videoRef.current;

    if (disabled) {
      stopWebCamera(videoElement, controlsRef.current);
      controlsRef.current = null;
      return undefined;
    }

    let cancelled = false;

    async function start() {
      let controls = null;

      try {
        const { BrowserQRCodeReader } = await import("@zxing/browser");
        const codeReader = new BrowserQRCodeReader();

        controls = await codeReader.decodeFromConstraints(
          {
            video: {
              facingMode: { ideal: "environment" },
            },
            audio: false,
          },
          videoElement,
          (result) => {
            if (cancelled || disabled) return;

            const text = result?.getText?.();

            if (text) {
              onScan({ data: text });
            }
          }
        );

        if (cancelled || disabled) {
          stopWebCamera(videoElement, controls);
          return;
        }

        controlsRef.current = controls;
      } catch (error) {
        if (cancelled || disabled) {
          stopWebCamera(videoElement, controls);
          return;
        }

        console.log("ZXing QR scanner error:", error);
        setWebError(getWebCameraErrorMessage(error));
        stopWebCamera(videoElement, controls);
      }
    }

    if (videoElement) {
      start();
    }

    return () => {
      cancelled = true;

      const controls = controlsRef.current;
      controlsRef.current = null;

      stopWebCamera(videoElement, controls);
    };
  }, [disabled, onScan]);

  return (
    <View style={styles.webCameraBox}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
          backgroundColor: "#000",
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
  const scannedRef = useRef(false);

  useEffect(() => {
    if (Platform.OS === "web") return;
    if (!permission) return;

    if (!permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  async function handleBarcodeScanned({ data }) {
    if (scannedRef.current) return;

    scannedRef.current = true;
    setScanned(true);

    const parsed = parseQrData(data);

    if (!parsed?.qrToken && !parsed?.sessionId) {
      showAlert("안내", "현중태극권 출석 QR이 아닙니다.", [
        {
          text: "다시 스캔",
          onPress: () => {
            scannedRef.current = false;
            setScanned(false);
          },
        },
      ]);
      return;
    }

    try {
      setSubmitting(true);

      await markAttendance(
        token,
        parsed.qrToken
          ? { qrToken: parsed.qrToken }
          : { sessionId: parsed.sessionId }
      );

      showAlert("출석 완료", "출석이 정상 처리되었습니다.", [
        {
          text: "확인",
          onPress: () => router.replace("/(tabs)/home"),
        },
      ]);
    } catch (error) {
      showAlert("출석 실패", error?.message || "출석 처리에 실패했습니다.", [
        {
          text: "확인",
          onPress: () => router.replace("/(tabs)/home"),
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
          {permission.canAskAgain
            ? "QR 출석을 위해 카메라 접근을 허용해주세요."
            : "카메라 권한이 거부되어 있습니다. 휴대폰 설정에서 현중태극권의 카메라 권한을 허용해주세요."}
        </Text>

        <Pressable
          style={styles.primaryButton}
          onPress={
            permission.canAskAgain
              ? requestPermission
              : () => Linking.openSettings()
          }
        >
          <Text style={styles.primaryButtonText}>
            {permission.canAskAgain ? "권한 허용하기" : "설정 열기"}
          </Text>
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
      ) : !scanned ? (
        <CameraView
          style={styles.camera}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          onBarcodeScanned={handleBarcodeScanned}
        />
      ) : (
        <View style={styles.cameraStopped} />
      )}

      <View style={styles.topPanel}>
        <Text style={styles.title}>QR 출석</Text>
        <Text style={styles.helperText}>
          관리자 화면의 출석 QR을 카메라 중앙에 맞춰주세요.
        </Text>
      </View>

      <View pointerEvents="none" style={styles.scanGuide}>
        <View style={styles.cornerTopLeft} />
        <View style={styles.cornerTopRight} />
        <View style={styles.cornerBottomLeft} />
        <View style={styles.cornerBottomRight} />
      </View>

      <View style={styles.bottomPanel}>
        <Text style={submitting ? styles.processingText : styles.bottomText}>
          {submitting ? "출석 처리 중..." : "QR을 스캔하면 자동 출석됩니다."}
        </Text>

        <Pressable style={styles.closeButton} onPress={() => router.back()}>
          <Text style={styles.closeButtonText}>닫기</Text>
        </Pressable>
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
    ...StyleSheet.absoluteFillObject,
  },
  webCameraBox: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000",
  },
  cameraStopped: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#1F1A17",
  },
  topPanel: {
    position: "absolute",
    top: 92,
    left: 24,
    right: 24,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.94)",
    padding: 18,
    zIndex: 10,
  },
  scanGuide: {
    position: "absolute",
    left: 52,
    right: 52,
    top: "39%",
    height: 260,
    zIndex: 9,
  },
  cornerTopLeft: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 44,
    height: 44,
    borderTopWidth: 5,
    borderLeftWidth: 5,
    borderColor: "#FFFFFF",
  },
  cornerTopRight: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 44,
    height: 44,
    borderTopWidth: 5,
    borderRightWidth: 5,
    borderColor: "#FFFFFF",
  },
  cornerBottomLeft: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: 44,
    height: 44,
    borderBottomWidth: 5,
    borderLeftWidth: 5,
    borderColor: "#FFFFFF",
  },
  cornerBottomRight: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 44,
    height: 44,
    borderBottomWidth: 5,
    borderRightWidth: 5,
    borderColor: "#FFFFFF",
  },
  bottomPanel: {
    position: "absolute",
    left: 24,
    right: 24,
    bottom: 54,
    alignItems: "center",
    zIndex: 10,
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
  webErrorBox: {
    position: "absolute",
    left: 24,
    right: 24,
    top: "45%",
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