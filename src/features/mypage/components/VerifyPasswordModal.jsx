import React from "react";
import { Modal, Pressable, Text, TextInput, View } from "react-native";
import { colors } from "../../../theme";

export default function VerifyPasswordModal({
  visible,
  onClose,
  styles,
  verifyPassword,
  setVerifyPassword,
  submittingAccount,
  handleVerifyPasswordForEdit,
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>비밀번호 확인</Text>

          <Text style={styles.modalDesc}>
            내정보 수정을 위해 현재 비밀번호를 한 번 더 입력해주세요.
          </Text>

          <TextInput
            style={styles.input}
            placeholder="현재 비밀번호"
            placeholderTextColor={colors.textSub}
            secureTextEntry
            value={verifyPassword}
            onChangeText={setVerifyPassword}
          />

          <View style={styles.modalButtonRow}>
            <Pressable
              style={[styles.modalButton, styles.modalCancelButton]}
              onPress={() => {
                setVerifyPassword("");
                onClose();
              }}
              disabled={submittingAccount}
            >
              <Text style={styles.modalCancelButtonText}>취소</Text>
            </Pressable>

            <Pressable
              style={[styles.modalButton, styles.modalPrimaryButton]}
              onPress={handleVerifyPasswordForEdit}
              disabled={submittingAccount}
            >
              <Text style={styles.modalPrimaryButtonText}>
                {submittingAccount ? "확인 중..." : "확인"}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}