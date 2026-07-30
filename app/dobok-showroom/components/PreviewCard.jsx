import React from "react";
import { Image, Text, View } from "react-native";
import DobokPreviewV9 from "../../../src/features/dobok/v9/DobokPreviewV9";
import { DOBOK_LANDSCAPE_BACKGROUND } from "../showroomAssets";
import styles from "../styles/showroomStyles";

export default function PreviewCard({
  combo,
  previewWidth,
  gender,
  effectiveStyle,
  sleeve,
  fabric,
  topColor,
  pantsColor,
  chestColor,
  cloudColor,
  showChest,
  blackBelt,
  showClouds,
  styleLabels,
  sleeveLabels,
  embroideryLayouts,
}) {
  return <View style={styles.previewCard}><View style={styles.previewLandscape}>
    <View style={styles.previewModelLayer}>{combo ? <DobokPreviewV9 comboKey={combo.key} width={previewWidth} topColor={topColor.hex} pantsColor={pantsColor.hex} chestEmbroideryColor={chestColor} cloudEmbroideryColor={cloudColor} showChest={showChest} showBlackBeltClouds={blackBelt && showClouds} embroideryLayouts={embroideryLayouts} /> : null}</View>
    <Image source={DOBOK_LANDSCAPE_BACKGROUND} style={styles.previewLandscapeBackground} resizeMode="contain" pointerEvents="none" />
    <View style={styles.previewSummary}>
      <Text style={styles.previewSummaryMain}>{gender === "female" ? "여성" : "남성"} | {styleLabels?.[effectiveStyle] || effectiveStyle} | {sleeveLabels?.[sleeve] || sleeve}</Text>
      <Text style={styles.previewSummarySub}>{fabric.label} | 상의 {topColor.position} | 하의 {pantsColor.position}</Text>
    </View>
  </View></View>;
}
