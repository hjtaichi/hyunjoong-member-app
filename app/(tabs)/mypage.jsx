import React, { useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  ImageBackground,
  LayoutAnimation,
  Linking,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { router } from "expo-router";
import {
  updateMyProfileAvatar,
} from "../../src/api/member";

import { useAuth } from "../../src/contexts/AuthContext";

import * as Clipboard from "expo-clipboard";
import * as ImagePicker from "expo-image-picker";
import { avatarImages, avatarGroups, mypageImages } from "../../src/features/mypage/mypageImages";
import { getAvatarSource, getJoinedPeriodLabel } from "../../src/features/mypage/mypageUtils";
import { MenuRow, MenuDivider } from "../../src/features/mypage/components/MyPageMenu";
import { getRankBadgeColors } from "../../src/theme/rankBadge";
import { styles } from "../../src/features/mypage/mypageStyles";
import PaymentModal from "../../src/features/mypage/components/PaymentModal";
import AvatarActionModal from "../../src/features/mypage/components/AvatarActionModal";
import DefaultAvatarModal from "../../src/features/mypage/components/DefaultAvatarModal";
import VerifyPasswordModal from "../../src/features/mypage/components/VerifyPasswordModal";
import PasswordModal from "../../src/features/mypage/components/PasswordModal";
import PhoneModal from "../../src/features/mypage/components/PhoneModal";
import { useMyPageScreen } from "../../src/features/mypage/useMyPageScreen";

export default function MyPageScreen() {
  
  const { user, token, logout } = useAuth();
  const {
  loading,
  refreshing,
  homeData,
  setHomeData,
  selectedAvatar,
  setSelectedAvatar,
  profileImageVersion,
  setProfileImageVersion,
  loadProfile,
  onRefresh,
  handleLogout,

  submittingAccount,
  setSubmittingAccount,

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
} = useMyPageScreen({ token, logout });
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
const [phoneModalVisible, setPhoneModalVisible] = useState(false);
const [paymentModalVisible, setPaymentModalVisible] = useState(false);
const [avatarModalVisible, setAvatarModalVisible] = useState(false);
const [defaultAvatarModalVisible, setDefaultAvatarModalVisible] = useState(false);
const [accountCopied, setAccountCopied] = useState(false);

const [loginIdModalVisible, setLoginIdModalVisible] = useState(false);
const [verifyModalVisible, setVerifyModalVisible] = useState(false);
const [avatarTab, setAvatarTab] = useState("animal");


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

async function handleSaveAvatar() {
  try {
    setSubmittingAccount(true);

    await updateMyProfileAvatar(selectedAvatar);

    Alert.alert("완료", "프로필 이미지가 변경되었습니다.");
    await loadProfile({ silent: true });
  } catch (error) {
    Alert.alert(
      "오류",
      error?.response?.data?.message ||
        error?.message ||
        "프로필 이미지 변경에 실패했습니다."
    );
  } finally {
    setSubmittingAccount(false);
  }
}

async function compressImageForWeb(imageUri, maxSize = 1000, quality = 0.68) {
  const blob = await fetch(imageUri).then((res) => res.blob());

  const image = await new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
const objectUrl = URL.createObjectURL(blob);
img.onload = () => {
  URL.revokeObjectURL(objectUrl);
  resolve(img);
};
img.onerror = (error) => {
  URL.revokeObjectURL(objectUrl);
  reject(error);
};
img.src = objectUrl;
  });

  const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
  const width = Math.round(image.width * scale);
  const height = Math.round(image.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(image, 0, 0, width, height);

  const compressedBlob = await new Promise((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", quality);
  });

  return compressedBlob || blob;
}

async function uploadProfileImageAsync(assetOrUri) {
  const formData = new FormData();

  const imageUri =
    typeof assetOrUri === "string" ? assetOrUri : assetOrUri?.uri;

  if (!imageUri) {
    throw new Error("선택된 이미지가 없습니다.");
  }

if (Platform.OS === "web") {
  const blob = await compressImageForWeb(imageUri, 1000, 0.68);

  const file = new File(
    [blob],
    `profile-image-${Date.now()}.jpg`,
    { type: "image/jpeg" }
  );

  formData.append("image", file);
} else {
    const asset = typeof assetOrUri === "object" ? assetOrUri : {};

let mime = asset?.mimeType || asset?.type || "image/jpeg";

if (!["image/jpeg", "image/png", "image/webp"].includes(mime)) {
  mime = "image/jpeg";
}

const ext =
  mime === "image/png"
    ? "png"
    : mime === "image/webp"
    ? "webp"
    : "jpg";

formData.append("image", {
  uri: imageUri,
  name: `profile-image-${Date.now()}.${ext}`,
  type: mime,
});
  }

  const rawApiBase = String(process.env.EXPO_PUBLIC_API_BASE_URL || "").replace(/\/$/, "");
  const apiBase = rawApiBase.endsWith("/api") ? rawApiBase : `${rawApiBase}/api`;

  const response = await fetch(`${apiBase}/member/me/profile-image`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "ngrok-skip-browser-warning": "true",
    },
    body: formData,
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result?.message || "프로필 이미지 업로드에 실패했습니다.");
  }

  return {
  profileAvatar: result?.profileAvatar || result?.data?.profileAvatar,
  updatedAt: result?.updatedAt || result?.data?.updatedAt || String(Date.now()),
};
}

async function handlePickProfileFromCamera() {
  const permission = await ImagePicker.requestCameraPermissionsAsync();

  if (!permission.granted) {
    Alert.alert("안내", "카메라 권한이 필요합니다.");
    return;
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.75,
  });

  if (result.canceled) return;

  try {
    setSubmittingAccount(true);

   const uploaded = await uploadProfileImageAsync(result.assets[0]);

setSelectedAvatar(uploaded.profileAvatar);
setProfileImageVersion(uploaded.updatedAt);

setHomeData((prev) => ({
  ...prev,
  member: {
    ...(prev?.member || {}),
    profileAvatar: uploaded.profileAvatar,
    updatedAt: uploaded.updatedAt,
  },
}));

Alert.alert("완료", "프로필 사진이 변경되었습니다.");
setAvatarModalVisible(false);
  } catch (error) {
    Alert.alert("오류", error?.message || "프로필 사진 변경에 실패했습니다.");
  } finally {
    setSubmittingAccount(false);
  }
}

async function handlePickProfileFromAlbum() {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    Alert.alert("안내", "앨범 접근 권한이 필요합니다.");
    return;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.75,
  });

  if (result.canceled) return;

  try {
    setSubmittingAccount(true);

    const uploaded = await uploadProfileImageAsync(result.assets[0]);

setSelectedAvatar(uploaded.profileAvatar);
setProfileImageVersion(uploaded.updatedAt);

setHomeData((prev) => ({
  ...prev,
  member: {
    ...(prev?.member || {}),
    profileAvatar: uploaded.profileAvatar,
    updatedAt: uploaded.updatedAt,
  },
}));

Alert.alert("완료", "프로필 사진이 변경되었습니다.");
setAvatarModalVisible(false);
  } catch (error) {
    Alert.alert("오류", error?.message || "프로필 사진 변경에 실패했습니다.");
  } finally {
    setSubmittingAccount(false);
  }
}

async function handleUseNoProfileImage() {
  try {
    setSubmittingAccount(true);

    await updateMyProfileAvatar(null);
    setSelectedAvatar(null);

    Alert.alert("완료", "기본 프로필 이미지로 적용되었습니다.");
    setAvatarModalVisible(false);
    setDefaultAvatarModalVisible(false);
    await loadProfile({ silent: true });
  } catch (error) {
    Alert.alert("오류", error?.message || "프로필 이미지 변경에 실패했습니다.");
  } finally {
    setSubmittingAccount(false);
  }
}

function openDefaultAvatarPicker() {
  setAvatarModalVisible(false);
  setDefaultAvatarModalVisible(true);
}

async function handleUseDefaultAvatar(avatarKey) {
  try {
    console.log("프로필 아바타 선택:", avatarKey);
    setSubmittingAccount(true);

    const rawApiBase = String(process.env.EXPO_PUBLIC_API_BASE_URL || "").replace(/\/$/, "");
    const apiBase = rawApiBase.endsWith("/api") ? rawApiBase : `${rawApiBase}/api`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(`${apiBase}/member/me/profile-avatar`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify({
        profileAvatar: avatarKey,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const result = await response.json();
    console.log("프로필 아바타 변경 응답:", response.status, result);

    if (!response.ok) {
      throw new Error(result?.message || "프로필 사진 변경에 실패했습니다.");
    }

    setSelectedAvatar(avatarKey);
    setDefaultAvatarModalVisible(false);

    Alert.alert("완료", "기본 프로필 이미지로 변경했습니다.");
    await loadProfile({ silent: true });
  } catch (error) {
    console.log("프로필 아바타 변경 오류:", error);

    Alert.alert(
      "오류",
      error?.name === "AbortError"
        ? "서버 응답이 너무 오래 걸립니다. 백엔드 서버를 재시작해보세요."
        : error?.message || "프로필 사진 변경에 실패했습니다."
    );
  } finally {
    setSubmittingAccount(false);
  }
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
  const rankBadgeColors = getRankBadgeColors(rankLevel);

const levelLabel =
  rankLevel > 0 ? `${rankLevel}단` : "일반회원";

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

const recurringSummary =
  homeData?.recurringReservationSummary ||
  homeData?.recurringReservationsText ||
  homeData?.recurringSummary ||
  member?.recurringReservationSummary ||
  member?.recurringReservationsText ||
  null;

  const paymentDaysLeftText = useMemo(() => {
    if (typeof payment?.daysLeft === "number") {
      if (payment.daysLeft === 0) return "오늘 결제일";
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

const joinedDateLabel = joinedAtText
  ? String(joinedAtText).slice(0, 10)
  : "입관일 확인 필요";

const joinedPeriodLabel = getJoinedPeriodLabel(joinedAtText);

  /*{const recurringSummary =
    homeData?.recurringReservationSummary ||
    homeData?.recurringReservationsText ||
    null;}*/

  const paymentSummaryText =
  paymentDueText && paymentDueText !== "-"
    ? `다음 회비 결제 ${paymentDueText} · ${paymentDaysLeftText}`
    : `다음 회비 결제일 확인 필요 · ${paymentDaysLeftText}`;

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

const hasRecurring = !!recurringSummary;

const recurringMenuSummary = hasRecurring
  ? recurringSummary
  : "정기 출석 요일과 시간을 설정해보세요";


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

  {homeData?.member?.canAccessYudanjaClass ? (
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
  onPress={() => setAvatarModalVisible(true)}
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
    onPress={() => setPaymentModalVisible(true)}
  >
    <Text style={styles.heroPayButtonText}>결제하기</Text>
  </Pressable>
</View>
</View>

{homeData?.member?.canAccessYudanjaClass ? (
  <Pressable
    onPress={handleFlipYudanjaCard}
    style={[
      styles.yudanjaFlipWrap,
      isYudanjaBackVisible
        ? styles.yudanjaFlipWrapBack
        : styles.yudanjaFlipWrapFront,
    ]}
  >
    <Animated.View
      style={[
        styles.yudanjaFlipFace,
        styles.yudanjaFrontFace,
        {
          transform: [{ rotateY: yudanjaFrontRotate }],
        },
      ]}
    >
      <ImageBackground
        source={mypageImages.yudanjaCardBg}
        style={styles.yudanjaCard}
        imageStyle={styles.yudanjaCardBgImage}
        resizeMode="cover"
      >
        <View style={styles.yudanjaOverlay} />

        <View style={styles.yudanjaTextWrap}>
          <Text style={styles.yudanjaYear}>2026.01.01 ~ 2026.12.31</Text>
          <Text style={styles.yudanjaTitle}>2026년 유단자회 회원</Text>
          <Text style={styles.yudanjaMemberNo}>No. YD-2026-001</Text>
        </View>

        <Image
          source={mypageImages.yudanjaIcon}
          style={styles.yudanjaIconImage}
          resizeMode="contain"
        />
      </ImageBackground>
    </Animated.View>

    <Animated.View
      style={[
        styles.yudanjaFlipFace,
        styles.yudanjaBackFace,
        {
          transform: [{ rotateY: yudanjaBackRotate }],
        },
      ]}
    >
      <Image
        source={mypageImages.yudanjaCardBackImage}
        style={styles.yudanjaBackImage}
        resizeMode="cover"
      />
    </Animated.View>
  </Pressable>
) : null}

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
  title="정기 출석 설정"
  description={recurringMenuSummary}
  onPress={() => router.push("/recurring-reservations")}
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

    <Modal
  visible={loginIdModalVisible}
  transparent
  animationType="fade"
  onRequestClose={() => setLoginIdModalVisible(false)}
>
  <View style={styles.modalOverlay}>
    <View style={styles.modalCard}>
      <Text style={styles.modalTitle}>최초 아이디 변경</Text>

      <Text style={styles.modalDesc}>
        정회원 전환 후 1회에 한하여{"\n"}
        원하는 로그인 아이디로 변경할 수 있습니다.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="새 로그인 아이디"
        autoCapitalize="none"
        autoCorrect={false}
        value={newLoginId}
        onChangeText={setNewLoginId}
      />

      <View style={styles.modalButtonRow}>
        <Pressable
          style={[styles.modalButton, styles.modalCancelButton]}
          onPress={() => setLoginIdModalVisible(false)}
          disabled={submittingAccount}
        >
          <Text style={styles.modalCancelButtonText}>취소</Text>
        </Pressable>

        <Pressable
          style={[styles.modalButton, styles.modalPrimaryButton]}
          onPress={() =>
  handleChangeLoginId({
    onSuccessClose: () => setLoginIdModalVisible(false),
  })
}
          disabled={submittingAccount}
        >
          <Text style={styles.modalPrimaryButtonText}>
            {submittingAccount ? "변경 중..." : "변경하기"}
          </Text>
        </Pressable>
      </View>
    </View>
  </View>
</Modal>

</ScrollView>
  );
}
