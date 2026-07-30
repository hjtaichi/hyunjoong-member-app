import React from "react";
import { Modal, Pressable, Text, TextInput, View } from "react-native";
import styles from "../styles/showroomStyles";

export default function SaveNameModal({ visible, editingFavoriteId, favoriteName, onChangeName, onClose, onConfirm }) {
  return <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <View style={styles.nameModalBackdrop}><View style={styles.nameDialog}>
      <Text style={styles.nameDialogTitle}>{editingFavoriteId ? "즐겨찾기 이름 변경" : "즐겨찾기 이름"}</Text>
      <Text style={styles.nameDialogHint}>기억하기 쉬운 이름을 입력해주세요.</Text>
      <TextInput value={favoriteName} onChangeText={onChangeName} autoFocus maxLength={20} placeholder="예: 심사복, 겨울 수련복" placeholderTextColor="#A89A90" style={styles.nameInput} returnKeyType="done" onSubmitEditing={onConfirm} />
      <View style={styles.nameDialogActions}><Pressable style={[styles.nameDialogButton, styles.nameCancelButton]} onPress={onClose}><Text style={styles.nameCancelText}>취소</Text></Pressable><Pressable style={[styles.nameDialogButton, styles.nameSaveButton]} onPress={onConfirm}><Text style={styles.nameSaveText}>저장</Text></Pressable></View>
    </View></View>
  </Modal>;
}
