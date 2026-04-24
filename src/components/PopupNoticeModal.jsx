import React from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
} from "react-native";

export default function PopupNoticeModal({
  visible,
  notice,
  onClose,
  onHideToday,
  onDetail,
}) {
  if (!notice) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.badge}>공지</Text>
          <Text style={styles.title}>{notice.title}</Text>

          <ScrollView style={styles.bodyWrap}>
            <Text style={styles.body}>{notice.content}</Text>
          </ScrollView>

          <View style={styles.buttonRow}>
            {notice.allowHideToday ? (
              <Pressable style={styles.secondaryButton} onPress={onHideToday}>
                <Text style={styles.secondaryText}>오늘 하루 보지 않기</Text>
              </Pressable>
            ) : null}

            <Pressable style={styles.detailButton} onPress={onDetail}>
              <Text style={styles.detailText}>자세히 보기</Text>
            </Pressable>
          </View>

          {notice.allowClose ? (
            <Pressable style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeText}>닫기</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(17,24,39,0.45)",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    maxHeight: "80%",
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#EEF2FF",
    color: "#3730A3",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    fontWeight: "700",
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 12,
  },
  bodyWrap: {
    maxHeight: 260,
  },
  body: {
    fontSize: 15,
    color: "#374151",
    lineHeight: 23,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  secondaryText: {
    color: "#374151",
    fontWeight: "700",
  },
  detailButton: {
    flex: 1,
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  detailText: {
    color: "#fff",
    fontWeight: "700",
  },
  closeButton: {
    marginTop: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  closeText: {
    color: "#6B7280",
    fontWeight: "600",
  },
});