// HJTAICHI_FORM_GOAL_PROMPT_MODAL_V18
import React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function FormGoalPromptModal({
  visible,
  mode = "notice",
  title,
  message,
  confirmLabel = "확인",
  cancelLabel = "취소",
  onConfirm,
  onClose,
}) {
  const isConfirm = mode === "confirm";

  return (
    <Modal
      visible={Boolean(visible)}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>
            {title || "안내"}
          </Text>

          <Text style={styles.message}>
            {message || ""}
          </Text>

          {isConfirm ? (
            <View style={styles.buttonRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.cancelButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={onClose}
              >
                <Text style={styles.cancelText}>
                  {cancelLabel || "취소"}
                </Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.confirmButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={onConfirm}
              >
                <Text style={styles.confirmText}>
                  {confirmLabel || "목표 저장"}
                </Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              style={({ pressed }) => [
                styles.confirmButton,
                styles.singleButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={onClose}
            >
              <Text style={styles.confirmText}>
                {confirmLabel || "확인"}
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: "rgba(57, 42, 32, 0.36)",
  },

  card: {
    width: "100%",
    maxWidth: 360,
    paddingHorizontal: 22,
    paddingTop: 25,
    paddingBottom: 18,
    borderRadius: 22,
    backgroundColor: "#FFFDF9",
    borderWidth: 1,
    borderColor: "#E8DDD2",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 8,
  },

  title: {
    marginBottom: 14,
    color: "#4C2D20",
    fontFamily: "MaruBuriBold",
    fontSize: 22,
    lineHeight: 25,
    textAlign: "center",
  },

  message: {
    marginBottom: 21,
    color: "#5E473B",
    fontFamily: "PretendardMedium",
    fontSize: 17,
    lineHeight: 24,
    textAlign: "center",
  },

  buttonRow: {
    flexDirection: "row",
    gap: 9,
  },

  cancelButton: {
    flex: 1,
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#EEE5D7",
  },

  confirmButton: {
    flex: 1,
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#866152",
  },

  singleButton: {
    width: "100%",
    flex: 0,
  },

  cancelText: {
    color: "#725B4E",
    fontFamily: "PretendardSemiBold",
    fontSize: 16,
  },

  confirmText: {
    color: "#FFFFFF",
    fontFamily: "PretendardSemiBold",
    fontSize: 16,
  },

  buttonPressed: {
    opacity: 0.84,
  },
});
