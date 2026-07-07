import { useCallback, useEffect, useState } from "react";
import { Alert, Platform } from "react-native";
import { router } from "expo-router";
import {
  changeMyPassword,
  changeMyPhone,
  verifyMyPassword,
  changeMyLoginId,
} from "../../api/member";

import { onlyNumbers } from "./mypageUtils";
import { getMemberHome } from "../../api/memberHome";

export function useMyPageScreen({ token, logout }) {
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
  };
}