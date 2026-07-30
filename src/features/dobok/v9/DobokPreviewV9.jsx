import React from "react";
import { Image, Platform, StyleSheet, View } from "react-native";

import {
  DOBOK_V9_COMBINATIONS,
  DOBOK_V9_EMBROIDERY_ASSETS,
} from "./dobokV9Assets";
import { DOBOK_V9_EMBROIDERY_LAYOUTS } from "./dobokV9Config";

const ASPECT = 1024 / 1536;

function FullLayer({ source, style }) {
  if (!source) return null;
  return (
    <Image
      source={source}
      style={[styles.full, style]}
      resizeMode="stretch"
      pointerEvents="none"
    />
  );
}

function PositionedTintLayer({ source, layout, color, scale, index = 0 }) {
  if (!source || !layout || layout.count === 0) return null;

  const gap = Number(layout.gap || 0);
  const count = Math.max(1, Number(layout.count || 1));
  const centeredOffset = (index - (count - 1) / 2) * gap;

  return (
    <Image
      source={source}
      resizeMode="contain"
      pointerEvents="none"
      style={{
        position: "absolute",
        left: (layout.left + centeredOffset) * scale,
        top: layout.top * scale,
        width: layout.width * scale,
        height: layout.height * scale,
        tintColor: color,
        transform: [{ rotate: `${Number(layout.rotation || 0)}deg` }],
      }}
    />
  );
}

function RepeatedTintLayer(props) {
  const count = Math.max(0, Math.min(6, Number(props.layout?.count ?? 1)));
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <PositionedTintLayer key={index} {...props} index={index} />
      ))}
    </>
  );
}

export default function DobokPreviewV9({
  comboKey,
  width = 390,
  topColor = "#FFFFFF",
  pantsColor = "#FFFFFF",
  embroideryColor = "#C69A2D",
  chestEmbroideryColor,
  cloudEmbroideryColor,
  showChest = true,
  showBlackBeltClouds = false,
  embroideryLayouts,
}) {
  const combo = DOBOK_V9_COMBINATIONS[comboKey];
  if (!combo) return null;

  const height = width / ASPECT;
  const scale = width / 1024;
  const allLayouts = embroideryLayouts || DOBOK_V9_EMBROIDERY_LAYOUTS;
  const layout = allLayouts[comboKey] || DOBOK_V9_EMBROIDERY_LAYOUTS[comboKey];
  const chestColor = chestEmbroideryColor || embroideryColor;
  const cloudColor = cloudEmbroideryColor || embroideryColor;

  const textureStyle =
    Platform.OS === "web"
      ? { mixBlendMode: "multiply", opacity: 1 }
      : { opacity: 0.34 };

  return (
    <View style={[styles.stage, { width, height }]}>
      <FullLayer source={combo.base} />

      <FullLayer source={combo.pantsMask} style={{ tintColor: pantsColor }} />
      <FullLayer source={combo.pantsTexture} style={textureStyle} />

      <FullLayer source={combo.topMask} style={{ tintColor: topColor }} />
      <FullLayer source={combo.topTexture} style={textureStyle} />

      {showChest ? (
        <RepeatedTintLayer
          source={DOBOK_V9_EMBROIDERY_ASSETS.chestTintMask}
          layout={layout.chest}
          color={chestColor}
          scale={scale}
        />
      ) : null}

      {showBlackBeltClouds ? (
        <>
          <RepeatedTintLayer source={DOBOK_V9_EMBROIDERY_ASSETS.cloudSource} layout={layout.collarLeftOuter} color={cloudColor} scale={scale} />
          <RepeatedTintLayer source={DOBOK_V9_EMBROIDERY_ASSETS.cloudSource} layout={layout.collarLeftInner} color={cloudColor} scale={scale} />
          <RepeatedTintLayer source={DOBOK_V9_EMBROIDERY_ASSETS.cloudSource} layout={layout.collarRightInner} color={cloudColor} scale={scale} />
          <RepeatedTintLayer source={DOBOK_V9_EMBROIDERY_ASSETS.cloudSource} layout={layout.collarRightOuter} color={cloudColor} scale={scale} />
          <RepeatedTintLayer source={DOBOK_V9_EMBROIDERY_ASSETS.cloudSource} layout={layout.leftCuff} color={cloudColor} scale={scale} />
          <RepeatedTintLayer source={DOBOK_V9_EMBROIDERY_ASSETS.cloudSource} layout={layout.rightCuff} color={cloudColor} scale={scale} />
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    position: "relative",
    overflow: "hidden",
    borderRadius: 0,
    backgroundColor: "transparent",
  },
  full: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
});

