import React from "react";
import {
  Alert,
  Platform,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import {
  FORM_IMAGES,
  FORM_IMAGE_STYLES,
  getFormCategory,
} from "./taegukwonMeta";

function hasActiveFormGoal(form) {
  const targetCount = Number(form?.targetCount || 0);

  if (targetCount <= 0) {
    return false;
  }

  if (form?.isActive === false) {
    return false;
  }

  const status = String(form?.status || "").toLowerCase();

  if (status && status !== "active") {
    return false;
  }

  return true;
}

function showFormGoalRequiredAlert() {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined") {
      window.alert("목표를 먼저 설정하세요.");
    }
    return;
  }

  Alert.alert("안내", "목표를 먼저 설정하세요.");
}

export default function FormRecordSection({
  styles,
  currentPeriodYear,
  currentPeriodLabel,
  currentPeriodSub,
  accessibleForms,
  featuredForm,
  otherForms,
  memberRank,
  setSelectedFormId,
  setFormGoalCount,
  setFormGoalModalVisible,
  setFormRecordCount,
  setFormRecordModalVisible,
}) {

  return (
    <>
        <View style={styles.formRecordSection}>
          <View style={styles.formPeriodRow}>
            <View>
              <Text style={styles.formPeriodTitle}>
                {currentPeriodYear}년 {currentPeriodLabel}
              </Text>
              <Text style={styles.formPeriodSub}>{currentPeriodSub}</Text>
            </View>
            <TouchableOpacity
              style={styles.formPeriodTextButton}
              activeOpacity={0.85}
              onPress={() => router.push("/form-activity-by-date")}
            >
              <Text style={styles.formPeriodTextButtonLabel}>지난 기록 보기 〉</Text>
            </TouchableOpacity>
          </View>
      
          <View style={styles.formTipCardNew}>
            <View>
              <Text style={styles.formTipTitleNew}>Tip</Text>
              <Text style={styles.formTipTextNew}>
                다 배운 투로를 반복하여 몸에 익히는 기록입니다.
              </Text>
            </View>
            <Image
        source={require("../../../assets/images/form-records/tip-flower.png")}
        style={styles.formTipFlower}
        resizeMode="contain"
      />
          </View>
      
          <View style={styles.formSectionHeaderRowNew}>
            <Text style={styles.formSectionTitleNew}>현재 연습 중인 투로</Text>
      
            <TouchableOpacity
              onPress={() => {
                const firstForm = accessibleForms[0];
      
                if (!firstForm) {
                  Alert.alert("안내", "설정 가능한 투로가 없습니다.");
                  return;
                }
      
                setSelectedFormId(firstForm.id);
                setFormGoalCount(firstForm.targetCount ? String(firstForm.targetCount) : "");
                setFormGoalModalVisible(true);
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.formGoalTextButton}>목표 설정 〉</Text>
            </TouchableOpacity>
          </View>
      
          {featuredForm ? (() => {
            const target = Number(featuredForm.targetCount || 0);
            const current = Number(
        featuredForm.currentCount ||
        featuredForm.completedCount ||
        0
      );
            const remain = Math.max(target - current, 0);
            const percent = target
        ? Math.round((current / target) * 100)
        : 0;
      
            return (
              <View style={styles.featuredFormCard}>
                <Image
        source={require("../../../assets/images/form-records/ink-circle.png")}
        style={styles.featuredInkCircleImage}
        resizeMode="contain"
      />
      
                {FORM_IMAGES[featuredForm.id] ? (
                  <Image
                    source={FORM_IMAGES[featuredForm.id]}
                    style={[
        styles.featuredFormImage,
        FORM_IMAGE_STYLES[featuredForm.id]?.featured,
      ]}
                    resizeMode="contain"
                  />
                ) : null}
      
                <View style={styles.featuredFormContent}>
                  <Text style={styles.featuredFormTitle}>
        {featuredForm.name.replace(/ (\d+식)$/, "\n$1")}
      </Text>
                  <Text style={styles.featuredFormCategory}>
                    {getFormCategory(featuredForm.id)}
                  </Text>
      
                  <Text style={styles.featuredFormCount}>
                    {current}회 기록 · 목표 {target || 0}회
                  </Text>
      
                  <Text style={styles.featuredFormRemain}>
                    {target > 0
                      ? `앞으로 ${remain}회 더 수련하면 목표 달성`
                      : "목표를 설정해주세요"}
                  </Text>
      
                  <View style={styles.featuredProgressTrack}>
                    <View
                      style={[
                        styles.featuredProgressFill,
                        { width: `${percent}%` },
                      ]}
                    />
                  </View>
      
                  <Text style={styles.featuredPercentText}>{percent}%</Text>
      
                  <TouchableOpacity
                    style={styles.featuredRecordButton}
                    activeOpacity={0.88}
                    onPress={() => {
                      if (!hasActiveFormGoal(featuredForm)) {
                        showFormGoalRequiredAlert();
                        return;
                      }

                      setSelectedFormId(featuredForm.id);
                      setFormRecordCount("3");
                      setFormRecordModalVisible(true);
                    }}
                  >
                    <Text style={styles.featuredRecordButtonText}>
                      오늘 수련 기록하기
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })() : (
            <View style={styles.emptyFormCard}>
              <Text style={styles.emptyFormTitle}>아직 연습 중인 투로가 없습니다.</Text>
              <Text style={styles.emptyFormText}>
                목표를 설정하면 이곳에 대표 투로가 표시됩니다.
              </Text>
            </View>
          )}
      
          <View style={styles.otherFormTitleRow}>
            <Text style={styles.otherFormTitle}>다른 투로 보기</Text>
            <View style={styles.otherFormLine} />
          </View>
      
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.otherFormScrollContent}
          >
            {otherForms.map((item) => {
        const current = Number(
        item.currentCount ||
        item.completedCount ||
        0
      );
        const target = Number(item.targetCount || 0);
        const locked = memberRank < Number(item.minRank || 0);
      
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
        styles.otherFormCard,
        locked && styles.otherFormCardLocked,
      ]}
                  activeOpacity={0.86}
                  onPress={() => {
        if (locked) {
          Alert.alert("안내", "해당 투로는 승단 후 이용할 수 있습니다.");
          return;
        }
      
        if (!hasActiveFormGoal(item)) {
          showFormGoalRequiredAlert();
          return;
        }

        setSelectedFormId(item.id);
        setFormRecordCount("1");
        setFormRecordModalVisible(true);
      }}
                >
                  <Text style={styles.otherFormName} numberOfLines={1}>
                    {item.name
                      .replace("현중", "")
                      .replace("태극권 ", "")
                      .replace(" 29식", "")
                      .replace(" 52식", "")
                      .replace(" 24식", "")}
                  </Text>
      
                  <Text style={styles.otherFormCount}>
        {target > 0 ? `${current}/${target}회` : `${current}회 기록`}
      </Text>
      
                  {FORM_IMAGES[item.id] ? (
                    <Image
                      source={FORM_IMAGES[item.id]}
                      style={[
        styles.otherFormImage,
        FORM_IMAGE_STYLES[item.id]?.small,
      ]}
                      resizeMode="contain"
                    />
                  ) : null}
      
                  {locked ? (
        <View style={styles.lockBadge}>
          <Text style={styles.lockBadgeText}>🔒</Text>
        </View>
      ) : null}
      
                  <Text style={styles.otherFormArrow}>〉</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
    </>
  );
}