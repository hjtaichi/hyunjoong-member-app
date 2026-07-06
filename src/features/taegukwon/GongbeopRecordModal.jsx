import React from "react";
import { Image, Modal, TextInput, TouchableOpacity, View } from "react-native";

export default function GongbeopRecordModal({
  visible,
  styles,
  todayGongbeopRecord,
  handleChangeTodayGongbeop,
  setRecordModalVisible,
  handleSaveGongbeopRecord,
}) {
  if (!visible) return null;

  return (
    <Modal visible transparent animationType="fade">
      <View style={styles.recordModalOverlay}>
        <View style={styles.imageModalCard}>
          <Image
            source={require("../../../assets/images/modal-today-record.png")}
            style={styles.imageModalBg}
            resizeMode="stretch"
          />

          <TouchableOpacity
            style={styles.modalCloseHotspot}
            onPress={() => setRecordModalVisible(false)}
          />

          <TextInput
            value={todayGongbeopRecord.ilsimyangui}
            onChangeText={(value) =>
              handleChangeTodayGongbeop("ilsimyangui", value)
            }
            keyboardType="numeric"
            style={[styles.imageModalInput, styles.modalInputOne]}
          />

          <TextInput
            value={todayGongbeopRecord.yobujeonsa}
            onChangeText={(value) =>
              handleChangeTodayGongbeop("yobujeonsa", value)
            }
            keyboardType="numeric"
            style={[styles.imageModalInput, styles.modalInputTwo]}
          />

          <TextInput
            value={todayGongbeopRecord.duyoMinutes}
            onChangeText={(value) =>
              handleChangeTodayGongbeop("duyoMinutes", value)
            }
            keyboardType="numeric"
            style={[styles.imageModalInput, styles.modalInputThree]}
          />

          <TextInput
            value={todayGongbeopRecord.ohaengjeonsa}
            onChangeText={(value) =>
              handleChangeTodayGongbeop("ohaengjeonsa", value)
            }
            keyboardType="numeric"
            style={[styles.imageModalInput, styles.modalInputFour]}
          />

          <TouchableOpacity
            style={styles.modalCancelHotspot}
            onPress={() => setRecordModalVisible(false)}
          />

          <TouchableOpacity
            style={styles.modalSaveHotspot}
            onPress={() => {
              setRecordModalVisible(false);

              setTimeout(() => {
                handleSaveGongbeopRecord();
              }, 300);
            }}
          />
        </View>
      </View>
    </Modal>
  );
}