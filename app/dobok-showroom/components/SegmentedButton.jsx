import React from "react";
import { Pressable, Text, View } from "react-native";
import styles from "../styles/showroomStyles";

export default function SegmentedButton({ label, active, disabled, onPress, showCheck = false, variant = "option" }) {
  const genderVariant = variant === "gender";
  return (
    <Pressable disabled={disabled} onPress={onPress} style={[styles.segment, genderVariant && styles.genderSegment, active && styles.segmentActive, genderVariant && active && styles.genderSegmentActive, disabled && styles.disabled]}>
      <Text style={[styles.segmentText, genderVariant && styles.genderSegmentText, active && styles.segmentTextActive, genderVariant && active && styles.genderSegmentTextActive]}>{label}</Text>
      {active && showCheck ? <View style={styles.segmentCheck}><Text style={styles.segmentCheckText}>✓</Text></View> : null}
    </Pressable>
  );
}
