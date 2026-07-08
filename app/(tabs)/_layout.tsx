// @ts-nocheck

import React, { useEffect, useRef } from "react";
import { Tabs, router, usePathname } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  ActivityIndicator,
  AppState,
  Image,
  Platform,
  View,
} from "react-native";
import { useAuth } from "../../src/contexts/AuthContext";
import { colors } from "../../src/theme/colors";

export default function TabLayout() {
  const auth = useAuth();
  const {
    user,
    refreshMe,
    isBootLoading,
    isAuthenticated,
  } = auth;

  const pathname = usePathname();
  const checkingRef = useRef(false);

  const memberStatus = user?.memberStatus || user?.status;
  const isPausedMember = memberStatus === "paused";

  async function checkMemberStatus() {
    if (isBootLoading) return;
    if (!isAuthenticated) return;
    if (checkingRef.current) return;
    if (!refreshMe) return;

    try {
      checkingRef.current = true;

      const refreshedUser = await refreshMe();

      if (!refreshedUser) {
        router.replace("/login");
        return;
      }

      const nextStatus =
        refreshedUser?.memberStatus || refreshedUser?.status;

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
  if (isBootLoading) return;

  if (!isAuthenticated) {
    router.replace("/login");
    return;
  }

  checkMemberStatus();

  const subscription = AppState.addEventListener("change", (state) => {
    if (state === "active") {
      checkMemberStatus();
    }
  });

  return () => {
    subscription.remove();
  };
}, [isBootLoading, isAuthenticated]);

  if (isBootLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Tabs
      initialRouteName={isPausedMember ? "inquiry" : "home"}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.warmBrown,
        tabBarInactiveTintColor: colors.softBrown,
        tabBarHideOnKeyboard: true,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
          marginTop: 0,
        },
        tabBarIconStyle: {
          marginTop: 3,
        },
        tabBarStyle: {
          height: Platform.OS === "web" ? 72 : 88,
          paddingTop: 4,
          paddingBottom: Platform.OS === "web" ? 12 : 18,
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
    tabBarIcon: ({ color, focused }) => (
      <Image
        source={require("../../assets/images/taegukwon-tab.png")}
        style={{
          width: 30,
          height: 30,
          opacity: focused ? 1 : 0.8,
          tintColor: color,
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
          title: "소식/문의",
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