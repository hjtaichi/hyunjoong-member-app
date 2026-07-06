import React from "react";
import { Image, Modal, TextInput, TouchableOpacity, View } from "react-native";

export default function GongbeopGoalModal({
  visible,
  styles,
  gongbeopGoals,
  handleChangeGongbeopGoal,
  setGoalModalVisible,
  handleSaveGongbeopGoals,
}) {
  if (!visible) return null;

  return (
    <Modal visible transparent animationType="fade">
      <View style={styles.recordModalOverlay}>
        <View style={styles.imageModalCard}>
          <Image
            source={require("../../../assets/images/modal-goal-setting.png")}
            style={styles.imageModalBg}
            resizeMode="contain"
          />

          <TouchableOpacity
            style={styles.modalCloseHotspot}
            onPress={() => setGoalModalVisible(false)}
          />

          <TextInput
            value={gongbeopGoals.ilsimyangui}
            onChangeText={(value) =>
              handleChangeGongbeopGoal("ilsimyangui", value)
            }
            keyboardType="numeric"
            style={[styles.imageModalInput, styles.modalInputOne]}
          />

          <TextInput
            value={gongbeopGoals.yobujeonsa}
            onChangeText={(value) =>
              handleChangeGongbeopGoal("yobujeonsa", value)
            }
            keyboardType="numeric"
            style={[styles.imageModalInput, styles.modalInputTwo]}
          />

          <TextInput
            value={gongbeopGoals.duyoMinutes}
            onChangeText={(value) =>
              handleChangeGongbeopGoal("duyoMinutes", value)
            }
            keyboardType="numeric"
            style={[styles.imageModalInput, styles.modalInputThree]}
          />

          <TextInput
            value={gongbeopGoals.ohaengjeonsa}
            onChangeText={(value) =>
              handleChangeGongbeopGoal("ohaengjeonsa", value)
            }
            keyboardType="numeric"
            style={[styles.imageModalInput, styles.modalInputFour]}
          />

          <TouchableOpacity
            style={styles.modalCancelHotspot}
            onPress={() => setGoalModalVisible(false)}
          />

          <TouchableOpacity
            style={[styles.modalSaveHotspot, { zIndex: 30, elevation: 30 }]}
            activeOpacity={0.8}
            onPress={handleSaveGongbeopGoals}
          />
        </View>
      </View>
    </Modal>
  );
}