import React, { useMemo, useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { styles } from "../homeStyles";
import BadgeInfoModal from "./BadgeInfoModal";
import { getMemberBadgeImageSource } from "../memberBadges";
import RankPlaque from "../../rank/RankPlaque";
import HomeTrainingMedals from "./HomeTrainingMedals";

import MonthlyGoalCrownModal from "./MonthlyGoalCrownModal";
export default function HomeHeader({
  displayName,
  joinDayCount,
  attendanceCount,
  hasUnreadMemberNotification,
  onPressNotification,
  rankLevel,
  isYudanja,
  profileImageSource,
  yudanjaEmblemFrame,
  promotionBadgeText,
  weeklyGoalSummary,
  onPressWeeklyGoal,
  memberBadges = [],
  monthlyGoalCrown = null,
  trainingMedals = [],
  onPressTrainingMedals,
}) {
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [
    monthlyGoalCrownModalVisible,
    setMonthlyGoalCrownModalVisible,
  ] = useState(false);
  const visibleBadges = useMemo(
    () =>
      (Array.isArray(memberBadges) ? memberBadges : []).filter((badge) =>
        Boolean(getMemberBadgeImageSource(badge?.code)),
      ),
    [memberBadges],
  );

  // HJTAICHI_HOME_MEMBER_BADGES_V1
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

        {hasUnreadMemberNotification && (
          <View style={styles.homeNoticeDot} />
        )}
      </Pressable>

      <LinearGradient
        colors={["rgba(255,249,246,0)", "#FFF9F6"]}
        style={styles.homeMountainFade}
      />

      <View style={styles.homeHeaderTextBlock}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <Text style={styles.homeGreeting}>안녕하세요!</Text>
          <HomeTrainingMedals
            medals={trainingMedals}
            onPress={onPressTrainingMedals}
          />
        </View>

        <View style={styles.homeNameRow}>
          <Text style={styles.homeName}>
            {displayName}님
          </Text>

          <RankPlaque
            rankLevel={rankLevel}
            variant="home"
          />
        </View>

        {visibleBadges.length > 0 ? (
          <View style={styles.homeMemberBadgeRow}>
            {visibleBadges.map((badge) => (
              <Pressable
                key={badge.code}
                accessibilityRole="button"
                accessibilityLabel={`${badge.title} 뱃지 설명 보기`}
                hitSlop={6}
                style={({ pressed }) => [
                  styles.homeMemberBadgeButton,
                  pressed && styles.homeMemberBadgeButtonPressed,
                ]}
                onPress={() => setSelectedBadge(badge)}
              >
                <Image
                  source={getMemberBadgeImageSource(badge.code)}
                  style={styles.homeMemberBadgeIcon}
                  resizeMode="contain"
                />
              </Pressable>
            ))}
          </View>
        ) : null}
{joinDayCount != null ? (
          <Text style={styles.homeAttendanceSummary}>
            입관 {joinDayCount}일째 · 누적 출석 {attendanceCount}회
          </Text>
        ) : null}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${weeklyGoalSummary?.title || "이번 주 목표 출석일수"} ${
            weeklyGoalSummary?.valueText || "설정"
          }`}
          disabled={weeklyGoalSummary?.loading === true}
          onPress={onPressWeeklyGoal}
          style={({ pressed }) => [
            styles.weeklyGoalMiniButton,
            pressed && styles.weeklyGoalMiniButtonPressed,
          ]}
        >
          <Text style={styles.weeklyGoalMiniText}>
            {weeklyGoalSummary?.title || "이번 주 출석 목표"}
          </Text>
          <Text style={styles.weeklyGoalMiniValue}>
            {weeklyGoalSummary?.valueText || "설정"}
          </Text>
          <Text style={styles.weeklyGoalMiniArrow}>›</Text>
        </Pressable>
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
        {/* HJTAICHI_MONTHLY_GOAL_CROWN_FINAL_V1 */}
        {monthlyGoalCrown?.visible === true ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="출석 목표 달성왕 안내 보기"
            hitSlop={8}
            style={({ pressed }) => [
              styles.homeMonthlyGoalCrown,
              isYudanja && styles.homeMonthlyGoalCrownYudanja,
              pressed && styles.homeMonthlyGoalCrownPressed,
            ]}
            onPress={() =>
              setMonthlyGoalCrownModalVisible(true)
            }
          >
            <Image
              source={require("../../../../assets/images/monthly-goal-crown.png")}
              style={styles.homeMonthlyGoalCrownImage}
              resizeMode="contain"
            />
          </Pressable>
        ) : null}
      </View>

      <BadgeInfoModal
        badge={selectedBadge}
        onClose={() => setSelectedBadge(null)}
      />
      <MonthlyGoalCrownModal
        visible={
          monthlyGoalCrownModalVisible &&
          monthlyGoalCrown?.visible === true
        }
        streakWeekCount={
          monthlyGoalCrown?.streakWeekCount || 0
        }
        onClose={() =>
          setMonthlyGoalCrownModalVisible(false)
        }
      />
    </View>
  );
}
