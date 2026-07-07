import React from "react";
import { Modal, Pressable, Text } from "react-native";

export default function AvatarActionModal({
  visible,
  onClose,
  styles,
  submittingAccount,
  handlePickProfileFromAlbum,
  handlePickProfileFromCamera,
  openDefaultAvatarPicker,
  handleUseNoProfileImage,
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.avatarMenuOverlay} onPress={onClose}>
        <Pressable
          style={styles.avatarSmallMenu}
          onPress={(event) => event.stopPropagation()}
        >
          <Pressable
            style={styles.avatarSmallMenuItem}
            onPress={handlePickProfileFromAlbum}
            disabled={submittingAccount}
          >
            <Text style={styles.avatarSmallMenuText}>앨범에서 사진 선택</Text>
          </Pressable>

          <Pressable
            style={styles.avatarSmallMenuItem}
            onPress={handlePickProfileFromCamera}
            disabled={submittingAccount}
          >
            <Text style={styles.avatarSmallMenuText}>카메라로 촬영</Text>
          </Pressable>

          <Pressable
            style={styles.avatarSmallMenuItem}
            onPress={openDefaultAvatarPicker}
            disabled={submittingAccount}
          >
            <Text style={styles.avatarSmallMenuText}>기본 이미지 적용</Text>
          </Pressable>

          <Pressable
            style={styles.avatarSmallMenuItem}
            onPress={handleUseNoProfileImage}
            disabled={submittingAccount}
          >
            <Text style={[styles.avatarSmallMenuText, styles.avatarSmallMenuDanger]}>
              사진 사용 안 함
            </Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}