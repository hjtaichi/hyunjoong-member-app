import React from "react";
import { Text, View } from "react-native";
import { Image } from "expo-image";
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
  return (
    <View style={styles.previewCard}>
      <View
        style={styles.previewLandscape}
        collapsable={false}
        removeClippedSubviews={false}
      >
        <Image
          source={DOBOK_LANDSCAPE_BACKGROUND}
          style={styles.previewLandscapeBackground}
          contentFit="contain"
          cachePolicy="memory-disk"
          transition={0}
          priority="low"
          recyclingKey="dobok-showroom-landscape"
          pointerEvents="none"
        />

        <View
          style={styles.previewModelLayer}
          collapsable={false}
          removeClippedSubviews={false}
        >
          {combo ? (
            <DobokPreviewV9
              comboKey={combo.key}
              width={previewWidth}
              topColor={topColor.hex}
              pantsColor={pantsColor.hex}
              chestEmbroideryColor={chestColor}
              cloudEmbroideryColor={cloudColor}
              showChest={showChest}
              showBlackBeltClouds={blackBelt && showClouds}
              embroideryLayouts={embroideryLayouts}
            />
          ) : null}
        </View>

        <View style={styles.previewSummary}>
          <Text style={styles.previewSummaryMain}>
            {gender === "female" ? "여성" : "남성"} |{" "}
            {styleLabels?.[effectiveStyle] || effectiveStyle} |{" "}
            {sleeveLabels?.[sleeve] || sleeve}
          </Text>
          <Text style={styles.previewSummarySub}>
            {fabric.label} | 상의 {topColor.position} | 하의{" "}
            {pantsColor.position}
          </Text>
        </View>
      </View>
    </View>
  );
}