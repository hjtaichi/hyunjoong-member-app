import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { colors } from "../theme";

const fonts = {
  title: "MaruBuriBold",
  medium: "PretendardMedium",
};

export default function ScreenHeader({ title, onBack }) {
  return (
    <View style={styles.header}>
      <Pressable
        style={styles.backButton}
        onPress={onBack || (() => router.back())}
        hitSlop={10}
      >
        <Image
          source={require("../../assets/images/back.png")}
          style={styles.backIcon}
          resizeMode="contain"
        />
      </Pressable>

      <Text style={styles.headerTitle}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 54,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    position: "relative",
  },

  backButton: {
    position: "absolute",
    left: 0,
    width: 44,
    height: 44,
    alignItems: "flex-start",
    justifyContent: "center",
  },

  backIcon: {
    width: 18,
    height: 18,
    opacity: 0.75,
  },

  headerTitle: {
    fontSize: 24,
    fontFamily: fonts.title,
    color: colors.textMain,
    lineHeight: 32,
  },
});