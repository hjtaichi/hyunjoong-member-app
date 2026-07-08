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
const WEB_PUSH_PUBLIC_KEY =
"BIDcyRAxTG6Vpf4UbEaAz5Vgxw-sR_fXpys8SrGZJwhdbfv5Zgf3y7C0kQ1zttBgk6qARjOI1B7Ho4NAzW3_baM";
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = `${base64String}${padding}`
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

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
    console.log("🌐 웹에서는 Expo Push 알림을 사용하지 않습니다.");
    return null;
  }

  if (!Device.isDevice) {
    console.log("❌ 실기기에서만 푸시 가능");
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
    console.log("❌ 푸시 권한 거부됨");
    return null;
  }

  // 🔥 핵심 (너 프로젝트 ID 자동 읽기)
  const projectId =
    Constants?.expoConfig?.extra?.eas?.projectId ??
    Constants?.easConfig?.projectId;

  console.log("🔥 EAS projectId:", projectId);

  if (!projectId) {
    console.log("❌ projectId 없음");
    return null;
  }

  // 🔥 푸시 토큰 발급
  const pushToken = (
    await Notifications.getExpoPushTokenAsync({
      projectId,
    })
  ).data;

  console.log("🔥 PUSH TOKEN:", pushToken);

  return pushToken;
}
async function registerForWebPushNotificationsAsync(accessToken) {
  console.log("🔥 Web Push 등록 시작");

  if (Platform.OS !== "web") return null;

  if (typeof window === "undefined") {
    console.log("❌ window 없음");
    return null;
  }

  if (!("serviceWorker" in navigator)) {
    console.log("❌ Service Worker 미지원");
    return null;
  }

  if (!("PushManager" in window)) {
    console.log("❌ PushManager 미지원");
    return null;
  }

  if (!("Notification" in window)) {
    console.log("❌ Notification 미지원");
    return null;
  }

  console.log("🔥 Notification permission before:", Notification.permission);

  const permission = await Notification.requestPermission();

  console.log("🔥 Notification permission after:", permission);

  if (permission !== "granted") {
    console.log("❌ 웹 푸시 권한 거부됨:", permission);
    return null;
  }

  console.log("🔥 service worker ready 대기");

  const registration = await navigator.serviceWorker.ready;

  console.log("✅ service worker ready 완료");

  let subscription = await registration.pushManager.getSubscription();

  console.log("🔥 기존 subscription:", subscription);

  if (!subscription) {
    console.log("🔥 새 subscription 생성 시작");

    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(WEB_PUSH_PUBLIC_KEY),
    });

    console.log("✅ 새 subscription 생성 완료");
  }

  const plainSubscription = subscription.toJSON();

  console.log("🔥 저장할 web subscription:", plainSubscription);

  await saveWebPushSubscription(plainSubscription, accessToken);

  console.log("✅ Web Push 구독 서버 저장 완료");

  return plainSubscription;
}

// 🔥 초기화
function PushInitializer() {
  const { token: accessToken, isBootLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    async function initPush() {
      console.log("🔥 PushInitializer 실행", {
        hasAccessToken: !!accessToken,
        isBootLoading,
        isAuthenticated,
        platform: Platform.OS,
      });

      if (isBootLoading) return;
      if (!isAuthenticated) return;
      if (!accessToken) return;

      try {
        if (Platform.OS === "web") {
          console.log("🔥 웹 푸시 등록 함수 호출 직전");
          await registerForWebPushNotificationsAsync(accessToken);
          console.log("🔥 웹 푸시 등록 함수 호출 완료");
          return;
        }

        const pushToken = await registerForPushNotificationsAsync();

        if (pushToken) {
          await savePushToken(pushToken, accessToken);
          console.log("✅ Expo 푸시 토큰 서버 저장 완료");
        }
      } catch (error) {
        console.log("❌ 푸시 초기화 실패:", error?.message || error);
      }
    }

    initPush();
  }, [accessToken, isBootLoading, isAuthenticated]);
  
  useEffect(() => {
  if (Platform.OS === "web") {
    console.log("🌐 웹에서는 알림 클릭 리스너를 등록하지 않습니다.");
    return;
  }

  function handleNotificationResponse(response) {
    const data = response?.notification?.request?.content?.data;

    console.log("🔥 알림 클릭됨:", data);

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
      .register("/sw.js")
      .then(() => console.log("✅ service worker registered"))
      .catch((error) => console.log("❌ service worker failed:", error));
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

          <StatusBar style="auto" />
        </ThemeProvider>
      </CartProvider>
    </AuthProvider>
  );
}