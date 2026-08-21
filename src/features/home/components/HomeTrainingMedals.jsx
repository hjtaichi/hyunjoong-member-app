import React from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import {
  getTrainingMedalImageSource,
} from "../trainingMedalAssets";

export default function HomeTrainingMedals({
  medals = [],
  onPress,
}) {
  const visible = Array.isArray(medals)
    ? medals
        .filter((item) =>
          Boolean(getTrainingMedalImageSource(item))
        )
        .slice(0, 3)
    : [];

  if (visible.length === 0) return null;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="내 수련 메달 진열장 보기"
      onPress={onPress}
      hitSlop={5}
      style={({ pressed }) => [
        styles.wrap,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.row}>
        {visible.map((medal, index) => {
          const source =
            getTrainingMedalImageSource(medal);
          const annual =
            medal?.type === "annual";

          return (
            <Image
              key={`${medal?.type || "half"}-${
                medal?.year || 0
              }-${medal?.half || 0}-${index}`}
              source={source}
              resizeMode="contain"
              style={
                annual
                  ? styles.annualMedal
                  : styles.halfMedal
              }
            />
          );
        })}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 4,
  },
  pressed: {
    opacity: 0.76,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 1,
  },
  halfMedal: {
    width: 23,
    height: 23,
  },
  annualMedal: {
    width: 28,
    height: 28,
  },
});