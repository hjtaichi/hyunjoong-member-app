import React from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function MemoHistoryModal({
  visible,
  styles,
  memberMemo,
  previousMemoHistory = [],
  setMemoHistoryModalVisible,
}) {
  if (!visible) return null;

  const memoList = [
    memberMemo
      ? {
          id: "current",
          createdAt: new Date().toISOString(),
          content: memberMemo,
        }
      : null,
    ...previousMemoHistory,
  ].filter(Boolean);

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
            {memoList.length === 0 ? (
              <View style={styles.memoHistoryModalItem}>
                <Text style={styles.memoHistoryContentText}>
                  아직 작성한 메모가 없습니다.
                </Text>
              </View>
            ) : (
              memoList.map((memo) => (
                <View key={memo.id} style={styles.memoHistoryModalItem}>
                  <Text style={styles.memoHistoryDateText}>
                    {new Date(memo.createdAt).toLocaleDateString("ko-KR")}
                  </Text>
                  <Text style={styles.memoHistoryContentText}>
                    {memo.content}
                  </Text>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}