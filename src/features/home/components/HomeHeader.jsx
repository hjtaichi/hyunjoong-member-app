import React, { useMemo, useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { styles } from "../homeStyles";
import BadgeInfoModal from "./BadgeInfoModal";
import { getMemberBadgeImageSource } from "../memberBadges";

export default function HomeHeader({
  displayName,
  joinDayCount,
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
  memberBadges = [],
}) {
  const monthlyRate = Math.min(
    100,
    Math.max(0, Number(monthlyGoalRate?.rate || 0))
  );
  const filledBars = Math.ceil(monthlyRate / 25);
  const [selectedBadge, setSelectedBadge] = useState(null);
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

        <View style={styles.homeNameRow}>
          <Text style={styles.homeName}>
            {displayName}님
          </Text>

          <View
            style={[
              styles.homeBadge,
              styles.homeRankBadgeInline,
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
        {monthlyGoalRate ? (
  <View style={styles.monthlyGoalMiniRow}>
    <Text style={styles.monthlyGoalMiniText}>
      출석 목표 달성률 {monthlyRate}%
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

      <BadgeInfoModal
        badge={selectedBadge}
        onClose={() => setSelectedBadge(null)}
      />
    </View>
  );
}
