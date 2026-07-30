import React from "react";
import { Image, Pressable, Text, View } from "react-native";
import { DOBOK_LOCK_ICON } from "../showroomAssets";
import styles from "../styles/showroomStyles";

export default function OptionCard({ icon, title, subtitle, swatch, onPress, locked }) {
  return (
    <Pressable onPress={onPress} disabled={locked} style={[styles.optionCard, locked && styles.lockedCard]}>
      {icon ? <Image source={icon} style={styles.optionIcon} resizeMode="contain" /> : null}
      <View style={styles.optionCardText}>
        <Text style={styles.optionTitle}>{title}</Text>
        <Text numberOfLines={1} style={styles.optionSubtitle}>{subtitle}</Text>
      </View>
      {swatch ? <View style={[styles.optionSwatch, { backgroundColor: swatch }]} /> : null}
      {locked ? <Image source={DOBOK_LOCK_ICON} style={styles.lockImage} resizeMode="contain" /> : <Text style={styles.chevron}>›</Text>}
    </Pressable>
  );
}
