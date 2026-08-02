import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

import { styles } from "../homeStyles";
import {
  getMinimumSelectableWeeklyGoal,
  WEEKLY_GOAL_MAX,
  WEEKLY_GOAL_MIN,
} from "../weeklyGoalUtils";

function isValidGoal(value, minimum = WEEKLY_GOAL_MIN) {
  return (
    Number.isInteger(value) &&
    value >= minimum &&
    value <= WEEKLY_GOAL_MAX
  );
}

function normalizeGoal(value, minimum = WEEKLY_GOAL_MIN) {
  const number = Math.trunc(Number(value));

  if (!Number.isFinite(number)) {
    return minimum;
  }

  return Math.min(
    WEEKLY_GOAL_MAX,
    Math.max(minimum, number),
  );
}

function GoalNumberControl({
  accessibilityLabel,
  value,
  minimum = WEEKLY_GOAL_MIN,
  disabled,
  onChange,
}) {
  const normalizedValue = isValidGoal(value, minimum)
    ? value
    : minimum;
  const minusDisabled =
    disabled || normalizedValue <= minimum;
  const plusDisabled =
    disabled || normalizedValue >= WEEKLY_GOAL_MAX;

  const handleTextChange = (text) => {
    const digits = String(text || "")
      .replace(/[^0-9]/g, "")
      .slice(0, 2);

    if (!digits) {
      onChange(null);
      return;
    }

    const number = Number(digits);

    if (number > WEEKLY_GOAL_MAX) {
      onChange(WEEKLY_GOAL_MAX);
      return;
    }

    onChange(number);
  };

  return (
    <View style={styles.weeklyGoalNumberRow}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${accessibilityLabel} 1회 줄이기`}
        accessibilityState={{
          disabled: minusDisabled,
        }}
        disabled={minusDisabled}
        onPress={() =>
          onChange(
            Math.max(
              minimum,
              normalizedValue - 1,
            ),
          )
        }
        style={({ pressed }) => [
          styles.weeklyGoalStepButton,
          minusDisabled &&
            styles.weeklyGoalStepButtonDisabled,
          pressed &&
            !minusDisabled &&
            styles.weeklyGoalOptionButtonPressed,
        ]}
      >
        <Text
          style={[
            styles.weeklyGoalStepButtonText,
            minusDisabled &&
              styles.weeklyGoalStepButtonTextDisabled,
          ]}
        >
          −
        </Text>
      </Pressable>

      <View style={styles.weeklyGoalNumberInputWrap}>
        <TextInput
          accessibilityLabel={accessibilityLabel}
          value={
            value == null
              ? ""
              : String(value)
          }
          editable={!disabled}
          keyboardType="number-pad"
          inputMode="numeric"
          maxLength={2}
          selectTextOnFocus
          onChangeText={handleTextChange}
          onBlur={() =>
            onChange(
              normalizeGoal(value, minimum),
            )
          }
          style={styles.weeklyGoalNumberInput}
        />
        <Text style={styles.weeklyGoalNumberSuffix}>
          회
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${accessibilityLabel} 1회 늘리기`}
        accessibilityState={{
          disabled: plusDisabled,
        }}
        disabled={plusDisabled}
        onPress={() =>
          onChange(
            Math.min(
              WEEKLY_GOAL_MAX,
              normalizedValue + 1,
            ),
          )
        }
        style={({ pressed }) => [
          styles.weeklyGoalStepButton,
          plusDisabled &&
            styles.weeklyGoalStepButtonDisabled,
          pressed &&
            !plusDisabled &&
            styles.weeklyGoalOptionButtonPressed,
        ]}
      >
        <Text
          style={[
            styles.weeklyGoalStepButtonText,
            plusDisabled &&
              styles.weeklyGoalStepButtonTextDisabled,
          ]}
        >
          +
        </Text>
      </Pressable>
    </View>
  );
}

export default function WeeklyGoalModal({
  visible,
  loading,
  attendanceCount,
  currentGoal,
  currentMode,
  isRestWeek,
  recurringGoal,
  pendingRecurringGoal,
  onClose,
  onSave,
}) {
  const [draftCurrentGoal, setDraftCurrentGoal] =
    useState(null);
  const [draftRecurringGoal, setDraftRecurringGoal] =
    useState(null);
  const [saving, setSaving] = useState(false);

  const savedCurrentGoal = isRestWeek
    ? null
    : currentGoal || null;
  const savedRecurringGoal =
    pendingRecurringGoal || recurringGoal || null;

  const minimumSelectableGoal = useMemo(
    () =>
      getMinimumSelectableWeeklyGoal(
        attendanceCount,
      ),
    [attendanceCount],
  );

  useEffect(() => {
    if (!visible) {
      return;
    }

    setDraftCurrentGoal(
      Math.max(
        minimumSelectableGoal,
        savedCurrentGoal || WEEKLY_GOAL_MIN,
      ),
    );
    setDraftRecurringGoal(
      savedRecurringGoal || WEEKLY_GOAL_MIN,
    );
    setSaving(false);
  }, [
    visible,
    savedCurrentGoal,
    savedRecurringGoal,
    minimumSelectableGoal,
    isRestWeek,
    currentMode,
  ]);

  const currentGoalValid =
    isValidGoal(
      draftCurrentGoal,
      minimumSelectableGoal,
    );
  const recurringGoalValid =
    isValidGoal(draftRecurringGoal);

  const currentChanged =
    isRestWeek === true ||
    draftCurrentGoal !== savedCurrentGoal;
  const recurringChanged =
    draftRecurringGoal !== savedRecurringGoal;
  const hasChanges =
    currentChanged || recurringChanged;
  const canSave =
    hasChanges &&
    currentGoalValid &&
    recurringGoalValid &&
    !saving;

  const requestClose = () => {
    if (saving) {
      return;
    }

    if (!hasChanges) {
      onClose();
      return;
    }

    Alert.alert(
      "변경사항을 저장하지 않고 닫을까요?",
      "입력한 내용은 적용되지 않습니다.",
      [
        {
          text: "계속 설정",
          style: "cancel",
        },
        {
          text: "닫기",
          style: "destructive",
          onPress: onClose,
        },
      ],
    );
  };

  const handleSave = async () => {
    if (!canSave) {
      return;
    }

    try {
      setSaving(true);

      await onSave({
        currentGoal: draftCurrentGoal,
        isRestWeek: false,
        recurringGoal: draftRecurringGoal,
        currentChanged,
        recurringChanged,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={requestClose}
    >
      <Pressable
        style={styles.weeklyGoalOverlay}
        onPress={requestClose}
      >
        <Pressable
          style={styles.weeklyGoalSheet}
          onPress={(event) => event.stopPropagation()}
        >
          <View style={styles.weeklyGoalHandle} />

          <View style={styles.weeklyGoalTitleRow}>
            <View style={styles.weeklyGoalTitleBlock}>
              <Text style={styles.weeklyGoalTitle}>
                일반수련 주간 목표
              </Text>
              <Text style={styles.weeklyGoalExclusionText}>
                유단자회 수련은 목표 횟수에 포함되지
                않습니다.
              </Text>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="닫기"
              hitSlop={8}
              style={styles.weeklyGoalCloseButton}
              onPress={requestClose}
            >
              <Text style={styles.weeklyGoalCloseText}>
                ×
              </Text>
            </Pressable>
          </View>

          {loading ? (
            <View style={styles.weeklyGoalLoading}>
              <ActivityIndicator />
            </View>
          ) : (
            <>
              <View style={styles.weeklyGoalSection}>
                <Text style={styles.weeklyGoalSectionTitle}>
                  이번 주만
                </Text>
                <Text style={styles.weeklyGoalSectionHelperStrong}>
                  이번 주 일반수련 출석{" "}
                  {attendanceCount}회
                </Text>
                <Text style={styles.weeklyGoalSectionHelper}>
                  이미 출석한 횟수보다 낮게 설정할 수
                  없습니다.
                </Text>

                <GoalNumberControl
                  accessibilityLabel="이번 주 목표 횟수"
                  value={draftCurrentGoal}
                  minimum={minimumSelectableGoal}
                  disabled={saving}
                  onChange={setDraftCurrentGoal}
                />

                {!currentGoalValid ? (
                  <Text style={styles.weeklyGoalInputError}>
                    이번 주 목표는{" "}
                    {minimumSelectableGoal}회부터{" "}
                    {WEEKLY_GOAL_MAX}회까지 입력해주세요.
                  </Text>
                ) : null}
              </View>

              <View style={styles.weeklyGoalDivider} />

              <View style={styles.weeklyGoalSection}>
                <Text style={styles.weeklyGoalSectionTitle}>
                  매주 반복
                </Text>
                <Text style={styles.weeklyGoalSectionHelper}>
                  다음 주부터 적용할 목표를
                  입력해주세요.
                </Text>

                <GoalNumberControl
                  accessibilityLabel="매주 반복 목표 횟수"
                  value={draftRecurringGoal}
                  disabled={saving}
                  onChange={setDraftRecurringGoal}
                />

                {!recurringGoalValid ? (
                  <Text style={styles.weeklyGoalInputError}>
                    반복 목표는 1회부터{" "}
                    {WEEKLY_GOAL_MAX}회까지 입력해주세요.
                  </Text>
                ) : null}
              </View>

              <View style={styles.weeklyGoalActionArea}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{
                    disabled: !canSave,
                  }}
                  disabled={!canSave}
                  onPress={handleSave}
                  style={({ pressed }) => [
                    styles.weeklyGoalSaveButton,
                    !canSave &&
                      styles.weeklyGoalSaveButtonDisabled,
                    pressed &&
                      canSave &&
                      styles.weeklyGoalSaveButtonPressed,
                  ]}
                >
                  {saving ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text
                      style={[
                        styles.weeklyGoalSaveButtonText,
                        !canSave &&
                          styles.weeklyGoalSaveButtonTextDisabled,
                      ]}
                    >
                      저장하기
                    </Text>
                  )}
                </Pressable>
              </View>
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
