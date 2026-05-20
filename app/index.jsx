import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';

export default function IndexPage() {
  const { isAuthenticated, isBootLoading, user } = useAuth();

  useEffect(() => {
    if (isBootLoading) return;

    if (isAuthenticated) {
  const authUser = user || {};
  const memberStatus = authUser?.memberStatus || authUser?.status;

  if (memberStatus === "paused") {
    router.replace("/(tabs)/inquiry");
  } else {
    router.replace("/(tabs)/home");
  }
} else {
  router.replace("/login");
}
  }, [isAuthenticated, isBootLoading]);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
}