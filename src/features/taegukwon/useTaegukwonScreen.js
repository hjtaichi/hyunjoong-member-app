import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Animated } from "react-native";
import { useLocalSearchParams } from "expo-router";

import { API_BASE_URL } from "../../config/env";
import { useAuth } from "../../contexts/AuthContext";
import { getMemberTaegukwon } from "../../api/memberTaegukwon";
import { getMyPrivateLessons } from "../../api/privateLessons";
import { FORM_DEFINITIONS } from "./taegukwonMeta";
import { useGongbeopRecords } from "./useGongbeopRecords";
import { useFormRecords } from "./useFormRecords";
import { sendClientLog } from "../../utils/clientLogger";

export function useTaegukwonScreen() {
  const { token } = useAuth();
  const { tab } = useLocalSearchParams();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

const [debugLogs, setDebugLogs] = useState([]);

const addDebugLog = useCallback((message, data) => {
  setDebugLogs((prev) => [
    ...prev.slice(-30),
    `${new Date().toLocaleTimeString()} | ${message} ${
      data ? JSON.stringify(data) : ""
    }`,
  ]);
}, []);

  const [taegukwonData, setTaegukwonData] = useState(null);
  const [privateLessonData, setPrivateLessonData] = useState(null);

  const [savingMemo, setSavingMemo] = useState(false);
  const [memoEditModalVisible, setMemoEditModalVisible] = useState(false);
  const [editMemberMemo, setEditMemberMemo] = useState("");
  const MEMBER_MEMO_MAX_LENGTH = 60;

  const [formGoalCount, setFormGoalCount] = useState("");
  const [recordModalVisible, setRecordModalVisible] = useState(false);
  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const [completionModalVisible, setCompletionModalVisible] = useState(false);
  const [completedGoalNames, setCompletedGoalNames] = useState([]);
  const [completionModalType, setCompletionModalType] = useState("gongbeop");

  const {
    gongbeopRecord,
    todayGongbeopRecord,
    setTodayGongbeopRecord,
    gongbeopGoals,
    gongbeopUpdatedAt,
    loadGongbeopRecord,
    loadGongbeopGoals,
    handleChangeGongbeopGoal,
    handleChangeTodayGongbeop,
    handleSaveGongbeopRecord,
    handleSaveGongbeopGoals,
  } = useGongbeopRecords({
    token,
    setGoalModalVisible,
    setCompletedGoalNames,
    setCompletionModalType,
    setCompletionModalVisible,
  });

  const [selectedFormId, setSelectedFormId] = useState(null);
  const [formRecordCount, setFormRecordCount] = useState("3");
  const [featuredFormId, setFeaturedFormId] = useState(null);

  const member = taegukwonData?.member || null;
  const memberRank = Number(member?.rankLevel || 0);

  const now = new Date();
  const currentPeriodYear = now.getFullYear();
  const currentPeriodHalf = now.getMonth() + 1 <= 6 ? 1 : 2;
  const currentPeriodLabel = currentPeriodHalf === 1 ? "상반기" : "하반기";
  const currentPeriodSub =
    currentPeriodHalf === 1 ? "1월 ~ 6월" : "7월 ~ 12월";

  const [memoHistoryModalVisible, setMemoHistoryModalVisible] =
    useState(false);
  const [formRecordModalVisible, setFormRecordModalVisible] = useState(false);
  const [formGoalModalVisible, setFormGoalModalVisible] = useState(false);

  const {
    loadFormRecords,
    accessibleForms,
    featuredForm,
    otherForms,
    selectedForm,
    handleSaveFormRecord,
    handleSaveFormGoal,
    handleSaveFavoriteForm,
  } = useFormRecords({
    token,
    formDefinitions: FORM_DEFINITIONS,
    memberRank,
    featuredFormId,
    selectedFormId,
    formRecordCount,
    formGoalCount,
    currentPeriodYear,
    currentPeriodHalf,
    setFeaturedFormId,
    setFormRecordModalVisible,
    setFormGoalModalVisible,
    setCompletedGoalNames,
    setCompletionModalType,
    setCompletionModalVisible,
  });

  const [activeTab, setActiveTab] = useState("training");

  useEffect(() => {
    if (tab === "gongbeop") setActiveTab("gongbeop");
    if (tab === "formRecord") setActiveTab("formRecord");
  }, [tab]);

  const loadData = useCallback(
    async ({ silent = false } = {}) => {
      if (!token) return;

      try {
        if (!silent) setLoading(true);

        const [taegukwonResult, privateLessonResult] = await Promise.all([
          getMemberTaegukwon(token),
          getMyPrivateLessons(token).catch(() => null),
        ]);

        const payload = taegukwonResult?.data
          ? taegukwonResult.data
          : taegukwonResult;

        setTaegukwonData(payload);

        setPrivateLessonData(
          privateLessonResult?.data ? privateLessonResult.data : privateLessonResult
        );

        await Promise.all([
          loadGongbeopRecord(),
          loadGongbeopGoals(),
          loadFormRecords(),
        ]);

const loadedMemo =
  payload?.memberMemo ??
  payload?.personalProgress?.memberMemo ??
  "";

setEditMemberMemo(loadedMemo);
      } catch (error) {
        Alert.alert("오류", error.message || "태극권 정보를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token, loadGongbeopRecord, loadGongbeopGoals, loadFormRecords]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData({ silent: true });
  }, [loadData]);

  const isYudanjaMember = member?.canAccessYudanjaClass === true;

  useEffect(() => {
    if (member?.favoriteFormKey) {
      setFeaturedFormId(member.favoriteFormKey);
    }
  }, [member?.favoriteFormKey]);

  const hasPrivateLessonMenu =
    privateLessonData?.isActive === true ||
    privateLessonData?.hasHistory === true ||
    !!privateLessonData?.currentPackage;

  const privateLessonMenuTitle = privateLessonData?.menuLabel || "개인지도";

  const privateLessonMenuDesc = privateLessonData?.isActive
    ? `잔여 ${privateLessonData?.currentPackage?.remainingCount ?? 0}회 · 최근 수업 확인`
    : "지난 개인지도 기록 보기";

const personalProgress = taegukwonData?.personalProgress || null;

const memberMemo =
  taegukwonData?.memberMemo ??
  personalProgress?.memberMemo ??
  "";

const memberMemoHistory = Array.isArray(taegukwonData?.memberMemoHistory)
  ? taegukwonData.memberMemoHistory
  : [];

const previousMemoHistory = memberMemoHistory.slice(1);

  const personalProgressPercent = useMemo(() => {
    return Number(personalProgress?.progressPercent || 0);
  }, [personalProgress]);

  const riverGlowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(riverGlowAnim, {
          toValue: 1,
          duration: 8000,
          useNativeDriver: true,
        }),
        Animated.timing(riverGlowAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );

    loop.start();

    return () => loop.stop();
  }, [riverGlowAnim]);

  const handleSaveMemberMemo = useCallback(async () => {
  const targetCurriculumId = personalProgress?.curriculumId || "";

  try {
    sendClientLog({
      level: "info",
      screen: "taegukwon-memo",
      message: "메모 저장 함수 진입",
      extra: {
        hasToken: !!token,
        hasPersonalProgress: !!personalProgress,
        hasCurriculumId: !!targetCurriculumId,
        curriculumId: targetCurriculumId || null,
        memoLength: editMemberMemo?.length || 0,
        userAgent:
          typeof navigator !== "undefined" ? navigator.userAgent : "",
        online:
          typeof navigator !== "undefined" ? navigator.onLine : null,
        cookieEnabled:
          typeof navigator !== "undefined" ? navigator.cookieEnabled : null,
      },
    });

    setSavingMemo(true);

    const memoUrl = `${API_BASE_URL}/api/member/me/personal-memo`;

    sendClientLog({
      level: "info",
      screen: "taegukwon-memo",
      message: "메모 저장 API 요청 직전",
      extra: {
        memoUrl,
        hasToken: !!token,
        hasCurriculumId: !!targetCurriculumId,
        curriculumId: targetCurriculumId || null,
        memoLength: editMemberMemo?.length || 0,
      },
    });

    const response = await fetch(memoUrl, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        curriculumId: targetCurriculumId || null,
        memberMemo: editMemberMemo,
      }),
    });

    const responseText = await response.text();

    let result = {};
    try {
      result = responseText ? JSON.parse(responseText) : {};
    } catch {
      result = { message: responseText };
    }

    sendClientLog({
      level: response.ok ? "info" : "error",
      screen: "taegukwon-memo",
      message: "메모 저장 API 응답",
      extra: {
        ok: response.ok,
        status: response.status,
        responseBodyLength: responseText?.length || 0,
      },
    });

    if (!response.ok) {
      throw new Error(result.message || "내 수련 메모 저장 실패");
    }

const savedMemo = result?.data?.memberMemo ?? editMemberMemo;

setEditMemberMemo(savedMemo);

setTaegukwonData((prev) => ({
  ...prev,
  memberMemo: savedMemo,
  personalProgress: prev?.personalProgress
    ? {
        ...prev.personalProgress,
        memberMemo: savedMemo,
      }
    : prev?.personalProgress,
}));

    setMemoEditModalVisible(false);
    Alert.alert("완료", "수련 메모가 저장되었습니다.");

    loadData({ silent: true }).catch(() => {});
  } catch (error) {
    sendClientLog({
      level: "error",
      screen: "taegukwon-memo",
      message: "메모 저장 실패 catch",
      extra: {
        name: error?.name,
        message: error?.message,
        hasToken: !!token,
        hasPersonalProgress: !!personalProgress,
        hasCurriculumId: !!targetCurriculumId,
        curriculumId: targetCurriculumId || null,
      },
    });

    Alert.alert("오류", error.message || "수련 메모 저장 중 오류가 발생했습니다.");
  } finally {
    setSavingMemo(false);
  }
}, [personalProgress, editMemberMemo, token, loadData]);

  return {
    loading,
    refreshing,
    onRefresh,

    activeTab,
    setActiveTab,

    recordModalVisible,
    setRecordModalVisible,
    goalModalVisible,
    setGoalModalVisible,
    completionModalVisible,
    setCompletionModalVisible,
    completedGoalNames,
    completionModalType,

    memoEditModalVisible,
    setMemoEditModalVisible,
    memoHistoryModalVisible,
    setMemoHistoryModalVisible,
    editMemberMemo,
    setEditMemberMemo,
    savingMemo,
    MEMBER_MEMO_MAX_LENGTH,
    handleSaveMemberMemo,

    formRecordModalVisible,
    setFormRecordModalVisible,
    formGoalModalVisible,
    setFormGoalModalVisible,
    formGoalCount,
    setFormGoalCount,
    selectedFormId,
    setSelectedFormId,
    formRecordCount,
    setFormRecordCount,
    featuredFormId,

    gongbeopRecord,
    todayGongbeopRecord,
    setTodayGongbeopRecord,
    gongbeopGoals,
    gongbeopUpdatedAt,
    handleChangeGongbeopGoal,
    handleChangeTodayGongbeop,
    handleSaveGongbeopRecord,
    handleSaveGongbeopGoals,

    currentPeriodYear,
    currentPeriodLabel,
    currentPeriodSub,

    memberRank,
    accessibleForms,
    featuredForm,
    otherForms,
    selectedForm,
    handleSaveFormRecord,
    handleSaveFormGoal,
    handleSaveFavoriteForm,

    personalProgress,
    memberMemo,
    previousMemoHistory,
    memberMemoHistory,
    personalProgressPercent,
   
    isYudanjaMember,
    hasPrivateLessonMenu,
    privateLessonMenuTitle,
    privateLessonMenuDesc,

    riverGlowAnim,
    debugLogs,
addDebugLog,
  };
}