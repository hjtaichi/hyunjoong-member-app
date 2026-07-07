import React from "react";
import { Modal, Pressable, Text, TextInput, View } from "react-native";
import { colors } from "../../../theme";
import { onlyNumbers } from "../mypageUtils";

export default function PhoneModal({
  visible,
  onClose,
  styles,
  newPhone,
  setNewPhone,
  submittingAccount,
  handleChangePhone,
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>연락처 저장</Text>

<Text style={styles.modalDesc}>
  연락처는 선택 입력 항목입니다. 도장 안내가 필요할 때만 사용됩니다.
</Text>

          <TextInput
            style={styles.input}
            placeholder="01000000000"
            placeholderTextColor={colors.textSub}
            keyboardType="phone-pad"
            value={newPhone}
            onChangeText={(value) => setNewPhone(onlyNumbers(value))}
            maxLength={11}
          />

          <View style={styles.modalButtonRow}>
            <Pressable
              style={[styles.modalButton, styles.modalCancelButton]}
              onPress={onClose}
              disabled={submittingAccount}
            >
              <Text style={styles.modalCancelButtonText}>취소</Text>
            </Pressable>

            <Pressable
              style={[styles.modalButton, styles.modalPrimaryButton]}
              onPress={handleChangePhone}
              disabled={submittingAccount}
            >
              <Text style={styles.modalPrimaryButtonText}>
                {submittingAccount ? "변경 중..." : "변경하기"}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}