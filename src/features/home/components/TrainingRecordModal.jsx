import React from "react";
import { Modal, Pressable, Text, View } from "react-native";

import { styles } from "../homeStyles";

export default function TrainingRecordModal({
  visible,
  onClose,
  onGongbeopPress,
  onFormRecordPress,
}) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.recordSelectCardThin}>
          <Pressable style={styles.recordSelectClose} onPress={onClose}>
            <Text style={styles.recordSelectCloseText}>×</Text>
          </Pressable>

          <View style={styles.recordSelectThinRow}>
            <Pressable
              style={styles.recordSelectThinItem}
              onPress={onGongbeopPress}
            >
              <Text style={styles.recordSelectThinText}>공력 기록</Text>
            </Pressable>

            <View style={styles.recordSelectDivider} />

            <Pressable
              style={styles.recordSelectThinItem}
              onPress={onFormRecordPress}
            >
              <Text style={styles.recordSelectThinText}>투로 기록</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}