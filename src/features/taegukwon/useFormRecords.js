import {
  useCallback,
  useRef,
  useState,
} from "react";
import { Alert, Platform } from "react-native";
import client from "../../api/client";
import { getKoreaDateKey } from "./formPeriodPolicy";

function hasActiveFormGoal(form) {
  const targetCount = Number(form?.targetCount || 0);

  if (targetCount <= 0) {
    return false;
  }

  if (form?.isActive === false) {
    return false;
  }

  const status = String(form?.status || "").toLowerCase();

  if (status && status !== "active") {
    return false;
  }

  return true;
}

function showFormGoalRequiredAlert() {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined") {
      window.alert("목표를 먼저 설정하세요.");
    }
    return;
  }

  Alert.alert("안내", "목표를 먼저 설정하세요.");
}


function showFormSaveSuccess(
  setFormSaveSuccess,
  title,
  message
) {
  setFormSaveSuccess({
    visible: true,
    title,
    message,
  });
}

export function useFormRecords({
  token,
  formDefinitions,
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
}) {
  const [formSaveSuccess, setFormSaveSuccess] = useState({
    visible: false,
    title: "",
    message: "",
  });

  const closeFormSaveSuccess = useCallback(() => {
    setFormSaveSuccess((current) => ({
      ...current,
      visible: false,
    }));
  }, []);

  // HJTAICHI_FORM_GOAL_CUSTOM_MODAL_V18
  const formGoalPromptResolverRef = useRef(null);

  const [formGoalPrompt, setFormGoalPrompt] = useState({
    visible: false,
    mode: "notice",
    title: "",
    message: "",
    confirmLabel: "확인",
    cancelLabel: "취소",
  });

  const closeFormGoalPrompt = useCallback(() => {
    const resolver = formGoalPromptResolverRef.current;
    formGoalPromptResolverRef.current = null;

    setFormGoalPrompt((current) => ({
      ...current,
      visible: false,
    }));

    if (typeof resolver === "function") {
      resolver(false);
    }
  }, []);

  const confirmFormGoalPrompt = useCallback(() => {
    const resolver = formGoalPromptResolverRef.current;
    formGoalPromptResolverRef.current = null;

    setFormGoalPrompt((current) => ({
      ...current,
      visible: false,
    }));

    if (typeof resolver === "function") {
      resolver(true);
    }
  }, []);

  const showFormGoalNotice = useCallback(
    ({ title, message }) =>
      new Promise((resolve) => {
        formGoalPromptResolverRef.current = resolve;

        setFormGoalPrompt({
          visible: true,
          mode: "notice",
          title,
          message,
          confirmLabel: "확인",
          cancelLabel: "",
        });
      }),
    []
  );

  const requestFormGoalConfirmation = useCallback(
    ({
      title,
      message,
      confirmLabel = "목표 저장",
      cancelLabel = "취소",
    }) =>
      new Promise((resolve) => {
        formGoalPromptResolverRef.current = resolve;

        setFormGoalPrompt({
          visible: true,
          mode: "confirm",
          title,
          message,
          confirmLabel,
          cancelLabel,
        });
      }),
    []
  );

  const [formRecordData, setFormRecordData] = useState(null);

  const loadFormRecords = useCallback(async () => {
    if (!token) return;

    try {
      const response = await client.get(
        "/api/member/me/form-records"
      );

      const result = response.data ?? {};
      setFormRecordData(result.data);
    } catch (error) {
    } finally {
    }
  }, [token]);

    const apiForms = formRecordData?.forms || [];

  const mergedForms = formDefinitions.map((definition) => {
    const apiForm = apiForms.find((item) => item.id === definition.id);

    return {
      ...definition,
      ...apiForm,
      minRank: definition.minRank,
    };
  });

  const accessibleForms = mergedForms.filter(
    (item) => memberRank >= Number(item.minRank || 0)
  );

  const lockedForms = mergedForms.filter(
    (item) => memberRank < Number(item.minRank || 0)
  );

  const featuredForm =
    accessibleForms.find((item) => item.id === featuredFormId) ||
    accessibleForms.find(
      (item) =>
        Number(item.targetCount || 0) > 0 ||
        Number(item.currentCount || 0) > 0
    ) ||
    accessibleForms[0] ||
    null;

  const otherForms = [
    ...accessibleForms.filter((item) => item.id !== featuredForm?.id),
    ...lockedForms,
  ];

  const selectedForm = mergedForms.find((item) => item.id === selectedFormId);

  const selectedFormName = selectedForm?.name || "투로";

    const handleSaveFormRecord = useCallback(async () => {
    if (!hasActiveFormGoal(selectedForm)) {
      showFormGoalRequiredAlert();
      return;
    }

    try {
      const response = await client.post(
        "/api/member/me/form-records",
        {
          formKey: selectedForm?.id,
          count: Number(formRecordCount || 0),
          recordDate: getKoreaDateKey(new Date()),
        }
      );

      const result = response.data ?? {};

      setFormRecordModalVisible(false);
      await loadFormRecords();

      if (result.data?.completedGoal) {
        setCompletedGoalNames([selectedForm?.name || "투로"]);
        setCompletionModalType("form");
        setCompletionModalVisible(true);
      } else {
        showFormSaveSuccess(
          setFormSaveSuccess,
          "저장 완료",
          "투로 기록이 저장되었습니다."
        );
      }
    } catch (error) {
      Alert.alert(
      "오류",
      error?.response?.data?.message ||
        error?.message ||
        "투로 기록 저장 중 오류가 발생했습니다."
    );
    }
  }, [
    token,
    selectedForm,
    formRecordCount,
    loadFormRecords,
    setFormRecordModalVisible,
    setCompletedGoalNames,
    setCompletionModalType,
    setCompletionModalVisible,
  ]);

const handleSaveFormGoal = useCallback(async () => {
  try {
    if (!selectedFormId) {
      Alert.alert("안내", "투로를 선택해주세요.");
      return;
    }

    const targetCountValue = Number(formGoalCount);

    if (
      !Number.isInteger(targetCountValue) ||
      targetCountValue < 1 ||
      targetCountValue > 9999999
    ) {
      Alert.alert("안내", "목표 횟수는 1회 이상 9,999,999회 이하로 입력해주세요.");
      return;
    }

    // HJTAICHI_FORM_GOAL_CLIENT_NO_DECREASE
    const existingTargetCount = Number(
      selectedForm?.targetCount || 0
    );
    const existingCurrentCount = Number(
      selectedForm?.currentCount || 0
    );

    if (
      existingCurrentCount > 0 &&
      existingTargetCount > 0 &&
      targetCountValue < existingTargetCount
    ) {
      // HJTAICHI_FORM_GOAL_MODAL_STACK_V185
      setFormGoalModalVisible(false);

      await showFormGoalNotice({
        title:
          "🔥처음 세운 목표 끝까지 가봐요!",
        message:
          "이미 시작한 수련 목표는 낮출 수 없어요.\n" +
          `처음 세운 ${existingTargetCount}회 까지 꾸준히 해봅시다.\n\n` +
          "한 번 한 번 쌓다 보면\n어느새 목표에 가까워질 거예요!",
      });

      setFormGoalModalVisible(true);
      return;
    }
    const isInitialGoal =
      existingTargetCount <= 0;

    const confirmationTitle = isInitialGoal
      ? "🎯 이 목표로 시작할까요?"
      : "🎯 이 목표로 저장할까요?";

    const confirmationMessage = isInitialGoal
      ? `${selectedFormName}\n${targetCountValue}회 목표를 설정합니다.\n\n수련을 한 번이라도 시작하면 목표 횟수는 낮출 수 없어요.\n이 목표로 저장하시겠습니까?`
      : `${selectedFormName}\n현재 목표 ${existingTargetCount}회 → 변경 목표 ${targetCountValue}회\n\n수련을 한 번이라도 시작하면\n목표 횟수는 낮출 수 없어요.\n\n이 목표로 저장하시겠습니까?`;

    setFormGoalModalVisible(false);

    const confirmed =
      await requestFormGoalConfirmation({
        title: confirmationTitle,
        message: confirmationMessage,
      });

    if (!confirmed) {
      setFormGoalModalVisible(true);
      return;
    }

    const response = await client.post(
      "/api/member/me/form-goals",
      {
        formKey: selectedFormId,
        periodYear: currentPeriodYear,
        periodHalf: currentPeriodHalf,
        targetCount: targetCountValue,
        isActive: true,
      }
    );

    const result = response.data ?? {};

    setFormGoalModalVisible(false);
    await loadFormRecords();

    showFormSaveSuccess(
      setFormSaveSuccess,
      "목표 설정 완료",
      `${selectedFormName} ${targetCountValue}회 목표가 설정되었습니다.`
    );
  } catch (error) {
    Alert.alert(
      "오류",
      error?.response?.data?.message ||
        error?.message ||
        "투로 목표 저장 중 오류가 발생했습니다."
    );
  }
}, [
  token,
  selectedFormId,
  selectedForm,
  selectedFormName,
  requestFormGoalConfirmation,
  showFormGoalNotice,
  formGoalCount,
  currentPeriodYear,
  currentPeriodHalf,
  loadFormRecords,
  setFormGoalModalVisible,
]);

const handleSaveFavoriteForm = useCallback(
  async (formKey) => {
    try {
      setFeaturedFormId(formKey);

      await client.patch(
          "/api/member/me/favorite-form",
          {
          formKey,
        }
        );
    } catch (error) {
    }
  },
  [token, setFeaturedFormId]
);

  return {
    formRecordData,
    loadFormRecords,
    mergedForms,
    accessibleForms,
    lockedForms,
    featuredForm,
    otherForms,
    selectedForm,
    formSaveSuccess,
    closeFormSaveSuccess,
    handleSaveFormRecord,
    handleSaveFormGoal,
    handleSaveFavoriteForm,
    formGoalPrompt,
    closeFormGoalPrompt,
    confirmFormGoalPrompt,
  };
}