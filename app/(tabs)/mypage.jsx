import React, { useMemo, useRef, useState, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  LayoutAnimation,
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";

import { router, useLocalSearchParams } from "expo-router";

import { useAuth } from "../../src/contexts/AuthContext";
import { APP_VERSION } from "../../src/config/appVersion";

import * as Clipboard from "expo-clipboard";
import { avatarGroups, mypageImages } from "../../src/features/mypage/mypageImages";
import {
  formatJoinDayCountLabel,
  getJoinDayCountFromHome,
} from "../../src/utils/joinDay";
import { MenuRow, MenuDivider } from "../../src/features/mypage/components/MyPageMenu";

import { styles } from "../../src/features/mypage/mypageStyles";
import PaymentModal from "../../src/features/mypage/components/PaymentModal";
import AvatarActionModal from "../../src/features/mypage/components/AvatarActionModal";
import DefaultAvatarModal from "../../src/features/mypage/components/DefaultAvatarModal";
import VerifyPasswordModal from "../../src/features/mypage/components/VerifyPasswordModal";
import PasswordModal from "../../src/features/mypage/components/PasswordModal";
import PhoneModal from "../../src/features/mypage/components/PhoneModal";
import { useMyPageScreen } from "../../src/features/mypage/useMyPageScreen";
import LoginIdModal from "../../src/features/mypage/components/LoginIdModal";
import MyPageHeroCard from "../../src/features/mypage/components/MyPageHeroCard";
import YudanjaCard from "../../src/features/mypage/components/YudanjaCard";

export default function MyPageScreen() {
  
  const { user, token, logout } = useAuth();
  const { menuAction } = useLocalSearchParams();
  const scrollViewRef = useRef(null);
  const [yudanjaCardY, setYudanjaCardY] = useState(0);
  
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [phoneModalVisible, setPhoneModalVisible] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);
  const [defaultAvatarModalVisible, setDefaultAvatarModalVisible] = useState(false);
  const [accountCopied, setAccountCopied] = useState(false);

  const [loginIdModalVisible, setLoginIdModalVisible] = useState(false);
  const [verifyModalVisible, setVerifyModalVisible] = useState(false);
  const [avatarTab, setAvatarTab] = useState("animal");

  const {
  loading,
  refreshing,
  homeData,
  selectedAvatar,
  profileImageVersion,
  onRefresh,
  handleLogout,
  submittingAccount,

  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  newPasswordConfirm,
  setNewPasswordConfirm,
  newPhone,
  setNewPhone,
  newLoginId,
  setNewLoginId,
  verifyPassword,
  setVerifyPassword,

  handleChangePassword,
  handleChangePhone,
  handleChangeLoginId,
  handleVerifyPasswordForEdit,
  handlePickProfileFromCamera,
  handlePickProfileFromAlbum,
  handleUseNoProfileImage,
  handleUseDefaultAvatar,
  openDefaultAvatarPicker,
  } = useMyPageScreen({
  token,
  logout,
  setAvatarModalVisible,
  setDefaultAvatarModalVisible,
});

  const avatarKeys = avatarGroups[avatarTab] || [];

  const [isYudanjaBackVisible, setIsYudanjaBackVisible] = useState(false);
  const yudanjaFlipAnim = useRef(new Animated.Value(0)).current;

  const yudanjaFrontRotate = yudanjaFlipAnim.interpolate({
  inputRange: [0, 180],
  outputRange: ["0deg", "180deg"],
  });

  const yudanjaBackRotate = yudanjaFlipAnim.interpolate({
  inputRange: [0, 180],
  outputRange: ["180deg", "360deg"],
});
function handleFlipYudanjaCard() {
  const nextIsBackVisible = !isYudanjaBackVisible;
  const nextValue = nextIsBackVisible ? 180 : 0;

  LayoutAnimation.configureNext({
    duration: 450,
    update: {
      type: LayoutAnimation.Types.easeInEaseOut,
    },
  });

  setIsYudanjaBackVisible(nextIsBackVisible);

  Animated.timing(yudanjaFlipAnim, {
    toValue: nextValue,
    duration: 450,
    useNativeDriver: true,
  }).start();
}

const PAYMENT_ACCOUNT_DISPLAY_TEXT =
  "신한은행 32304897185 \n예금주: 정원석";

const PAYMENT_ACCOUNT_COPY_TEXT =
  "신한은행 32304897185";

async function handleCopyAccount() {
  await Clipboard.setStringAsync(PAYMENT_ACCOUNT_COPY_TEXT);

  setAccountCopied(true);

  setTimeout(() => {
    setAccountCopied(false);
  }, 1800);
}

async function handleOpenSeoulPay() {
  try {
    await Linking.openURL("seoulpay://");
  } catch (error) {
    Alert.alert(
      "서울Pay+ 앱 열기 실패",
      "서울Pay+ 앱이 열리지 않습니다. 설치 화면으로 이동할까요?",
      [
        { text: "취소", style: "cancel" },
        {
          text: "이동",
          onPress: () =>
            Linking.openURL(
              "market://details?id=com.bizplay.seoul.pay"
            ),
        },
      ]
    );
  }
}

  const memberName = homeData?.member?.name || user?.name || "회원";

  const rankLevel = Number(homeData?.member?.rankLevel || 0);

  const academyName = homeData?.academyName || "현중태극권";

  const member = homeData?.member || {};

const payment =
  homeData?.payment ||
  homeData?.tuition ||
  member?.payment ||
  member?.tuition ||
  null;

const trainingGoals =
  homeData?.trainingGoals ||
  homeData?.goals ||
  member?.trainingGoals ||
  member?.goals ||
  null;

const paymentDaysLeftText = useMemo(() => {
    if (typeof payment?.daysLeft === "number") {
      if (payment.daysLeft === 0) return "오늘 납부일";
      if (payment.daysLeft < 0) return `${Math.abs(payment.daysLeft)}일 지남`;
      return `${payment.daysLeft}일 남음`;
    }

    return "확인 필요";
  }, [payment]);

  const paymentDueText =
    payment?.dueDate || payment?.nextDueDate || payment?.tuitionDueDate || "-";


const joinedAtText =
  homeData?.member?.joinDate ||
  homeData?.member?.joinedAt ||
  null;

const attendanceSessionCount =
  homeData?.member?.totalAttendanceSessionCount ??
  homeData?.member?.totalAttendanceCount ??
  homeData?.member?.attendanceCount ??
  0;

const attendanceDayCount =
  homeData?.member?.totalAttendanceCount ??
  0;

  const isYudanja = homeData?.member?.canAccessYudanjaClass === true;

  useEffect(() => {
    if (loading || !menuAction) return;

    const normalizedAction = Array.isArray(menuAction)
      ? menuAction[0]
      : String(menuAction);

    const timer = setTimeout(() => {
      if (normalizedAction === "payment") {
        setPaymentModalVisible(true);
      }

      if (normalizedAction === "yudanjaCard" && isYudanja) {
        scrollViewRef.current?.scrollTo({
          y: Math.max(0, Number(yudanjaCardY || 0) - 16),
          animated: true,
        });
      }

      router.setParams({ menuAction: "" });
    }, 180);

    return () => clearTimeout(timer);
  }, [isYudanja, loading, menuAction, yudanjaCardY]);

const joinedDateLabel = joinedAtText
  ? String(joinedAtText).slice(0, 10)
  : "입관일 확인 필요";

const joinDayCount = getJoinDayCountFromHome(homeData);
const joinedPeriodLabel = formatJoinDayCountLabel(joinDayCount);

  const paymentSummaryText =
  payment?.isCovered &&
  (payment?.coverageEndDateLabel || payment?.coverageEndMonthLabel)
    ? `${payment.coverageEndDateLabel || payment.coverageEndMonthLabel}까지 납부 완료`
    : paymentDueText && paymentDueText !== "-"
      ? `다음 회비 납부 ${paymentDueText} · ${paymentDaysLeftText}`
      : `다음 회비 납부일 확인 필요 · ${paymentDaysLeftText}`;

const promotionSummary = (() => {
  const promotion =
    trainingGoals?.promotion ||
    trainingGoals?.promotionGoal ||
    trainingGoals?.danPromotion ||
    null;

  if (!promotion) {
    if (typeof attendanceSessionCount === "number") {
      const remaining = Math.max(0, 300 - attendanceSessionCount);

      if (remaining <= 0) {
        return "승단심사 가능 조건을 채웠어요";
      }

      return `${remaining}회 더 출석하면 승단 가능`;
    }

    return "수련 목표 확인";
  }

  if (promotion.isEligible) {
    return "승단심사 가능 조건을 채웠어요";
  }

  const remainingCount =
    promotion.remainingCount ??
    promotion.remainingAttendanceCount ??
    promotion.daysLeft ??
    null;

  if (typeof remainingCount === "number") {
    return `${remainingCount}회 더 출석하면 승단 가능`;
  }

  return "수련 목표 확인";
})();



  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>내 정보를 불러오는 중입니다.</Text>
      </View>
    );
  }

  return (
    <ScrollView
  ref={scrollViewRef}
  style={[styles.screen, isYudanja && styles.screenYudanja]}
  contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.headerRow}>
  <Text style={[styles.title, isYudanja && styles.titleYudanja]}>
  내 정보
</Text>

  <Pressable
  style={styles.headerIconButton}
  onPress={() => setVerifyModalVisible(true)}
  hitSlop={10}
>
<Image source={mypageImages.goalSettingIcon} style={styles.headerIconImage} />
</Pressable>
</View>

<Text style={styles.subtitle}>
  나의 수련 정보와 계정 설정을 확인할 수 있어요.
</Text>

<MyPageHeroCard
  styles={styles}
  isYudanja={isYudanja}
  memberBadges={homeData?.member?.badges || []}
  memberName={memberName}
  rankLevel={rankLevel}
  joinedDateLabel={joinedDateLabel}
  joinedPeriodLabel={joinedPeriodLabel}
  attendanceSessionCount={attendanceSessionCount}
  attendanceDayCount={attendanceDayCount}
  selectedAvatar={selectedAvatar}
  profileImageVersion={profileImageVersion}
  payment={payment}
  paymentDueText={paymentDueText}
  paymentDaysLeftText={paymentDaysLeftText}
  onOpenAvatar={() => setAvatarModalVisible(true)}
  onOpenPayment={() => setPaymentModalVisible(true)}
/>

<View onLayout={(event) => setYudanjaCardY(event.nativeEvent.layout.y)}>
<YudanjaCard
  isYudanja={isYudanja}
  isYudanjaBackVisible={isYudanjaBackVisible}
  handleFlipYudanjaCard={handleFlipYudanjaCard}
  yudanjaFrontRotate={yudanjaFrontRotate}
  yudanjaBackRotate={yudanjaBackRotate}
  styles={styles}
/>
</View>

<View style={[styles.menuSection, isYudanja && styles.menuSectionYudanja]}>
<MenuRow
  styles={styles}
  title="수련 History"
  description={promotionSummary}
  onPress={() => router.push("/training-history")}
/>

<MenuDivider styles={styles} />

<MenuRow
  styles={styles}
  title="함께 수련하기"
  description="지인에게 현중태극권 무료 체험을 추천해보세요"
  onPress={() => router.push("/trial-application")}
/>

<MenuDivider styles={styles} />

<MenuRow
  styles={styles}
  title="알림 설정"
  description="공지와 출석 알림 설정"
  onPress={() => router.push("/notification-settings")}
/>

</View>
      <Pressable style={styles.logoutButton} onPress={handleLogout}>
  <Text style={styles.logoutButtonText}>로그아웃</Text>
</Pressable>
<View style={styles.appInfoBox}>
  <Text style={styles.appInfoTitle}>한국현중태극권총회 with studio 素隱</Text>
  <Text style={styles.appInfoVersion}>Version {APP_VERSION}</Text>
</View>
<PasswordModal
  visible={passwordModalVisible}
  onClose={() => setPasswordModalVisible(false)}
  styles={styles}
  currentPassword={currentPassword}
  setCurrentPassword={setCurrentPassword}
  newPassword={newPassword}
  setNewPassword={setNewPassword}
  newPasswordConfirm={newPasswordConfirm}
  setNewPasswordConfirm={setNewPasswordConfirm}
  submittingAccount={submittingAccount}
  handleChangePassword={() =>
  handleChangePassword({
    onSuccessClose: () => setPasswordModalVisible(false),
  })
}
/>

<PhoneModal
  visible={phoneModalVisible}
  onClose={() => setPhoneModalVisible(false)}
  styles={styles}
  newPhone={newPhone}
  setNewPhone={setNewPhone}
  submittingAccount={submittingAccount}
  handleChangePhone={() =>
  handleChangePhone({
    onSuccessClose: () => setPhoneModalVisible(false),
  })
}
/>

<VerifyPasswordModal
  visible={verifyModalVisible}
  onClose={() => setVerifyModalVisible(false)}
  styles={styles}
  verifyPassword={verifyPassword}
  setVerifyPassword={setVerifyPassword}
  submittingAccount={submittingAccount}
  handleVerifyPasswordForEdit={() =>
  handleVerifyPasswordForEdit({
    onVerifyClose: () => setVerifyModalVisible(false),
    onLoginIdOpen: () => setLoginIdModalVisible(true),
  })
}
/>
<AvatarActionModal
  visible={avatarModalVisible}
  onClose={() => setAvatarModalVisible(false)}
  styles={styles}
  submittingAccount={submittingAccount}
  handlePickProfileFromAlbum={handlePickProfileFromAlbum}
  handlePickProfileFromCamera={handlePickProfileFromCamera}
  openDefaultAvatarPicker={openDefaultAvatarPicker}
  handleUseNoProfileImage={handleUseNoProfileImage}
/>

<DefaultAvatarModal
  visible={defaultAvatarModalVisible}
  onClose={() => setDefaultAvatarModalVisible(false)}
  styles={styles}
  avatarTab={avatarTab}
  setAvatarTab={setAvatarTab}
  avatarKeys={avatarKeys}
  selectedAvatar={selectedAvatar}
  submittingAccount={submittingAccount}
  handleUseDefaultAvatar={handleUseDefaultAvatar}
/>
<PaymentModal
  visible={paymentModalVisible}
  onClose={() => setPaymentModalVisible(false)}
  styles={styles}
  accountCopied={accountCopied}
  PAYMENT_ACCOUNT_DISPLAY_TEXT={PAYMENT_ACCOUNT_DISPLAY_TEXT}
  handleCopyAccount={handleCopyAccount}
  handleOpenSeoulPay={handleOpenSeoulPay}
/>

<LoginIdModal
  visible={loginIdModalVisible}
  onClose={() => setLoginIdModalVisible(false)}
  styles={styles}
  newLoginId={newLoginId}
  setNewLoginId={setNewLoginId}
  submittingAccount={submittingAccount}
  handleChangeLoginId={() =>
    handleChangeLoginId({
      onSuccessClose: () => setLoginIdModalVisible(false),
    })
  }
/>

</ScrollView>
  );
}
