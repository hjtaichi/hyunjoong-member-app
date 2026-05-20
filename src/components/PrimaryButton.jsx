import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";
import { colors } from "../theme/colors";

export default function PrimaryButton({
  title,
  onPress,
  disabled = false,
  style,
  textStyle,
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      <Text style={[styles.text, textStyle]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 50,
    borderRadius: 14,
    backgroundColor: colors.warmBrown,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  pressed: {
    opacity: 0.86,
  },
  disabled: {
    backgroundColor: colors.absent,
  },
  text: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "700",
  },
});