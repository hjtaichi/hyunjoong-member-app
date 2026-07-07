import React from "react";
import { Image, Pressable, Text, View } from "react-native";

import { styles } from "../homeStyles";

export default function TrainingRecordBanner({ onPress }) {
  return (
    <Pressable style={styles.trainingRecordBanner} onPress={onPress}>
      <Image
        source={require("../../../../assets/images/movement-section-icon.png")}
        style={styles.trainingRecordBannerIcon}
        resizeMode="contain"
      />

      <Image
        source={require("../../../../assets/images/movement-card-brush.png")}
        style={styles.trainingRecordBannerBrush}
        resizeMode="contain"
      />

      <View style={styles.trainingRecordBannerTextBlock}>
        <Text style={styles.trainingRecordBannerTitle}>수련 기록</Text>
        <Text style={styles.trainingRecordBannerSub}>
          오늘의 공력과 투로를 기록해보세요.
        </Text>
      </View>

      <Text style={styles.trainingRecordBannerArrow}>기록하기 〉</Text>
    </Pressable>
  );
}