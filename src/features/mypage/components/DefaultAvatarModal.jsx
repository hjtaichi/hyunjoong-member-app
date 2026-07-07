import React from "react";
import { Image, Modal, Pressable, Text, View } from "react-native";

import { avatarImages } from "../mypageImages";

export default function DefaultAvatarModal({
  visible,
  onClose,
  styles,
  avatarTab,
  setAvatarTab,
  avatarKeys,
  selectedAvatar,
  submittingAccount,
  handleUseDefaultAvatar,
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.defaultAvatarModalCard}>
          <Text style={styles.modalTitle}>기본 프로필 선택</Text>
          <Text style={styles.modalDesc}>사용할 기본 이미지를 선택해주세요.</Text>

          <View style={styles.avatarTabRow}>
            <Pressable
              style={[
                styles.avatarTabButton,
                avatarTab === "animal" && styles.avatarTabButtonActive,
              ]}
              onPress={() => setAvatarTab("animal")}
            >
              <Text
                style={[
                  styles.avatarTabText,
                  avatarTab === "animal" && styles.avatarTabTextActive,
                ]}
              >
                동물
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.avatarTabButton,
                avatarTab === "person" && styles.avatarTabButtonActive,
              ]}
              onPress={() => setAvatarTab("person")}
            >
              <Text
                style={[
                  styles.avatarTabText,
                  avatarTab === "person" && styles.avatarTabTextActive,
                ]}
              >
                사람
              </Text>
            </Pressable>
          </View>

          <View style={styles.defaultAvatarGrid}>
            {avatarKeys.map((avatarKey) => {
              const isSelected = selectedAvatar === avatarKey;

              return (
                <Pressable
                  key={avatarKey}
                  style={[
                    styles.defaultAvatarButton,
                    isSelected && styles.defaultAvatarButtonSelected,
                  ]}
                  onPress={() => handleUseDefaultAvatar(avatarKey)}
                  disabled={submittingAccount}
                >
                  <Image
                    source={avatarImages[avatarKey]}
                    style={styles.defaultAvatarImage}
                    resizeMode="cover"
                  />
                </Pressable>
              );
            })}
          </View>

          <Pressable
            style={styles.avatarCloseButton}
            onPress={onClose}
            disabled={submittingAccount}
          >
            <Text style={styles.avatarCloseButtonText}>
              {submittingAccount ? "처리 중..." : "닫기"}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}