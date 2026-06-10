import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { colors, spacing, radius, shadow } from "../../src/theme";
import {
  ActivityIndicator,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "../../src/contexts/AuthContext";
import { getMemberTaegukwon } from "../../src/api/memberTaegukwon";
import { API_BASE_URL } from "../../src/config/env";
import Svg, { Circle } from "react-native-svg";


function getStatusLabel(status) {
  if (status === "done") return "완료";
  if (status === "current") return "진행중";
  if (status === "locked") return "잠금";
  return "예정";
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

function AnimatedPercentCircle({ percent, color = "#9b7650" }) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  const size = 42;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    animatedValue.setValue(0);

    Animated.timing(animatedValue, {
      toValue: percent,
      duration: 900,
      useNativeDriver: false,
    }).start();
  }, [percent, animatedValue]);

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

  return (
    <View style={styles.animatedCircleWrap}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(226,216,201,0.8)"
          strokeWidth={strokeWidth}
          fill="rgba(255,253,249,0.55)"
        />

        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          originX={size / 2}
          originY={size / 2}
        />
      </Svg>

      <Text style={styles.recordPercentText}>{percent}%</Text>
    </View>
  );
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
  const [memoEditModalVisible, setMemoEditModalVisible] = useState(false);
  const [editMemberMemo, setEditMemberMemo] = useState("");
  const memberTracks = taegukwonData?.memberTracks || [];
  const memberTrackMap = useMemo(() => {
  return new Map(memberTracks.map((track) => [track.curriculumId, track]));
}, [memberTracks]);

const [recordModalVisible, setRecordModalVisible] = useState(false);
const [goalModalVisible, setGoalModalVisible] = useState(false);
const [memoHistoryModalVisible, setMemoHistoryModalVisible] = useState(false);

const [todayRecord, setTodayRecord] = useState({
  ilsimyangui: "",
  yobujeonsa: "",
  duyoMinutes: "",
  ohaengjeonsa: "",
});

const [lastRecordDate, setLastRecordDate] = useState(null);

const [showGongbeopInfo, setShowGongbeopInfo] = useState(false);
const [gongbeopEditMode, setGongbeopEditMode] = useState(false);
const [gongbeopUpdatedAt, setGongbeopUpdatedAt] = useState(null);


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
  const [showMemoHistory, setShowMemoHistory] = useState(false);
  const [activeTab, setActiveTab] = useState("training");

const loadGongbeopRecord = useCallback(async () => {
  const response = await fetch(`${API_BASE_URL}/api/member/me/gongbeop?t=${Date.now()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "ngrok-skip-browser-warning": "true",
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

  const loadData = useCallback(
    async ({ silent = false } = {}) => {
      if (!token) return;

      try {
        if (!silent) setLoading(true);

        const taegukwonResult = await getMemberTaegukwon(token);

try {
  await loadGongbeopRecord();
} catch (gongbeopError) {
  console.log("공법 기록 불러오기 실패:", gongbeopError);
}

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

const [gongbeopGoals, setGongbeopGoals] = useState({
  ilsimyangui: "50",
  yobujeonsa: "30",
  duyoMinutes: "10",
  ohaengjeonsa: "20",
});

const handleChangeGongbeopGoal = useCallback((key, value) => {
  const numericOnly = value.replace(/[^0-9]/g, "");
  setGongbeopGoals((prev) => ({
    ...prev,
    [key]: numericOnly,
  }));
}, []);

function getGongbeopPercent(value, goal) {
  const current = Number(value || 0);
  if (!goal) return 0;
  return Math.min(Math.round((current / goal) * 100), 100);
}

const handleChangeGongbeop = useCallback((key, value) => {
  const numericOnly = value.replace(/[^0-9]/g, "");
  setGongbeopRecord((prev) => ({
    ...prev,
    [key]: numericOnly,
  }));
}, []);

const handleSaveGongbeopRecord = useCallback(async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/member/me/gongbeop`, {
  method: "PATCH",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    "ngrok-skip-browser-warning": "true",
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



  const scrollToEditSection = useCallback(() => {
  setTimeout(() => {
    scrollRef.current?.scrollTo({
      y: 500,
      animated: true,
    });
  }, 250);
}, []);

  const member = taegukwonData?.member || null;
  const groupProgress = taegukwonData?.groupProgress || null;
  const personalProgress = taegukwonData?.personalProgress || null;
  const memoHistory = personalProgress?.memoHistory || [];
  const previousMemoHistory = memoHistory.slice(1);
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

      const response = await fetch(`${API_BASE_URL}/api/member/me/personal-progress`, {
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

  const riverGlowAnim = useRef(new Animated.Value(0)).current;

useEffect(() => {
  const loop = Animated.loop(
    Animated.sequence([
      Animated.timing(riverGlowAnim, {
        toValue: 1,
        duration: 8000,
        useNativeDriver: true,
      }),
      Animated.timing(riverGlowAnim, {
        toValue: 0,
        duration: 0,
        useNativeDriver: true,
      }),
    ])
  );

  loop.start();

  return () => loop.stop();
}, [riverGlowAnim]);

const riverGlowTranslateY = riverGlowAnim.interpolate({
  inputRange: [0, 1],
  outputRange: [0, 230],
});

  const handleSaveMemberMemo = useCallback(async () => {
    try {
      const targetCurriculumId =
        editCurriculumId || personalProgress?.curriculumId || "";

      if (!targetCurriculumId) {
        Alert.alert("안내", "메모를 저장할 투로를 먼저 선택해주세요.");
        return;
      }

      setSavingMemo(true);

      const response = await fetch(`${API_BASE_URL}/api/member/me/personal-memo`, {
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
        throw new Error(result.message || "내 수련 메모 저장 실패");
      }

      Alert.alert("완료", "수련 메모가 저장되었습니다.");
      setMemoEditMode(false);
      await loadData({ silent: true });
    } catch (error) {
      Alert.alert(
        "오류",
        error.message || "수련 메모 저장 중 오류가 발생했습니다."
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
      activeTab === "record" && styles.topTabButtonActive,
    ]}
    onPress={() => setActiveTab("record")}
    activeOpacity={0.85}
  >
    <Text
      style={[
        styles.topTabText,
        activeTab === "record" && styles.topTabTextActive,
      ]}
    >
      공력 증진 기록
    </Text>
  </TouchableOpacity>
</View>

{activeTab === "record" ? (
  <View style={styles.flowSection}>
   
    <Image
       source={require("../../assets/images/gongbeop-flow-full.png")}
      style={styles.flowBackground}
      resizeMode="contain"
    />
    <Animated.Image
  source={require("../../assets/images/river-highlight.png")}
  style={[
    styles.riverHighlight,
    { pointerEvents: "none" },
    {
      opacity: riverGlowAnim.interpolate({
        inputRange: [0, 0.2, 0.65, 1],
        outputRange: [0, 0.22, 0.12, 0],
}),

      transform: [
  {
    translateY: riverGlowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [-8, 14],
    }),
  },
],
    },
  ]}
/>
    <TouchableOpacity
  style={styles.flowTodayRecord}
  activeOpacity={0.85}
  onPress={() => setRecordModalVisible(true)}
>
  <Text style={styles.flowTodayRecordText}>오늘 기록</Text>
</TouchableOpacity>

{gongbeopUpdatedAt ? (
  <Text style={styles.lastRecordText}>
    updated {new Date(gongbeopUpdatedAt).toLocaleDateString("ko-KR")}
  </Text>
) : null}

<View style={[styles.recordOverlay, styles.recordOverlayOne]}>
  <AnimatedPercentCircle
  percent={getGongbeopPercent(
    gongbeopRecord.ilsimyangui,
    gongbeopGoals.ilsimyangui
  )}
  color="#9b7650"
/>
  
  <Text style={styles.recordOverlayValue}>
    {gongbeopRecord.ilsimyangui || "0"}
    <Text style={styles.recordOverlayGoal}> / {gongbeopGoals.ilsimyangui}회</Text>
  </Text>
</View>

<View style={[styles.recordOverlay, styles.recordOverlayTwo]}>
  <AnimatedPercentCircle
  percent={getGongbeopPercent(
    gongbeopRecord.yobujeonsa,
    gongbeopGoals.yobujeonsa
  )}
  color="#6f805e"
/>

  <Text style={styles.recordOverlayValue}>
    {gongbeopRecord.yobujeonsa || "0"}
    <Text style={styles.recordOverlayGoal}> / {gongbeopGoals.yobujeonsa}회</Text>
  </Text>
</View>

<View style={[styles.recordOverlay, styles.recordOverlayThree]}>
  <AnimatedPercentCircle
  percent={getGongbeopPercent(
    gongbeopRecord.duyoMinutes,
    gongbeopGoals.duyoMinutes
  )}
  color="#c48a42"
/>

  <Text style={styles.recordOverlayValue}>
    {gongbeopRecord.duyoMinutes || "0"}
    <Text style={styles.recordOverlayGoal}> / {gongbeopGoals.duyoMinutes}분</Text>
  </Text>
</View>

<View style={[styles.recordOverlay, styles.recordOverlayFour]}>
  <AnimatedPercentCircle
  percent={getGongbeopPercent(
    gongbeopRecord.ohaengjeonsa,
    gongbeopGoals.ohaengjeonsa
  )}
  color="#5f8490"
/>

  <Text style={styles.recordOverlayValue}>
    {gongbeopRecord.ohaengjeonsa || "0"}
    <Text style={styles.recordOverlayGoal}> / {gongbeopGoals.ohaengjeonsa}회</Text>
  </Text>
 </View>
</View>
) : null}

{activeTab === "record" ? (
  <View style={styles.goalCard}>
    <View style={styles.goalHeaderRow}>
      <View style={styles.goalTitleRow}>
  <Text style={styles.goalTitle}>내 목표</Text>
  <Text style={styles.goalSubtitle}>설정한 목표를 향해 꾸준히 나아가세요.</Text>
</View>

      <TouchableOpacity 
      
      style={styles.goalSettingIconButton}
  activeOpacity={0.85}
  onPress={() => {
    console.log("목표 설정 눌림");
    setGoalModalVisible(true);
  }}
>
  <Image
    source={require("../../assets/images/goal-setting-icon.png")}
    style={styles.goalSettingIconImage}
    resizeMode="contain"
  />
</TouchableOpacity>
    </View>

    <View style={styles.goalGrid}>
  <View style={styles.goalItem}>
    <Text style={styles.goalItemTitle}>일심양의</Text>
    <Text
  style={[styles.goalGoalValue, styles.goalValueBrown]}
  numberOfLines={1}
  adjustsFontSizeToFit
  minimumFontScale={0.45}
>
  {`${gongbeopGoals.ilsimyangui || 0}회`}
</Text>
  </View>

  <View style={styles.goalItem}>
    <Text style={styles.goalItemTitle}>요부전사</Text>
    <Text style={[styles.goalGoalValue, styles.goalValueGreen]}
    numberOfLines={1}
  adjustsFontSizeToFit
  minimumFontScale={0.65}
  >
  {gongbeopGoals.yobujeonsa}<Text style={styles.goalUnit}>회</Text>
</Text>
  </View>

  <View style={styles.goalItem}>
    <Text style={styles.goalItemTitle}>두요</Text>
    <Text style={[styles.goalGoalValue, styles.goalValueGold]}
    numberOfLines={1}
  adjustsFontSizeToFit
  minimumFontScale={0.65}
  >
  {gongbeopGoals.duyoMinutes}<Text style={styles.goalUnit}>분</Text>
</Text>
  </View>

  <View style={styles.goalItem}>
    <Text style={styles.goalItemTitle}>오행전사</Text>
    <Text style={[styles.goalGoalValue, styles.goalValueBlue]}
    numberOfLines={1}
  adjustsFontSizeToFit
  minimumFontScale={0.65}
  >
  {gongbeopGoals.ohaengjeonsa}<Text style={styles.goalUnit}>회</Text>
</Text>
  </View>
</View>
</View>
) : null}

{activeTab === "record" ? (
  <View style={styles.memoImageCard}>
    <Image
      source={require("../../assets/images/memo-card-bg.png")}
      style={styles.memoCardBg}
      resizeMode="stretch"
    />

    <Text style={styles.memoPreviewText} numberOfLines={2}>
      {personalProgress?.memberMemo || "아직 작성한 메모가 없습니다."}
    </Text>

    <TouchableOpacity
  style={styles.memoEditHotspot}
  onPress={() => {
    setEditMemberMemo(personalProgress?.memberMemo || "");
    setMemoEditModalVisible(true);
  }}
/>

    <TouchableOpacity
  style={styles.memoDetailButton}
  onPress={() => setMemoHistoryModalVisible(true)}
  activeOpacity={0.85}
>
  <Text style={styles.memoDetailButtonText}>이전 기록 보기</Text>
</TouchableOpacity>
  </View>
) : null}
      

{activeTab === "training" ? (
  <Text style={styles.sectionLabel}>현재 수련</Text>
) : null}
{activeTab === "training" ? (
  <View style={styles.coachingInlineBox}>
    <Image
  source={require("../../assets/images/training-tip-title.png")}
  style={styles.coachingTipTitleImage}
  resizeMode="contain"
/>

    <Text style={styles.coachingInlineText} numberOfLines={2}>
      {personalProgress?.recentAdminMemos?.[0]?.content ||
        "아직 등록된 수련 Tip이 없습니다."}
    </Text>
  </View>
) : null}
{activeTab === "training" ? (
   <View style={[styles.card, styles.trainingCard]}>
    <View style={styles.cardTopActionRow}>
  <TouchableOpacity
  style={styles.detailButton}
  activeOpacity={0.85}
  onPress={() => {
    if (!personalProgress?.curriculumId) {
      Alert.alert("안내", "아직 등록된 개인 진도 정보가 없습니다.");
      return;
    }

    router.push({
      pathname: "/taegukwon/[curriculumId]",
      params: {
        curriculumId: personalProgress.curriculumId,
        name: personalProgress.curriculumName || "수련 과정",
        currentStep: String(personalProgress.currentStep || 0),
        totalSteps: String(personalProgress.totalSteps || 0),
        source: "personal",
      },
    });
  }}
>
  <Text style={styles.detailTextButton}>자세히 보기 </Text>
</TouchableOpacity>
</View>
    {personalProgress ? (
      <>
<View style={styles.trainingHeroRow}>
  <View style={styles.trainingHeroLeft}>
    <Text style={styles.personalName}>
      {personalProgress.curriculumName || "등록된 투로 없음"}
    </Text>

    <Text style={styles.bigProgressText}>
      {personalProgress.currentStep || 0} / {personalProgress.totalSteps || 0}식
    </Text>

<View style={styles.progressSection}>
  <Text style={styles.progressLabel}>진행률</Text>

  <View style={styles.progressBarRow}>
    <View style={styles.progressTrackInline}>
      <View
        style={[
          styles.progressFillPersonal,
          { width: `${personalProgressPercent}%` },
        ]}
      />
    </View>

    <Text style={styles.progressPercentInline}>
      {personalProgressPercent}%
    </Text>
  </View>
</View>
  </View>

  <View style={styles.trainingSilhouetteWrap}>
    <Image
      source={require("../../assets/images/taichi-silhouette2.png")}
      style={styles.trainingSilhouette}
      resizeMode="contain"
    />
  </View>
</View>
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
) : null}

{activeTab === "training" ? (
  <View style={[styles.card, styles.menuCard]}>
    <TouchableOpacity
  style={styles.menuRow}
  activeOpacity={0.85}
  onPress={() => router.push("/training-journey")}
>
  <Image
    source={require("../../assets/images/menu-curriculum.png")}
    style={styles.menuIcon}
    resizeMode="contain"
  />

  <View style={styles.menuTextWrap}>
    <Text style={styles.menuTitle}>수련 과정</Text>
    <Text style={styles.menuDesc}>커리큘럼 보기</Text>
  </View>

  <Text style={styles.menuArrow}>〉</Text>
</TouchableOpacity>


<TouchableOpacity
  style={styles.menuRow}
  activeOpacity={0.85}
  onPress={() => router.push("/coaching-videos")}
>
  <Image
    source={require("../../assets/images/menu-video.png")}
    style={styles.menuIcon}
    resizeMode="contain"
  />

  <View style={styles.menuTextWrap}>
    <Text style={styles.menuTitle}>내 수련 영상 올리기</Text>
    <Text style={styles.menuDesc}>실전 코칭</Text>
  </View>

  <Text style={styles.menuArrow}>〉</Text>
</TouchableOpacity>

<TouchableOpacity
  style={styles.menuRow}
  activeOpacity={0.85}
  onPress={() => router.push("/movement-dictionary")}
>
  <Image
    source={require("../../assets/images/menu-dictionary.png")}
    style={styles.menuIcon}
    resizeMode="contain"
  />

  <View style={styles.menuTextWrap}>
    <Text style={styles.menuTitle}>투로명이 궁금해요</Text>
    <Text style={styles.menuDesc}>동작 설명 및 포인트</Text>
  </View>

  <Text style={styles.menuArrow}>〉</Text>
</TouchableOpacity>

<TouchableOpacity
  style={styles.menuRow}
  activeOpacity={0.85}
  onPress={() => router.push("/private-training-guide")}
>
  <Image
    source={require("../../assets/images/menu-private-training.png")}
    style={styles.menuIcon}
    resizeMode="contain"
  />

  <View style={styles.menuTextWrap}>
    <Text style={styles.menuTitle}>개별 수련 지도</Text>
    <Text style={styles.menuDesc}>정리부터 심화 수련까지</Text>
  </View>

  <Text style={styles.menuArrow}>〉</Text>
</TouchableOpacity>

<TouchableOpacity
  style={[styles.menuRow, styles.menuRowLast, !member?.isYudanja && styles.menuRowLocked]}
  activeOpacity={0.85}
>
  <Image
  source={require("../../assets/images/menu-yudanja.png")}
  style={[styles.menuIcon, styles.menuYudanjaIcon]}
  resizeMode="contain"
/>
  <View style={styles.menuTextWrap}>
    <Text style={styles.menuTitle}>유단자 전용</Text>
    <Text style={styles.menuDesc}>유단자 전용 콘텐츠</Text>
  </View>

 {member?.isYudanja ? (
  <Text style={styles.menuArrow}>〉</Text>
) : (
  <Image
    source={require("../../assets/images/menu-lock.png")}
    style={styles.menuLockIcon}
    resizeMode="contain"
  />
)}
</TouchableOpacity>
  </View>
) : null}

{false && (
      <View style={[styles.card, styles.menuCard]}>
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
      )}

{false && (
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
      )}
    </ScrollView>
    <Modal
  visible={recordModalVisible}
  transparent
  animationType="fade"
>
  <View style={styles.recordModalOverlay}>
    <View style={styles.imageModalCard}>
  <Image
    source={require("../../assets/images/modal-today-record.png")}
    style={styles.imageModalBg}
    resizeMode="stretch"
  />

  <TouchableOpacity
    style={styles.modalCloseHotspot}
    onPress={() => setRecordModalVisible(false)}
  />

  <TextInput
    value={gongbeopRecord.ilsimyangui}
    onChangeText={(value) => handleChangeGongbeop("ilsimyangui", value)}
    keyboardType="numeric"
    style={[styles.imageModalInput, styles.modalInputOne]}
  />

  <TextInput
    value={gongbeopRecord.yobujeonsa}
    onChangeText={(value) => handleChangeGongbeop("yobujeonsa", value)}
    keyboardType="numeric"
    style={[styles.imageModalInput, styles.modalInputTwo]}
  />

  <TextInput
    value={gongbeopRecord.duyoMinutes}
    onChangeText={(value) => handleChangeGongbeop("duyoMinutes", value)}
    keyboardType="numeric"
    style={[styles.imageModalInput, styles.modalInputThree]}
  />

  <TextInput
    value={gongbeopRecord.ohaengjeonsa}
    onChangeText={(value) => handleChangeGongbeop("ohaengjeonsa", value)}
    keyboardType="numeric"
    style={[styles.imageModalInput, styles.modalInputFour]}
  />

  <TouchableOpacity
    style={styles.modalCancelHotspot}
    onPress={() => setRecordModalVisible(false)}
  />

  <TouchableOpacity
    style={styles.modalSaveHotspot}
    onPress={async () => {
      await handleSaveGongbeopRecord();
      setRecordModalVisible(false);
    }}
  />
</View>
  </View>
</Modal>
<Modal
  visible={goalModalVisible}
  transparent
  animationType="fade"
>
  <View style={styles.recordModalOverlay}>
    <View style={styles.imageModalCard}>
      <Image
        source={require("../../assets/images/modal-goal-setting.png")}
        style={styles.imageModalBg}
        resizeMode="contain"
      />

      <TouchableOpacity
        style={styles.modalCloseHotspot}
        onPress={() => setGoalModalVisible(false)}
      />

      <TextInput
  value={gongbeopGoals.ilsimyangui}
  onChangeText={(value) => handleChangeGongbeopGoal("ilsimyangui", value)}
  keyboardType="numeric"
  style={[styles.imageModalInput, styles.modalInputOne]}
/>

<TextInput
  value={gongbeopGoals.yobujeonsa}
  onChangeText={(value) => handleChangeGongbeopGoal("yobujeonsa", value)}
  keyboardType="numeric"
  style={[styles.imageModalInput, styles.modalInputTwo]}
/>

<TextInput
  value={gongbeopGoals.duyoMinutes}
  onChangeText={(value) => handleChangeGongbeopGoal("duyoMinutes", value)}
  keyboardType="numeric"
  style={[styles.imageModalInput, styles.modalInputThree]}
/>

<TextInput
  value={gongbeopGoals.ohaengjeonsa}
  onChangeText={(value) => handleChangeGongbeopGoal("ohaengjeonsa", value)}
  keyboardType="numeric"
  style={[styles.imageModalInput, styles.modalInputFour]}
/>

      <TouchableOpacity
        style={styles.modalCancelHotspot}
        onPress={() => setGoalModalVisible(false)}
      />

      <TouchableOpacity
        style={styles.modalSaveHotspot}
        onPress={() => {
          setGoalModalVisible(false);
        }}
      />
    </View>
  </View>
</Modal>
<Modal visible={memoHistoryModalVisible} transparent animationType="fade">
  <View style={styles.recordModalOverlay}>
    <View style={styles.memoHistoryModalCard}>
      <Text style={styles.memoHistoryModalTitle}>지난 수련 메모</Text>

      <TouchableOpacity
        style={styles.memoHistoryCloseButton}
        onPress={() => setMemoHistoryModalVisible(false)}
      >
        <Text style={styles.memoHistoryCloseText}>×</Text>
      </TouchableOpacity>

      <ScrollView
  style={styles.memoHistoryScroll}
  contentContainerStyle={styles.memoHistoryScrollContent}
  showsVerticalScrollIndicator={false}
  nestedScrollEnabled
>
        {[personalProgress?.memberMemo ? {
          id: "current",
          createdAt: new Date().toISOString(),
          content: personalProgress.memberMemo,
        } : null, ...previousMemoHistory]
          .filter(Boolean)
          .map((memo) => (
            <View key={memo.id} style={styles.memoHistoryModalItem}>
              <Text style={styles.memoHistoryDateText}>
                {new Date(memo.createdAt).toLocaleDateString("ko-KR")}
              </Text>
              <Text style={styles.memoHistoryContentText}>
                {memo.content}
              </Text>
            </View>
          ))}
      </ScrollView>
    </View>
  </View>
</Modal>
<Modal visible={memoEditModalVisible} transparent animationType="fade">
  <View style={styles.recordModalOverlay}>
    <View style={styles.memoEditModalCard}>
      <Text style={styles.memoHistoryModalTitle}>내 수련 메모</Text>

      <TouchableOpacity
        style={styles.memoHistoryCloseButton}
        onPress={() => setMemoEditModalVisible(false)}
      >
        <Text style={styles.memoHistoryCloseText}>×</Text>
      </TouchableOpacity>

      <TextInput
        value={editMemberMemo}
        onChangeText={setEditMemberMemo}
        style={styles.memoEditModalInput}
        placeholder="오늘 수련하며 느낀 점을 적어보세요."
        placeholderTextColor="#a99585"
        multiline
        textAlignVertical="top"
      />

      <View style={styles.memoEditModalButtonRow}>
        <TouchableOpacity
          style={styles.memoEditCancelButton}
          onPress={() => setMemoEditModalVisible(false)}
        >
          <Text style={styles.memoEditCancelText}>취소</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.memoEditSaveButton}
          onPress={async () => {
            await handleSaveMemberMemo();
            setMemoEditModalVisible(false);
          }}
        >
          <Text style={styles.memoEditSaveText}>저장</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>
    </KeyboardAvoidingView>
  );
}

const isWeb = Platform.OS === "web";

const fonts = {
  regular: "PretendardRegular",
  medium: "PretendardMedium",
  semiBold: "PretendardSemiBold",
  bold: "PretendardBold",
  title: "MaruBuriBold",
  titleSemi: "MaruBuriSemiBold",
  handwriting: "KyoboHandwriting2025lyb",
};

const styles = StyleSheet.create({
  container: {
  flex: 1,
  backgroundColor: colors.background,
},
  content: {
  paddingHorizontal: isWeb ? 12 : 16,
  paddingTop: isWeb ? 24 : 44,
  paddingBottom: isWeb ? 30 : 18,
  gap: isWeb ? 10 : 14,
  width: "100%",
  maxWidth: 430,
  alignSelf: "center",
},
  center: {
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.background,
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
    marginLeft: 4,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: "#6b6257",
    marginBottom: 16,
  },
  card: {
  backgroundColor: colors.card,
  borderRadius: radius.lg,
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.lg,
  marginBottom: 0,
  borderWidth: 1,
  borderColor: colors.border,
  ...shadow.card,
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
  fontSize: isWeb ? 24 : 28,
  fontFamily: fonts.title,
  color: colors.textMain,
  lineHeight: isWeb ? 31 : 35,
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
  fontFamily: fonts.titleSemi,
  color: colors.warmBrown,
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
  backgroundColor: colors.bronzeGold,
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
  fontSize: 6,
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
  fontSize: 17,
  fontWeight: "800",
  color: "#2f241d",

  marginTop: 8,
  marginBottom: 10,
},
gongbeopRecordText: {
  fontSize: 13,
  fontWeight: "700",
  color: "#6b4f46",

  marginBottom: 6,
},
gongbeopPercentText: {
  fontSize: 11,
  fontWeight: "700",
  color: "#b19a83",
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
memoHistorySection: {
  marginTop: 8,
},

memoHistoryList: {
  marginTop: 6,
  gap: 8,
},

memoHistoryItemBox: {
  paddingHorizontal: 12,
  paddingVertical: 10,
  borderRadius: 12,
  backgroundColor: "#f7efe2",
  borderWidth: 1,
  borderColor: "#eadcc8",
},

memoHistoryDateText: {
  fontSize: 11,
  fontWeight: "700",
  color: "#8a7f72",
  marginBottom: 4,
},

memoHistoryContentText: {
  fontSize: 13,
  lineHeight: 19,
  color: "#4c4339",
},
topTabWrap: {
  flexDirection: "row",
  backgroundColor: colors.card,
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: radius.md,
  padding: 3,
  marginTop: 0,
  marginBottom: spacing.md,
},

topTabButton: {
  flex: 1,
  height: 40,
  borderRadius: 10,
  alignItems: "center",
  justifyContent: "center",
},

topTabButtonActive: {
  backgroundColor: colors.warmBrown,
},

topTabText: {
  fontSize: 14,
  fontFamily: fonts.semiBold,
  color: colors.softBrown,
},

topTabTextActive: {
  color: colors.white,
},

menuRow: {
  minHeight: 68,
  paddingHorizontal: 18,
  paddingVertical: 13,
  flexDirection: "row",
  alignItems: "center",
},

menuRowLocked: {
  opacity: 0.7,
},

menuTitle: {
  fontSize: 17,
  fontFamily: fonts.title,
  color: colors.textMain,
  marginBottom: 3,
},
menuDesc: {
  fontSize: 12,
  fontFamily: fonts.medium,
  color: colors.textSub,
},

menuLock: {
  fontSize: 18,
},
currentTrainingLabel: {
  fontSize: 11,
  fontWeight: "800",
  letterSpacing: 1.2,
  color: "#9b866e",
  marginBottom: 8,
},

currentStepDescription: {
  marginTop: -2,
  marginBottom: 12,
  fontSize: 13,
  color: "#7b7064",
  fontWeight: "600",
},
trainingHeroRow: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 6,
},

trainingHeroLeft: {
  flex: 1,
  paddingRight: 12,
},

trainingSilhouetteWrap: {
  width: 110,
  height: 110,
  alignItems: "center",
  justifyContent: "center",
  opacity: 0.9,
},

trainingSilhouette: {
  width: 150,
  height: 150,
  marginTop: -20,
  marginBottom: -25,
},

progressSection: {
  marginTop: 10,
  marginBottom: 4,
},

progressLabel: {
  fontSize: 13,
  fontFamily: fonts.bold,
  color: colors.textMain,
  marginBottom: 4,
},

progressBarRow: {
  flexDirection: "row",
  alignItems: "center",
  gap: 12,
},

progressTrackInline: {
  flex: 1,
  height: 9,
  backgroundColor: colors.border,
  borderRadius: 999,
  overflow: "hidden",
},

progressPercentInline: {
  width: 42,
  fontSize: 13,
  fontFamily: fonts.bold,
  color: colors.textMain,
},

progressHeaderRow: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 8,
},

progressPercentText: {
  fontSize: 13,
  fontWeight: "800",
  color: "#9b866e",
},
currentCardHeaderRow: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  marginBottom: 16,
},
detailButton: {
  paddingHorizontal: 12,
  paddingVertical: 8,
},
detailTextButton: {
  fontSize: 12,
  fontWeight: "700",
  color: "#8a7f72",
  marginTop: -2,
},

sectionLabel: {
  fontSize: 18,
  fontFamily: fonts.title,
  color: colors.textMain,
  marginTop: 2,
  marginBottom: 6,
  marginLeft: 4,
},

cardTopActionRow: {
  flexDirection: "row",
  justifyContent: "flex-end",
  marginBottom: 2,
},
coachingInlineBox: {
  marginTop: -6,
  marginBottom: 10,
  paddingHorizontal: 16,
  paddingVertical: 13,
  borderRadius: 18,
  backgroundColor: "#F7EFE2",
  borderWidth: 1,
  borderColor: "#E6D5BA",
  transform: [{ rotate: "-0.3deg" }],
},

coachingInlineLabel: {
  fontSize: 12,
  fontWeight: "700",
  color: "#8c6330",
  marginBottom: 4,
},

coachingInlineText: {  
  fontSize: 22,
  lineHeight: 24,
  color: colors.ink,
  marginLeft: 15,
  marginTop: -3,
  marginLeft: 18,
  fontFamily: fonts.handwriting,
},
trainingCard: {
  paddingTop: 8,
  paddingBottom: 10,
  paddingHorizontal: 16,
  backgroundColor: "#FFFCF8",
  borderColor: "#E8D8BE",
},
menuCard: {
  paddingTop: 4,
  paddingBottom: 4,
},

menuRow: {
  minHeight: 67,
  paddingVertical: 12,
  borderBottomWidth: 1,
  borderBottomColor: "#f0e8dc",
  flexDirection: "row",
  alignItems: "center",
  gap: 14,
},

menuRowLast: {
  borderBottomWidth: 0,
},

menuIcon: {
  width: 28,
  height: 28,
  opacity: 0.82,
},

menuTextWrap: {
  flex: 1,
},

menuTitle: {
  fontSize: 15,
  fontFamily: fonts.bold,
  color: colors.textMain,
},

menuDesc: {
  marginTop: 4,
  fontSize: 12,
  fontFamily: fonts.medium,
  color: colors.textSub,
},

menuArrow: {
  width: 18,
  textAlign: "center",
  fontSize: 13,
  lineHeight: 18,
  color: "#a08f7a",
  fontWeight: "300",
  marginRight: 2,
},

menuLock: {
  fontSize: 20,
  marginRight: 2,
},

menuRowLocked: {
  opacity: 0.65,
},
menuLockIcon: {
  width: 26,
  height: 26,
  marginRight: 2,
  opacity: 0.9,
},
menuYudanjaIcon: {
  width: 36,
  height: 36,
  marginLeft: -5,
  marginRight: -5,
},
flowSection: {
  position: "relative",
  height: 480,
  marginBottom: 15,
  overflow: "hidden",
},

flowBackground: {
  position: "absolute",
  left: 0,
  top: 0,
  width: "100%",
  height: "100%",
  opacity: 0.96,
},

recordActionRow: {
  flexDirection: "row",
  justifyContent: "flex-end",
  marginTop: -4,
  marginBottom: 8,
},

todayRecordButton: {
  paddingVertical: 4,
  paddingHorizontal: 2,
},

todayRecordButtonText: {
  fontSize: 12,
  fontWeight: "800",
  color: "#6b4f46",
},
flowTodayRecord: {
  position: "absolute",
  top: 0,
  right: 10,
  paddingHorizontal: 8,
  paddingVertical: 5,
  borderRadius: 15,
  borderWidth: 1,
  borderColor: "rgba(123, 86, 72, 0.24)",
  backgroundColor: "rgba(255,248,240,0.42)",
  alignItems: "center",
  zIndex: 20,
},

flowTodayRecordText: {
  fontSize: 11,
  fontWeight: "800",
  color: "#6F4D3F",
  textAlign: "center",
},

recordOverlay: {
  position: "absolute",
  zIndex: 20,
  elevation: 20,
},

recordOverlayValue: {
  fontSize: 18,
  fontWeight: "700",
  color: "#5b3f30",
},

recordOverlayGoal: {
  fontSize: 12,
  fontWeight: "800",
  color: "#8a7f72",
},

animatedCircleWrap: {
  width: 42,
  height: 42,
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 0,
  position: "relative",
  opacity: 0.8,
},

recordPercentText: {
  position: "absolute",
  left: 2,
  right: 0,
  top: 15,
  textAlign: "center",
  fontSize: 9.5,
  fontWeight: "800",
  color: "#5b3f30",
},

recordOverlayOne: {
  top: 80,
  left: 140,
},

recordOverlayTwo: {
  top: 200,
  left: 210,
},

recordOverlayThree: {
  top: 267,
  left: 120,
},

recordOverlayFour: {
  top: 350,
  left: 168,
},
recordOverlayPercent: {
  marginTop: 4,
  fontSize: 12,
  fontWeight: "800",
  color: "#9b7650",
},
gongbeopEditCard: {
  backgroundColor: "#fffdf9",
  borderRadius: 20,
  padding: 16,
  marginBottom: 12,
  borderWidth: 1,
  borderColor: "#ece4d8",
},

gongbeopEditTitle: {
  fontSize: 17,
  fontWeight: "800",
  color: "#2f2a24",
  marginBottom: 12,
},

gongbeopInputGrid: {
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 10,
},

gongbeopInputBox: {
  width: "48%",
},

gongbeopInputLabel: {
  fontSize: 12,
  fontWeight: "800",
  color: "#7c4f21",
  marginBottom: 6,
},

gongbeopInput: {
  borderWidth: 1,
  borderColor: "#e1d8ca",
  borderRadius: 12,
  backgroundColor: "#fff",
  paddingHorizontal: 12,
  paddingVertical: 10,
  fontSize: 14,
  color: "#2f2a24",
},

gongbeopEditButtonRow: {
  flexDirection: "row",
  gap: 10,
  marginTop: 14,
},

gongbeopCancelButton: {
  flex: 1,
  borderRadius: 12,
  paddingVertical: 12,
  alignItems: "center",
  backgroundColor: "#e8e0d2",
},

gongbeopCancelButtonText: {
  fontSize: 13,
  fontWeight: "800",
  color: "#5d5146",
},

gongbeopSaveButton: {
  flex: 1,
  borderRadius: 12,
  paddingVertical: 12,
  alignItems: "center",
  backgroundColor: "#8c6330",
},

gongbeopSaveButtonText: {
  fontSize: 13,
  fontWeight: "800",
  color: "#fffdf9",
},
recordModalOverlay: {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.28)",
  justifyContent: "center",
  alignItems: "center",
},

recordCancelText: {
  color: "#6B564C",
  fontSize: 16,
  fontWeight: "700",
},

recordSaveText: {
  color: "#FFFFFF",
  fontSize: 16,
  fontWeight: "700",
},

lastRecordText: {
  position: "absolute",
  top: 30,
  right: 10,
  fontSize: 9,
  color: "#9A867A",
  textAlign: "right",
  zIndex: 20,
},

recordModalOverlay: {
  flex: 1,
  backgroundColor: "rgba(47, 42, 36, 0.32)",
  justifyContent: "center",
  alignItems: "center",
},

recordModalCard: {
  width: "86%",
  backgroundColor: "#fffdf8",
  borderRadius: 26,
  paddingHorizontal: 22,
  paddingTop: 24,
  paddingBottom: 20,
  borderWidth: 1,
  borderColor: "#eadfce",
},

recordModalTitle: {
  fontSize: 24,
  fontWeight: "800",
  color: "#4A3427",
  marginBottom: 18,
  textAlign: "center",
},

recordInputGrid: {
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "space-between",
  rowGap: 12,
},

recordInputBox: {
  width: "48%",
},

recordInputLabel: {
  fontSize: 12,
  fontWeight: "800",
  color: "#7c5a42",
  marginBottom: 5,
},

recordInputLabel: {
  fontSize: 12,
  fontWeight: "800",
  color: "#7c5a42",
  marginBottom: 5,
},

recordInput: {
  height: 44,
  borderRadius: 14,
  backgroundColor: "#fffaf2",
  borderWidth: 1,
  borderColor: "#eadfce",
  paddingHorizontal: 14,
  fontSize: 15,
  color: "#4A3427",
},

recordButtonRow: {
  flexDirection: "row",
  marginTop: 18,
  gap: 10,
},

recordCancelButton: {
  flex: 1,
  height: 46,
  borderRadius: 15,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "#e9dfd2",
},

recordSaveButton: {
  flex: 1,
  height: 46,
  borderRadius: 15,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "#7B5648",
},
goalCard: {
  backgroundColor: "rgba(255,253,249,0.92)",
  borderRadius: 20,
  padding: 16,
  marginBottom: 12,
  borderWidth: 1,
  borderColor: "#ece4d8",
},

goalHeaderRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: 12,
},

goalTitle: {
  fontFamily: "ChosunCentennial",
  fontSize: 18,
  color: "#5b3f30",
   transform: [{ scaleX: 0.9 }],
},
goalTitleRow: {
  flexDirection: "row",
  alignItems: "flex-end",
  gap: 8,
  flex: 1,
},
goalSubtitle: {
  flex: 1,
  fontSize: 11,
  color: "#7a6f61",
  marginBottom: 3,
},

goalValueBrown: {
  color: "#9b7650",
},

goalValueGreen: {
  color: "#6f805e",
},

goalValueGold: {
  color: "#c48a42",
},

goalValueBlue: {
  color: "#5f8490",
},

goalGrid: {
  flexDirection: "row",
  gap: 8,
},

goalItem: {
  flex: 1,
  paddingHorizontal: 8,
  paddingVertical: 10,
  borderRadius: 14,
  borderWidth: 1,
  borderColor: "#eee4d7",
  backgroundColor: "rgba(255,255,255,0.55)",
  alignItems: "center",
},

goalItemTitle: {
  fontSize: 12,
  fontWeight: "800",
  color: "#4a3d31",
  marginBottom: 0,
},
goalGoalValue: {
  fontSize: 18,
  fontWeight: "900",
  textAlign: "center",
  includeFontPadding: false,
  maxWidth: "100%",
},

goalSettingIconButton: {
  width: 16,
  height: 16,
  borderRadius: 16,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "rgba(255,250,242,0.65)",
},

goalSettingIconImage: {
  width: 23,
  height: 23,
  opacity: 0.9,
},

goalSettingIcon: {
  fontSize: 17,
  color: "#5b3f30",
},

goalSubValue: {
  marginTop: 2,
  fontSize: 12,
  color: "#5f5147",
},
imageModalCard: {
  width: "92%",
  aspectRatio: 1680 / 750,
  position: "relative",
},

imageModalBg: {
  position: "absolute",
  width: "100%",
  height: "115%",
},

imageModalInput: {
  position: "absolute",
  width: "18%",
  height: 34,
  textAlign: "center",
  fontSize: 13,
  color: "#5b3f30",
  fontFamily: "ChosunCentennial",
  backgroundColor: "transparent",
  padding: 0,
},

modalInputOne: {
  left: "7%",
  top: "51%",
},

modalInputTwo: {
  left: "30%",
  top: "51%",
},

modalInputThree: {
  left: "52%",
  top: "51%",
},

modalInputFour: {
  left: "75%",
  top: "51%",
},

modalCloseHotspot: {
  position: "absolute",
  top: -4,
  right: 20,
  width: 45,
  height: 45,
},

modalCancelHotspot: {
  position: "absolute",
  left: "33%",
  bottom: -10,
  width: "15%",
  height: 35,
},

modalSaveHotspot: {
  position: "absolute",
  left: "51%",
  bottom: -10,
  width: "22%",
  height: 35,
},
memoImageCard: {
  position: "relative",
  height: 130,
  marginBottom: 12,
},

memoCardBg: {
  position: "absolute",
  width: "100%",
  height: "100%",
},

memoPreviewText: {
  position: "absolute",
  left: 28,
  right: 78,
  top: 62,
  fontSize: 13,
  lineHeight: 20,
  color: "#4c3a31",
},

memoEditHotspot: {
  position: "absolute",
  right: 26,
  top: 28,
  width: 54,
  height: 54,
},

memoDetailButton: {
  position: "absolute",
  left: 130,
  top: 25,
},

memoDetailButtonText: {
  fontSize: 11,
  fontWeight: "600",
  color: "#7a6254",
  top: 5,
  fontFamily: "ChosunCentennial",
  opacity:0.7,
},

memoHistoryModalCard: {
  width: "88%",
  maxHeight: "72%",
  backgroundColor: "#fffdf9",
  borderRadius: 24,
  padding: 20,
  borderWidth: 1,
  borderColor: "#eadfce",
},

memoHistoryModalTitle: {
  fontSize: 20,
  fontWeight: "700",
  color: "#5b3f30",
  marginBottom: 16,
  fontFamily: "ChosunCentennial",
},

memoHistoryCloseButton: {
  position: "absolute",
  right: 18,
  top: 14,
  width: 36,
  height: 36,
  alignItems: "center",
  justifyContent: "center",
},

memoHistoryCloseText: {
  fontSize: 30,
  color: "#8a7a6f",
},

memoHistoryScroll: {
  marginTop: 8,
  maxHeight: 300,
},

memoHistoryScrollContent: {
  paddingBottom: 12,
},

memoHistoryModalItem: {
  paddingVertical: 12,
  borderBottomWidth: 1,
  borderBottomColor: "#eee4d7",
},
memoEditModalCard: {
  width: "88%",
  backgroundColor: "#fffdf9",
  borderRadius: 24,
  padding: 20,
  borderWidth: 1,
  borderColor: "#eadfce",
},

memoEditModalInput: {
  minHeight: 150,
  marginTop: 10,
  padding: 14,
  borderRadius: 16,
  borderWidth: 1,
  borderColor: "#eadfce",
  backgroundColor: "rgba(255,255,255,0.72)",
  fontSize: 20,
  lineHeight: 22,
  color: "#4c3a31",
},

memoEditModalButtonRow: {
  marginTop: 16,
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  gap: 18,
},

memoEditCancelButton: {
  paddingHorizontal: 18,
  paddingVertical: 10,
},

memoEditCancelText: {
  fontSize: 15,
  fontWeight: "800",
  color: "#5b3f30",
  fontFamily: "ChosunCentennial",
},

memoEditSaveButton: {
  paddingHorizontal: 28,
  paddingVertical: 10,
  borderRadius: 999,
  backgroundColor: "#9b8676",
},

memoEditSaveText: {
  fontSize: 15,
  fontWeight: "800",
  color: "#fffdf9",
  fontFamily: "ChosunCentennial",
},
riverGlow: {
  position: "absolute",
  left: "39%",
  top: 120,
  width: "15%",
  height: 190,
  borderRadius: 999,
  backgroundColor: "rgba(255, 244, 211, 0.22)",
  zIndex: 6,
  elevation: 6,
},
riverHighlight: {
  position: "absolute",
  left: -320,
  top: 95,

  width: 390,
  height: 440,

  zIndex: 4,
  elevation: 4,

  resizeMode: "stretch",
},
coachingTipTitleImage: {
  width: 130,
  height: 50,
  marginBottom: 3,
  marginTop: -7,
},
});