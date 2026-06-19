import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { router } from "expo-router";
import { useAuth } from "../src/contexts/AuthContext";

export default function IndexPage() {
  const { isAuthenticated, isBootLoading, user } = useAuth();

  useEffect(() => {
    if (isBootLoading) return;

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    const memberStatus = user?.memberStatus || user?.status;

    if (memberStatus === "paused") {
      router.replace("/(tabs)/inquiry");
      return;
    }

    router.replace("/(tabs)/home");
  }, [isAuthenticated, isBootLoading, user]);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator size="large" />
    </View>
  );
}