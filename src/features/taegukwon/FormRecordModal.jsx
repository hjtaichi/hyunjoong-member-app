import React from "react";
import {
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function FormRecordModal({
  visible,
  styles,
  selectedForm,
  formRecordCount,
  setFormRecordCount,
  setFormRecordModalVisible,
  handleSaveFormRecord,
}) {
  if (!visible) return null;

  return (
    <Modal visible transparent animationType="fade">
      <View style={styles.recordModalOverlay}>
        <View style={styles.formRecordModalCard}>
          <Text style={styles.formModalTitle}>오늘 투로 기록</Text>

          <TouchableOpacity
            style={styles.formModalClose}
            onPress={() => setFormRecordModalVisible(false)}
          >
            <Text style={styles.formModalCloseText}>×</Text>
          </TouchableOpacity>

          <Text style={styles.formModalName}>
            {selectedForm?.name || "투로"}
          </Text>

          <Text style={styles.formModalDesc}>
            오늘 몇 회 수련하셨나요?
          </Text>

          <View style={styles.formCountStepper}>
            <TouchableOpacity
              style={styles.formStepperButton}
              onPress={() =>
                setFormRecordCount((prev) =>
                  String(Math.max(Number(prev || 0) - 1, 0))
                )
              }
            >
              <Text style={styles.formStepperText}>−</Text>
            </TouchableOpacity>

            <TextInput
              value={formRecordCount}
              onChangeText={(value) =>
                setFormRecordCount(value.replace(/[^0-9]/g, ""))
              }
              keyboardType="numeric"
              style={styles.formCountInput}
            />

            <TouchableOpacity
              style={styles.formStepperButton}
              onPress={() =>
                setFormRecordCount((prev) =>
                  String(Number(prev || 0) + 1)
                )
              }
            >
              <Text style={styles.formStepperText}>＋</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.quickCountRow}>
            {["1", "2", "3", "5"].map((count) => (
              <TouchableOpacity
                key={count}
                style={styles.quickCountButton}
                onPress={() => setFormRecordCount(count)}
              >
                <Text style={styles.quickCountText}>
                  {count}회
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.formModalButtonRow}>
            <TouchableOpacity
              style={styles.formModalCancelButton}
              onPress={() => setFormRecordModalVisible(false)}
            >
              <Text style={styles.formModalCancelText}>
                취소
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.formModalSaveButton}
              onPress={handleSaveFormRecord}
            >
              <Text style={styles.formModalSaveText}>
                기록 저장
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}