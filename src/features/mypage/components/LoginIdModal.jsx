import React from "react";
import { Modal, Pressable, Text, TextInput, View } from "react-native";
import { colors } from "../../../theme";

export default function LoginIdModal({
  visible,
  onClose,
  styles,
  newLoginId,
  setNewLoginId,
  submittingAccount,
  handleChangeLoginId,
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>최초 아이디 변경</Text>

          <Text style={styles.modalDesc}>
            정회원 전환 후 1회에 한하여{"\n"}
            원하는 로그인 아이디로 변경할 수 있습니다.
          </Text>

          <TextInput
            style={styles.input}
            placeholder="새 로그인 아이디"
            placeholderTextColor={colors.textSub}
            autoCapitalize="none"
            autoCorrect={false}
            value={newLoginId}
            onChangeText={setNewLoginId}
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
              onPress={handleChangeLoginId}
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