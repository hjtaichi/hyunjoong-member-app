import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { API_BASE_URL } from "../../config/env";

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
  const [formRecordData, setFormRecordData] = useState(null);

  const loadFormRecords = useCallback(async () => {
    if (!token) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/member/me/form-records?t=${Date.now()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "투로 기록 불러오기 실패");
      }

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

    const handleSaveFormRecord = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/member/me/form-records`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          formKey: selectedForm?.id,
          count: Number(formRecordCount || 0),
          recordDate: new Date().toISOString().slice(0, 10),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "투로 기록 저장 실패");
      }

      setFormRecordModalVisible(false);
      await loadFormRecords();

      if (result.data?.completedGoal) {
        setCompletedGoalNames([selectedForm?.name || "투로"]);
        setCompletionModalType("form");
        setCompletionModalVisible(true);
      } else {
        Alert.alert("완료", "투로 기록이 저장되었습니다.");
      }
    } catch (error) {
      Alert.alert("오류", error.message || "투로 기록 저장 중 오류가 발생했습니다.");
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

    const response = await fetch(`${API_BASE_URL}/api/member/me/form-goals`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        formKey: selectedFormId,
        periodYear: currentPeriodYear,
        periodHalf: currentPeriodHalf,
        targetCount: targetCountValue,
        isActive: true,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "투로 목표 저장 실패");
    }

    Alert.alert("완료", "투로 목표가 저장되었습니다.");
    setFormGoalModalVisible(false);
    await loadFormRecords();
  } catch (error) {
    Alert.alert("오류", error.message || "투로 목표 저장 중 오류가 발생했습니다.");
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

      await fetch(`${API_BASE_URL}/api/member/me/favorite-form`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          formKey,
        }),
      });
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
    handleSaveFormRecord,
    handleSaveFormGoal,
    handleSaveFavoriteForm,
  };
}