import React, { useMemo, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { mypageImages } from "../mypageImages";
import { getAvatarSource } from "../mypageUtils";
import BadgeInfoModal from "../../home/components/BadgeInfoModal";
import { getMemberBadgeImageSource } from "../../home/memberBadges";

function MyPageHeroCard({
  styles,
  isYudanja,
  memberBadges,
  memberName,
  levelLabel,
  rankBadgeColors,
  joinedDateLabel,
  joinedPeriodLabel,
  attendanceSessionCount,
  attendanceDayCount,
  selectedAvatar,
  profileImageVersion,
  payment,
  paymentDueText,
  paymentDaysLeftText,
  onOpenAvatar,
  onOpenPayment,
}) {
  const [selectedBadge, setSelectedBadge] = useState(null);
  const visibleBadges = useMemo(
    () =>
      (Array.isArray(memberBadges) ? memberBadges : []).filter((badge) =>
        Boolean(getMemberBadgeImageSource(badge?.code)),
      ),
    [memberBadges],
  );
  const joinedDateDisplay =
    joinedDateLabel === "입관일 확인 필요"
      ? "확인 필요"
      : String(joinedDateLabel || "확인 필요").replace(/-/g, ".");

  const joinedPeriodDisplay =
    joinedPeriodLabel === "입관일 확인 필요"
      ? "확인 필요"
      : String(joinedPeriodLabel || "확인 필요").replace(/^입관\s+/, "");
  return (
    <View style={[styles.heroCard, isYudanja && styles.heroCardYudanja]}>
        {isYudanja ? (
          <Image
        source={mypageImages.yudanjaProfileCardBg}
        style={styles.heroCardBgImage}
        resizeMode="stretch"
      />
        ) : null}
      
        {isYudanja ? <View style={styles.heroCardBgSoftOverlay} /> : null}
        {/* {isYudanja ? <View style={styles.heroGoldGlow} /> : null} */}
      
        <View style={styles.heroProfileRow}>
          <View style={styles.heroTextWrap}>
            <View style={styles.heroNameRow}>
        <Text style={styles.heroName}>{memberName}</Text>
      
        <View
        style={[
          styles.heroLevelBadge,
          {
            backgroundColor: rankBadgeColors.backgroundColor,
            borderColor: rankBadgeColors.borderColor,
          },
        ]}
      >
        <Text
          style={[
            styles.heroLevelBadgeText,
            { color: rankBadgeColors.textColor },
          ]}
        >
          {levelLabel}
        </Text>
      </View>
      </View>

      {visibleBadges.length > 0 ? (
        <View style={myPageBadgeStyles.badgeRow}>
          {visibleBadges.map((badge) => (
            <Pressable
              key={badge.code}
              accessibilityRole="button"
              accessibilityLabel={`${badge.title} 뱃지 설명 보기`}
              hitSlop={5}
              style={({ pressed }) => [
                myPageBadgeStyles.badgeButton,
                pressed && myPageBadgeStyles.badgeButtonPressed,
              ]}
              onPress={() => setSelectedBadge(badge)}
            >
              <Image
                source={getMemberBadgeImageSource(badge.code)}
                style={myPageBadgeStyles.badgeIcon}
                resizeMode="contain"
              />
            </Pressable>
          ))}
        </View>
      ) : null}

      <Text style={styles.heroSubText}>
        입관일 {joinedDateDisplay} · {joinedPeriodDisplay}
      </Text>

      <Text style={styles.heroMetaText}>
        누적 출석 {attendanceSessionCount}회 · 출석일 {attendanceDayCount}일
      </Text>
          </View>
      
          <Pressable
        style={[
          styles.heroAvatarButton,
          isYudanja && styles.heroAvatarButtonYudanja,
        ]}
        onPress={onOpenAvatar}
      >
        {isYudanja ? (
          <Image
            source={mypageImages.yudanjaEmblemFrame}
            style={styles.heroYudanjaFrame}
            resizeMode="contain"
          />
        ) : null}
      
        <Image
          source={getAvatarSource(selectedAvatar, profileImageVersion)}
          style={[
            styles.heroAvatarImage,
            isYudanja && styles.heroAvatarImageYudanja,
          ]}
          resizeMode="cover"
        />
      
        <View style={[styles.cameraBadge, isYudanja && styles.cameraBadgeYudanja]}>
          <Image
            source={mypageImages.cameraIcon}
            style={styles.cameraIcon}
            resizeMode="contain"
          />
        </View>
      </Pressable>
        </View>
      
        <View style={styles.heroDivider} />
      
        <View style={styles.heroPaymentRow}>
        <View style={styles.heroPaymentInfo}>
          <Text style={styles.heroSmallLabel}>회비 상태</Text>
      
          <View style={styles.heroPaymentBadge}>
            <Text style={styles.heroPaymentBadgeText}>
              {payment?.statusLabel || payment?.status || "확인 필요"}
            </Text>
          </View>
      
          <Text style={styles.heroPaymentDueText}>
            {payment?.isCovered && payment?.coverageEndMonthLabel
              ? `${payment.coverageEndMonthLabel}까지 납부 완료`
              : `다음 납부일 ${paymentDueText} · ${paymentDaysLeftText}`}
          </Text>
        </View>
      
        <Pressable
          style={styles.heroPayButton}
          onPress={onOpenPayment}
        >
          <Text style={styles.heroPayButtonText}>납부 안내</Text>
        </Pressable>
      </View>
      <BadgeInfoModal
        badge={selectedBadge}
        onClose={() => setSelectedBadge(null)}
      />
    </View>
  );
}

const myPageBadgeStyles = StyleSheet.create({
  badgeRow: {
    minHeight: 26,
    marginTop: 7,
    marginBottom: 7,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    columnGap: 5,
    rowGap: 4,
  },
  badgeButton: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  badgeButtonPressed: {
    opacity: 0.72,
    transform: [{ scale: 0.95 }],
  },
  badgeIcon: {
    width: 24,
    height: 24,
  },
});

export default React.memo(MyPageHeroCard);