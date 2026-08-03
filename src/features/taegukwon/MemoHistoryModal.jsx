import React, { useMemo } from "react";
import {
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  buildMemoHistoryList,
} from "./memoHistoryUtils";

export default function MemoHistoryModal({
  visible,
  styles,
  memberMemo,
  memberMemoHistory = [],
  deletingMemoId,
  handleDeleteMemberMemo,
  setMemoHistoryModalVisible,
}) {
  const memoList = useMemo(
    () =>
      buildMemoHistoryList({
        memberMemoHistory,
        memberMemo,
      }),
    [memberMemoHistory, memberMemo]
  );

  if (!visible) return null;

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={() =>
        setMemoHistoryModalVisible(false)
      }
    >
      <View style={styles.recordModalOverlay}>
        <View style={styles.memoHistoryModalCard}>
          <Text style={styles.memoHistoryModalTitle}>
            지난 수련 메모
          </Text>

          <TouchableOpacity
            style={styles.memoHistoryCloseButton}
            onPress={() =>
              setMemoHistoryModalVisible(false)
            }
            accessibilityRole="button"
            accessibilityLabel="지난 수련 메모 닫기"
          >
            <Text style={styles.memoHistoryCloseText}>
              ×
            </Text>
          </TouchableOpacity>

          <ScrollView
            style={styles.memoHistoryScroll}
            contentContainerStyle={
              styles.memoHistoryScrollContent
            }
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled
          >
            {memoList.length === 0 ? (
              <View style={styles.memoHistoryModalItem}>
                <Text
                  style={styles.memoHistoryContentText}
                >
                  아직 작성한 메모가 없습니다.
                </Text>
              </View>
            ) : (
              memoList.map((memo) => {
                const deleting =
                  deletingMemoId === memo.id;

                return (
                  <View
                    key={memo.id}
                    style={styles.memoHistoryModalItem}
                  >
                    <View
                      style={
                        styles.memoHistoryModalItemHeader
                      }
                    >
                      <Text
                        style={
                          styles.memoHistoryDateText
                        }
                      >
                        {memo.dateLabel}
                      </Text>

                      {memo.canDelete ? (
                        <TouchableOpacity
                          style={[
                            styles.memoHistoryDeleteButton,
                            deleting &&
                              styles.memoHistoryDeleteButtonDisabled,
                          ]}
                          disabled={
                            deleting ||
                            Boolean(deletingMemoId)
                          }
                          onPress={() =>
                            handleDeleteMemberMemo(memo)
                          }
                          accessibilityRole="button"
                          accessibilityLabel={`${memo.dateLabel} 수련 메모 삭제`}
                        >
                          <Text
                            style={
                              styles.memoHistoryDeleteText
                            }
                          >
                            {deleting
                              ? "삭제 중"
                              : "삭제"}
                          </Text>
                        </TouchableOpacity>
                      ) : null}
                    </View>

                    <Text
                      style={
                        styles.memoHistoryContentText
                      }
                    >
                      {memo.content}
                    </Text>
                  </View>
                );
              })
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
