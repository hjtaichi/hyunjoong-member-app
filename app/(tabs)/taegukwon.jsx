import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "../../src/contexts/AuthContext";
import { getMemberTaegukwon } from "../../src/api/memberTaegukwon";
import { API_BASE_URL } from "../../src/config/env";

function getStatusLabel(status) {
  if (status === "done") return "완료";
  if (status === "current") return "진행중";
  if (status === "locked") return "잠금";
  return "예정";
}

export default function TaegukwonScreen() {
  const { token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [taegukwonData, setTaegukwonData] = useState(null);

  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editCurriculumId, setEditCurriculumId] = useState("");
  const [editCurrentStep, setEditCurrentStep] = useState("");
  const [editLastLessonNote, setEditLastLessonNote] = useState("");

  const [memoEditMode, setMemoEditMode] = useState(false);
  const [savingMemo, setSavingMemo] = useState(false);
  const [editMemberMemo, setEditMemberMemo] = useState("");
  const memberTracks = taegukwonData?.memberTracks || [];
  const memberTrackMap = useMemo(() => {
  return new Map(memberTracks.map((track) => [track.curriculumId, track]));
}, [memberTracks]);

const [showGongbeopInfo, setShowGongbeopInfo] = useState(false);
const [gongbeopEditMode, setGongbeopEditMode] = useState(false);
const [gongbeopUpdatedAt, setGongbeopUpdatedAt] = useState(null);
const [gongbeopMemo, setGongbeopMemo] = useState("");
const [gongbeopMemoEditMode, setGongbeopMemoEditMode] = useState(false);

const [gongbeopRecord, setGongbeopRecord] = useState({
  ilsimyangui: "",
  yobujeonsa: "",
  duyoMinutes: "",
  ohaengjeonsa: "",
});

const scrollRef = useRef(null);

  const [showRoadmap, setShowRoadmap] = useState(false);
  const [showRecentAdminMemos, setShowRecentAdminMemos] = useState(false);
  const [showCurriculumOptions, setShowCurriculumOptions] = useState(false);

  const loadData = useCallback(
    async ({ silent = false } = {}) => {
      if (!token) return;

      try {
        if (!silent) setLoading(true);

        const [taegukwonResult] = await Promise.all([
  getMemberTaegukwon(token),
  loadGongbeopRecord(),
]);

const payload = taegukwonResult?.data ? taegukwonResult.data : taegukwonResult;
        console.log("TAEGUKWON payload:", payload);
        console.log("TAEGUKWON member:", payload?.member);

        setTaegukwonData(payload);

        if (payload?.personalProgress) {
          setEditCurriculumId(payload.personalProgress.curriculumId || "");
          setEditCurrentStep(String(payload.personalProgress.currentStep ?? ""));
          setEditLastLessonNote(payload.personalProgress.lastLessonNote || "");
          setEditMemberMemo(payload.personalProgress.memberMemo || "");
        } else {
          setEditCurriculumId("");
          setEditCurrentStep("");
          setEditLastLessonNote("");
          setEditMemberMemo("");
        }
      } catch (error) {
        Alert.alert("오류", error.message || "태극권 정보를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData({ silent: true });
  }, [loadData]);

  const hasAnyGongbeopRecord = useMemo(() => {
  return Object.values(gongbeopRecord).some((value) => String(value).trim() !== "");
}, [gongbeopRecord]);

const handleChangeGongbeop = useCallback((key, value) => {
  const numericOnly = value.replace(/[^0-9]/g, "");
  setGongbeopRecord((prev) => ({
    ...prev,
    [key]: numericOnly,
  }));
}, []);

const handleSaveGongbeopRecord = useCallback(async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/member/me/gongbeop`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        date: new Date().toISOString().slice(0, 10),
        ilsimyangui: Number(gongbeopRecord.ilsimyangui || 0),
        yobujeonsa: Number(gongbeopRecord.yobujeonsa || 0),
        duyoMinutes: Number(gongbeopRecord.duyoMinutes || 0),
        ohaengjeonsa: Number(gongbeopRecord.ohaengjeonsa || 0),
        note: "",
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "공법 기록 저장 실패");
    }

    Alert.alert("완료", "공법 기록이 저장되었습니다.");
    setGongbeopEditMode(false);
  } catch (error) {
    Alert.alert(
      "오류",
      error.message || "공법 기록 저장 중 오류가 발생했습니다."
    );
  }
}, [token, gongbeopRecord]);

const loadGongbeopRecord = useCallback(async () => {
  const response = await fetch(`${API_BASE_URL}/member/me/gongbeop`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();

  if (!response.ok) throw new Error(result.message);

  const record = result.data;

  setGongbeopRecord({
    ilsimyangui: record?.ilsimyangui ? String(record.ilsimyangui) : "",
    yobujeonsa: record?.yobujeonsa ? String(record.yobujeonsa) : "",
    duyoMinutes: record?.duyoMinutes ? String(record.duyoMinutes) : "",
    ohaengjeonsa: record?.ohaengjeonsa ? String(record.ohaengjeonsa) : "",
  });

  setGongbeopUpdatedAt(record?.updatedAt || null);
}, [token]);

  const scrollToEditSection = useCallback(() => {
  setTimeout(() => {
    scrollRef.current?.scrollTo({
      y: 1150,
      animated: true,
    });
  }, 250);
}, []);

  const member = taegukwonData?.member || null;
  const groupProgress = taegukwonData?.groupProgress || null;
  const personalProgress = taegukwonData?.personalProgress || null;
  const roadmap = taegukwonData?.roadmap || [];
  const editableCurriculums = taegukwonData?.editableCurriculums || [];

  const recentAdminMemos = personalProgress?.recentAdminMemos || [];
  const featuredAdminMemo = recentAdminMemos[0] || null;
  const recentListAdminMemos = recentAdminMemos.slice(1, 3);

  const selectedCurriculum = useMemo(() => {
    return (
      editableCurriculums.find((item) => item.id === editCurriculumId) || null
    );
  }, [editableCurriculums, editCurriculumId]);

  const personalProgressPercent = useMemo(() => {
    return Number(personalProgress?.progressPercent || 0);
  }, [personalProgress]);

  const currentStepNumber = Number(personalProgress?.currentStep || 0);
  const totalStepsNumber = Number(personalProgress?.totalSteps || 0);

  const isPersonalCurriculumCompleted =
    !!personalProgress &&
    totalStepsNumber > 0 &&
    currentStepNumber >= totalStepsNumber;

  const handleStartEdit = useCallback(() => {
  const initialCurriculumId = personalProgress?.curriculumId || "";
  const initialTrack = memberTrackMap.get(initialCurriculumId);

  setEditMode(true);
  setShowCurriculumOptions(false);
  setEditCurriculumId(initialCurriculumId);
  setEditCurrentStep(String(initialTrack?.currentStep ?? ""));
  setEditLastLessonNote(initialTrack?.lastLessonNote || "");
  setMemoEditMode(false);
  setEditMemberMemo(initialTrack?.memberMemo || "");
}, [personalProgress, memberTrackMap]);

  const handleCancelEdit = useCallback(() => {
  const initialCurriculumId = personalProgress?.curriculumId || "";
  const initialTrack = memberTrackMap.get(initialCurriculumId);

  setEditMode(false);
  setShowCurriculumOptions(false);
  setEditCurriculumId(initialCurriculumId);
  setEditCurrentStep(String(initialTrack?.currentStep ?? ""));
  setEditLastLessonNote(initialTrack?.lastLessonNote || "");
  setMemoEditMode(false);
  setEditMemberMemo(initialTrack?.memberMemo || "");
}, [personalProgress, memberTrackMap]);

  const handleSavePersonalProgress = useCallback(async () => {
    try {
      if (!editCurriculumId) {
        Alert.alert("안내", "수련 투로를 선택해주세요.");
        return;
      }

      if (!String(editCurrentStep).trim()) {
        Alert.alert("안내", "현재 식을 입력해주세요.");
        return;
      }

      setSaving(true);

      const response = await fetch(`${API_BASE_URL}/member/me/personal-progress`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          curriculumId: editCurriculumId,
          currentStep: Number(editCurrentStep),
          lastLessonNote: editLastLessonNote,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "개인 진도 저장 실패");
      }

      Alert.alert("완료", "개인 진도가 저장되었습니다.");
      setEditMode(false);
      await loadData({ silent: true });
    } catch (error) {
      Alert.alert(
        "오류",
        error.message || "개인 진도 저장 중 오류가 발생했습니다."
      );
    } finally {
      setSaving(false);
    }
  }, [editCurriculumId, editCurrentStep, editLastLessonNote, token, loadData]);

  const handleSaveMemberMemo = useCallback(async () => {
    try {
      const targetCurriculumId =
        editCurriculumId || personalProgress?.curriculumId || "";

      if (!targetCurriculumId) {
        Alert.alert("안내", "메모를 저장할 투로를 먼저 선택해주세요.");
        return;
      }

      setSavingMemo(true);

      const response = await fetch(`${API_BASE_URL}/member/me/personal-memo`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          curriculumId: targetCurriculumId,
          memberMemo: editMemberMemo,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "내 메모 저장 실패");
      }

      Alert.alert("완료", "내 메모가 저장되었습니다.");
      setMemoEditMode(false);
      await loadData({ silent: true });
    } catch (error) {
      Alert.alert(
        "오류",
        error.message || "내 메모 저장 중 오류가 발생했습니다."
      );
    } finally {
      setSavingMemo(false);
    }
  }, [editCurriculumId, personalProgress, editMemberMemo, token, loadData]);

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
      ref={scrollRef}
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
    >
      <Text style={styles.title}>태극권 수련</Text>

{personalProgress?.recentAdminMemos?.[0]?.content ? (
  <View style={styles.topCoachingBanner}>
    <Text style={styles.topCoachingLabel}>지도 포인트</Text>
    <Text style={styles.topCoachingText}>
      {personalProgress.recentAdminMemos[0].content}
    </Text>
  </View>
) : (
  <Text style={styles.subtitle}>내 진도와 공법 기록을 확인해요.</Text>
)}

      <View style={styles.card}>
  <View style={styles.gongbeopHeaderRow}>
    <View style={styles.gongbeopHeaderTextWrap}>
      <Text style={styles.cardTitle}>내 공법 기록</Text>

<Text style={styles.cardSubText}>
  공법 기록과 메모를 함께 정리해요.
</Text>
    </View>

    {gongbeopUpdatedAt ? (
  <Text style={styles.gongbeopDate}>
    최근 갱신: {new Date(gongbeopUpdatedAt).toLocaleDateString("ko-KR")}
  </Text>
) : null}

    {!gongbeopEditMode ? (
      <TouchableOpacity
        style={styles.gongbeopActionButton}
        onPress={() => {
          setGongbeopEditMode(true);
          setTimeout(() => {
            scrollRef.current?.scrollTo({ y: 120, animated: true });
          }, 200);
        }}
        activeOpacity={0.85}
      >
        <Text style={styles.gongbeopActionButtonText}>수정</Text>
      </TouchableOpacity>
    ) : (
      <TouchableOpacity
        style={styles.gongbeopActionButton}
        onPress={() => setGongbeopEditMode(false)}
        activeOpacity={0.85}
      >
        <Text style={styles.gongbeopActionButtonText}>취소</Text>
      </TouchableOpacity>
    )}
  </View>

  {!gongbeopEditMode ? (
    <>
      <View style={styles.gongbeopSummaryWrap}>
        <View style={styles.gongbeopSummaryRow}>
          <Text style={styles.gongbeopName}>일심양의</Text>
          <Text style={styles.gongbeopValue}>
            {gongbeopRecord.ilsimyangui ? `${gongbeopRecord.ilsimyangui}회` : "기록 없음"}
          </Text>
        </View>

        <View style={styles.gongbeopSummaryRow}>
          <Text style={styles.gongbeopName}>요부전사</Text>
          <Text style={styles.gongbeopValue}>
            {gongbeopRecord.yobujeonsa ? `${gongbeopRecord.yobujeonsa}회` : "기록 없음"}
          </Text>
        </View>

        <View style={styles.gongbeopSummaryRow}>
          <Text style={styles.gongbeopName}>두요</Text>
          <Text style={styles.gongbeopValue}>
            {gongbeopRecord.duyoMinutes ? `${gongbeopRecord.duyoMinutes}분` : "기록 없음"}
          </Text>
        </View>

        <View style={styles.gongbeopSummaryRow}>
          <Text style={styles.gongbeopName}>오행전사</Text>
          <Text style={styles.gongbeopValue}>
            {gongbeopRecord.ohaengjeonsa ? `${gongbeopRecord.ohaengjeonsa}회` : "기록 없음"}
          </Text>
        </View>
      </View>

      {!hasAnyGongbeopRecord ? (
        <Text style={styles.gongbeopEmptyText}>
          아직 기록한 공법 내용이 없습니다.
        </Text>
      ) : null}
    </>
  ) : (
    <View style={styles.gongbeopEditWrap}>
      <Text style={styles.inputLabel}>일심양의 (횟수)</Text>
      <TextInput
        value={gongbeopRecord.ilsimyangui}
        onChangeText={(value) => handleChangeGongbeop("ilsimyangui", value)}
        keyboardType="number-pad"
        style={styles.input}
        placeholder="횟수 입력"
        onFocus={() => {
          setTimeout(() => {
            scrollRef.current?.scrollTo({ y: 260, animated: true });
          }, 250);
        }}
      />

      <Text style={styles.inputLabel}>요부전사 (횟수)</Text>
      <TextInput
        value={gongbeopRecord.yobujeonsa}
        onChangeText={(value) => handleChangeGongbeop("yobujeonsa", value)}
        keyboardType="number-pad"
        style={styles.input}
        placeholder="횟수 입력"
        onFocus={() => {
          setTimeout(() => {
            scrollRef.current?.scrollTo({ y: 320, animated: true });
          }, 250);
        }}
      />

      <Text style={styles.inputLabel}>두요 (분)</Text>
      <TextInput
        value={gongbeopRecord.duyoMinutes}
        onChangeText={(value) => handleChangeGongbeop("duyoMinutes", value)}
        keyboardType="number-pad"
        style={styles.input}
        placeholder="분 입력"
        onFocus={() => {
          setTimeout(() => {
            scrollRef.current?.scrollTo({ y: 380, animated: true });
          }, 250);
        }}
      />

      <Text style={styles.inputLabel}>오행전사 (횟수)</Text>
      <TextInput
        value={gongbeopRecord.ohaengjeonsa}
        onChangeText={(value) => handleChangeGongbeop("ohaengjeonsa", value)}
        keyboardType="number-pad"
        style={styles.input}
        placeholder="횟수 입력"
        onFocus={() => {
          setTimeout(() => {
            scrollRef.current?.scrollTo({ y: 440, animated: true });
          }, 250);
        }}
      />

      <TouchableOpacity
        style={styles.gongbeopSaveButton}
        onPress={handleSaveGongbeopRecord}
        activeOpacity={0.85}
      >
        <Text style={styles.gongbeopSaveButtonText}>저장</Text>
      </TouchableOpacity>
    </View>
  )}

  <TouchableOpacity
    style={styles.inlineToggleButton}
    onPress={() => setShowGongbeopInfo((prev) => !prev)}
    activeOpacity={0.85}
  >
    <Text style={styles.inlineToggleButtonText}>
      {showGongbeopInfo ? "공법 설명 닫기" : "공법 설명 보기"}
    </Text>
    <Text style={styles.inlineToggleArrow}>
      {showGongbeopInfo ? "▲" : "▼"}
    </Text>
  </TouchableOpacity>

  {showGongbeopInfo ? (
    <View style={styles.gongbeopInfoWrap}>
      <View style={styles.gongbeopInfoItem}>
        <Text style={styles.gongbeopInfoTitle}>일심양의 一心兩儀</Text>
        <Text style={styles.gongbeopInfoDesc}>
          한 마음(태극)에서 음과 양 두 가지의 기운이 나뉘어 조화를 이룸을 뜻합니다.
        </Text>
      </View>

      <View style={styles.gongbeopInfoItem}>
        <Text style={styles.gongbeopInfoTitle}>요부전사 腰部纏絲</Text>
        <Text style={styles.gongbeopInfoDesc}>
          허리 부위를 중심으로 비틀며 회전하는 나선형의 움직임입니다.
        </Text>
      </View>

      <View style={styles.gongbeopInfoItem}>
        <Text style={styles.gongbeopInfoTitle}>두요 抖腰</Text>
        <Text style={styles.gongbeopInfoDesc}>
          허리를 털어주어 경력을 발산하거나 긴장을 해소하는 동작입니다.
        </Text>
      </View>

      <View style={styles.gongbeopInfoItem}>
        <Text style={styles.gongbeopInfoTitle}>오행전사 五行纏絲</Text>
        <Text style={styles.gongbeopInfoDesc}>
          오행(금, 목, 수, 화, 토)의 원리를 전사경(나선경)에 결합하여 운용하는 공법입니다.
        </Text>
      </View>
    </View>
  ) : null}
  <View style={styles.gongbeopMemoSection}>
  <View style={styles.inlineSectionHeader}>
    <Text style={styles.memoSectionTitle}>내 메모</Text>

    {!gongbeopMemoEditMode ? (
      <TouchableOpacity
        style={styles.smallOutlineButton}
        onPress={() => setGongbeopMemoEditMode(true)}
        activeOpacity={0.85}
      >
        <Text style={styles.smallOutlineButtonText}>수정</Text>
      </TouchableOpacity>
    ) : null}
  </View>

  {!gongbeopMemoEditMode ? (
    <Text style={styles.memoText}>
      {gongbeopMemo?.trim()
        ? gongbeopMemo
        : "아직 작성한 메모가 없습니다."}
    </Text>
  ) : (
    <View style={styles.memoEditWrap}>
      <TextInput
        value={gongbeopMemo}
        onChangeText={setGongbeopMemo}
        style={styles.textAreaCompact}
        placeholder="공법 관련 느낀 점이나 부족한 점을 적어보세요."
        multiline
        onFocus={() => {
          setTimeout(() => {
            scrollRef.current?.scrollTo({ y: 260, animated: true });
          }, 250);
        }}
      />

      <View style={styles.editButtonRow}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => setGongbeopMemoEditMode(false)}
        >
          <Text style={styles.secondaryButtonText}>취소</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.primaryButtonInline}
          onPress={() => setGongbeopMemoEditMode(false)}
        >
          <Text style={styles.primaryButtonText}>저장</Text>
        </TouchableOpacity>
      </View>
    </View>
  )}
</View>
</View>

      <View style={styles.card}>
        <View style={styles.overviewHeaderRow}>
          <View style={styles.headerTitleInlineRow}>
  <Text style={styles.cardTitleNoMargin}>내 현재 수련</Text>

  <View style={styles.levelTextBadge}>
    <Text style={styles.levelTextBadgeText}>
  {member?.level || "일반회원"}
</Text>
  </View>
</View>
        </View>

        {personalProgress ? (
          <>
            <View style={styles.curriculumRow}>
              <Text style={styles.personalName}>
                {personalProgress.curriculumName || "등록된 투로 없음"}
              </Text>

              {isPersonalCurriculumCompleted ? (
                <View style={styles.completedBadgeInline}>
                  <Text style={styles.completedBadgeText}>완료</Text>
                </View>
              ) : null}
            </View>

            <Text style={styles.bigProgressText}>
  {personalProgress.currentStep || 0} / {personalProgress.totalSteps || 0}식
</Text>

<Text style={styles.progressSummaryText}>
  {personalProgressPercent}% 진행
</Text>

<View style={styles.progressTrackCompact}>
  <View
    style={[
      styles.progressFillPersonal,
      { width: `${personalProgressPercent}%` },
    ]}
  />
</View>

            <View style={styles.memoHeaderRow}>
  <Text style={styles.memoSectionTitleNoMargin}>내 메모</Text>

  {!memoEditMode ? (
    <TouchableOpacity
      style={styles.memoSmallActionButton}
      onPress={() => {
        setMemoEditMode(true);
        setEditMemberMemo(personalProgress?.memberMemo || "");
      }}
      activeOpacity={0.85}
    >
      <Text style={styles.memoSmallActionButtonText}>수정</Text>
    </TouchableOpacity>
  ) : (
    <TouchableOpacity
      style={styles.memoSmallActionButton}
      onPress={() => {
        setMemoEditMode(false);
        setEditMemberMemo(personalProgress?.memberMemo || "");
      }}
      activeOpacity={0.85}
    >
      <Text style={styles.memoSmallActionButtonText}>취소</Text>
    </TouchableOpacity>
  )}
</View>

{!memoEditMode ? (
  <Text style={styles.memoText} numberOfLines={3}>
    {personalProgress.memberMemo || "아직 작성한 메모가 없습니다."}
  </Text>
) : (
  <View style={styles.memoInlineEditWrap}>
    <TextInput
  value={editMemberMemo}
  onChangeText={setEditMemberMemo}
  style={styles.textAreaCompact}
  placeholder="복습 포인트나 기억할 점을 적어보세요."
  multiline
  onFocus={scrollToEditSection}
/>
    <TouchableOpacity
      style={[
        styles.memoSaveButton,
        !(editCurriculumId || personalProgress?.curriculumId) && {
          opacity: 0.5,
        },
      ]}
      onPress={handleSaveMemberMemo}
      disabled={savingMemo || !(editCurriculumId || personalProgress?.curriculumId)}
    >
      <Text style={styles.memoSaveButtonText}>
        {savingMemo ? "저장 중..." : "저장"}
      </Text>
    </TouchableOpacity>
  </View>
)}
          </>
        ) : (
          <>
            <Text style={styles.cardText}>아직 등록된 개인 진도 정보가 없습니다.</Text>
            <Text style={styles.cardText}>
              개인 진도가 입력되면 여기에 표시됩니다.
            </Text>
          </>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>수련 과정 로드맵</Text>
        <Text style={styles.cardSubText}>
          전체 수련 흐름과 잠금된 과정을 함께 확인할 수 있어요.
        </Text>

        {showRoadmap ? (
          roadmap.length > 0 ? (
            <>
              {roadmap.map((item, index) => {
  const track = memberTrackMap.get(item.curriculumId);

  const currentStepForDetail = Number(track?.currentStep || 0);
  const totalStepsForDetail = Number(item.totalSteps || 0);

  const source =
    track?.curriculumId === item.curriculumId
      ? "personal"
      : groupProgress?.curriculumId === item.curriculumId
      ? "group"
      : "personal";

  let displayStatus = item.status;

  // 잠금이 최우선
  if (item.isLocked) {
    displayStatus = "locked";
  } else if (track) {
    if (totalStepsForDetail > 0 && currentStepForDetail >= totalStepsForDetail) {
      displayStatus = "done";
    } else if (currentStepForDetail > 0) {
      displayStatus = "current";
    }
  }

  const roadmapMemo =
  track?.lastLessonNote?.trim() || "최근 수련 메모가 없습니다.";

  const canOpenDetail = !item.isLocked;

  const handleOpenDetail = () => {
    if (!canOpenDetail) return;

    router.push({
      pathname: "/taegukwon/[curriculumId]",
      params: {
        curriculumId: item.curriculumId,
        name: item.name,
        currentStep: String(currentStepForDetail),
        totalSteps: String(item.totalSteps || 0),
        source,
      },
    });
  };

  return (
    <View
      key={item.curriculumId || `${item.name}-${index}`}
      style={[
        styles.roadmapItem,
        index === roadmap.length - 1 && styles.roadmapItemLast,
      ]}
    >
      <View
        style={[
          styles.stepBadge,
          displayStatus === "done" && styles.stepBadgeDone,
          displayStatus === "current" && styles.stepBadgeCurrent,
          displayStatus === "locked" && styles.stepBadgeLocked,
        ]}
      >
        <Text
          style={[
            styles.stepBadgeText,
            displayStatus === "done" && styles.stepBadgeTextDone,
            displayStatus === "current" && styles.stepBadgeTextCurrent,
            displayStatus === "locked" && styles.stepBadgeTextLocked,
          ]}
        >
          {index + 1}
        </Text>
      </View>

      <View style={styles.roadmapTextWrap}>
        <View style={styles.roadmapTopRow}>
          <Text style={styles.roadmapName}>
            {item.name}
            {item.totalSteps ? ` · ${item.totalSteps}식` : ""}
          </Text>

          <TouchableOpacity
            activeOpacity={canOpenDetail ? 0.85 : 1}
            disabled={!canOpenDetail}
            onPress={handleOpenDetail}
            style={[
              styles.statusPill,
              displayStatus === "done" && styles.statusPillDone,
              displayStatus === "current" && styles.statusPillCurrent,
              displayStatus === "locked" && styles.statusPillLocked,
              canOpenDetail && styles.statusPillPressable,
            ]}
          >
            <Text
              style={[
                styles.statusPillText,
                displayStatus === "done" && styles.statusPillTextDone,
                displayStatus === "current" && styles.statusPillTextCurrent,
                displayStatus === "locked" && styles.statusPillTextLocked,
              ]}
            >
              {getStatusLabel(displayStatus)}
            </Text>
          </TouchableOpacity>
        </View>

        {item.isLocked ? (
          !!item.unlockMessage && (
            <Text style={styles.roadmapDescription}>{item.unlockMessage}</Text>
          )
        ) : (
          <Text
            style={styles.roadmapMemoText}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {roadmapMemo}
          </Text>
        )}
      </View>
    </View>
  );
})}

              <TouchableOpacity
                style={styles.bottomToggleButton}
                onPress={() => setShowRoadmap(false)}
                activeOpacity={0.85}
              >
                <View style={styles.bottomToggleButtonInner}>
  <Text style={styles.bottomToggleArrow}>▲</Text>
  <Text style={styles.bottomToggleButtonText}>로드맵 닫기</Text>
</View>
              </TouchableOpacity>
            </>
          ) : (
            <Text style={styles.cardText}>표시할 로드맵 정보가 없습니다.</Text>
          )
        ) : (
          <>
            <Text style={styles.collapsedPreviewText}>
              {roadmap.length > 0
                ? `전체 ${roadmap.length}개 투로 흐름을 확인할 수 있어요.`
                : "표시할 로드맵 정보가 없습니다."}
            </Text>

            {roadmap.length > 0 ? (
              <TouchableOpacity
                style={styles.bottomToggleButton}
                onPress={() => setShowRoadmap(true)}
                activeOpacity={0.85}
              >
                <View style={styles.bottomToggleButtonInner}>
  <Text style={styles.bottomToggleArrow}>▼</Text>
  <Text style={styles.bottomToggleButtonText}>전체 로드맵 보기</Text>
</View>
              </TouchableOpacity>
            ) : null}
          </>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>내 진도 수정</Text>
        <Text style={styles.cardSubText}>
          현재 내 등급에서 수정 가능한 투로만 표시됩니다.
        </Text>

        {!editMode ? (
          <TouchableOpacity style={styles.primaryButton} onPress={handleStartEdit}>
            <Text style={styles.primaryButtonText}>내 진도 수정</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.editWrap}>
            <Text style={styles.inputLabel}>수련 투로 선택</Text>

{editableCurriculums.length === 0 ? (
  <Text style={styles.emptyCurriculumText}>
    현재 선택 가능한 투로가 없습니다.
  </Text>
) : (
  <>
    <TouchableOpacity
      style={styles.curriculumSelectBox}
      onPress={() => setShowCurriculumOptions((prev) => !prev)}
      activeOpacity={0.85}
    >
      <View style={styles.curriculumSelectTextWrap}>
        <Text style={styles.curriculumSelectLabel}>선택된 투로</Text>
        <Text style={styles.curriculumSelectValue}>
          {selectedCurriculum?.name || "수련 투로를 선택해주세요."}
        </Text>
      </View>

      <Text style={styles.curriculumSelectArrow}>
        {showCurriculumOptions ? "▲" : "▼"}
      </Text>
    </TouchableOpacity>

    {showCurriculumOptions ? (
      <View style={styles.curriculumDropdownList}>
        {editableCurriculums.map((item) => {
          const selected = item.id === editCurriculumId;

          return (
            <TouchableOpacity
  key={item.id}
  style={[
    styles.curriculumDropdownItem,
    selected && styles.curriculumDropdownItemSelected,
  ]}
  onPress={() => {
    const selectedTrack = memberTrackMap.get(item.id);

    setEditCurriculumId(item.id);
    setEditCurrentStep(String(selectedTrack?.currentStep ?? ""));
    setEditLastLessonNote(selectedTrack?.lastLessonNote || "");
    setEditMemberMemo(selectedTrack?.memberMemo || "");
    setShowCurriculumOptions(false);
  }}
  activeOpacity={0.85}
>
              <View style={styles.curriculumDropdownTextWrap}>
                <Text
                  style={[
                    styles.curriculumDropdownTitle,
                    selected && styles.curriculumDropdownTitleSelected,
                  ]}
                >
                  {item.name}
                </Text>
                <Text
                  style={[
                    styles.curriculumDropdownMeta,
                    selected && styles.curriculumDropdownMetaSelected,
                  ]}
                >
                  {item.totalSteps || 0}식
                </Text>
              </View>

              {selected ? (
                <Text style={styles.curriculumDropdownCheck}>선택됨</Text>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>
    ) : null}
  </>
)}

            <Text style={styles.inputLabel}>현재 식</Text>
            <TextInput
              value={editCurrentStep}
              onChangeText={setEditCurrentStep}
              keyboardType="number-pad"
              style={styles.input}
              placeholder="현재 식 입력"
            />

            <Text style={styles.inputLabel}>최근 수련 메모</Text>
<TextInput
  value={editLastLessonNote}
  onChangeText={setEditLastLessonNote}
  style={styles.textArea}
  placeholder="최근 배운 내용이나 메모"
  multiline
  onFocus={scrollToEditSection}
/>

            <View style={styles.editButtonRow}>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleCancelEdit}
              >
                <Text style={styles.secondaryButtonText}>취소</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.primaryButtonInline}
                onPress={handleSavePersonalProgress}
                disabled={saving}
              >
                <Text style={styles.primaryButtonText}>
                  {saving ? "저장 중..." : "저장"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f3ee",
  },
  content: {
  paddingHorizontal: 20,
  paddingTop: 34,
  paddingBottom: 10,
},
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f6f3ee",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6b6257",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#2f2a24",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: "#6b6257",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#fffdf9",
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ece4d8",
  },
  overviewHeaderRow: {
    marginBottom: 10,
  },
  headerTitleInlineRow: {
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
  marginBottom: 10,
},

cardTitleNoMargin: {
  fontSize: 18,
  fontWeight: "800",
  color: "#2f2a24",
},

levelTextBadge: {
  paddingHorizontal: 8,
  paddingVertical: 3,
  borderRadius: 999,
  backgroundColor: "#f3ecdf",
  alignSelf: "center",
},

levelTextBadgeText: {
  fontSize: 11,
  fontWeight: "700",
  color: "#7b6650",
},
  cardTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#2f2a24",
    marginBottom: 6,
  },
  cardSubText: {
    fontSize: 13,
    lineHeight: 19,
    color: "#7a6f61",
    marginBottom: 12,
  },
  curriculumRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 8,
  },
  personalName: {
    flex: 1,
    fontSize: 22,
    fontWeight: "800",
    color: "#2f2a24",
    lineHeight: 30,
  },
  completedBadgeInline: {
    backgroundColor: "#dfead9",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    alignSelf: "flex-start",
    marginTop: 2,
  },
  completedBadgeText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#4f7144",
  },
  bigProgressText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#7c4f21",
    marginBottom: 10,
  },
  cardText: {
    fontSize: 14,
    lineHeight: 21,
    color: "#4c4339",
    marginBottom: 6,
  },
  progressTrack: {
  height: 10,
  backgroundColor: "#ede6db",
  borderRadius: 999,
  overflow: "hidden",
  marginTop: 8,
},
  progressFillPersonal: {
    height: "100%",
    backgroundColor: "#6f8a63",
    borderRadius: 999,
  },
  progressPercent: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: "700",
    color: "#6b6257",
  },
  memoSectionTitle: {
    marginTop: 10,
    marginBottom: 4,
    fontSize: 13,
    fontWeight: "800",
    color: "#5b5147",
  },
  memoText: {
    fontSize: 14,
    lineHeight: 21,
    color: "#4c4339",
  },
  coachingPointCard: {
  marginTop: 8,
  marginBottom: 6,
  padding: 16,
  borderRadius: 16,
  backgroundColor: "#f7efe2",
  borderWidth: 1,
  borderColor: "#e8d7bb",
},
  coachingPointHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 10,
  },
  coachingPointBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#8c6330",
  },
  coachingPointBadgeText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#fffdf9",
  },
  coachingPointDate: {
    fontSize: 12,
    fontWeight: "700",
    color: "#8a7f72",
  },
  coachingPointText: {
    fontSize: 15,
    lineHeight: 24,
    color: "#3e3428",
    fontWeight: "600",
  },
  recentMemoSection: {
  marginTop: 0,
  marginBottom: 2,
},
  inlineToggleButton: {
  paddingVertical: 6,
  flexDirection: "row",
  alignItems: "center",
  gap: 6,
},
  inlineToggleButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#6a563f",
  },
  memoListSection: {
    marginTop: 2,
  },
  memoHistoryItem: {
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ece4d8",
  },
  memoHistoryDate: {
    fontSize: 12,
    fontWeight: "700",
    color: "#8a7f72",
    marginBottom: 4,
  },
  roadmapItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee7dc",
  },
  roadmapItemLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  stepBadge: {
    width: 32,
    height: 32,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ece4d8",
    marginRight: 12,
    marginTop: 2,
  },
  stepBadgeDone: {
    backgroundColor: "#dfead9",
  },
  stepBadgeCurrent: {
    backgroundColor: "#f1dfbf",
  },
  stepBadgeLocked: {
    backgroundColor: "#e8e8e8",
  },
  stepBadgeText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#6b6257",
  },
  stepBadgeTextDone: {
    color: "#4f7144",
  },
  stepBadgeTextCurrent: {
    color: "#8a5a21",
  },
  stepBadgeTextLocked: {
    color: "#888888",
  },
  roadmapTextWrap: {
    flex: 1,
  },
  roadmapTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  roadmapName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: "#2f2a24",
    lineHeight: 22,
  },
  roadmapDescription: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 19,
    color: "#7b7266",
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#f0ece5",
  },
  statusPillDone: {
    backgroundColor: "#e1eddb",
  },
  statusPillCurrent: {
    backgroundColor: "#f6e5c8",
  },
  statusPillLocked: {
    backgroundColor: "#ededed",
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6b6257",
  },
  statusPillTextDone: {
    color: "#4f7144",
  },
  statusPillTextCurrent: {
    color: "#8a5a21",
  },
  statusPillTextLocked: {
    color: "#888888",
  },
  collapsedPreviewText: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 22,
    color: "#6b6257",
  },
  bottomToggleButton: {
  marginTop: 8,
  paddingTop: 10,
  paddingBottom: 1,
  alignItems: "center",
  justifyContent: "center",
  borderTopWidth: 1,
  borderTopColor: "#ece4d8",
},
  bottomToggleButtonText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#6a563f",
  },
  editWrap: {
    marginTop: 4,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#5b5147",
    marginBottom: 8,
    marginTop: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e1d8ca",
    borderRadius: 12,
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#2f2a24",
    marginBottom: 12,
  },
  textArea: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: "#e1d8ca",
    borderRadius: 12,
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#2f2a24",
    textAlignVertical: "top",
    marginBottom: 14,
  },
  editButtonRow: {
    flexDirection: "row",
    gap: 10,
  },
  primaryButton: {
    marginTop: 4,
    backgroundColor: "#8c6330",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryButtonInline: {
    flex: 1,
    backgroundColor: "#8c6330",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fffdf9",
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: "#e8e0d2",
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#5d5146",
  },
  emptyCurriculumText: {
    fontSize: 13,
    lineHeight: 20,
    color: "#9a8f81",
  },
  inlineToggleButton: {
  paddingVertical: 10,
  flexDirection: "row",
  alignItems: "center",
  gap: 6,
},

inlineToggleButtonText: {
  fontSize: 14,
  fontWeight: "700",
  color: "#6a563f",
},

inlineToggleArrow: {
  fontSize: 11,
  fontWeight: "700",
  color: "#7b6650",
  marginTop: 1,
},

bottomToggleButtonInner: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
},

bottomToggleArrow: {
  fontSize: 11,
  fontWeight: "700",
  color: "#7b6650",
  marginTop: 1,
},
memoHeaderRow: {
  marginTop: 10,
  marginBottom: 6,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
},

memoSectionTitleNoMargin: {
  fontSize: 13,
  fontWeight: "800",
  color: "#5b5147",
},

memoSmallActionButton: {
  paddingHorizontal: 10,
  paddingVertical: 5,
  borderRadius: 999,
  borderWidth: 1,
  borderColor: "#d7c9b3",
  backgroundColor: "#fffaf2",
},

memoSmallActionButtonText: {
  fontSize: 12,
  fontWeight: "700",
  color: "#7c4f21",
},

memoInlineEditWrap: {
  marginTop: 2,
  marginBottom: 8,
},

textAreaCompact: {
  minHeight: 88,
  borderWidth: 1,
  borderColor: "#e1d8ca",
  borderRadius: 12,
  backgroundColor: "#fff",
  paddingHorizontal: 14,
  paddingVertical: 12,
  fontSize: 14,
  color: "#2f2a24",
  textAlignVertical: "top",
  marginBottom: 10,
},

memoSaveButton: {
  alignSelf: "flex-end",
  backgroundColor: "#8c6330",
  borderRadius: 10,
  paddingHorizontal: 16,
  paddingVertical: 10,
},

memoSaveButtonText: {
  fontSize: 13,
  fontWeight: "700",
  color: "#fffdf9",
},

progressSummaryText: {
  fontSize: 13,
  fontWeight: "700",
  color: "#6b6257",
  marginTop: -2,
  marginBottom: 8,
},

progressTrackCompact: {
  height: 10,
  backgroundColor: "#ede6db",
  borderRadius: 999,
  overflow: "hidden",
  marginBottom: 14,
},
curriculumSelectBox: {
  borderWidth: 1,
  borderColor: "#e1d8ca",
  borderRadius: 14,
  backgroundColor: "#fff",
  paddingHorizontal: 14,
  paddingVertical: 14,
  marginBottom: 10,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
},

curriculumSelectTextWrap: {
  flex: 1,
},

curriculumSelectLabel: {
  fontSize: 12,
  fontWeight: "700",
  color: "#8a7f72",
  marginBottom: 4,
},

curriculumSelectValue: {
  fontSize: 15,
  fontWeight: "700",
  color: "#2f2a24",
  lineHeight: 22,
},

curriculumSelectArrow: {
  fontSize: 12,
  fontWeight: "700",
  color: "#7b6650",
},

curriculumDropdownList: {
  borderWidth: 1,
  borderColor: "#e6ddd0",
  borderRadius: 14,
  backgroundColor: "#fffdf9",
  overflow: "hidden",
  marginBottom: 10,
},

curriculumDropdownItem: {
  paddingHorizontal: 14,
  paddingVertical: 14,
  borderBottomWidth: 1,
  borderBottomColor: "#eee7dc",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
},

curriculumDropdownItemSelected: {
  backgroundColor: "#f7efe2",
},

curriculumDropdownTextWrap: {
  flex: 1,
},

curriculumDropdownTitle: {
  fontSize: 14,
  fontWeight: "700",
  color: "#2f2a24",
  marginBottom: 4,
},

curriculumDropdownTitleSelected: {
  color: "#7c4f21",
},

curriculumDropdownMeta: {
  fontSize: 12,
  color: "#7a6f61",
},

curriculumDropdownMetaSelected: {
  color: "#8a5a21",
},

curriculumDropdownCheck: {
  fontSize: 12,
  fontWeight: "700",
  color: "#8a5a21",
},
statusPillPressable: {
  minWidth: 68,
  alignItems: "center",
},

roadmapMemoText: {
  marginTop: 8,
  fontSize: 13,
  lineHeight: 19,
  color: "#6f665c",
},
gongbeopHeaderRow: {
  flexDirection: "row",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 12,
  marginBottom: 4,
},

gongbeopHeaderTextWrap: {
  flex: 1,
},

gongbeopActionButton: {
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 999,
  borderWidth: 1,
  borderColor: "#d7c9b3",
  backgroundColor: "#fffaf2",
},

gongbeopActionButtonText: {
  fontSize: 12,
  fontWeight: "700",
  color: "#7c4f21",
},

gongbeopSummaryWrap: {
  marginTop: 2,
  marginBottom: 6,
  gap: 8,
},

gongbeopSummaryRow: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
  paddingVertical: 2,
},

gongbeopName: {
  fontSize: 14,
  fontWeight: "700",
  color: "#3f372f",
},

gongbeopValue: {
  fontSize: 14,
  fontWeight: "700",
  color: "#7c4f21",
},

gongbeopEmptyText: {
  marginTop: 8,
  fontSize: 13,
  lineHeight: 19,
  color: "#8a7f72",
},

gongbeopEditWrap: {
  marginTop: 4,
  marginBottom: 6,
},

gongbeopSaveButton: {
  marginTop: 4,
  alignSelf: "flex-end",
  backgroundColor: "#8c6330",
  borderRadius: 10,
  paddingHorizontal: 16,
  paddingVertical: 10,
},

gongbeopSaveButtonText: {
  fontSize: 13,
  fontWeight: "700",
  color: "#fffdf9",
},

gongbeopInfoWrap: {
  marginTop: 6,
  paddingTop: 4,
},

gongbeopInfoItem: {
  marginBottom: 10,
},

gongbeopInfoTitle: {
  fontSize: 13,
  fontWeight: "800",
  color: "#5b5147",
  marginBottom: 4,
},

gongbeopInfoDesc: {
  fontSize: 12,
  lineHeight: 18,
  color: "#7a6f61",
},
topCoachingBanner: {
  marginBottom: 18,
  paddingHorizontal: 14,
  paddingVertical: 12,
  borderRadius: 14,
  backgroundColor: "#f7efe2",
  borderWidth: 1,
  borderColor: "#e8d7bb",
},

topCoachingLabel: {
  fontSize: 12,
  fontWeight: "800",
  color: "#8c6330",
  marginBottom: 4,
},

topCoachingText: {
  fontSize: 14,
  lineHeight: 21,
  color: "#4a3d31",
  fontWeight: "600",
},

gongbeopMemoSection: {
  marginTop: 10,
  paddingTop: 10,
  borderTopWidth: 1,
  borderTopColor: "#ece4d8",
},

inlineSectionHeader: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  marginBottom: 6,
},

smallOutlineButton: {
  borderWidth: 1,
  borderColor: "#d7c9b3",
  borderRadius: 999,
  paddingHorizontal: 12,
  paddingVertical: 6,
  backgroundColor: "#fffaf2",
},

smallOutlineButtonText: {
  fontSize: 12,
  fontWeight: "700",
  color: "#7c4f21",
},
});