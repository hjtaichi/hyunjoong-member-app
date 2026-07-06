import React from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function MemoHistoryModal({
  visible,
  styles,
  personalProgress,
  previousMemoHistory,
  setMemoHistoryModalVisible,
}) {
  if (!visible) return null;

  return (
    <Modal visible transparent animationType="fade">
      <View style={styles.recordModalOverlay}>
        <View style={styles.memoHistoryModalCard}>
          <Text style={styles.memoHistoryModalTitle}>지난 수련 메모</Text>

          <TouchableOpacity
            style={styles.memoHistoryCloseButton}
            onPress={() => setMemoHistoryModalVisible(false)}
          >
            <Text style={styles.memoHistoryCloseText}>×</Text>
          </TouchableOpacity>

          <ScrollView
            style={styles.memoHistoryScroll}
            contentContainerStyle={styles.memoHistoryScrollContent}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled
          >
            {[
              personalProgress?.memberMemo
                ? {
                    id: "current",
                    createdAt: new Date().toISOString(),
                    content: personalProgress.memberMemo,
                  }
                : null,
              ...previousMemoHistory,
            ]
              .filter(Boolean)
              .map((memo) => (
                <View key={memo.id} style={styles.memoHistoryModalItem}>
                  <Text style={styles.memoHistoryDateText}>
                    {new Date(memo.createdAt).toLocaleDateString("ko-KR")}
                  </Text>
                  <Text style={styles.memoHistoryContentText}>
                    {memo.content}
                  </Text>
                </View>
              ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}