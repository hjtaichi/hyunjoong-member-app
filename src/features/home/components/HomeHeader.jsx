import React from "react";
import { Image, Pressable, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { styles } from "../homeStyles";

export default function HomeHeader({
  displayName,
  joinDays,
  attendanceCount,
  hasUnreadNotice,
  hasUnreadMemberNotification,
  onPressNotification,
  rankBadgeColors,
  levelLabel,
  isYudanja,
  profileImageSource,
  yudanjaEmblemFrame,
  promotionBadgeText,
  monthlyGoalRate,
}) {
  const monthlyRate = Number(monthlyGoalRate?.rate || 0);
  const filledBars = Math.ceil(monthlyRate / 25);
  return (
    <View style={styles.homeHeader}>
      <Image
        source={require("../../../../assets/images/home-mountain-bg.png")}
        style={styles.homeMountainBg}
        resizeMode="cover"
      />

      <Pressable
        style={styles.homeNoticeBell}
        onPress={onPressNotification}
      >
        <Image
          source={require("../../../../assets/images/bell-line.png")}
          style={styles.homeNoticeBellIcon}
          resizeMode="contain"
        />

        {(hasUnreadNotice || hasUnreadMemberNotification) && (
          <View style={styles.homeNoticeDot} />
        )}
      </Pressable>

      <LinearGradient
        colors={["rgba(255,249,246,0)", "#FFF9F6"]}
        style={styles.homeMountainFade}
      />

      <View style={styles.homeHeaderTextBlock}>
        <Text style={styles.homeGreeting}>안녕하세요!</Text>

        <Text style={styles.homeName}>
          {displayName}님
        </Text>

        <View style={styles.homeBadgeRow}>
          <View
            style={[
              styles.homeBadge,
              {
                backgroundColor: rankBadgeColors.backgroundColor,
                borderColor: rankBadgeColors.borderColor,
                borderWidth: 1,
              },
            ]}
          >
            <Text
              style={[
                styles.homeBadgeText,
                { color: rankBadgeColors.textColor },
              ]}
            >
              {levelLabel}
            </Text>
          </View>

          {isYudanja && (
            <View style={[styles.homeBadge, styles.homeBadgeYudanja]}>
              <Text
                style={[
                  styles.homeBadgeText,
                  styles.homeBadgeTextYudanja,
                ]}
              >
                유단자회
              </Text>
            </View>
          )}
        </View>

        {joinDays ? (
          <Text style={styles.homeAttendanceSummary}>
            입관 {joinDays}일째 · 누적 출석 {attendanceCount}일
          </Text>
        ) : null}
        {monthlyGoalRate ? (
  <View style={styles.monthlyGoalMiniRow}>
    <Text style={styles.monthlyGoalMiniText}>
      이번 달 목표 달성률 {monthlyRate}%
    </Text>

    <View style={styles.monthlyGoalSignal}>
      {[1, 2, 3, 4].map((bar) => (
        <View
          key={bar}
          style={[
            styles.monthlyGoalSignalBar,
            styles[`monthlyGoalSignalBar${bar}`],
            bar <= filledBars && styles.monthlyGoalSignalBarFilled,
          ]}
        />
      ))}
    </View>
  </View>
) : null}
      </View>

      <View
        style={[
          styles.homeProfileWrap,
          isYudanja && styles.homeProfileWrapYudanja,
        ]}
      >
        <View
          style={[
            styles.homeProfileCircle,
            isYudanja && styles.homeProfileCircleYudanja,
          ]}
        >
          <Image
            source={profileImageSource}
            style={styles.homeProfileImage}
            resizeMode="cover"
          />
        </View>

        {isYudanja && (
          <Image
            source={yudanjaEmblemFrame}
            style={styles.homeYudanjaEmblemFrame}
            resizeMode="contain"
          />
        )}
      </View>
    </View>
  );
}