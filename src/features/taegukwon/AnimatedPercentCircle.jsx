import React from "react";
import { Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

export default function AnimatedPercentCircle({
  styles,
  percent,
  color = "#9b7650",
}) {
  const size = 42;
  const strokeWidth = 6;
  const circleRadius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * circleRadius;
  const safePercent = Math.max(0, Math.min(Number(percent || 0), 100));
  const strokeDashoffset =
    circumference - (circumference * safePercent) / 100;

  return (
    <View style={styles.animatedCircleWrap}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={circleRadius}
          stroke="rgba(226,216,201,0.8)"
          strokeWidth={strokeWidth}
          fill="rgba(255,253,249,0.55)"
        />

        <Circle
          cx={size / 2}
          cy={size / 2}
          r={circleRadius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>

      <Text style={styles.recordPercentText}>{safePercent}%</Text>
    </View>
  );
}