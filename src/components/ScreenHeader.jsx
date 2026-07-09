import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { colors } from "../theme";

const fonts = {
  title: "MaruBuriBold",
};

export default function ScreenHeader({ title, onBack, light = false }) {
  return (
    <View style={styles.header}>
      <Pressable
        style={styles.backButton}
        onPress={onBack || (() => router.back())}
        hitSlop={10}
      >
        <Image
          source={require("../../assets/images/back.png")}
          style={[styles.backIcon, light && styles.backIconLight]}
          resizeMode="contain"
        />
      </Pressable>

      {title ? (
        <Text style={[styles.headerTitle, light && styles.headerTitleLight]}>
          {title}
        </Text>
      ) : null}
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
    zIndex: 50,
    elevation: 50,
  },

  backButton: {
    position: "absolute",
    left: 0,
    width: 44,
    height: 44,
    alignItems: "flex-start",
    justifyContent: "center",
    zIndex: 60,
    elevation: 60,
  },

  backIcon: {
    width: 18,
    height: 18,
    opacity: 0.75,
  },

  backIconLight: {
    tintColor: "#F5E6D0",
    opacity: 1,
  },

  headerTitle: {
    fontSize: 24,
    fontFamily: fonts.title,
    color: colors.textMain,
    lineHeight: 32,
  },

  headerTitleLight: {
    color: "#F5E6D0",
  },
});