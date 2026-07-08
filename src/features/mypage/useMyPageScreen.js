import { useCallback, useEffect, useState } from "react";
import { Alert, Platform } from "react-native";
import { router } from "expo-router";
import {
  changeMyPassword,
  changeMyPhone,
  verifyMyPassword,
  changeMyLoginId,
  updateMyProfileAvatar,
} from "../../api/member";

import { onlyNumbers } from "./mypageUtils";
import { getMemberHome } from "../../api/memberHome";
import * as ImagePicker from "expo-image-picker";

async function compressImageForWeb(imageUri, maxSize = 1000, quality = 0.68) {
  const blob = await fetch(imageUri).then((res) => res.blob());

  const image = await new Promise((resolve, reject) => {
    const img = new window.Image();
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

export function useMyPageScreen({ token, logout, setAvatarModalVisible, setDefaultAvatarModalVisible }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [homeData, setHomeData] = useState(null);

  const [selectedAvatar, setSelectedAvatar] = useState("avatar1");
  const [submittingAccount, setSubmittingAccount] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newLoginId, setNewLoginId] = useState("");
  const [verifyPassword, setVerifyPassword] = useState("");
  const [profileImageVersion, setProfileImageVersion] = useState("");

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

        setHomeData(result);

        const nextAvatar = result?.member?.profileAvatar || null;
        const nextVersion = result?.member?.updatedAt || "";

        setSelectedAvatar(nextAvatar);
        setProfileImageVersion(nextVersion);
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

  const handleChangePassword = useCallback(
  async ({ onSuccessClose } = {}) => {
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

      onSuccessClose?.();
    } catch (error) {
      Alert.alert(
        "오류",
        error?.response?.data?.message ||
          error?.message ||
          "비밀번호 변경에 실패했습니다."
      );
    } finally {
      setSubmittingAccount(false);
    }
  },
  [currentPassword, newPassword, newPasswordConfirm]
);

const handleChangePhone = useCallback(
  async ({ onSuccessClose } = {}) => {
    const cleanPhone = onlyNumbers(newPhone);

    if (cleanPhone && !/^010\d{8}$/.test(cleanPhone)) {
      Alert.alert("안내", "휴대폰 번호는 010으로 시작하는 숫자 11자리여야 합니다.");
      return;
    }

    try {
      setSubmittingAccount(true);

      await changeMyPhone(cleanPhone || null);

      Alert.alert("완료", "연락처가 저장되었습니다.");

      setNewPhone("");
      onSuccessClose?.();

      await loadProfile({ silent: true });
    } catch (error) {
      Alert.alert(
        "오류",
        error?.response?.data?.message ||
          error?.message ||
          "연락처 저장에 실패했습니다."
      );
    } finally {
      setSubmittingAccount(false);
    }
  },
  [newPhone, loadProfile]
);

const handleChangeLoginId = useCallback(
  async ({ onSuccessClose } = {}) => {
    const cleanLoginId = String(newLoginId || "").trim().toLowerCase();

    if (
      cleanLoginId.length < 4 ||
      cleanLoginId.length > 20 ||
      !/^[a-z0-9_]+$/.test(cleanLoginId)
    ) {
      Alert.alert(
        "안내",
        "아이디는 4~20자의 영문 소문자, 숫자, _만 사용할 수 있습니다."
      );
      return;
    }

    try {
      setSubmittingAccount(true);

      await changeMyLoginId(cleanLoginId);

      Alert.alert(
        "완료",
        "아이디가 변경되었습니다.\n다음 로그인부터 새 아이디를 사용해주세요."
      );

      setNewLoginId("");
      onSuccessClose?.();

      await logout();
      router.replace("/login");
    } catch (error) {
      Alert.alert(
        "오류",
        error?.response?.data?.message ||
          error?.message ||
          "아이디 변경에 실패했습니다."
      );
    } finally {
      setSubmittingAccount(false);
    }
  },
  [newLoginId, logout]
);

const handleVerifyPasswordForEdit = useCallback(
  async ({ onLoginIdOpen, onVerifyClose } = {}) => {
    if (!verifyPassword.trim()) {
      Alert.alert("안내", "비밀번호를 입력해주세요.");
      return;
    }

    try {
      setSubmittingAccount(true);

      await verifyMyPassword(verifyPassword);

      setVerifyPassword("");
      onVerifyClose?.();

      if (homeData?.member?.canChangeLoginId) {
        onLoginIdOpen?.();
      }

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
  },
  [verifyPassword, homeData]
);

const uploadProfileImageAsync = useCallback(
  async (assetOrUri) => {
    const formData = new FormData();

    const imageUri =
      typeof assetOrUri === "string" ? assetOrUri : assetOrUri?.uri;

    if (!imageUri) {
      throw new Error("선택된 이미지가 없습니다.");
    }

    if (Platform.OS === "web") {
      const blob = await compressImageForWeb(imageUri, 1000, 0.68);

      const file = new File([blob], `profile-image-${Date.now()}.jpg`, {
        type: "image/jpeg",
      });

      formData.append("image", file);
    } else {
      const asset = typeof assetOrUri === "object" ? assetOrUri : {};

      let mime = asset?.mimeType || asset?.type || "image/jpeg";

      if (!["image/jpeg", "image/png", "image/webp"].includes(mime)) {
        mime = "image/jpeg";
      }

      const ext =
        mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : "jpg";

      formData.append("image", {
        uri: imageUri,
        name: `profile-image-${Date.now()}.${ext}`,
        type: mime,
      });
    }

    const rawApiBase = String(process.env.EXPO_PUBLIC_API_BASE_URL || "").replace(/\/$/, "");
    const apiBase = rawApiBase.endsWith("/api")
      ? rawApiBase
      : `${rawApiBase}/api`;

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
      updatedAt:
        result?.updatedAt || result?.data?.updatedAt || String(Date.now()),
    };
  },
  [token]
);

const handlePickProfileFromCamera = useCallback(async () => {
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
}, [uploadProfileImageAsync, setAvatarModalVisible]);

const handlePickProfileFromAlbum = useCallback(async () => {
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
}, [uploadProfileImageAsync, setAvatarModalVisible]);

const handleUseNoProfileImage = useCallback(async () => {
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
}, [loadProfile, setAvatarModalVisible, setDefaultAvatarModalVisible]);

const handleUseDefaultAvatar = useCallback(
  async (avatarKey) => {
    try {
      setSubmittingAccount(true);

      await updateMyProfileAvatar(avatarKey);

      setSelectedAvatar(avatarKey);
      setDefaultAvatarModalVisible(false);

      Alert.alert("완료", "기본 프로필 이미지로 변경했습니다.");
      await loadProfile({ silent: true });
    } catch (error) {
      Alert.alert("오류", error?.message || "프로필 사진 변경에 실패했습니다.");
    } finally {
      setSubmittingAccount(false);
    }
  },
  [loadProfile, setDefaultAvatarModalVisible]
);

const openDefaultAvatarPicker = useCallback(() => {
  setAvatarModalVisible(false);
  setDefaultAvatarModalVisible(true);
}, [setAvatarModalVisible, setDefaultAvatarModalVisible]);

  return {
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
handlePickProfileFromCamera,
handlePickProfileFromAlbum,
handleUseNoProfileImage,
handleUseDefaultAvatar,
openDefaultAvatarPicker,
  };
}
