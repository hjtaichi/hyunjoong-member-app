import React, { useEffect } from "react";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import "react-native-reanimated";

import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";

import { useColorScheme } from "../hooks/use-color-scheme";
import { AuthProvider, useAuth } from "../src/contexts/AuthContext";
import { savePushToken } from "../src/api/push.js";

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

// 🔥 초기화
function PushInitializer() {
  const { token: accessToken } = useAuth();

  useEffect(() => {
    async function initPush() {
      if (!accessToken) return;

      try {
        const pushToken = await registerForPushNotificationsAsync();

        if (pushToken) {
          await savePushToken(pushToken, accessToken);
          console.log("✅ 푸시 토큰 서버 저장 완료");
        }
      } catch (error) {
        console.log("❌ 푸시 초기화 실패:", error?.message || error);
      }
    }

    initPush();
  }, [accessToken]);

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
SplashScreen.preventAutoHideAsync();
// 🔥 루트
export default function RootLayout() {
  const colorScheme = useColorScheme();
const [fontsLoaded] = useFonts({
  ChosunCentennial: require("../assets/fonts/ChosunCentennial.ttf"),

  PretendardRegular: require("../assets/fonts/Pretendard-Regular.otf"),
  PretendardMedium: require("../assets/fonts/Pretendard-Medium.otf"),
  PretendardSemiBold: require("../assets/fonts/Pretendard-SemiBold.otf"),
  PretendardBold: require("../assets/fonts/Pretendard-Bold.otf"),
});
  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;
  return (
    <AuthProvider>
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
    </AuthProvider>
  );
}