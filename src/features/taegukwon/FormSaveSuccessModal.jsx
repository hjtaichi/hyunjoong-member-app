import React from "react";
import {
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function FormSaveSuccessModal({
  visible,
  styles,
  title,
  message,
  onClose,
}) {
  if (!visible) return null;

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.recordModalOverlay}>
        <View style={styles.completionModalCard}>
          <Text style={styles.completionTitle}>
            {title}
          </Text>

          <Text style={styles.completionText}>
            {message}
          </Text>

          <View style={styles.completionButtonRow}>
            <TouchableOpacity
              style={[
                styles.completionSaveButton,
                { flex: 1 },
              ]}
              activeOpacity={0.86}
              onPress={onClose}
            >
              <Text style={styles.completionSaveText}>
                확인
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
