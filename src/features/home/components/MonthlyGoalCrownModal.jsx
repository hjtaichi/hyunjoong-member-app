// HJTAICHI_MONTHLY_GOAL_CROWN_MODAL_V1
import React from "react";
import {
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function MonthlyGoalCrownModal({
  visible,
  streakWeekCount,
  onClose,
}) {
  const weekCount = Math.max(
    1,
    Math.trunc(Number(streakWeekCount || 0)),
  );

  return (
    <Modal
      transparent
      visible={visible === true}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={modalStyles.overlay}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="출석 목표 달성왕 안내 닫기"
          style={StyleSheet.absoluteFill}
          onPress={onClose}
        />

        <View style={modalStyles.card}>
          <View style={modalStyles.glow} />

          <Image
            source={require("../../../../assets/images/monthly-goal-crown.png")}
            style={modalStyles.crown}
            resizeMode="contain"
          />

          <Text style={modalStyles.title}>
            👑 출석 목표 달성왕!
          </Text>

          <View style={modalStyles.divider} />

          <Text style={modalStyles.description}>
            지난 {weekCount}주 연속 출석 목표를 달성했어요.
          </Text>
          <Text style={modalStyles.description}>
            이대로라면 금방 고수가 되시겠어요!
          </Text>
          <Text style={modalStyles.cheer}>
            다음 달 왕관도 노려볼까요? ✨
          </Text>

          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [
              modalStyles.closeButton,
              pressed && modalStyles.closeButtonPressed,
            ]}
            onPress={onClose}
          >
            <Text style={modalStyles.closeButtonText}>
              확인
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    backgroundColor: "rgba(24, 18, 15, 0.46)",
  },
  card: {
    width: "100%",
    maxWidth: 340,
    minHeight: 365,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 22,
    alignItems: "center",
    overflow: "hidden",
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "rgba(205, 168, 103, 0.76)",
    backgroundColor: "rgba(255, 252, 248, 0.97)",
    shadowColor: "#2A1B12",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.26,
    shadowRadius: 26,
    elevation: 18,
  },
  glow: {
    position: "absolute",
    top: -80,
    width: 250,
    height: 200,
    borderRadius: 999,
    backgroundColor: "rgba(228, 190, 116, 0.18)",
  },
  crown: {
    width: 120,
    height: 94,
    marginTop: 3,
    marginBottom: 7,
    transform: [{ rotate: "-32deg" }],
  },
  title: {
    fontSize: 22,
    lineHeight: 30,
    fontFamily: "MaruBuriBold",
    color: "#4E3528",
    textAlign: "center",
  },
  divider: {
    width: 38,
    height: 2,
    marginTop: 12,
    marginBottom: 16,
    borderRadius: 999,
    backgroundColor: "#CDA867",
  },
  description: {
    fontSize: 15,
    lineHeight: 23,
    fontFamily: "PretendardMedium",
    color: "#725B4E",
    textAlign: "center",
  },
  cheer: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 23,
    fontFamily: "PretendardBold",
    color: "#9B6420",
    textAlign: "center",
  },
  closeButton: {
    minWidth: 122,
    minHeight: 44,
    marginTop: 24,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: "#65483A",
  },
  closeButtonPressed: {
    opacity: 0.82,
  },
  closeButtonText: {
    fontSize: 15,
    fontFamily: "PretendardBold",
    color: "#FFF9EF",
  },
});