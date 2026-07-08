import React from "react";
import { Image, Pressable, Text, View } from "react-native";

import { mypageImages } from "../mypageImages";
import { getAvatarSource } from "../mypageUtils";

function MyPageHeroCard({
  styles,
  isYudanja,
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
      
        {isYudanja ? (
        <View style={styles.heroYudanjaBadge}>
          <Text style={styles.heroYudanjaBadgeText}>유단자회</Text>
        </View>
      ) : null}
      </View>
      
      <Text style={styles.heroSubText}>입관 {joinedDateLabel}</Text>
      
      <Text style={styles.heroMetaText}>{joinedPeriodLabel}</Text>
      
      <Text style={styles.heroMetaText}>
        출석횟수 {attendanceSessionCount}회 ({attendanceDayCount}일)
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
            다음 결제일 {paymentDueText} · {paymentDaysLeftText}
          </Text>
        </View>
      
        <Pressable
          style={styles.heroPayButton}
          onPress={onOpenPayment}
        >
          <Text style={styles.heroPayButtonText}>결제하기</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default React.memo(MyPageHeroCard);