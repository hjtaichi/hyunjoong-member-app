// src/navigation/RootNavigator.js

import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../contexts/AuthContext";
import LoadingScreen from "../components/LoadingScreen";
import LoginScreen from "../screens/LoginScreen";
import HomeScreen from "../screens/HomeScreen";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { isAuthenticated, isBootLoading } = useAuth();

  if (isBootLoading) {
    return <LoadingScreen text="앱 준비 중..." />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerTitleAlign: "center" }}>
        {isAuthenticated ? (
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ title: "회원 홈" }}
          />
        ) : (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ title: "로그인" }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}