import React from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";

export default function CompletionModal({
  visible,
  styles,
  completedGoalNames,
  completionModalType,
  setCompletionModalVisible,
  setGoalModalVisible,
  setFormGoalModalVisible,
}) {
  if (!visible) return null;

  return (
    <Modal visible transparent animationType="fade">
      <View style={styles.recordModalOverlay}>
        <View style={styles.completionModalCard}>
          <Text style={styles.completionTitle}>축하합니다!</Text>

          <Text style={styles.completionText}>
            {completedGoalNames.join(", ")}
            {"\n"}목표를 달성하셨습니다.
          </Text>

          <Text style={styles.completionSubText}>
            새 목표를 설정하고 수련을 이어가세요.
          </Text>

          <View style={styles.completionButtonRow}>
            <TouchableOpacity
              style={styles.completionCancelButton}
              onPress={() => setCompletionModalVisible(false)}
            >
              <Text style={styles.completionCancelText}>나중에</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.completionSaveButton}
              onPress={() => {
                setCompletionModalVisible(false);

                if (completionModalType === "form") {
                  setFormGoalModalVisible(true);
                } else {
                  setGoalModalVisible(true);
                }
              }}
            >
              <Text style={styles.completionSaveText}>목표 재설정</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}