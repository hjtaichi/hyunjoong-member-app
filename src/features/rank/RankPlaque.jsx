// HJTAICHI_RANK_PLAQUE_USER_ASSETS_V1
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
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

function LegacyPlaque({ config, size }) {
  const fallback = config.legacyFallback;
  const scale = size.height / PLAQUE_SIZES.home.height;
  const gradientId = `rank-plaque-fill-${config.level}`;

  return (
    <>
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 72 144"
        style={StyleSheet.absoluteFill}
      >
        <Defs>
          <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={fallback.fillStart} />
            <Stop offset="0.52" stopColor={fallback.fillEnd} />
            <Stop offset="1" stopColor={fallback.fillStart} />
          </LinearGradient>
        </Defs>

        <Path d={OUTER_PATH} fill={fallback.borderOuter} opacity={0.98} />
        <Path
          d={INNER_PATH}
          fill={`url(#${gradientId})`}
          stroke={fallback.borderInner}
          strokeWidth={1.5}
        />
        <Path
          d="M15 45 C27 38 44 52 58 43 M13 68 C28 58 44 76 60 65 M14 94 C27 84 45 101 58 91"
          fill="none"
          stroke={fallback.texture}
          strokeOpacity={0.18}
          strokeWidth={1.1}
        />
      </Svg>

      <View pointerEvents="none" style={styles.textLayer}>
        <Text
          allowFontScaling={false}
          style={[
            styles.emblemText,
            {
              color: fallback.text,
              fontSize: 5.2 * scale,
              lineHeight: 6.4 * scale,
              marginTop: 4.1 * scale,
              textShadowColor: fallback.textShadow,
              textShadowOffset: { width: 0, height: Math.max(0.4, scale) },
              textShadowRadius: Math.max(0.3, 0.65 * scale),
            },
          ]}
        >
          帝
        </Text>

        <View style={[styles.rankTextWrap, { marginTop: 4.8 * scale }]}>
          {fallback.rows.map((row) => (
            <Text
              key={row}
              allowFontScaling={false}
              style={[
                styles.rankText,
                {
                  color: fallback.text,
                  fontSize: 9.7 * scale,
                  lineHeight: 13.2 * scale,
                  textShadowColor: fallback.textShadow,
                  textShadowOffset: { width: 0, height: Math.max(0.4, scale) },
                  textShadowRadius: Math.max(0.3, 0.65 * scale),
                },
              ]}
            >
              {row}
            </Text>
          ))}
        </View>
      </View>
    </>
  );
}

export default function RankPlaque({
  rankLevel = 0,
  variant = "home",
  style,
  imageStyle,
}) {
  const config = getRankPlaqueConfig(rankLevel);
  const size = PLAQUE_SIZES[variant] || PLAQUE_SIZES.home;

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
      {config.imageSource ? (
        <Image
          source={config.imageSource}
          resizeMode="contain"
          style={[
            styles.image,
            {
              width: size.width,
              height: size.height,
            },
            imageStyle,
          ]}
        />
      ) : (
        <LegacyPlaque config={config} size={size} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexShrink: 0,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
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
