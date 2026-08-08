// HJTAICHI_RANK_PLAQUE_V1
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, {
  Defs,
  LinearGradient,
  Path,
  Stop,
} from "react-native-svg";

import { getRankPlaqueConfig } from "../../theme/rankPlaque";

const PLAQUE_SIZES = {
  home: { width: 22, height: 44 },
  mypage: { width: 18, height: 36 },
};

const OUTER_PATH =
  "M18 3 H54 C59 3 63 7 63 12 V17 C63 21 66 23 69 24 V120 C66 121 63 124 63 128 V132 C63 138 58 142 52 142 H20 C14 142 9 138 9 132 V128 C9 124 6 121 3 120 V24 C6 23 9 21 9 17 V12 C9 7 13 3 18 3 Z";

const INNER_PATH =
  "M20 9 H52 C55 9 58 12 58 15 V20 C58 24 61 27 64 28 V116 C61 118 58 121 58 125 V130 C58 134 55 137 51 137 H21 C17 137 14 134 14 130 V125 C14 121 11 118 8 116 V28 C11 27 14 24 14 20 V15 C14 12 17 9 20 9 Z";

export default function RankPlaque({
  rankLevel = 0,
  variant = "home",
  style,
}) {
  const config = getRankPlaqueConfig(rankLevel);
  const size = PLAQUE_SIZES[variant] || PLAQUE_SIZES.home;
  const scale = size.height / PLAQUE_SIZES.home.height;
  const gradientId = `rank-plaque-fill-${config.level}`;

  const embossedTextStyle = {
    color: config.text,
    textShadowColor: config.textShadow,
    textShadowOffset: { width: 0, height: Math.max(0.4, scale) },
    textShadowRadius: Math.max(0.3, 0.65 * scale),
  };

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={config.accessibilityLabel}
      style={[
        styles.container,
        {
          width: size.width,
          height: size.height,
        },
        style,
      ]}
    >
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 72 144"
        style={StyleSheet.absoluteFill}
      >
        <Defs>
          <LinearGradient
            id={gradientId}
            x1="0"
            y1="0"
            x2="1"
            y2="1"
          >
            <Stop offset="0" stopColor={config.fillStart} />
            <Stop offset="0.52" stopColor={config.fillEnd} />
            <Stop offset="1" stopColor={config.fillStart} />
          </LinearGradient>
        </Defs>

        <Path
          d={OUTER_PATH}
          fill={config.borderOuter}
          opacity={0.98}
        />

        <Path
          d={INNER_PATH}
          fill={`url(#${gradientId})`}
          stroke={config.borderInner}
          strokeWidth={1.5}
        />

        <Path
          d="M15 45 C27 38 44 52 58 43 M13 68 C28 58 44 76 60 65 M14 94 C27 84 45 101 58 91"
          fill="none"
          stroke={config.texture}
          strokeOpacity={0.18}
          strokeWidth={1.1}
        />

        <Path
          d="M18 12 C27 15 44 15 54 12 M18 132 C27 129 44 129 54 132"
          fill="none"
          stroke={config.borderInner}
          strokeOpacity={0.75}
          strokeWidth={0.9}
        />
      </Svg>

      <View
        pointerEvents="none"
        style={styles.textLayer}
      >
        <Text
          allowFontScaling={false}
          style={[
            styles.emblemText,
            embossedTextStyle,
            {
              fontSize: 5.2 * scale,
              lineHeight: 6.4 * scale,
              marginTop: 4.1 * scale,
            },
          ]}
        >
          帝
        </Text>

        <View
          style={[
            styles.rankTextWrap,
            { marginTop: 4.8 * scale },
          ]}
        >
          {config.rows.map((row) => (
            <Text
              key={row}
              allowFontScaling={false}
              style={[
                styles.rankText,
                embossedTextStyle,
                {
                  fontSize: 9.7 * scale,
                  lineHeight: 13.2 * scale,
                },
              ]}
            >
              {row}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexShrink: 0,
    position: "relative",
  },
  textLayer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
  },
  emblemText: {
    fontWeight: "900",
    textAlign: "center",
  },
  rankTextWrap: {
    alignItems: "center",
  },
  rankText: {
    fontWeight: "900",
    textAlign: "center",
  },
});