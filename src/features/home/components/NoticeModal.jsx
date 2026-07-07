import React from "react";
import {
  Modal,
  View,
  Text,
  ScrollView,
  Pressable,
} from "react-native";

import { styles } from "../homeStyles";
export default function NoticeModal({
  visible,
  activeNotice,
  onClose,
  onHideToday,
  onDetail,
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.noticeModalCard}>
          <Text style={styles.noticeModalLabel}>최근 공지</Text>

          <Text style={styles.noticeModalTitle}>
            {activeNotice?.title || "공지"}
          </Text>

          <ScrollView style={styles.noticeModalBody}>
            <Text style={styles.noticeModalContent}>
              {activeNotice?.content || ""}
            </Text>
          </ScrollView>

          <View style={styles.noticeButtonRow}>
            <Pressable
              style={[
                styles.noticeButton,
                styles.noticeButtonSecondary,
              ]}
              onPress={onHideToday}
            >
              <Text style={styles.noticeButtonSecondaryText}>
                오늘 하루 보지 않기
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.noticeButton,
                styles.noticeButtonPrimary,
              ]}
              onPress={onClose}
            >
              <Text style={styles.noticeButtonPrimaryText}>
                닫기
              </Text>
            </Pressable>
          </View>

          <Pressable
            style={styles.noticeDetailButton}
            onPress={onDetail}
          >
            <Text style={styles.noticeDetailButtonText}>
              자세히 보기
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
