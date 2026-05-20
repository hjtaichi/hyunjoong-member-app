import React, { useEffect, useRef } from "react";
import { Tabs, router, usePathname } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { AppState, Image, Platform, Text } from "react-native";
import { useAuth } from "../../src/contexts/AuthContext";
import { colors } from "../../src/theme/colors";

export default function TabLayout() {
  const auth = useAuth() as any;
  const { user, refreshMe } = auth;

  const pathname = usePathname();
  const checkingRef = useRef(false);

  const authUser = user as any;
  const memberStatus = authUser?.memberStatus || authUser?.status;
  const isPausedMember = memberStatus === "paused";

  async function checkMemberStatus() {
    if (checkingRef.current) return;
    if (!refreshMe) return;

    try {
      checkingRef.current = true;

      const refreshedUser = await refreshMe();
      const nextStatus = refreshedUser?.memberStatus || refreshedUser?.status;

      if (nextStatus === "ended") {
        router.replace("/login");
        return;
      }

      if (nextStatus === "paused") {
        const currentPath = String(pathname || "");

        const isAllowedPausedPath =
          currentPath.includes("inquiry") ||
          currentPath.includes("notice");

        if (!isAllowedPausedPath) {
          router.replace("/(tabs)/inquiry");
        }
      }
    } finally {
      checkingRef.current = false;
    }
  }

  useEffect(() => {
    checkMemberStatus();

    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        checkMemberStatus();
      }
    });

    const timer = setInterval(() => {
      checkMemberStatus();
    }, 30000);

    return () => {
      subscription.remove();
      clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <Tabs
      initialRouteName={isPausedMember ? "inquiry" : "home"}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.warmBrown,
        tabBarInactiveTintColor: colors.softBrown,
        tabBarHideOnKeyboard: true,
        tabBarLabelStyle: {
  fontSize: 10,
  fontWeight: "700",
  marginTop: 0,
},
tabBarIconStyle: {
  marginTop: 3,
},
tabBarStyle: {
  height: Platform.OS === "web" ? 72 : 88,
  paddingTop: 4,
  paddingBottom: Platform.OS === "web" ? 8 : 18,
  backgroundColor: colors.card,
  borderTopColor: colors.border,
  borderTopWidth: 1,
},
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "홈",
          href: isPausedMember ? null : undefined,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
  name="taegukwon"
  options={{
    title: "태극권",
    href: isPausedMember ? null : undefined,
    tabBarIcon: ({ color, focused }) => (
      <Image
        source={require("../../assets/images/taegukwon-tab.png")}
        tintColor={color}
        style={{
          width: 34,
          height: 34,
          opacity: focused ? 1 : 0.8,
        }}
        resizeMode="contain"
      />
    ),
  }}
/>

      <Tabs.Screen
        name="schedule"
        options={{
          title: "일정",
          href: isPausedMember ? null : undefined,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="inquiry"
        options={{
          title: "문의",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="mypage"
        options={{
          title: "내정보",
          href: isPausedMember ? null : undefined,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}