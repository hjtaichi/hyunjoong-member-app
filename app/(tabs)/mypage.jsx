import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  StyleSheet,
  Text,
  TextInput,
  View,  
} from "react-native";

import { router } from "expo-router";
import {
  changeMyPassword,
  changeMyPhone,
  verifyMyPassword,
  updateMyProfileAvatar,
} from "../../src/api/member";

import { useAuth } from "../../src/contexts/AuthContext";
import { getMemberHome } from "../../src/api/memberHome";
import * as Clipboard from "expo-clipboard";
import * as ImagePicker from "expo-image-picker";
import profilePlaceholder from "../../assets/images/profile-placeholder.png";
import { colors } from "../../src/theme/colors";

export default function MyPageScreen() {
  
  const { user, token, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [homeData, setHomeData] = useState(null);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
const [phoneModalVisible, setPhoneModalVisible] = useState(false);
const [paymentModalVisible, setPaymentModalVisible] = useState(false);
const [avatarModalVisible, setAvatarModalVisible] = useState(false);
const [defaultAvatarModalVisible, setDefaultAvatarModalVisible] = useState(false);

const [currentPassword, setCurrentPassword] = useState("");
const [newPassword, setNewPassword] = useState("");
const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
const [newPhone, setNewPhone] = useState("");
const [verifyModalVisible, setVerifyModalVisible] = useState(false);
const [verifyPassword, setVerifyPassword] = useState("");
const avatarImages = {
  avatar1: require("../../assets/images/avatar1.png"),
  avatar2: require("../../assets/images/avatar2.png"),
  avatar3: require("../../assets/images/avatar3.png"),
  avatar4: require("../../assets/images/avatar4.png"),
  avatar5: require("../../assets/images/avatar5.png"),
  avatar6: require("../../assets/images/avatar6.png"),
  avatar7: require("../../assets/images/avatar7.png"),
  avatar8: require("../../assets/images/avatar8.png"),
};
const cameraIcon = require("../../assets/images/camera-icon.png");
const yudanjaIcon = require("../../assets/images/yudanja-icon.png");
const yudanjaCardBg = require("../../assets/images/yudanja-card-bg.png");
const yudanjaCardBackImage = require("../../assets/images/yudanja-card-back.png");
const yudanjaEmblemFrame = require("../../assets/images/yudanja-emblem-frame.png");
const yudanjaProfileCardBg = require("../../assets/images/yudanja-profile-card-bg.png");
const goalSettingIcon = require("../../assets/images/goal-setting-icon.png");
const paymentBankIcon = require("../../assets/images/payment-bank-icon.png");
const paymentSeoulPayIcon = require("../../assets/images/payment-seoulpay-icon.png");
const paymentCardIcon = require("../../assets/images/payment-card-icon.png");

const avatarKeys = Object.keys(avatarImages);
function getAvatarSource(profileAvatar) {
  if (!profileAvatar) {
    return profilePlaceholder;
  }

  if (avatarImages[profileAvatar]) {
    return avatarImages[profileAvatar];
  }

  const rawBaseUrl = String(process.env.EXPO_PUBLIC_API_BASE_URL || "").replace(/\/$/, "");
  const originBaseUrl = rawBaseUrl.endsWith("/api")
    ? rawBaseUrl.replace(/\/api$/, "")
    : rawBaseUrl;

  if (String(profileAvatar).startsWith("/uploads/")) {
    return { uri: `${originBaseUrl}${profileAvatar}` };
  }

  if (
    String(profileAvatar).startsWith("http") ||
    String(profileAvatar).startsWith("file:")
  ) {
    return { uri: profileAvatar };
  }

  return profilePlaceholder;
}
const [selectedAvatar, setSelectedAvatar] = useState("avatar1");
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

const [submittingAccount, setSubmittingAccount] = useState(false);

  const loadProfile = useCallback(
    async ({ silent = false } = {}) => {
      if (!token) {
        setLoading(false);
        setRefreshing(false);
        return;
      }

      try {
        if (!silent) setLoading(true);

        const result = await getMemberHome(token);
console.log("🔥 mypage homeData:", result);
setHomeData(result);
        
        setHomeData(result);
        setSelectedAvatar(result?.member?.profileAvatar || null);

      } catch (error) {
        Alert.alert("오류", error.message || "내 정보를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token]
  );

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);


    const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadProfile({ silent: true });
  }, [loadProfile]);

  const handleLogout = useCallback(async () => {
  try {
    if (Platform.OS === "web") {
      const ok = window.confirm("로그아웃 하시겠습니까?");
      if (!ok) return;

      await logout();
      router.replace("/login");
      return;
    }

    Alert.alert("로그아웃", "로그아웃 하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "로그아웃",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/login");
        },
      },
    ]);
  } catch (error) {
    console.error("logout error:", error);
    Alert.alert("오류", "로그아웃 중 문제가 발생했습니다.");
  }
}, [logout]);

  function onlyNumbers(value) {
  return String(value || "").replace(/[^0-9]/g, "");
}

async function handleChangePassword() {
  if (!currentPassword || !newPassword || !newPasswordConfirm) {
    Alert.alert("안내", "비밀번호를 모두 입력해주세요.");
    return;
  }

  if (
    newPassword.length < 8 ||
    !/[A-Za-z]/.test(newPassword) ||
    !/[0-9]/.test(newPassword)
  ) {
    Alert.alert("안내", "새 비밀번호는 8자 이상, 영문/숫자 조합이어야 합니다.");
    return;
  }

  if (newPassword !== newPasswordConfirm) {
    Alert.alert("안내", "새 비밀번호 확인이 일치하지 않습니다.");
    return;
  }

  try {
    setSubmittingAccount(true);

    await changeMyPassword({
      currentPassword,
      newPassword,
      newPasswordConfirm,
    });

    Alert.alert("완료", "비밀번호가 변경되었습니다.");

    setCurrentPassword("");
    setNewPassword("");
    setNewPasswordConfirm("");
    setPasswordModalVisible(false);
  } catch (error) {
    Alert.alert(
      "오류",
      error?.response?.data?.message || error?.message || "비밀번호 변경에 실패했습니다."
    );
  } finally {
    setSubmittingAccount(false);
  }
}

async function handleChangePhone() {
  const cleanPhone = onlyNumbers(newPhone);

  if (!/^010\d{8}$/.test(cleanPhone)) {
    Alert.alert("안내", "휴대폰 번호는 010으로 시작하는 숫자 11자리여야 합니다.");
    return;
  }

  try {
    setSubmittingAccount(true);

    await changeMyPhone(cleanPhone);

    Alert.alert("완료", "전화번호가 변경되었습니다. 다시 로그인해주세요.");

    setNewPhone("");
    setPhoneModalVisible(false);

    await logout();
    router.replace("/login");
  } catch (error) {
    Alert.alert(
      "오류",
      error?.response?.data?.message || error?.message || "전화번호 변경에 실패했습니다."
    );
  } finally {
    setSubmittingAccount(false);
  }
}

async function handleVerifyPasswordForEdit() {
  if (!verifyPassword.trim()) {
    Alert.alert("안내", "비밀번호를 입력해주세요.");
    return;
  }

  try {
    setSubmittingAccount(true);

    await verifyMyPassword(verifyPassword);

    setVerifyPassword("");
    setVerifyModalVisible(false);

    router.push("/profile-edit");
  } catch (error) {
    Alert.alert(
      "오류",
      error?.response?.data?.message ||
        error?.message ||
        "비밀번호 확인에 실패했습니다."
    );
  } finally {
    setSubmittingAccount(false);
  }
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
async function uploadProfileImageAsync(imageUri) {
  const formData = new FormData();

  const fileName = imageUri.split("/").pop() || "profile.jpg";
  const fileType = fileName.split(".").pop();

  formData.append("image", {
    uri: imageUri,
    name: fileName,
    type: `image/${fileType || "jpeg"}`,
  });

  const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/api/member/me/profile-image`, {
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

return result?.profileAvatar || result?.data?.profileAvatar;
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

    const uploadedUrl = await uploadProfileImageAsync(result.assets[0].uri);

setSelectedAvatar(uploadedUrl);
Alert.alert("완료", "프로필 사진이 변경되었습니다.");
setAvatarModalVisible(false);
await loadProfile({ silent: true });
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

    const uploadedUrl = await uploadProfileImageAsync(result.assets[0].uri);

setSelectedAvatar(uploadedUrl);
Alert.alert("완료", "프로필 사진이 변경되었습니다.");
setAvatarModalVisible(false);
await loadProfile({ silent: true });
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
    setSubmittingAccount(true);

    await updateMyProfileAvatar(avatarKey);
    setSelectedAvatar(avatarKey);

    Alert.alert("완료", "기본 프로필 이미지로 변경했습니다.");
    setDefaultAvatarModalVisible(false);
    await loadProfile({ silent: true });
  } catch (error) {
    Alert.alert("오류", error?.message || "프로필 사진 변경에 실패했습니다.");
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
  Alert.alert("복사 완료", "계좌번호가 복사되었습니다.");
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

  const levelLabel =
    homeData?.member?.levelLabel || homeData?.member?.level || "일반회원";

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

    function getJoinedPeriodLabel(joinedAt) {
  if (!joinedAt) return "입관일 확인 필요";

  const start = new Date(joinedAt);
  const today = new Date();

  if (Number.isNaN(start.getTime())) return "입관일 확인 필요";

  const startDate = new Date(
    start.getFullYear(),
    start.getMonth(),
    start.getDate()
  );

  const todayDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  let years = todayDate.getFullYear() - startDate.getFullYear();

  let anniversary = new Date(
    todayDate.getFullYear(),
    startDate.getMonth(),
    startDate.getDate()
  );

  if (todayDate < anniversary) {
    years -= 1;
    anniversary = new Date(
      todayDate.getFullYear() - 1,
      startDate.getMonth(),
      startDate.getDate()
    );
  }

  const diffMs = todayDate.getTime() - anniversary.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (years <= 0) {
    return `입관 ${days}일째`;
  }

  return `입관 ${years}년 ${days}일째`;
}

const joinedAtText =
  homeData?.member?.joinDate ||
  homeData?.member?.joinedAt ||
  null;

const attendanceCount =
  homeData?.member?.totalAttendanceCount ??
  homeData?.member?.attendanceCount ??
  homeData?.totalAttendanceCount ??
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
    if (typeof attendanceCount === "number") {
      const remaining = Math.max(0, 300 - attendanceCount);

      if (remaining <= 0) {
        return "승단심사 가능 조건을 채웠어요";
      }

      return `${remaining}일 더 출석하면 가능`;
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
    return `${remainingCount}일 더 출석하면 가능`;
  }

  return "수련 목표 확인";
})();

const hasRecurring = !!recurringSummary;

const recurringMenuSummary = hasRecurring
  ? recurringSummary
  : "정기 출석 요일과 시간을 설정해보세요";

  function MenuRow({ title, description, onPress, disabled = false }) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.menuRow,
        pressed && !disabled && styles.menuRowPressed,
        disabled && styles.menuRowDisabled,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <View style={styles.menuTextWrap}>
        <Text style={styles.menuTitle}>{title}</Text>
        {description ? (
          <Text style={styles.menuDescription} numberOfLines={1}>
            {description}
          </Text>
        ) : null}
      </View>

      <Text style={styles.menuArrow}>›</Text>
    </Pressable>
  );
}

function MenuDivider() {
  return <View style={styles.menuDivider} />;
}

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
  <Image source={goalSettingIcon} style={styles.headerIconImage} />
</Pressable>
</View>

<Text style={styles.subtitle}>
  나의 수련 정보와 계정 설정을 확인할 수 있어요.
</Text>

<View style={[styles.heroCard, isYudanja && styles.heroCardYudanja]}>
  {isYudanja ? (
    <Image
  source={yudanjaProfileCardBg}
  style={styles.heroCardBgImage}
  resizeMode="stretch"
/>
  ) : null}

  {isYudanja ? <View style={styles.heroCardBgSoftOverlay} /> : null}
  {/* {isYudanja ? <View style={styles.heroGoldGlow} /> : null} */}
  {isYudanja ? <View style={styles.heroGoldLine} /> : null}
  <View style={styles.heroProfileRow}>
    <View style={styles.heroTextWrap}>
      <View style={styles.heroNameRow}>
  <Text style={styles.heroName}>{memberName}</Text>

  <View style={styles.heroLevelBadge}>
    <Text style={styles.heroLevelBadgeText}>{levelLabel}</Text>
  </View>

  {homeData?.member?.canAccessYudanjaClass ? (
  <View style={styles.heroYudanjaBadge}>
    <Text style={styles.heroYudanjaBadgeText}>유단자회</Text>
  </View>
) : null}
</View>

<Text style={styles.heroSubText}>입관 {joinedDateLabel}</Text>

<Text style={styles.heroMetaText}>
  {joinedPeriodLabel} · 누적 출석 {attendanceCount}일
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
      source={yudanjaEmblemFrame}
      style={styles.heroYudanjaFrame}
      resizeMode="contain"
    />
  ) : null}

  <Image
    source={getAvatarSource(selectedAvatar)}
    style={[
      styles.heroAvatarImage,
      isYudanja && styles.heroAvatarImageYudanja,
    ]}
    resizeMode="cover"
  />

  <View style={[styles.cameraBadge, isYudanja && styles.cameraBadgeYudanja]}>
    <Image
      source={cameraIcon}
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
        source={yudanjaCardBg}
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
          source={yudanjaIcon}
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
        source={yudanjaCardBackImage}
        style={styles.yudanjaBackImage}
        resizeMode="cover"
      />
    </Animated.View>
  </Pressable>
) : null}

<View style={[styles.menuSection, isYudanja && styles.menuSectionYudanja]}>
  <MenuRow
    title="수련 목표"
    description={promotionSummary}
    onPress={() => Alert.alert("안내", "수련 목표 상세 화면은 추후 연결할 예정입니다.")}
  />

  <MenuDivider />

  <MenuRow
    title="정기 출석 설정"
    description={recurringMenuSummary}
    onPress={() => router.push("/recurring-reservations")}
  />

  <MenuDivider />

  <MenuRow
    title="출석 통계"
    description="출석 현황과 기록을 확인할 수 있어요"
    onPress={() => Alert.alert("안내", "출석 통계 화면은 추후 연결할 예정입니다.")}
  />

  <MenuDivider />

  <MenuRow
    title="알림 설정"
    description="공지와 출석 알림 설정"
    onPress={() => Alert.alert("안내", "알림 설정은 준비 중입니다.")}
  />

  <MenuDivider />

  <MenuRow
    title="계정 설정"
    description="비밀번호와 연락처 관리"
    onPress={() => setVerifyModalVisible(true)}
  />
</View>
      <Pressable style={styles.logoutButton} onPress={handleLogout}>
  <Text style={styles.logoutButtonText}>로그아웃</Text>
</Pressable>

<Modal
  visible={passwordModalVisible}
  transparent
  animationType="fade"
  onRequestClose={() => setPasswordModalVisible(false)}
>
  <View style={styles.modalOverlay}>
    <View style={styles.modalCard}>
      <Text style={styles.modalTitle}>비밀번호 변경</Text>
      <Text style={styles.modalDesc}>
        안전한 계정 관리를 위해 현재 비밀번호를 먼저 확인합니다.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="현재 비밀번호"
        placeholderTextColor={colors.textMuted}
        secureTextEntry
        value={currentPassword}
        onChangeText={setCurrentPassword}
      />

      <TextInput
        style={styles.input}
        placeholder="새 비밀번호"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
      />

      <TextInput
        style={styles.input}
        placeholder="새 비밀번호 확인"
        secureTextEntry
        value={newPasswordConfirm}
        onChangeText={setNewPasswordConfirm}
      />

      <View style={styles.modalButtonRow}>
        <Pressable
          style={[styles.modalButton, styles.modalCancelButton]}
          onPress={() => setPasswordModalVisible(false)}
          disabled={submittingAccount}
        >
          <Text style={styles.modalCancelButtonText}>취소</Text>
        </Pressable>

        <Pressable
          style={[styles.modalButton, styles.modalPrimaryButton]}
          onPress={handleChangePassword}
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

<Modal
  visible={phoneModalVisible}
  transparent
  animationType="fade"
  onRequestClose={() => setPhoneModalVisible(false)}
>
  <View style={styles.modalOverlay}>
    <View style={styles.modalCard}>
      <Text style={styles.modalTitle}>전화번호 변경</Text>
      <Text style={styles.modalDesc}>
        전화번호는 로그인 아이디로 사용됩니다. 변경 후 다시 로그인합니다.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="01000000000"
        keyboardType="phone-pad"
        value={newPhone}
        onChangeText={(value) => setNewPhone(onlyNumbers(value))}
        maxLength={11}
      />

      <View style={styles.modalButtonRow}>
        <Pressable
          style={[styles.modalButton, styles.modalCancelButton]}
          onPress={() => setPhoneModalVisible(false)}
          disabled={submittingAccount}
        >
          <Text style={styles.modalCancelButtonText}>취소</Text>
        </Pressable>

        <Pressable
          style={[styles.modalButton, styles.modalPrimaryButton]}
          onPress={handleChangePhone}
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

<Modal
  visible={verifyModalVisible}
  transparent
  animationType="fade"
  onRequestClose={() => setVerifyModalVisible(false)}
>
  <View style={styles.modalOverlay}>
    <View style={styles.modalCard}>
      <Text style={styles.modalTitle}>비밀번호 확인</Text>
      <Text style={styles.modalDesc}>
        내정보 수정을 위해 현재 비밀번호를 한 번 더 입력해주세요.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="현재 비밀번호"
        secureTextEntry
        value={verifyPassword}
        onChangeText={setVerifyPassword}
      />

      <View style={styles.modalButtonRow}>
        <Pressable
          style={[styles.modalButton, styles.modalCancelButton]}
          onPress={() => {
            setVerifyPassword("");
            setVerifyModalVisible(false);
          }}
          disabled={submittingAccount}
        >
          <Text style={styles.modalCancelButtonText}>취소</Text>
        </Pressable>

        <Pressable
          style={[styles.modalButton, styles.modalPrimaryButton]}
          onPress={handleVerifyPasswordForEdit}
          disabled={submittingAccount}
        >
          <Text style={styles.modalPrimaryButtonText}>
            {submittingAccount ? "확인 중..." : "확인"}
          </Text>
        </Pressable>
      </View>
    </View>
  </View>
</Modal>
<Modal
  visible={avatarModalVisible}
  transparent
  animationType="fade"
  onRequestClose={() => setAvatarModalVisible(false)}
>
  <Pressable
    style={styles.avatarMenuOverlay}
    onPress={() => setAvatarModalVisible(false)}
  >
    <Pressable
      style={styles.avatarSmallMenu}
      onPress={(event) => event.stopPropagation()}
    >
      <Pressable
        style={styles.avatarSmallMenuItem}
        onPress={handlePickProfileFromAlbum}
        disabled={submittingAccount}
      >
        <Text style={styles.avatarSmallMenuText}>앨범에서 사진 선택</Text>
      </Pressable>

      <Pressable
        style={styles.avatarSmallMenuItem}
        onPress={handlePickProfileFromCamera}
        disabled={submittingAccount}
      >
        <Text style={styles.avatarSmallMenuText}>카메라로 촬영</Text>
      </Pressable>

      <Pressable
        style={styles.avatarSmallMenuItem}
        onPress={openDefaultAvatarPicker}
        disabled={submittingAccount}
      >
        <Text style={styles.avatarSmallMenuText}>기본 이미지 적용</Text>
      </Pressable>

      <Pressable
        style={styles.avatarSmallMenuItem}
        onPress={handleUseNoProfileImage}
        disabled={submittingAccount}
      >
        <Text style={[styles.avatarSmallMenuText, styles.avatarSmallMenuDanger]}>
          사진 사용 안 함
        </Text>
      </Pressable>
    </Pressable>
  </Pressable>
</Modal>

<Modal
  visible={defaultAvatarModalVisible}
  transparent
  animationType="fade"
  onRequestClose={() => setDefaultAvatarModalVisible(false)}
>
  <View style={styles.modalOverlay}>
    <View style={styles.defaultAvatarModalCard}>
      <Text style={styles.modalTitle}>기본 프로필 선택</Text>
      <Text style={styles.modalDesc}>
        사용할 기본 이미지를 선택해주세요.
      </Text>

      <View style={styles.defaultAvatarGrid}>
        {avatarKeys.map((avatarKey) => {
          const isSelected = selectedAvatar === avatarKey;

          return (
            <Pressable
              key={avatarKey}
              style={[
                styles.defaultAvatarButton,
                isSelected && styles.defaultAvatarButtonSelected,
              ]}
              onPress={() => handleUseDefaultAvatar(avatarKey)}
              disabled={submittingAccount}
            >
              <Image
                source={avatarImages[avatarKey]}
                style={styles.defaultAvatarImage}
                resizeMode="cover"
              />
            </Pressable>
          );
        })}
      </View>

      <Pressable
        style={styles.avatarCloseButton}
        onPress={() => setDefaultAvatarModalVisible(false)}
        disabled={submittingAccount}
      >
        <Text style={styles.avatarCloseButtonText}>
          {submittingAccount ? "처리 중..." : "닫기"}
        </Text>
      </Pressable>
    </View>
  </View>
</Modal>
<Modal
  visible={paymentModalVisible}
  transparent
  animationType="fade"
  onRequestClose={() => setPaymentModalVisible(false)}
>
  <View style={styles.modalOverlay}>
    <View style={styles.paymentModalCard}>
      <Pressable
        style={styles.paymentModalCloseIcon}
        onPress={() => setPaymentModalVisible(false)}
        hitSlop={10}
      >
        <Text style={styles.paymentModalCloseIconText}>×</Text>
      </Pressable>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.paymentModalContent}
      >
        <Text style={styles.paymentModalTitle}>회비 결제</Text>

        <Text style={styles.paymentModalDesc}>
          결제 후 관리자가 확인하면{"\n"}
          회비 상태가 납부 완료로 변경됩니다.
        </Text>

        <View style={styles.paymentMethodBox}>
          <View style={styles.paymentMethodRow}>
            <View style={styles.paymentIconCircle}>
              <Image
  source={paymentBankIcon}
  style={styles.paymentIconImage}
  resizeMode="contain"
/>
            </View>

            <View style={styles.paymentMethodBody}>
              <Text style={styles.paymentMethodTitle}>계좌이체</Text>
              <Text style={styles.paymentMethodText}>
                {PAYMENT_ACCOUNT_DISPLAY_TEXT}
              </Text>

              <Pressable
                style={styles.paymentMethodButton}
                onPress={handleCopyAccount}
              >
                <Text style={styles.paymentMethodButtonText}>
                  계좌 정보 복사
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        <View style={styles.paymentMethodBox}>
          <View style={styles.paymentMethodRow}>
            <View style={styles.paymentIconCircle}>
              <Image
  source={paymentSeoulPayIcon}
  style={styles.paymentIconImage}
  resizeMode="contain"
/>
            </View>

            <View style={styles.paymentMethodBody}>
              <Text style={styles.paymentMethodTitle}>
                서울Pay+ 비대면 결제
              </Text>
              <Text style={styles.paymentMethodText}>
                서울Pay+ 앱에서 비대면 결제 {"\n"} →  현중태극권 검색  → {"\n"}
                금액 입력 후 결제해주세요.                
              </Text>

              <Pressable
                style={styles.paymentMethodButton}
                onPress={handleOpenSeoulPay}
              >
                <Text style={styles.paymentMethodButtonText}>
                  서울Pay+ 앱 열기
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        <View style={styles.paymentMethodBox}>
          <View style={styles.paymentMethodRow}>
            <View style={styles.paymentIconCircle}>
              <Image
  source={paymentCardIcon}
  style={styles.paymentIconImage}
  resizeMode="contain"
/>
            </View>

            <View style={styles.paymentMethodBody}>
              <Text style={styles.paymentMethodTitle}>카드결제</Text>
              <Text style={styles.paymentMethodText}>
                신용카드 결제는 도장에서 직접 결제해주세요.
              </Text>
            </View>
          </View>
        </View>

        <Pressable
          style={styles.paymentCloseButton}
          onPress={() => setPaymentModalVisible(false)}
        >
          <Text style={styles.paymentCloseButtonText}>닫기</Text>
        </Pressable>
      </ScrollView>
    </View>
  </View>
</Modal>
</ScrollView>
  );
}
const isWeb = Platform.OS === "web";
const styles = StyleSheet.create({
  screen: {
  flex: 1,
  backgroundColor: colors.background,
},
content: {
  paddingHorizontal: 16,
  paddingTop: 42,
  paddingBottom: isWeb ? 130 : 120,
  gap: 14,
},
center: {
  flex: 1,
  backgroundColor: colors.background,
  alignItems: "center",
  justifyContent: "center",
},
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "#666",
  },
  header: {
    marginBottom: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#161311",
  },
  subtitle: {
  fontSize: 13,
  color: colors.textSub,
  marginBottom: 1,
  marginLeft: 9,
  lineHeight: 32,
},
  profileCard: {
    backgroundColor: "#F8F5EF",
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: "#E8E1D6",
  },
    card: {
    backgroundColor: "#FFFEFC",
    borderRadius: 28,
    paddingHorizontal: 18,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: "#ECE7DE",
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1F1A17",
  },
  cardText: {
    fontSize: 14,
    lineHeight: 21,
    color: "#5F554B",
  },
  cardHint: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 19,
    color: "#9A8F81",
  },
  paymentMain: {
    fontSize: 24,
    fontWeight: "800",
    color: "#7C4F21",
    marginBottom: 6,
  },
  recurringMain: {
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 23,
    color: "#314E67",
  },
  softBadge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#F6F1E8",
  },
  softBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#7B7164",
  },
  linkText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#8C6330",
  },
  settingRow: {
    marginTop: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2A2624",
  },
  settingDesc: {
    marginTop: 3,
    fontSize: 13,
    color: "#8A8177",
  },
  readyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "#F3F4F6",
  },
  readyBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
  },
  logoutButton: {
    marginTop: 2,
    marginBottom: 20,
    zIndex: 5,
    minHeight: 52,
    borderRadius: 18,
    backgroundColor: "#2A2624",
    alignItems: "center",
    justifyContent: "center",
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFFDF9",
  },
  profileNameWrap: {
  flex: 1,
},

profileNameLine: {
  flexDirection: "row",
  alignItems: "center",
  flexWrap: "wrap",
  gap: 10,
},

profileEditButton: {
  paddingHorizontal: 10,
  paddingVertical: 7,
  borderRadius: 999,
  backgroundColor: "#F6F1E8",
  borderWidth: 1,
  borderColor: "#DED4C7",
},

profileEditButtonText: {
  fontSize: 12,
  fontWeight: "800",
  color: "#8C6330",
},

profileName: {
  fontSize: 26,
  fontWeight: "800",
  color: "#161311",
},

profileBadge: {
  paddingHorizontal: 10,
  paddingVertical: 5,
  borderRadius: 999,
  backgroundColor: "#F1ECE3",
  borderWidth: 1,
  borderColor: "#DED4C7",
},

profileBadgeText: {
  fontSize: 12,
  fontWeight: "800",
  color: "#5F554B",
},

profileEmail: {
  marginTop: 8,
  fontSize: 14,
  color: "#7A7168",
},

profileDivider: {
  height: 1,
  backgroundColor: "#E8E1D6",
  marginVertical: 16,
},

tuitionRow: {
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
},

tuitionLabel: {
  fontSize: 14,
  fontWeight: "700",
  color: "#5F554B",
},

tuitionBadge: {
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 999,
  backgroundColor: "#F6F1E8",
},

tuitionBadgeText: {
  fontSize: 11,
  fontWeight: "800",
  color: "#7C4F21",
},

tuitionDays: {
  marginTop: 8,
  fontSize: 15,
  fontWeight: "800",
  color: "#7C4F21",
},

tuitionDue: {
  marginTop: 4,
  fontSize: 13,
  color: "#7A7168",
},
input: {
  borderWidth: 1,
  borderColor: "#E1D8CC",
  borderRadius: 14,
  paddingHorizontal: 14,
  paddingVertical: 13,
  fontSize: 15,
  backgroundColor: "#FFFEFC",
  marginTop: 12,
},

accountActionRow: {
  minHeight: 58,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
},

accountActionArrow: {
  fontSize: 28,
  fontWeight: "300",
  color: "#9A8F81",
},

innerDivider: {
  height: 1,
  backgroundColor: "#ECE7DE",
  marginVertical: 8,
},

modalOverlay: {
  flex: 1,
  backgroundColor: "rgba(58, 44, 39, 0.38)",
  justifyContent: "center",
  paddingHorizontal: 24,
},

modalCard: {
  backgroundColor: colors.card,
  borderRadius: 28,
  padding: 22,
  borderWidth: 1,
  borderColor: colors.border,
},

modalTitle: {
  fontSize: 24,
  fontWeight: "900",
  color: colors.textMain,
},

modalDesc: {
  marginTop: 10,
  fontSize: 15,
  lineHeight: 22,
  color: colors.textSub,
},

modalButtonRow: {
  flexDirection: "row",
  gap: 12,
  marginTop: 18,
},

modalButton: {
  flex: 1,
  minHeight: 52,
  borderRadius: 16,
  alignItems: "center",
  justifyContent: "center",
},

modalCancelButton: {
  backgroundColor: colors.blushBeige,
  borderWidth: 1,
  borderColor: colors.border,
},

modalPrimaryButton: {
  backgroundColor: colors.warmBrown,
},

modalCancelButtonText: {
  fontSize: 15,
  fontWeight: "900",
  color: colors.warmBrown,
},

modalPrimaryButtonText: {
  fontSize: 15,
  fontWeight: "900",
  color: colors.white,
},
headerRow: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: -15,
  marginLeft: 9,
},

headerEditButton: {
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 999,
  backgroundColor: "#F6F1E8",
  borderWidth: 1,
  borderColor: "#DED4C7",
},

headerEditButtonText: {
  fontSize: 12,
  fontWeight: "800",
  color: "#8C6330",
},
goalBlock: {
  marginTop: 14,
},

goalLabel: {
  fontSize: 13,
  fontWeight: "800",
  color: "#7A7168",
},

goalMain: {
  marginTop: 5,
  fontSize: 16,
  fontWeight: "900",
  color: "#1F1A17",
},

goalSub: {
  marginTop: 4,
  fontSize: 13,
  lineHeight: 18,
  color: "#7A7168",
},

goalDivider: {
  marginTop: 14,
  height: 1,
  backgroundColor: "#ECE7DE",
},
tuitionLeft: {
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
  flex: 1,
},

paymentButton: {
  paddingHorizontal: 12,
  paddingVertical: 7,
  borderRadius: 999,
  backgroundColor: colors.warmBrown,
},

paymentButtonText: {
  fontSize: 12,
  fontWeight: "900",
  color: colors.white,
},
aymentModalCard: {
  width: "100%",
  maxHeight: "82%",
  backgroundColor: colors.card,
  borderRadius: 30,
  paddingHorizontal: 18,
  paddingTop: 26,
  paddingBottom: 18,
  borderWidth: 1,
  borderColor: colors.border,
  shadowColor: colors.textMain,
  shadowOpacity: 0.14,
  shadowRadius: 20,
  shadowOffset: { width: 0, height: 10 },
  elevation: 10,
},

paymentModalCloseIcon: {
  position: "absolute",
  top: 16,
  right: 16,
  width: 42,
  height: 42,
  borderRadius: 21,
  backgroundColor: "#F6EFE8",
  borderWidth: 1,
  borderColor: colors.border,
  alignItems: "center",
  justifyContent: "center",
  zIndex: 10,
},

paymentModalCloseIconText: {
  fontSize: 30,
  lineHeight: 32,
  fontWeight: "300",
  color: colors.warmBrown,
},

paymentModalContent: {
  paddingTop: 8,
  paddingBottom: 2,
},
paymentModalCard: {
  width: "100%",
  maxHeight: "82%",
  backgroundColor: colors.card,
  borderRadius: 30,
  paddingHorizontal: 18,
  paddingTop: 26,
  paddingBottom: 18,
  borderWidth: 1,
  borderColor: colors.border,
  shadowColor: colors.textMain,
  shadowOpacity: 0.14,
  shadowRadius: 20,
  shadowOffset: { width: 0, height: 10 },
  elevation: 10,
},
paymentModalTitle: {
  fontSize: 28,
  fontWeight: "900",
  color: colors.textMain,
  textAlign: "center",
   marginTop: -10,
  marginBottom: -5,
},

paymentModalDesc: {
  marginTop: 12,
  marginBottom: 2,
  fontSize: 14,
  lineHeight: 18,
  color: colors.textSub,
  textAlign: "center",
},

paymentMethodBox: {
  marginTop: 10,
  borderRadius: 24,
  borderWidth: 1,
  borderColor: "#E8DED2",
  backgroundColor: "#FFFEFC",
  paddingHorizontal: 16,
  paddingVertical: 9,
},

paymentMethodRow: {
  flexDirection: "row",
  alignItems: "center",
  gap: 15,
},

paymentIconCircle: {
  width: 55,
  height: 55,
  borderRadius: 31,
  backgroundColor: "#F7F0EA",
  alignItems: "center",
  justifyContent: "center",
  borderWidth: 1,
  borderColor: "#EFE5DE",
},

paymentIconText: {
  fontSize: 15,
  fontWeight: "900",
  color: colors.warmBrown,
},

paymentIconTextSmall: {
  fontSize: 13,
  fontWeight: "900",
  color: colors.warmBrown,
},

paymentMethodBody: {
  flex: 1,
},

paymentMethodTitle: {
  fontSize: 17,
  fontWeight: "900",
  color: colors.textMain,
},

paymentMethodText: {
  marginTop: 7,
  fontSize: 14,
  lineHeight: 19,
  color: colors.textSub,
},

paymentMethodButton: {
  marginTop: 10,
  minHeight: 40,
  borderRadius: 12,
  backgroundColor: "#FFF8F1",
  borderWidth: 1,
  borderColor: "#E8D7C4",
  alignItems: "center",
  justifyContent: "center",
},

paymentMethodButtonText: {
  fontSize: 14,
  fontWeight: "900",
  color: colors.warmBrown,
},

paymentCloseButton: {
  marginTop: 18,
  minHeight: 52,
  borderRadius: 18,
  backgroundColor: "#F3ECE4",
  borderWidth: 1,
  borderColor: "#E2D5C7",
  alignItems: "center",
  justifyContent: "center",
},

paymentCloseButtonText: {
  fontSize: 17,
  fontWeight: "900",
  color: colors.warmBrown,
},

avatarPickerCard: {
  backgroundColor: "#FFFFFF",
  borderRadius: 28,
  paddingHorizontal: 18,
  paddingVertical: 18,
  borderWidth: 1,
  borderColor: "#EFE5DE",
},

avatarPickerTitle: {
  fontSize: 17,
  fontWeight: "800",
  color: "#2B2522",
  marginBottom: 14,
},

avatarGrid: {
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 12,
},

avatarOption: {
  width: 64,
  height: 64,
  borderRadius: 32,
  overflow: "hidden",
  borderWidth: 2,
  borderColor: "transparent",
  backgroundColor: "#F5EAE4",
},

avatarOptionSelected: {
  borderColor: "#6B4F46",
},

avatarOptionImage: {
  width: "100%",
  height: "100%",
},

avatarSaveButton: {
  marginTop: 16,
  height: 48,
  borderRadius: 14,
  backgroundColor: "#6B4F46",
  alignItems: "center",
  justifyContent: "center",
},

avatarSaveButtonText: {
  fontSize: 15,
  fontWeight: "800",
  color: "#FFFFFF",
},
heroCard: {
  backgroundColor: "#FFFEFC",
  borderRadius: 28,
  paddingHorizontal: 18,
  paddingVertical: 18,
  borderWidth: 1,
  borderColor: "#EFE5DE",
  shadowColor: "#6B4F46",
  shadowOpacity: 0.06,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 6 },
  elevation: 2,
},
heroCardYudanja: {
  borderColor: "#E3BD61",
  borderWidth: 1.4,
  backgroundColor: "#FFFDF7",
  shadowColor: "#C9962A",
  shadowOpacity: 0.18,
  shadowRadius: 20,
  shadowOffset: { width: 0, height: 8 },
  elevation: 6,
  overflow: "hidden",
},
heroGoldGlow: {
  position: "absolute",
  right: -80,
  top: -85,
  width: 230,
  height: 230,
  borderRadius: 115,
  backgroundColor: "rgba(231, 188, 85, 0.16)",
},
heroProfileRow: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 14,
},

heroTextWrap: {
  flex: 1,
},

heroNameRow: {
  flexDirection: "row",
  alignItems: "center",
  flexWrap: "wrap",
  gap: 8,
},

heroName: {
  fontSize: 24,
  fontWeight: "900",
  color: "#2B2522",
},

heroLevelBadge: {
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 999,
  backgroundColor: colors.blushBeige,
  borderWidth: 1,
  borderColor: colors.roseTaupe,
},

heroLevelBadgeText: {
  fontSize: 11,
  fontWeight: "900",
  color: colors.warmBrown,
},

heroSubText: {
  marginTop: 8,
  fontSize: 13,
  lineHeight: 19,
  color: "#7D746D",
},

heroAvatarButton: {
  width: 72,
  height: 72,
  borderRadius: 36,
  backgroundColor: "#F5EAE4",
  borderWidth: 1,
  borderColor: "#EFE5DE",
  alignItems: "center",
  justifyContent: "center",
},

heroAvatarImage: {
  width: 66,
  height: 66,
  borderRadius: 33,
},

cameraBadge: {
  position: "absolute",
  right: -2,
  bottom: 0,
  width: 26,
  height: 26,
  borderRadius: 13,
  backgroundColor: "#FFFFFF",
  borderWidth: 2,
  borderColor: "#FFFEFC",
  alignItems: "center",
  justifyContent: "center",

  // ✅ 추가
  zIndex: 20,
  elevation: 20,

  overflow: "hidden",
},
cameraIcon: {
  width: 26,
  height: 26,
},
cameraBadgeText: {
  fontSize: 12,
  fontWeight: "900",
  color: "#FFFFFF",
},
heroAvatarButtonYudanja: {
  width: 112,
  height: 112,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "transparent",
  borderWidth: 0,
},

heroYudanjaFrame: {
  position: "absolute",
  width: 100,
  height: 100,
  zIndex: 2,
  marginBottom: -5,
},

heroAvatarImageYudanja: {
  width: 76,
  height: 76,
  borderRadius: 38,
  borderWidth: 1,
  borderColor: "rgba(220, 177, 79, 0.55)",
},
cameraBadgeYudanja: {
  right: 8,
  bottom: 9,
  backgroundColor: "#231E1B",
  borderColor: "#E0BC65",
  borderWidth: 1,

  // ✅ 추가
  zIndex: 30,
  elevation: 30,
},
heroDivider: {
  height: 1,
  backgroundColor: "#EFE5DE",
  marginVertical: 16,
},

heroPaymentRow: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
},

heroSmallLabel: {
  fontSize: 12,
  fontWeight: "800",
  color: "#A78D83",
  marginBottom: 6,
},

heroPaymentBadge: {
  alignSelf: "flex-start",
  paddingHorizontal: 10,
  paddingVertical: 5,
  borderRadius: 999,
  backgroundColor: "#F5EAE4",
},

heroPaymentBadgeText: {
  fontSize: 12,
  fontWeight: "900",
  color: "#6B4F46",
},

heroPayButton: {
  paddingHorizontal: 14,
  paddingVertical: 9,
  borderRadius: 999,
  backgroundColor: "#2B2522",
},

heroPayButtonText: {
  fontSize: 12,
  fontWeight: "900",
  color: "#FFFFFF",
},

yudanjaCard: {
  flex: 1,
  borderRadius: 26,
  paddingLeft: 22,
  paddingRight: 18,
  paddingVertical: 12,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  overflow: "hidden",
  position: "relative",
},

yudanjaCardBgImage: {
  width: "110%",
  height: "110%",
  borderRadius: 26,
},

yudanjaOverlay: {
  ...StyleSheet.absoluteFillObject,
  backgroundColor: "rgba(60, 0, 10, 0.08)",
},

yudanjaBackImage: {
  width: "100%",
  height: "100%",
  borderRadius: 26,
},
yudanjaTextWrap: {
  flex: 1,
  paddingLeft: 2,
},

yudanjaYear: {
  fontSize: 12,
  fontWeight: "700",
  color: "#F8E8C8",
  opacity: 0.9,
},

yudanjaTitle: {
  marginTop: 2,
  fontSize: 22,
  fontWeight: "900",
  color: "#FFFFFF",
},

yudanjaMemberNo: {
  marginTop: 3,
  fontSize: 13,
  fontWeight: "700",
  color: "#E6C27A",
  letterSpacing: 0.5,
},

yudanjaMark: {
  width: 64,
  height: 64,
  alignItems: "center",
  justifyContent: "center",
},
yudanjaIconImage: {
  width: 70,
  height: 70,
  marginRight: 17,
},
yudanjaMarkText: {
  fontSize: 28,
  fontWeight: "900",
  color: "#C89E6A",
},

menuSection: {
  backgroundColor: "#FFFEFC",
  borderRadius: 26,
  borderWidth: 1,
  borderColor: "#EFE5DE",
  overflow: "hidden",
},

menuRow: {
  minHeight: 68,
  paddingHorizontal: 18,
  paddingVertical: 13,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
},

menuRowPressed: {
  backgroundColor: "#FFF9F6",
},

menuRowDisabled: {
  opacity: 0.55,
},

menuTextWrap: {
  flex: 1,
},

menuTitle: {
  fontSize: 15,
  fontWeight: "900",
  color: "#2B2522",
},

menuDescription: {
  marginTop: 4,
  fontSize: 12,
  color: "#7D746D",
},

menuArrow: {
  fontSize: 12,
  fontWeight: "500",
  color: "#A99F98",
},

menuDivider: {
  height: 1,
  backgroundColor: "#EFE5DE",
  marginLeft: 18,
},
avatarModalCard: {
  width: "100%",
  backgroundColor: "#FFFDF9",
  borderRadius: 26,
  padding: 20,
  borderWidth: 1,
  borderColor: "#ECE7DE",
},
heroYudanjaBadge: {
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 999,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#2B2521",
  borderWidth: 1,
  borderColor: "#D9AF55",
},
heroYudanjaBadgeText: {
  fontSize: 11,
  color: "#F7D782",
  fontWeight: "800",
},

heroMetaText: {
  marginTop: 4,
  fontSize: 12,
  lineHeight: 18,
  color: "#A78D83",
},

heroPaymentInfo: {
  flex: 1,
},

heroPaymentDueText: {
  marginTop: 8,
  fontSize: 12,
  lineHeight: 18,
  color: "#7D746D",
},
noAvatarCircle: {
  width: 66,
  height: 66,
  borderRadius: 33,
  backgroundColor: "#F3ECE2",
  borderWidth: 1,
  borderColor: "#E2D7C6",
  alignItems: "center",
  justifyContent: "center",
},

noAvatarText: {
  fontSize: 24,
  fontWeight: "900",
  color: "#6B4F46",
},

profilePreviewBox: {
  marginTop: 18,
  alignItems: "center",
  justifyContent: "center",
},

profilePreviewImage: {
  width: 96,
  height: 96,
  borderRadius: 48,
  backgroundColor: "#F5EAE4",
  borderWidth: 1,
  borderColor: "#EFE5DE",
},

profilePreviewEmpty: {
  width: 96,
  height: 96,
  borderRadius: 48,
  backgroundColor: "#F3ECE2",
  borderWidth: 1,
  borderColor: "#E2D7C6",
  alignItems: "center",
  justifyContent: "center",
},

profilePreviewEmptyText: {
  fontSize: 34,
  fontWeight: "900",
  color: "#6B4F46",
},

avatarActionList: {
  marginTop: 18,
  gap: 10,
},

avatarActionButton: {
  borderRadius: 18,
  borderWidth: 1,
  borderColor: "#ECE7DE",
  backgroundColor: "#FFFEFC",
  paddingHorizontal: 16,
  paddingVertical: 14,
},

avatarActionTitle: {
  fontSize: 15,
  fontWeight: "900",
  color: "#2B2522",
},

avatarActionDesc: {
  marginTop: 4,
  fontSize: 12,
  lineHeight: 17,
  color: "#7D746D",
},

avatarActionDanger: {
  backgroundColor: "#FBF3F1",
  borderColor: "#E8D2CC",
},

avatarActionDangerTitle: {
  fontSize: 15,
  fontWeight: "900",
  color: "#7B1E2B",
},

avatarCloseButton: {
  marginTop: 18,
  minHeight: 50,
  borderRadius: 16,
  backgroundColor: "#2B2522",
  alignItems: "center",
  justifyContent: "center",
},

avatarCloseButtonText: {
  fontSize: 15,
  fontWeight: "900",
  color: "#FFFFFF",
},
defaultAvatarSection: {
  marginTop: 4,
  paddingVertical: 12,
  paddingHorizontal: 12,
  borderRadius: 18,
  backgroundColor: "#F8F3EA",
  borderWidth: 1,
  borderColor: "#E5D8C8",
},

defaultAvatarTitle: {
  marginBottom: 10,
  fontSize: 13,
  fontWeight: "800",
  color: "#5A4636",
},

defaultAvatarGrid: {
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 10,
},

defaultAvatarOption: {
  width: 54,
  height: 54,
  borderRadius: 999,
  padding: 3,
  backgroundColor: "#EFE6D8",
  borderWidth: 1,
  borderColor: "#D8C8B6",
  position: "relative",
},

defaultAvatarOptionActive: {
  borderWidth: 2,
  borderColor: "#A97C36",
  backgroundColor: "#FFF7E8",
},

defaultAvatarImage: {
  width: "100%",
  height: "100%",
  borderRadius: 999,
},

defaultAvatarCheck: {
  position: "absolute",
  right: -2,
  bottom: -2,
  width: 18,
  height: 18,
  borderRadius: 999,
  backgroundColor: "#7B1E2B",
  alignItems: "center",
  justifyContent: "center",
  borderWidth: 1,
  borderColor: "#F8F3EA",
},

defaultAvatarCheckText: {
  fontSize: 11,
  fontWeight: "900",
  color: "#F6D58A",
},
avatarMenuOverlay: {
  flex: 1,
  backgroundColor: "rgba(0, 0, 0, 0.28)",
},

avatarSmallMenu: {
  position: "absolute",
  top: 220,
  right: 38,
  width: 180,
  paddingVertical: 7,
  backgroundColor: "#FFFEFC",
  borderRadius: 22,
  borderWidth: 1,
  borderColor: "#E8DED2",
  shadowColor: "#000",
  shadowOpacity: 0.16,
  shadowRadius: 18,
  shadowOffset: { width: 0, height: 8 },
  elevation: 8,
},

avatarSmallMenuItem: {
  paddingHorizontal: 20,
  paddingVertical: 7,
},

avatarSmallMenuText: {
  fontSize: 15,
  fontWeight: "550",
  color: "#241E1A",
},

avatarSmallMenuDanger: {
  color: "#8F1D2C",
},

defaultAvatarModalCard: {
  width: "88%",
  maxWidth: 420,
  borderRadius: 30,
  backgroundColor: "#FFFEFC",
  paddingHorizontal: 22,
  paddingTop: 26,
  paddingBottom: 20,
  borderWidth: 1,
  borderColor: "#E8DED2",
},

defaultAvatarGrid: {
  marginTop: 18,
  marginBottom: 18,
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "space-between",
  rowGap: 16,
},

defaultAvatarButton: {
  width: "23%",
  aspectRatio: 1,
  borderRadius: 999,
  padding: 3,
  backgroundColor: "#F4EEE5",
  borderWidth: 2,
  borderColor: "#E4D8C8",
},

defaultAvatarButtonSelected: {
  borderColor: "#8B5A2B",
  backgroundColor: "#EFE3D2",
},

defaultAvatarImage: {
  width: "100%",
  height: "100%",
  borderRadius: 999,
},
yudanjaFlipWrap: {
  width: "100%",
  borderRadius: 26,
  overflow: "hidden",
  marginTop: 0,
  marginBottom: 0,
},

yudanjaFlipWrapFront: {
  height: 128,
},

yudanjaFlipWrapBack: {
  aspectRatio: 1.586,
},

yudanjaFlipFace: {
  position: "absolute",
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  backfaceVisibility: "hidden",
},

yudanjaFrontFace: {
  zIndex: 2,
},

yudanjaBackFace: {
  zIndex: 1,
},

yudanjaBackImageRadius: {
  borderRadius: 26,
},
screenYudanja: {
  backgroundColor: colors.background,
},
titleYudanja: {
  color: "#1F1A14",
},

headerEditButtonYudanja: {
  backgroundColor: "#FFF7E4",
  borderColor: "#E5BE62",
},

headerEditButtonTextYudanja: {
  color: "#8A5D16",
},
heroGoldLine: {
  position: "absolute",
  left: -40,
  right: -40,
  bottom: 0,
  height: 2,
  backgroundColor: "rgba(224, 188, 101, 0.55)",
},
menuSectionYudanja: {
  borderColor: "rgba(224, 188, 101, 0.45)",
  backgroundColor: "#FFFDF8",
},
heroCardBgImage: {
  position: "absolute",
  left: -17,
  top: -40,
  width: "123%",
  height: "140%",
  borderRadius: 28,
  opacity: 0.5,
},

heroCardBgSoftOverlay: {
  ...StyleSheet.absoluteFillObject,
  backgroundColor: "rgba(255, 253, 247, 0.10)",
},
headerIconButton: {
  width: 26,
  height: 26,
  borderRadius: 23,
  alignItems: "center",
  justifyContent: "center",
},

headerIconImage: {
  width: 26,
  height: 26,
  resizeMode: "contain",
},
paymentIconImage: {
  width: 34,
  height: 34,
},
});