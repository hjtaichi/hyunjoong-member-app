import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  Text,
  View,
} from "react-native";

import { styles } from "../homeStyles";

const GOAL_OPTIONS = [1, 2, 3, 4, 5];

function GoalOptionButton({
  value,
  selected,
  disabled,
  onPress,
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{
        selected,
        disabled,
      }}
      disabled={disabled}
      onPress={() => onPress(value)}
      style={({ pressed }) => [
        styles.weeklyGoalOptionButton,
        disabled &&
          styles.weeklyGoalOptionButtonDisabled,
        selected &&
          styles.weeklyGoalOptionButtonSelected,
        pressed &&
          !disabled &&
          styles.weeklyGoalOptionButtonPressed,
      ]}
    >
      <Text
        style={[
          styles.weeklyGoalOptionText,
          disabled &&
            styles.weeklyGoalOptionTextDisabled,
          selected &&
            styles.weeklyGoalOptionTextSelected,
        ]}
      >
        {value}회
      </Text>
    </Pressable>
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
  const [draftIsRestWeek, setDraftIsRestWeek] =
    useState(false);
  const [draftRecurringGoal, setDraftRecurringGoal] =
    useState(null);
  const [saving, setSaving] = useState(false);

  const savedCurrentGoal = isRestWeek
    ? null
    : currentGoal || null;
  const savedRecurringGoal =
    pendingRecurringGoal || recurringGoal || null;

  useEffect(() => {
    if (!visible) {
      return;
    }

    setDraftCurrentGoal(savedCurrentGoal);
    setDraftIsRestWeek(isRestWeek === true);
    setDraftRecurringGoal(savedRecurringGoal);
    setSaving(false);
  }, [
    visible,
    savedCurrentGoal,
    savedRecurringGoal,
    isRestWeek,
    currentMode,
  ]);

  const currentChanged =
    draftIsRestWeek !== (isRestWeek === true) ||
    (!draftIsRestWeek &&
      draftCurrentGoal !== savedCurrentGoal);
  const recurringChanged =
    draftRecurringGoal !== savedRecurringGoal;
  const hasChanges = currentChanged || recurringChanged;

  const minimumSelectableGoal = useMemo(() => {
    if (attendanceCount <= 0) {
      return 1;
    }

    if (savedCurrentGoal) {
      return savedCurrentGoal;
    }

    return attendanceCount + 1;
  }, [attendanceCount, savedCurrentGoal]);

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
      "선택한 내용은 적용되지 않습니다.",
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
    if (!hasChanges || saving) {
      return;
    }

    try {
      setSaving(true);

      await onSave({
        currentGoal: draftIsRestWeek
          ? null
          : draftCurrentGoal,
        isRestWeek: draftIsRestWeek,
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
              <Text style={styles.weeklyGoalDescription}>
                이번 주 몇 회 수련에 참여할지
                정해주세요.
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

                <View style={styles.weeklyGoalOptionRow}>
                  {GOAL_OPTIONS.map((goal) => {
                    const selected =
                      !draftIsRestWeek &&
                      draftCurrentGoal === goal;
                    const disabled =
                      saving ||
                      (attendanceCount > 0 &&
                        goal < minimumSelectableGoal);

                    return (
                      <GoalOptionButton
                        key={`current-${goal}`}
                        value={goal}
                        selected={selected}
                        disabled={disabled}
                        onPress={(value) => {
                          setDraftIsRestWeek(false);
                          setDraftCurrentGoal(value);
                        }}
                      />
                    );
                  })}
                </View>

                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{
                    selected: draftIsRestWeek,
                    disabled:
                      attendanceCount > 0 || saving,
                  }}
                  disabled={
                    attendanceCount > 0 || saving
                  }
                  onPress={() => {
                    setDraftIsRestWeek(true);
                    setDraftCurrentGoal(null);
                  }}
                  style={({ pressed }) => [
                    styles.weeklyGoalRestButton,
                    (attendanceCount > 0 || saving) &&
                      styles.weeklyGoalRestButtonDisabled,
                    draftIsRestWeek &&
                      styles.weeklyGoalRestButtonSelected,
                    pressed &&
                      attendanceCount === 0 &&
                      !saving &&
                      styles.weeklyGoalOptionButtonPressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.weeklyGoalRestButtonText,
                      (attendanceCount > 0 || saving) &&
                        styles.weeklyGoalOptionTextDisabled,
                      draftIsRestWeek &&
                        styles.weeklyGoalRestButtonTextSelected,
                    ]}
                  >
                    이번 주 목표 쉬기
                  </Text>
                </Pressable>

                {attendanceCount > 0 ? (
                  <Text style={styles.weeklyGoalRuleText}>
                    일반수련 출석을 시작해 이번 주 목표는
                    높이는 것만 가능해요.
                  </Text>
                ) : null}
              </View>

              <View style={styles.weeklyGoalDivider} />

              <View style={styles.weeklyGoalSection}>
                <Text style={styles.weeklyGoalSectionTitle}>
                  매주 반복
                </Text>

                <View style={styles.weeklyGoalOptionRow}>
                  {GOAL_OPTIONS.map((goal) => (
                    <GoalOptionButton
                      key={`recurring-${goal}`}
                      value={goal}
                      selected={
                        draftRecurringGoal === goal
                      }
                      disabled={saving}
                      onPress={setDraftRecurringGoal}
                    />
                  ))}
                </View>

                {recurringChanged &&
                attendanceCount > 0 &&
                savedCurrentGoal &&
                draftRecurringGoal < savedCurrentGoal ? (
                  <Text style={styles.weeklyGoalPendingText}>
                    낮춘 반복 목표는 다음 주부터
                    적용됩니다.
                  </Text>
                ) : pendingRecurringGoal &&
                  !recurringChanged ? (
                  <Text style={styles.weeklyGoalPendingText}>
                    다음 주부터 매주{" "}
                    {pendingRecurringGoal}회 목표가
                    적용됩니다.
                  </Text>
                ) : draftRecurringGoal ? (
                  <Text style={styles.weeklyGoalRuleText}>
                    매주 월요일마다 0 /{" "}
                    {draftRecurringGoal}회로 새로 시작해요.
                  </Text>
                ) : (
                  <Text style={styles.weeklyGoalRuleText}>
                    한 번 설정하면 매주 같은 목표가
                    자동으로 적용돼요.
                  </Text>
                )}
              </View>

              <View style={styles.weeklyGoalActionArea}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{
                    disabled:
                      !hasChanges || saving,
                  }}
                  disabled={!hasChanges || saving}
                  onPress={handleSave}
                  style={({ pressed }) => [
                    styles.weeklyGoalSaveButton,
                    (!hasChanges || saving) &&
                      styles.weeklyGoalSaveButtonDisabled,
                    pressed &&
                      hasChanges &&
                      !saving &&
                      styles.weeklyGoalSaveButtonPressed,
                  ]}
                >
                  {saving ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text
                      style={[
                        styles.weeklyGoalSaveButtonText,
                        !hasChanges &&
                          styles.weeklyGoalSaveButtonTextDisabled,
                      ]}
                    >
                      변경사항 저장
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
