import {
  useCallback,
  useState,
} from "react";
import { Alert, Platform } from "react-native";
import client from "../../api/client";

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
          recordDate: new Date().toISOString().slice(0, 10),
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
  };
}