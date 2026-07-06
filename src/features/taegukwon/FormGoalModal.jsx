import React from "react";
import {
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function FormGoalModal({
  visible,
  styles,
  accessibleForms,
  selectedFormId,
  featuredFormId,
  formGoalCount,
  currentPeriodLabel,
  setSelectedFormId,
  setFormGoalCount,
  setFormGoalModalVisible,
  handleSaveFavoriteForm,
  handleSaveFormGoal,
}) {
  if (!visible) return null;

  return (
    <Modal visible transparent animationType="fade">
      <View style={styles.recordModalOverlay}>
        <View style={styles.formRecordModalCard}>
          <Text style={styles.formModalTitle}>투로 목표 설정</Text>

          <TouchableOpacity
            style={styles.formModalClose}
            onPress={() => setFormGoalModalVisible(false)}
          >
            <Text style={styles.formModalCloseText}>×</Text>
          </TouchableOpacity>

          <Text style={styles.formModalDesc}>
            대표로 보여줄 투로에 별표를 선택해주세요.{"\n"}
            별표가 없는 투로도 목표 설정과 기록이 가능합니다.
          </Text>

          <View style={{ gap: 8, marginBottom: 18 }}>
            {accessibleForms.map((item) => {
              const selected = item.id === selectedFormId;
              const isFeatured = item.id === featuredFormId;

              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.goalFormSelectCard,
                    selected && styles.goalFormSelectCardSelected,
                  ]}
                  activeOpacity={0.86}
                  onPress={() => {
                    setSelectedFormId(item.id);
                    setFormGoalCount(
                      item.targetCount ? String(item.targetCount) : ""
                    );
                  }}
                >
                  <View style={styles.goalFormSelectTextWrap}>
                    <Text style={styles.goalFormSelectName}>{item.name}</Text>
                    <Text style={styles.goalFormSelectMeta}>
                      현재 목표 {item.targetCount || 0}회
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.featuredStarButton,
                      isFeatured && styles.featuredStarButtonActive,
                    ]}
                    activeOpacity={0.8}
                    onPress={() => handleSaveFavoriteForm(item.id)}
                  >
                    <Text
                      style={[
                        styles.featuredStarText,
                        isFeatured && styles.featuredStarTextActive,
                      ]}
                    >
                      ★
                    </Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.goalInputSection}>
            <Text style={styles.goalInputLabel}>
              {currentPeriodLabel} 목표 횟수
            </Text>

            <Text style={styles.goalInputHint}>
              1회 이상 9,999,999회 이하로 입력 가능
            </Text>

            <View style={styles.goalInputBox}>
              <TextInput
                value={formGoalCount}
                onChangeText={(value) => {
                  const numericOnly = value.replace(/[^0-9]/g, "").slice(0, 7);
                  setFormGoalCount(numericOnly);
                }}
                keyboardType="numeric"
                maxLength={7}
                style={styles.goalCountInput}
                placeholder="100"
                placeholderTextColor="#B8A99D"
              />

              <Text style={styles.goalInputUnit}>회</Text>
            </View>
          </View>

          <View style={styles.formModalButtonRow}>
            <TouchableOpacity
              style={styles.formModalCancelButton}
              onPress={() => setFormGoalModalVisible(false)}
            >
              <Text style={styles.formModalCancelText}>취소</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.formModalSaveButton}
              onPress={handleSaveFormGoal}
            >
              <Text style={styles.formModalSaveText}>목표 저장</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}