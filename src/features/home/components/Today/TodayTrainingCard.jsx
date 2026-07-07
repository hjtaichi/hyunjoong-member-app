import React from "react";
import { Image, Pressable, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { colors } from "../../../../theme";
import { styles } from "../../homeStyles";

export default function TodayTrainingCard({
  isYudanja,
  yudanjaProfileBg,
  todayClassTitle,
  todayWeekProgressText,
  hasTodayCompletedSession,
  todayAttendanceButtonText,
  onPressDetail,
  onPressAttendance,
}) {
  return (
    <LinearGradient
      colors={
        isYudanja
          ? ["#FFFDF7", "#FFF8E8", "#FFFFFF"]
          : [colors.card, colors.card]
      }
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.todayTrainingCard,
        isYudanja && styles.todayTrainingCardYudanja,
      ]}
    >
      {isYudanja ? (
        <Image
          source={yudanjaProfileBg}
          style={[styles.todayYudanjaBgImage, { pointerEvents: "none" }]}
          resizeMode="stretch"
        />
      ) : null}

      <View style={styles.todayTrainingHeader}>
        <Text style={styles.todayTrainingLabel}>오늘의 수련</Text>

        <Pressable onPress={onPressDetail}>
          <View style={styles.moreLinkRow}>
            <Text style={styles.todayTrainingMore}>자세히 보기</Text>
          </View>
        </Pressable>
      </View>

      <Text style={styles.todayTrainingTitle}>{todayClassTitle}</Text>

      <Text
        style={[
          styles.todayTrainingStep,
          isYudanja && styles.todayTrainingStepYudanja,
        ]}
      >
        {todayWeekProgressText}
      </Text>

      <Image
        source={require("../../../../../assets/images/taichi-silhouette.png")}
        style={[
          styles.todaySilhouette,
          isYudanja && styles.todaySilhouetteYudanja,
        ]}
        resizeMode="contain"
      />

      <Pressable
        disabled={hasTodayCompletedSession}
        style={[
          styles.todayTrainingButton,
          isYudanja && styles.todayTrainingButtonYudanja,
          hasTodayCompletedSession && styles.todayTrainingButtonDone,
        ]}
        onPress={onPressAttendance}
      >
        <Text
          style={[
            styles.todayTrainingButtonText,
            isYudanja && styles.todayTrainingButtonTextYudanja,
          ]}
        >
          {todayAttendanceButtonText}
        </Text>
      </Pressable>
    </LinearGradient>
  );
}