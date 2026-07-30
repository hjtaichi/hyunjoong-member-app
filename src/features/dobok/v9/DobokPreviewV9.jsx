import React, { memo } from "react";
import {
  Image as NativeImage,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import { Image as CachedImage } from "expo-image";

import {
  DOBOK_V9_COMBINATIONS,
  DOBOK_V9_EMBROIDERY_ASSETS,
} from "./dobokV9Assets";
import { DOBOK_V9_EMBROIDERY_LAYOUTS } from "./dobokV9Config";

const ASPECT = 1024 / 1536;

function getAssetUri(source) {
  if (!source) return null;

  if (typeof source === "string") return source;
  if (typeof source?.uri === "string") return source.uri;

  return NativeImage.resolveAssetSource(source)?.uri || null;
}

function createWebMaskStyle(source, color) {
  const uri = getAssetUri(source);
  if (!uri) return null;

  const maskImage = `url("${String(uri).replace(/"/g, "%22")}")`;

  return {
    backgroundColor: color,
    WebkitMaskImage: maskImage,
    WebkitMaskRepeat: "no-repeat",
    WebkitMaskPosition: "center",
    WebkitMaskSize: "100% 100%",
    maskImage,
    maskRepeat: "no-repeat",
    maskPosition: "center",
    maskSize: "100% 100%",
  };
}

const CachedFullLayer = memo(function CachedFullLayer({
  source,
  style,
  recyclingKey,
}) {
  if (!source) return null;

  return (
    <CachedImage
      source={source}
      style={[styles.full, style]}
      contentFit="fill"
      cachePolicy="memory-disk"
      transition={0}
      priority="high"
      recyclingKey={recyclingKey}
      pointerEvents="none"
    />
  );
});

const NativeTintFullLayer = memo(function NativeTintFullLayer({
  source,
  color,
}) {
  if (!source) return null;

  if (Platform.OS === "web") {
    const maskStyle = createWebMaskStyle(source, color);
    if (!maskStyle) return null;

    return React.createElement("div", {
      "aria-hidden": true,
      style: {
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        ...maskStyle,
      },
    });
  }

  return (
    <NativeImage
      source={source}
      style={[styles.full, { tintColor: color }]}
      resizeMode="stretch"
      pointerEvents="none"
      fadeDuration={0}
    />
  );
});

const PositionedTintLayer = memo(function PositionedTintLayer({
  source,
  layout,
  color,
  scale,
  index = 0,
}) {
  if (!source || !layout || layout.count === 0) return null;

  const gap = Number(layout.gap || 0);
  const count = Math.max(1, Number(layout.count || 1));
  const centeredOffset = (index - (count - 1) / 2) * gap;

  const positionedStyle = {
    position: "absolute",
    left: (layout.left + centeredOffset) * scale,
    top: layout.top * scale,
    width: layout.width * scale,
    height: layout.height * scale,
    transform: `rotate(${Number(layout.rotation || 0)}deg)`,
    pointerEvents: "none",
  };

  if (Platform.OS === "web") {
    const maskStyle = createWebMaskStyle(source, color);
    if (!maskStyle) return null;

    return React.createElement("div", {
      "aria-hidden": true,
      style: {
        ...positionedStyle,
        ...maskStyle,
      },
    });
  }

  return (
    <NativeImage
      source={source}
      resizeMode="contain"
      pointerEvents="none"
      fadeDuration={0}
      style={{
        position: "absolute",
        left: positionedStyle.left,
        top: positionedStyle.top,
        width: positionedStyle.width,
        height: positionedStyle.height,
        tintColor: color,
        transform: [{ rotate: `${Number(layout.rotation || 0)}deg` }],
      }}
    />
  );
});

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
  const layout =
    allLayouts[comboKey] || DOBOK_V9_EMBROIDERY_LAYOUTS[comboKey];

  const chestColor = chestEmbroideryColor || embroideryColor;
  const cloudColor = cloudEmbroideryColor || embroideryColor;

  const textureStyle =
    Platform.OS === "web"
      ? { mixBlendMode: "multiply", opacity: 1 }
      : { opacity: 0.34 };

  return (
    <View
      style={[styles.stage, { width, height }]}
      collapsable={false}
      removeClippedSubviews={false}
    >
      <CachedFullLayer
        source={combo.base}
        recyclingKey={`${comboKey}-base`}
      />

      <NativeTintFullLayer
        source={combo.pantsMask}
        color={pantsColor}
      />
      <CachedFullLayer
        source={combo.pantsTexture}
        style={textureStyle}
        recyclingKey={`${comboKey}-pants-texture`}
      />

      <NativeTintFullLayer
        source={combo.topMask}
        color={topColor}
      />
      <CachedFullLayer
        source={combo.topTexture}
        style={textureStyle}
        recyclingKey={`${comboKey}-top-texture`}
      />

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
    isolation: Platform.OS === "web" ? "isolate" : undefined,
  },
  full: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
});