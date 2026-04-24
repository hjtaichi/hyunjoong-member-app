// src/components/LoadingScreen.js

import React from "react";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";

export default function LoadingScreen({ text = "불러오는 중..." }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" />
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: "#fff",
  },
  text: {
    fontSize: 14,
    color: "#666",
  },
});