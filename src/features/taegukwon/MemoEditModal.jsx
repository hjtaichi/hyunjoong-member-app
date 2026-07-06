import React from "react";
import { Modal, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function MemoEditModal({
  visible,
  styles,
  editMemberMemo,
  setEditMemberMemo,
  maxLength,
  savingMemo,
  setMemoEditModalVisible,
  handleSaveMemberMemo,
}) {
  if (!visible) return null;

  return (
    <Modal visible transparent animationType="fade">
      <View style={styles.recordModalOverlay}>
        <View style={styles.memoEditModalCard}>
          <Text style={styles.memoHistoryModalTitle}>내 수련 메모</Text>

          <TouchableOpacity
            style={styles.memoHistoryCloseButton}
            onPress={() => setMemoEditModalVisible(false)}
          >
            <Text style={styles.memoHistoryCloseText}>×</Text>
          </TouchableOpacity>

          <TextInput
            value={editMemberMemo}
            onChangeText={setEditMemberMemo}
            maxLength={maxLength}
            style={styles.memoEditModalInput}
            placeholder="오늘 수련하며 느낀 점을 적어보세요."
            placeholderTextColor="#a99585"
            multiline
            textAlignVertical="top"
          />

          <Text style={styles.memoLimitText}>
            최대 {maxLength}자까지 적을 수 있어요. ({editMemberMemo.length}/{maxLength})
          </Text>

          <View style={styles.memoEditModalButtonRow}>
            <TouchableOpacity
              style={styles.memoEditCancelButton}
              onPress={() => setMemoEditModalVisible(false)}
            >
              <Text style={styles.memoEditCancelText}>취소</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.memoEditSaveButton}
              disabled={savingMemo}
              onPress={handleSaveMemberMemo}
            >
              <Text style={styles.memoEditSaveText}>
                {savingMemo ? "저장 중..." : "저장"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}