import React, { useEffect } from "react";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import "react-native-reanimated";
import { CartProvider } from "../src/contexts/CartContext";
import { checkAppVersionAndClearCache } from "../src/utils/appVersionManager";

import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform, View, ActivityIndicator } from "react-native";

import { useColorScheme } from "../hooks/use-color-scheme";
import { AuthProvider, useAuth } from "../src/contexts/AuthContext";
import {
  savePushToken,
  saveWebPushSubscription,
} from "../src/api/push.js";
import {
  ensureWebPushSubscription,
} from "../src/features/push/webPushSubscription";
import GlobalMenuLayer from "../src/features/globalMenu/GlobalMenuLayer";
const WEB_PUSH_PUBLIC_KEY =
"BA6OM0kZQC_j7BTZzAJi3fO783dpcCgLBThg8mc0pYe11abMEry7fRi1hoH6bMr90agBGTsRZqx2Z6JsMKznzSM";

// 🔥 알림 표시 설정
if (Platform.OS !== "web") {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

// 🔥 푸시 토큰 얻기
async function registerForPushNotificationsAsync() {
  if (Platform.OS === "web") {
    return null;
  }

  if (!Device.isDevice) {
    return null;
  }

  // ✅ Android 필수 (이거 없으면 알림 안 뜰 수 있음)
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#2563EB",
    });
  }

  // 권한 요청
  const { status: existingStatus } =
    await Notifications.getPermissionsAsync();

  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } =
      await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    return null;
  }

  // 🔥 핵심 (너 프로젝트 ID 자동 읽기)
  const projectId =
    Constants?.expoConfig?.extra?.eas?.projectId ??
    Constants?.easConfig?.projectId;


  if (!projectId) {
    return null;
  }

  // 🔥 푸시 토큰 발급
  const pushToken = (
    await Notifications.getExpoPushTokenAsync({
      projectId,
    })
  ).data;


  return pushToken;
}
function isAdminManagedBrowser() {
  if (
    Platform.OS !== "web" ||
    typeof document === "undefined"
  ) {
    return false;
  }

  return document.cookie
    .split(";")
    .map((item) => item.trim())
    .includes("hjtaichi_admin_device=1");
}

async function removeMemberWebPushFromAdminBrowser() {
  if (
    typeof navigator === "undefined" ||
    !("serviceWorker" in navigator)
  ) {
    return;
  }

  try {
    const registrations =
      await navigator.serviceWorker.getRegistrations();

    let unsubscribedCount = 0;

    for (const registration of registrations) {
      const subscription =
        await registration.pushManager
          ?.getSubscription();

      if (
        subscription &&
        (await subscription.unsubscribe())
      ) {
        unsubscribedCount += 1;
      }
    }

    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        "hjtaichi_member_web_push_suppressed",
        "admin_device"
      );
      window.localStorage.setItem(
        "hjtaichi_member_web_push_cleanup_status",
        "complete"
      );
      window.localStorage.setItem(
        "hjtaichi_member_web_push_cleanup_count",
        String(unsubscribedCount)
      );
      window.localStorage.setItem(
        "hjtaichi_member_web_push_cleanup_completed_at",
        new Date().toISOString()
      );
    }
  } catch (error) {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        "hjtaichi_member_web_push_cleanup_status",
        "failed"
      );
      window.localStorage.setItem(
        "hjtaichi_member_web_push_cleanup_error_code",
        String(
          error?.name ||
            "MemberWebPushCleanupError"
        )
      );
      window.localStorage.setItem(
        "hjtaichi_member_web_push_cleanup_failed_at",
        new Date().toISOString()
      );
    }
  }
}

async function registerForWebPushNotificationsAsync(accessToken) {

  if (Platform.OS !== "web") return null;

  if (typeof window === "undefined") {
    return null;
  }

  if (!("serviceWorker" in navigator)) {
    return null;
  }

  if (!("PushManager" in window)) {
    return null;
  }

  if (!("Notification" in window)) {
    return null;
  }

  if (isAdminManagedBrowser()) {
    await removeMemberWebPushFromAdminBrowser();
    return null;
  }

  const permission = await Notification.requestPermission();


  if (permission !== "granted") {
    return null;
  }


  const registration = await navigator.serviceWorker.ready;


  const storedPublicKey = window.localStorage.getItem(
    "hjtaichi_web_push_public_key"
  );

  const subscription = await ensureWebPushSubscription(
    registration,
    WEB_PUSH_PUBLIC_KEY,
    {
      forceRenew:
        storedPublicKey !== WEB_PUSH_PUBLIC_KEY,
    }
  );

  const plainSubscription = subscription.toJSON();

  await saveWebPushSubscription(
    plainSubscription,
    accessToken
  );

  window.localStorage.setItem(
    "hjtaichi_web_push_public_key",
    WEB_PUSH_PUBLIC_KEY
  );
  window.localStorage.removeItem(
    "hjtaichi_push_registration_error"
  );

  return plainSubscription;
}

// 🔥 초기화
function PushInitializer() {
  const { token: accessToken, isBootLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    async function initPush() {

      if (isBootLoading) return;
      if (!isAuthenticated) return;
      if (!accessToken) return;

      try {
        if (Platform.OS === "web") {
          await registerForWebPushNotificationsAsync(accessToken);
          return;
        }

        const pushToken = await registerForPushNotificationsAsync();

        if (pushToken) {
          await savePushToken(pushToken, accessToken);
        }
      } catch (error) {
        if (
          Platform.OS === "web" &&
          typeof window !== "undefined"
        ) {
          window.localStorage.setItem(
            "hjtaichi_push_registration_status",
            "failed"
          );
          window.localStorage.setItem(
            "hjtaichi_push_registration_error_code",
            String(error?.name || "PushRegistrationError")
          );
          window.localStorage.setItem(
            "hjtaichi_push_registration_failed_at",
            new Date().toISOString()
          );
        }
      }
    }

    initPush();
  }, [accessToken, isBootLoading, isAuthenticated]);
  
  useEffect(() => {
  if (Platform.OS === "web") {
    return;
  }

  function handleNotificationResponse(response) {
    const data = response?.notification?.request?.content?.data;


    if (data?.type === "notice" && data?.noticeId) {
      setTimeout(() => {
        router.push({
          pathname: "/notice/[noticeId]",
          params: {
            noticeId: String(data.noticeId),
          },
        });
      }, 300);

      return;
    }

    if (data?.type === "inquiry" && data?.roomId) {
      setTimeout(() => {
        router.push({
          pathname: "/(tabs)/inquiry/[roomId]",
          params: {
            roomId: String(data.roomId),
          },
        });
      }, 300);

      return;
    }
  }

  const subscription =
    Notifications.addNotificationResponseReceivedListener(
      handleNotificationResponse
    );

  if (Notifications.getLastNotificationResponseAsync) {
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) {
        handleNotificationResponse(response);
      }
    });
  }

  return () => {
    subscription.remove();
  };
}, []);
  return null;
}
if (Platform.OS !== "web") {
  SplashScreen.preventAutoHideAsync();
}
// 🔥 루트
export default function RootLayout() {
  const colorScheme = useColorScheme();
  useEffect(() => {
    checkAppVersionAndClearCache();
  }, []);
  const [fontsLoaded] = useFonts({
    ChosunCentennial: require("../assets/fonts/ChosunCentennial.ttf"),

    PretendardRegular: require("../assets/fonts/Pretendard-Regular.otf"),
    PretendardMedium: require("../assets/fonts/Pretendard-Medium.otf"),
    PretendardSemiBold: require("../assets/fonts/Pretendard-SemiBold.otf"),
    PretendardBold: require("../assets/fonts/Pretendard-Bold.otf"),

    MaruBuriRegular: require("../assets/fonts/MaruBuri-Regular.ttf"),
    MaruBuriSemiBold: require("../assets/fonts/MaruBuri-SemiBold.ttf"),
    MaruBuriBold: require("../assets/fonts/MaruBuri-Bold.ttf"),

    SimKyungha: require("../assets/fonts/SimKyungha.ttf"),
    KyoboHandwriting2025lyb: require("../assets/fonts/KyoboHandwriting2025lyb.ttf"),
    ZhaoKai: require("../assets/fonts/ZhaoCaiKaiShu.otf"),
  });

  useEffect(() => {
    if (!fontsLoaded) return;

    if (Platform.OS !== "web") {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    if (typeof navigator === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/sw.js?v=20260724-v4", {
        updateViaCache: "none",
      })
      .catch((error) => {
        window.localStorage.setItem(
          "hjtaichi_service_worker_status",
          "failed"
        );
        window.localStorage.setItem(
          "hjtaichi_service_worker_error_code",
          String(error?.name || "ServiceWorkerError")
        );
        window.localStorage.setItem(
          "hjtaichi_service_worker_failed_at",
          new Date().toISOString()
        );
      });
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <AuthProvider>
      <CartProvider>
        <PushInitializer />

        <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="login" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="modal"
              options={{ presentation: "modal", title: "Modal" }}
            />
          </Stack>

          <GlobalMenuLayer />

          <StatusBar style="auto" />
        </ThemeProvider>
      </CartProvider>
    </AuthProvider>
  );
}