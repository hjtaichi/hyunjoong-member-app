import React from "react";
import {
  ActivityIndicator,
    KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { styles } from "../../src/features/taegukwon/taegukwonStyles";

import { useTaegukwonScreen } from "../../src/features/taegukwon/useTaegukwonScreen";
import CompletionModal from "../../src/features/taegukwon/CompletionModal";
import MemoHistoryModal from "../../src/features/taegukwon/MemoHistoryModal";
import MemoEditModal from "../../src/features/taegukwon/MemoEditModal";
import FormRecordModal from "../../src/features/taegukwon/FormRecordModal";
import FormGoalModal from "../../src/features/taegukwon/FormGoalModal";
import GongbeopRecordModal from "../../src/features/taegukwon/GongbeopRecordModal";
import GongbeopGoalModal from "../../src/features/taegukwon/GongbeopGoalModal";

import GongbeopSection from "../../src/features/taegukwon/GongbeopSection";
import FormRecordSection from "../../src/features/taegukwon/FormRecordSection";
import TrainingSection from "../../src/features/taegukwon/TrainingSection";
import AnimatedPercentCircle from "../../src/features/taegukwon/AnimatedPercentCircle";


export default function TaegukwonScreen() {
  const screen = useTaegukwonScreen();

const {
  loading,
  refreshing,
  onRefresh,
  activeTab,
  setActiveTab,
  recordModalVisible,
  setRecordModalVisible,
  goalModalVisible,
  setGoalModalVisible,
  completionModalVisible,
  setCompletionModalVisible,
  completedGoalNames,
  completionModalType,
  memoEditModalVisible,
  setMemoEditModalVisible,
  memoHistoryModalVisible,
  setMemoHistoryModalVisible,
  editMemberMemo,
  setEditMemberMemo,
  savingMemo,
  MEMBER_MEMO_MAX_LENGTH,
  handleSaveMemberMemo,
  formRecordModalVisible,
  setFormRecordModalVisible,
  formGoalModalVisible,
  setFormGoalModalVisible,
  formGoalCount,
  setFormGoalCount,
  selectedFormId,
  setSelectedFormId,
  formRecordCount,
  setFormRecordCount,
  featuredFormId,
  gongbeopRecord,
  todayGongbeopRecord,
  setTodayGongbeopRecord,
  gongbeopGoals,
  gongbeopUpdatedAt,
  handleChangeGongbeopGoal,
  handleChangeTodayGongbeop,
  handleSaveGongbeopRecord,
  handleSaveGongbeopGoals,
  currentPeriodYear,
  currentPeriodLabel,
  currentPeriodSub,
  memberRank,
  accessibleForms,
  featuredForm,
  otherForms,
  selectedForm,
  handleSaveFormRecord,
  handleSaveFormGoal,
  handleSaveFavoriteForm,
  personalProgress,
  personalProgressPercent,
  previousMemoHistory,
  isYudanjaMember,
  hasPrivateLessonMenu,
  privateLessonMenuTitle,
  privateLessonMenuDesc,
  riverGlowAnim,
} = screen;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>태극권 정보를 불러오는 중입니다.</Text>
      </View>
    );
  }

  return (
  <KeyboardAvoidingView
    style={styles.container}
    behavior={Platform.OS === "ios" ? "padding" : "height"}
    keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 20}
  >
    <ScrollView
     style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
    >

      <View style={styles.topTabWrap}>
  <TouchableOpacity
    style={[
      styles.topTabButton,
      activeTab === "training" && styles.topTabButtonActive,
    ]}
    onPress={() => setActiveTab("training")}
    activeOpacity={0.85}
  >
    <Text
      style={[
        styles.topTabText,
        activeTab === "training" && styles.topTabTextActive,
      ]}
    >
      수련
    </Text>
  </TouchableOpacity>
  

  <TouchableOpacity
    style={[
      styles.topTabButton,
      activeTab === "gongbeop" && styles.topTabButtonActive,
    ]}
    onPress={() => setActiveTab("gongbeop")}
    activeOpacity={0.85}
  >
    <Text
      style={[
        styles.topTabText,
        activeTab === "gongbeop" && styles.topTabTextActive,
      ]}
    >
      공력 기록
    </Text>
  </TouchableOpacity>

  <TouchableOpacity
    style={[
      styles.topTabButton,
      activeTab === "formRecord" && styles.topTabButtonActive,
    ]}
    onPress={() => setActiveTab("formRecord")}
    activeOpacity={0.85}
  >
    <Text
      style={[
        styles.topTabText,
        activeTab === "formRecord" && styles.topTabTextActive,
      ]}
    >
      투로 기록
    </Text>
  </TouchableOpacity>
</View>

{activeTab === "gongbeop" ? (
  <GongbeopSection
    styles={styles}
    AnimatedPercentCircle={(props) => (
  <AnimatedPercentCircle styles={styles} {...props} />
)}
    riverGlowAnim={riverGlowAnim}
    gongbeopRecord={gongbeopRecord}
    gongbeopGoals={gongbeopGoals}
    gongbeopUpdatedAt={gongbeopUpdatedAt}
    setTodayGongbeopRecord={setTodayGongbeopRecord}
    setRecordModalVisible={setRecordModalVisible}
    setGoalModalVisible={setGoalModalVisible}
    personalProgress={personalProgress}
    setEditMemberMemo={setEditMemberMemo}
    setMemoEditModalVisible={setMemoEditModalVisible}
    setMemoHistoryModalVisible={setMemoHistoryModalVisible}
  />
) : null}
      
{activeTab === "formRecord" ? (
  <FormRecordSection
    styles={styles}
    currentPeriodYear={currentPeriodYear}
    currentPeriodLabel={currentPeriodLabel}
    currentPeriodSub={currentPeriodSub}
    accessibleForms={accessibleForms}
    featuredForm={featuredForm}
    otherForms={otherForms}
    memberRank={memberRank}
    setSelectedFormId={setSelectedFormId}
    setFormGoalCount={setFormGoalCount}
    setFormGoalModalVisible={setFormGoalModalVisible}
    setFormRecordCount={setFormRecordCount}
    setFormRecordModalVisible={setFormRecordModalVisible}
  />
) : null} 

{activeTab === "training" ? (
  <TrainingSection
    styles={styles}
    personalProgress={personalProgress}
    personalProgressPercent={personalProgressPercent}
    isYudanjaMember={isYudanjaMember}
    hasPrivateLessonMenu={hasPrivateLessonMenu}
    privateLessonMenuTitle={privateLessonMenuTitle}
    privateLessonMenuDesc={privateLessonMenuDesc}
  />
) : null}

    </ScrollView>
<GongbeopRecordModal
  visible={recordModalVisible}
  styles={styles}
  todayGongbeopRecord={todayGongbeopRecord}
  handleChangeTodayGongbeop={handleChangeTodayGongbeop}
  setRecordModalVisible={setRecordModalVisible}
  handleSaveGongbeopRecord={handleSaveGongbeopRecord}
/>

<CompletionModal
  visible={completionModalVisible}
  styles={styles}
  completedGoalNames={completedGoalNames}
  completionModalType={completionModalType}
  setCompletionModalVisible={setCompletionModalVisible}
  setGoalModalVisible={setGoalModalVisible}
  setFormGoalModalVisible={setFormGoalModalVisible}
/>

<GongbeopGoalModal
  visible={goalModalVisible}
  styles={styles}
  gongbeopGoals={gongbeopGoals}
  handleChangeGongbeopGoal={handleChangeGongbeopGoal}
  setGoalModalVisible={setGoalModalVisible}
  handleSaveGongbeopGoals={handleSaveGongbeopGoals}
/>

<MemoHistoryModal
  visible={memoHistoryModalVisible}
  styles={styles}
  personalProgress={personalProgress}
  previousMemoHistory={previousMemoHistory}
  setMemoHistoryModalVisible={setMemoHistoryModalVisible}
/>

<MemoEditModal
  visible={memoEditModalVisible}
  styles={styles}
  editMemberMemo={editMemberMemo}
  setEditMemberMemo={setEditMemberMemo}
  maxLength={MEMBER_MEMO_MAX_LENGTH}
  savingMemo={savingMemo}
  setMemoEditModalVisible={setMemoEditModalVisible}
  handleSaveMemberMemo={handleSaveMemberMemo}
/>

<FormRecordModal
  visible={formRecordModalVisible}
  styles={styles}
  selectedForm={selectedForm}
  formRecordCount={formRecordCount}
  setFormRecordCount={setFormRecordCount}
  setFormRecordModalVisible={setFormRecordModalVisible}
  handleSaveFormRecord={handleSaveFormRecord}
/>

<FormGoalModal
  visible={formGoalModalVisible}
  styles={styles}
  accessibleForms={accessibleForms}
  selectedFormId={selectedFormId}
  featuredFormId={featuredFormId}
  formGoalCount={formGoalCount}
  currentPeriodLabel={currentPeriodLabel}
  setSelectedFormId={setSelectedFormId}
  setFormGoalCount={setFormGoalCount}
  setFormGoalModalVisible={setFormGoalModalVisible}
  handleSaveFavoriteForm={handleSaveFavoriteForm}
  handleSaveFormGoal={handleSaveFormGoal}
/>
    </KeyboardAvoidingView>
  );
}