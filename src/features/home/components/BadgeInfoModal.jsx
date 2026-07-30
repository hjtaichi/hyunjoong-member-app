// HJTAICHI_BADGE_INFO_MODAL_V1
import React from "react";
import {
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { getMemberBadgeImageSource } from "../memberBadges";

export default function BadgeInfoModal({ badge, onClose }) {
  const visible = Boolean(badge);
  const imageSource = getMemberBadgeImageSource(badge?.code);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={modalStyles.overlay}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="뱃지 설명 닫기"
          style={StyleSheet.absoluteFill}
          onPress={onClose}
        />

        <View style={modalStyles.card}>
          <View style={modalStyles.glow} />

          {imageSource ? (
            <Image
              source={imageSource}
              style={modalStyles.badgeImage}
              resizeMode="contain"
            />
          ) : null}

          <Text style={modalStyles.title}>{badge?.title || "회원 뱃지"}</Text>
          <View style={modalStyles.divider} />
          <Text style={modalStyles.description}>{badge?.description || ""}</Text>

          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [
              modalStyles.closeButton,
              pressed && modalStyles.closeButtonPressed,
            ]}
            onPress={onClose}
          >
            <Text style={modalStyles.closeButtonText}>확인</Text>
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
    minHeight: 320,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 22,
    alignItems: "center",
    overflow: "hidden",
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "rgba(205, 168, 103, 0.72)",
    backgroundColor: "rgba(255, 252, 248, 0.95)",
    shadowColor: "#2A1B12",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.26,
    shadowRadius: 26,
    elevation: 18,
  },
  glow: {
    position: "absolute",
    top: -70,
    width: 230,
    height: 180,
    borderRadius: 999,
    backgroundColor: "rgba(228, 190, 116, 0.16)",
  },
  badgeImage: {
    width: 112,
    height: 112,
    marginBottom: 14,
  },
  title: {
    fontSize: 23,
    lineHeight: 31,
    fontFamily: "MaruBuriBold",
    color: "#4E3528",
    textAlign: "center",
  },
  divider: {
    width: 38,
    height: 2,
    marginTop: 12,
    marginBottom: 14,
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
