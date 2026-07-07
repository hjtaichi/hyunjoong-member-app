import React from "react";
import { Pressable, Text, View } from "react-native";

function MenuRowComponent({ title, description, onPress, disabled = false, styles }) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.menuRow,
        pressed && !disabled && styles.menuRowPressed,
        disabled && styles.menuRowDisabled,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <View style={styles.menuTextWrap}>
        <Text style={styles.menuTitle}>{title}</Text>

        {description ? (
          <Text style={styles.menuDescription} numberOfLines={1}>
            {description}
          </Text>
        ) : null}
      </View>

      <Text style={styles.menuArrow}>〉</Text>
    </Pressable>
  );
}

function MenuDividerComponent({ styles }) {
  return <View style={styles.menuDivider} />;
}

export const MenuRow = React.memo(MenuRowComponent);
export const MenuDivider = React.memo(MenuDividerComponent);