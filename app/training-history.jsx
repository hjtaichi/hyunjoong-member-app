import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { getMemberHome } from "../src/api/memberHome";
import { colors } from "../src/theme/colors";
import { Image, ImageBackground } from "react-native";
import { useAuth } from "../src/contexts/AuthContext";
import {
  getMyHistoryEvents,
  getCommonHistoryMilestones,
} from "../src/api/memberHistoryEvents";
import { LinearGradient } from "expo-linear-gradient";


const fogLayer = require("../assets/images/fog-layer.png");
const goldPath = require("../assets/images/gold-path.png");
const walkerStage1 = require("../assets/images/walker-stage-1.png");
const walkerStage2 = require("../assets/images/walker-stage-2.png");
const walkerStage3 = require("../assets/images/walker-stage-3.png");
const walkerStage4 = require("../assets/images/walker-stage-4.png");
const walkerStage5 = require("../assets/images/walker-stage-5.png");
const walkerStage6 = require("../assets/images/walker-stage-6.png");
const walkerStage7 = require("../assets/images/walker-stage-7.png");
const walkerStage8 = require("../assets/images/walker-stage-8.png");
const walkerStage9 = require("../assets/images/walker-stage-9.png");
const statsIcon = require("../assets/images/stats-icon.png");
const JOURNEY_IMAGES = {
  spring: {
    start: require("../assets/journey/spring/spring-start.png"),
    1: require("../assets/journey/spring/spring-1.png"),
    2: require("../assets/journey/spring/spring-2.png"),
    3: require("../assets/journey/spring/spring-3.png"),
    4: require("../assets/journey/spring/spring-4.png"),
    end: require("../assets/journey/spring/spring-end.png"),
  },
  summer: {
    start: require("../assets/journey/summer/summer-start.png"),
    1: require("../assets/journey/summer/summer-1.png"),
    2: require("../assets/journey/summer/summer-2.png"),
    3: require("../assets/journey/summer/summer-3.png"),
    4: require("../assets/journey/summer/summer-4.png"),
    end: require("../assets/journey/summer/summer-end.png"),
  },
  autumn: {
    start: require("../assets/journey/autumn/autumn-start.png"),
    1: require("../assets/journey/autumn/autumn-1.png"),
    2: require("../assets/journey/autumn/autumn-2.png"),
    3: require("../assets/journey/autumn/autumn-3.png"),
    4: require("../assets/journey/autumn/autumn-4.png"),
    end: require("../assets/journey/autumn/autumn-end.png"),
  },
  winter: {
    start: require("../assets/journey/winter/winter-start.png"),
    1: require("../assets/journey/winter/winter-1.png"),
    2: require("../assets/journey/winter/winter-2.png"),
    3: require("../assets/journey/winter/winter-3.png"),
    4: require("../assets/journey/winter/winter-4.png"),
    end: require("../assets/journey/winter/winter-end.png"),
  },
};

const WALKER_IMAGES = [
  walkerStage1,
  walkerStage2,
  walkerStage3,
  walkerStage4,
  walkerStage5,
  walkerStage6,
  walkerStage7,
  walkerStage8,
  walkerStage9,
];

const JOURNEY_PATH_POINTS = {
  start: [
    { progress: 0, x: 0.361, y: 0.671, scale: 1.4 },
    { progress: 0.5, x: 0.375, y: 0.585, scale: 1.2 },
    { progress: 0.8, x: 0.373, y: 0.530, scale: 0.9 },
    { progress: 1, x: 0.361, y: 0.512, scale: 0.7 },
  ],
  1: [
    { progress: 0, x: 0.403, y: 0.780, scale: 2 },
    { progress: 0.5, x: 0.35, y: 0.598, scale: 1.6 },
    { progress: 1, x: 0.37, y: 0.415, scale: 0.8 },
  ],
  2: [
    { progress: 0, x: 0.597, y: 0.780, scale: 2 }, //300
    { progress: 0.5, x: 0.71, y: 0.561, scale: 1.4 }, //425
    { progress: 0.72, x: 0.55, y: 0.488, scale: 1 },
    { progress: 0.9, x: 0.67, y: 0.402, scale: 0.8 },
    { progress: 1, x: 0.5, y: 0.376, scale: 0.6 },
  ],
  3: [
    { progress: 0, x: 0.278, y: 0.768, scale: 2 },
    { progress: 0.25, x: 0.292, y: 0.622, scale: 1.7 },
    { progress: 0.5, x: 0.472, y: 0.494, scale: 1.4 },
    { progress: 0.76, x: 0.79, y: 0.350, scale: 1 },
    { progress: 0.92, x: 0.63, y: 0.256, scale: 0.7 },
    { progress: 1, x: 0.67, y: 0.220, scale: 0.6 },
  ],
  4: [
    { progress: 0, x: 0.35, y: 0.768, scale: 2 },
    { progress: 0.25, x: 0.3, y: 0.622, scale: 1.7 },
    { progress: 0.5, x: 0.444, y: 0.494, scale: 1.4 },
    { progress: 0.73, x: 0.71, y: 0.311, scale: 1 },
    { progress: 0.92, x: 0.67, y: 0.256, scale: 0.7 },
    { progress: 1, x: 0.67, y: 0.220, scale: 0.6 },
  ],
  end: [
    { progress: 0, x: 0.389, y: 0.768, scale: 2 }, //1050
    { progress: 0.3, x: 0.35, y: 0.64, scale: 1.7 }, //1095 
    { progress: 0.45, x: 0.1, y: 0.58, scale: 1.55 }, //1118
    { progress: 0.5, x: 0.38, y: 0.46, scale: 1.4 },  //1125
    { progress: 0.6, x: 0.13, y: 0.35, scale: 1.1 }, //1140
    { progress: 0.82, x: 0.4, y: 0.238, scale: 1 }, //1173
    { progress: 0.87, x: 0.35, y: 0.220, scale: 0.8 }, //1180.5
    { progress: 0.94, x: 0.406, y: 0.18, scale: 0.7 }, //1191
    { progress: 1, x: 0.45, y: 0.159, scale: 0.6 }, //1200
  ],
};
const JOURNEY_CARD_POINTS = {
  start: {
  current: { top: 640, right: 40 },
  next: { top: 470, left: 28 },
},
  1: {
    current: { top: 500, right: 16 },
    next: { top: 190, left: 28 },
  },
  2: {
    current: { top: 500, right: 16 },
    next: { top: 190, left: 28 },
  },
  3: {
    current: { top: 500, right: 16 },
    next: { top: 190, left: 28 },
  },
  4: {
    current: { top: 500, right: 16 },
    next: { top: 190, left: 28 },
  },
  end: {
    current: { top: 500, right: 16 },
    next: { top: 190, left: 28 },
  },
};
const STAGES = [
  { days: 0, title: "입관", desc: "현중태극권의 길에 들어서다" },

  ...Array.from({ length: 12 }, (_, index) => {
    const days = (index + 1) * 100;

    return {
      days,
      title: `수련 ${days}일째`,
      desc: "꾸준함이 길을 만든다",
    };
  }),
];

function getCurrentSeason(date = new Date()) {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const md = month * 100 + day;

  if (md >= 315 && md <= 510) return "spring";
  if (md >= 511 && md <= 915) return "summer";
  if (md >= 916 && md <= 1130) return "autumn";
  return "winter";
}

function getJourneyRange(days) {
  if (days < 50) return { start: 0, end: 50 };
  if (days < 300) return { start: 50, end: 300 };
  if (days < 550) return { start: 300, end: 550 };
  if (days < 800) return { start: 550, end: 800 };
  if (days < 1050) return { start: 800, end: 1050 };
  return { start: 1050, end: 1200 };
}

function getJourneySegment(days) {
  if (days < 50) return "start";
  if (days < 300) return "1";
  if (days < 550) return "2";
  if (days < 800) return "3";
  if (days < 1050) return "4";
  if (days < 1200) return "end";
  return "end";
}

function getWalkerStageIndex(attendanceCount) {
  if (attendanceCount >= 800) return 8;
  if (attendanceCount >= 700) return 7;
  if (attendanceCount >= 600) return 6;
  if (attendanceCount >= 500) return 5;
  if (attendanceCount >= 400) return 4;
  if (attendanceCount >= 300) return 3;
  if (attendanceCount >= 200) return 2;
  if (attendanceCount >= 100) return 1;
  return 0;
}

function getJoinedPeriodLabel(joinedAt) {
  if (!joinedAt) return "입관일 확인 필요";

  const start = new Date(joinedAt);
  const today = new Date();

  if (Number.isNaN(start.getTime())) return "입관일 확인 필요";

  const diffMs =
    new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime() -
    new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();

  const days = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  return `입관 ${days}일째`;
}

function getSegmentProgress(days) {
  const range = getJourneyRange(days);

  return Math.min(
    1,
    Math.max(0, (days - range.start) / (range.end - range.start))
  );
}
function getNextDanEvent(member) {
  const danPromotions = Array.isArray(member?.danPromotions)
    ? member.danPromotions
    : [];

  const currentRankLevel = Number(
    member?.rankLevel ?? String(member?.level || "").replace("단", "") ?? 0
  );

  if (currentRankLevel <= 0) {
    return {
      days: 150,
      title: "1단 승단 가능",
      desc: "관리자 확인 후 승단을 진행할 수 있습니다.",
      kind: "promotion",
    };
  }

  const latestPromotion = [...danPromotions]
    .sort((a, b) => Number(b.danRank) - Number(a.danRank))[0];

  if (!latestPromotion) return null;

  const nextRank = currentRankLevel + 1;
  const requiredDays = nextRank * 150;

  return {
    days: Number(latestPromotion.attendanceDay || 0) + requiredDays,
    title: `${nextRank}단 승단 가능`,
    desc: `${currentRankLevel}단 승단 후 다음 단계에 도전할 수 있습니다.`,
    kind: "promotion",
  };
}

export default function TrainingHistoryScreen() {
  const [loading, setLoading] = useState(true);
  const [homeData, setHomeData] = useState(null);
  const [historyEvents, setHistoryEvents] = useState([]);
  const [commonMilestones, setCommonMilestones] = useState([]);
  const { token } = useAuth();
  const [sceneSize, setSceneSize] = useState({
  width: 360,
  height: 820,
});

  useEffect(() => {
  async function load() {
    if (!token) return;

    try {
      const result = await getMemberHome(token);
      setHomeData(result);

      const history = await getMyHistoryEvents(token);
      setHistoryEvents(history);

      const common = await getCommonHistoryMilestones(token);
      setCommonMilestones(common);
    } finally {
      setLoading(false);
    }
  }

  load();
}, [token]);

  const member = homeData?.member || {};
  const trainingStats = homeData?.trainingStats || {};
  const realAttendanceCount = 
  member?.totalAttendanceCount ??
  member?.attendanceCount ??
  homeData?.totalAttendanceCount ??
  0;

const attendanceCount = realAttendanceCount;

  const joinedAt = member?.joinDate || member?.joinedAt || null;

  const nextStage = useMemo(() => {
    return STAGES.find((stage) => stage.days > attendanceCount) || null;
  }, [attendanceCount]);

  const previousStage = useMemo(() => {
    return [...STAGES]
      .reverse()
      .find((stage) => stage.days <= attendanceCount);
  }, [attendanceCount]);
const walkerStageIndex = getWalkerStageIndex(attendanceCount);
const currentWalkerImage = WALKER_IMAGES[walkerStageIndex];

const currentStageIndex = Math.max(
  0,
  STAGES.findIndex((stage) => stage.days === previousStage?.days)
);

const nextStageIndex = Math.min(currentStageIndex + 1, STAGES.length - 1);


const STAGE_GAP = 120;
const START_BOTTOM_OFFSET = 120;
const DAY_HEIGHT = 2.15;
const MAX_JOURNEY_DAYS = 1200;
const SCENE_TOP_PADDING = 210;
const SCENE_BOTTOM_PADDING = 120;

const season = getCurrentSeason();
const segment = getJourneySegment(attendanceCount);
const currentJourneyImage = JOURNEY_IMAGES[season][segment];
const range = getJourneyRange(attendanceCount);

const sceneHeight = 820;

function getStageTop(index) {
  return sceneHeight - START_BOTTOM_OFFSET - index * STAGE_GAP;
}

function getDayTop(day) {
  const range = getJourneyRange(attendanceCount);

  const clampedDay = Math.min(
    Math.max(day, range.start),
    range.end
  );

  const segmentProgress =
    (clampedDay - range.start) / (range.end - range.start);

  const usableHeight = sceneHeight - SCENE_TOP_PADDING - SCENE_BOTTOM_PADDING;

  return sceneHeight - SCENE_BOTTOM_PADDING - usableHeight * segmentProgress;
}

function getStageLayout(index) {
  const isCurrent = index === displayCurrentStageIndex;
  const cardPoints = JOURNEY_CARD_POINTS[segment] || JOURNEY_CARD_POINTS.start;

  return isCurrent ? cardPoints.current : cardPoints.next;
}

function getWalkerPosition() {
  const points = JOURNEY_PATH_POINTS[segment] || JOURNEY_PATH_POINTS.start;
  const progress = getSegmentProgress(attendanceCount);

  let previous = points[0];
  let next = points[points.length - 1];

  for (let i = 0; i < points.length - 1; i++) {
    if (
      progress >= points[i].progress &&
      progress <= points[i + 1].progress
    ) {
      previous = points[i];
      next = points[i + 1];
      break;
    }
  }

  const sectionProgress =
    (progress - previous.progress) /
    (next.progress - previous.progress || 1);

  const x =
  previous.x + (next.x - previous.x) * sectionProgress;

const y =
  previous.y + (next.y - previous.y) * sectionProgress;

const scale =
  (previous.scale ?? 1) +
  ((next.scale ?? 1) - (previous.scale ?? 1)) * sectionProgress;

const imageWidth = sceneSize.width;
const imageHeight = sceneSize.height;

return {
  top: imageHeight * y,
  left: imageWidth * x,
  transform: [{ scale }],
};
}

  const progressText = nextStage
    ? `${Math.max(0, nextStage.days - attendanceCount)}일 더 수련하면 ${nextStage.title}`
    : "수련의 길은 계속 이어집니다";
const promotionGoal = homeData?.trainingGoals?.promotion;

const nextDanEvent = promotionGoal
  ? {
      days: promotionGoal.requiredAttendanceCount,
      title: promotionGoal.label || `${promotionGoal.nextRankLevel}단 승단심사`,
      desc: `${promotionGoal.nextRankLevel}단까지 앞으로 ${promotionGoal.remainingCount}일 남았습니다.`,
      kind: "promotion",
    }
  : getNextDanEvent(member);
const mergedStages = [
  {
    days: 0,
    title: "입관",
    desc: "현중태극권의 길에 들어서다",
    kind: "start",
  },

  ...(nextDanEvent ? [nextDanEvent] : []),

  ...historyEvents.map((event) => ({
    days: event.attendanceDay,
    title: event.title,
    desc: event.description || "",
    eventDate: event.eventDate,
    kind: "custom",
  })),
].sort((a, b) => a.days - b.days);

const completedStages = [...mergedStages]
  .reverse()
  .filter((stage) => stage.days <= attendanceCount);

const displayPreviousStage =
  completedStages.find((stage) => {
    if (stage.kind === "start" && attendanceCount >= 50) return false;
    return true;
  }) || null;

const displayNextStage =
  mergedStages.find((stage) => stage.days > attendanceCount) || null;
const statsTargetDays = displayNextStage?.days ?? null;

const statsRemainDays =
  statsTargetDays != null
    ? Math.max(0, statsTargetDays - attendanceCount)
    : 0;

const statsProgressPercent =
  statsTargetDays != null && statsTargetDays > 0
    ? Math.min(100, Math.max(0, (attendanceCount / statsTargetDays) * 100))
    : 100;

const expectedTrainingHours = Math.floor(attendanceCount * 1.5);
  const displayNextStages = mergedStages
  .filter((stage) => stage.days > attendanceCount)
  .slice(0, 2);

const visibleStages = [
  ...(displayPreviousStage ? [displayPreviousStage] : []),
  ...displayNextStages,
];

const displayCurrentStageIndex = Math.max(
  0,
  mergedStages.findIndex((stage) => stage.days === displayPreviousStage?.days)
);

const displayNextStageIndex = Math.min(
  displayCurrentStageIndex + 1,
  mergedStages.length - 1
);
  
    if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>수련의 길을 불러오는 중입니다.</Text>
      </View>
    );
  }

  return (
   <View style={styles.bg}>
  
  <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>‹</Text>
        </Pressable>

        <View style={styles.headerTextWrap}>
          <Text style={styles.title}>수련의 길</Text>
          <Text style={styles.subtitle}>고수를 향해, 한 걸음 한 걸음</Text>
        </View>
      </View>

      

      
      <View
  style={[styles.journeyScene, { height: sceneHeight }]}
  onLayout={(event) => {
    const { width, height } = event.nativeEvent.layout;
    setSceneSize({ width, height });
  }}
>
        
  <View style={styles.journeyBlockLayer}>
  <Image
    source={currentJourneyImage}
    style={styles.journeyFullImage}
    resizeMode="cover"
  />
</View>

  <View style={styles.sceneProfileCard}>
  <Text style={styles.sceneProfileName}>{member?.name || "회원"}</Text>

  <Text style={styles.sceneProfileMeta}>
    입관일 {joinedAt ? String(joinedAt).slice(0, 10) : "-"}
  </Text>

  <Text style={styles.sceneProfileWalkText}>
    수련의 길 {attendanceCount}일째 걷는 중
  </Text>
</View>

  <Image
  source={currentWalkerImage}
  style={[
    styles.sceneWalker,
    getWalkerPosition(),
  ]}
  resizeMode="contain"
/>

  {mergedStages.map((stage, index) => {
    const completed = attendanceCount >= stage.days;
    const current = displayPreviousStage?.days === stage.days;
    const future = !completed;

    const visible = visibleStages.some((item) => item.days === stage.days);
if (!visible) return null;

const layout = getStageLayout(index);

return (
      <View
  style={[
    styles.sceneMilestone,
    current ? styles.sceneMilestoneRight : styles.sceneMilestoneLeft,
    {
      top: layout.top,
      left: layout.left,
      right: layout.right,
    },
  ]}
>
        <View
          style={[
            styles.sceneDot,
            completed && styles.sceneDotCompleted,
            current && styles.sceneDotCurrent,
            future && styles.sceneDotFuture,
          ]}
        >
          <Text
            style={[
              styles.sceneDotText,
              current && styles.sceneDotTextCurrent,
            ]}
          >
            {completed ? "✓" : ""}
          </Text>
        </View>

        <View
          style={[
            styles.sceneTextBox,
            current && styles.sceneTextBoxCurrent,
            future && styles.sceneTextBoxFuture,
          ]}
        >
          <Text
            style={[
              styles.sceneMilestoneTitle,
              current && styles.sceneMilestoneTitleCurrent,
              future && styles.sceneMilestoneTitleFuture,
            ]}
          >
            {stage.title}
          </Text>

          {stage.kind === "custom" ? (
  <Text style={styles.customEventBadge}>특별 수련 기록</Text>
) : null}

          <Text
  style={[
    styles.sceneMilestoneDesc,
    current && styles.sceneMilestoneDescCurrent,
    future && styles.sceneMilestoneDescFuture,
  ]}
>
  {stage.desc}
</Text>
   </View>
      </View>
    );
  })}

  <LinearGradient
  pointerEvents="none"
  colors={[
    "rgba(247,241,232,1)",
    "rgba(247,241,232,0.75)",
    "rgba(247,241,232,0)",
  ]}
  locations={[0, 0.35, 1]}
  style={styles.journeyTopFade}
/>

<LinearGradient
  pointerEvents="none"
  colors={[
    "rgba(247,241,232,0)",
    "rgba(247,241,232,0.38)",
    "rgba(247,241,232,1)",
  ]}
  locations={[0, 0.5, 1]}
  style={styles.journeyBottomFade}
/>
</View>

      <Pressable
  style={styles.trainingStatsCard}
  onPress={() => router.push("/training-stats")}
>
  <View style={styles.trainingStatsHeader}>
    <View style={styles.trainingStatsTitleRow}>
      <Image
        source={statsIcon}
        style={styles.trainingStatsIconImage}
        resizeMode="contain"
      />
      <Text style={styles.trainingStatsTitle}>내 수련 통계</Text>
    </View>

    <View style={styles.trainingStatsViewButton}>
      <Text style={styles.trainingStatsViewButtonText}>1년 보기</Text>
    </View>
  </View>

  <View style={styles.trainingStatsMainRow}>
    <View style={styles.trainingStatsMainItem}>
      <Text style={styles.trainingStatsMainValue}>
        {attendanceCount}일
      </Text>
      <Text style={styles.trainingStatsMainLabel}>총 출석일</Text>
    </View>

    <View style={styles.trainingStatsCenterDot} />

    <View style={styles.trainingStatsMainItem}>
      <Text style={styles.trainingStatsMainValue}>
        {expectedTrainingHours}시간
      </Text>
      <Text style={styles.trainingStatsMainLabel}>예상 수련 시간</Text>
    </View>
  </View>

  <View style={styles.trainingStatsGoalPanel}>
  <Text style={styles.trainingStatsGoalSmallLabel}>다음 목표</Text>

  <View style={styles.trainingStatsGoalTitleRow}>
    <Text style={styles.trainingStatsGoalBigTitle}>
      {displayNextStage?.title || "수련의 길은 계속 이어집니다"}
    </Text>

    {displayNextStage ? (
      <View style={styles.trainingStatsProgressTrackInline}>
        <View
          style={[
            styles.trainingStatsProgressFill,
            { width: `${statsProgressPercent}%` },
          ]}
        />
      </View>
    ) : null}
  </View>

  <Text style={styles.trainingStatsGoalDesc}>
    {displayNextStage
      ? `현재 ${attendanceCount}일 · 목표 ${statsTargetDays}일 · 앞으로 ${statsRemainDays}일`
      : "꾸준히 한 걸음씩 나아가고 있어요"}
  </Text>
</View>
</Pressable>
     </ScrollView>

  <Image
  source={fogLayer}
  style={styles.sceneTopFog}
  resizeMode="cover"
/>
</View>
  );
}

const styles = StyleSheet.create({
  screen: {
  flex: 1,
  backgroundColor: "transparent",
},
  content: {
  paddingHorizontal: 16,
  paddingTop: 20,
  paddingBottom: 40,
  gap: 8,
},
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: colors.textSub,
  },
  headerRow: {
  flexDirection: "row",
  alignItems: "center",
  gap: 12,
},
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  backButtonText: {
    fontSize: 30,
    color: colors.warmBrown,
    marginTop: -2,
  },
  headerTextWrap: {
    flex: 1,
    alignItems: "center",
    marginRight: 42,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: colors.textMain,
  },
  subtitle: {
    marginTop: 5,
    fontSize: 14,
    color: colors.textSub,
  },
  profileCard: {
  borderRadius: 24,
  backgroundColor: "rgba(255,253,249,0.92)",
  borderWidth: 1,
  borderColor: colors.border,
  padding: 16,
},
  memberName: {
    fontSize: 22,
    fontWeight: "900",
    color: colors.textMain,
  },
  memberMeta: {
    marginTop: 6,
    fontSize: 14,
    color: colors.textSub,
  },
  currentBadge: {
    alignSelf: "flex-start",
    marginTop: 14,
    borderRadius: 999,
    backgroundColor: "#2B2522",
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  currentBadgeText: {
    fontSize: 16,
    fontWeight: "900",
    color: "#F1D39A",
  },
  progressText: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSub,
  },
  timelineCard: {
  borderRadius: 30,
  backgroundColor: "rgba(255, 254, 252, 0.82)",
  borderWidth: 1,
  borderColor: "rgba(232, 222, 210, 0.8)",
  paddingVertical: 18,
  paddingHorizontal: 16,
  overflow: "hidden",
},
  timelineItem: {
    minHeight: 100,
    flexDirection: "row",
    position: "relative",
  },
  timelineLine: {
    position: "absolute",
    left: 18,
    top: 38,
    bottom: -2,
    width: 3,
    borderRadius: 999,
    backgroundColor: "#DDD5CA",
  },
  timelineLineCompleted: {
    backgroundColor: "#C9A25B",
  },
  timelineDot: {
    width: 39,
    height: 39,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#D8CEC2",
    backgroundColor: "#F2EEE8",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  timelineDotCompleted: {
    backgroundColor: "#F4E2B5",
    borderColor: "#C9A25B",
  },
  timelineDotCurrent: {
  backgroundColor: "#2B2522",
  borderColor: "#D6AA55",
  shadowColor: "#D6AA55",
  shadowOpacity: 0.55,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
  elevation: 10,
},
  timelineDotFuture: {
    opacity: 0.45,
  },
  timelineDotText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#8C6330",
  },
  timelineDotTextCompleted: {
    color: "#8C6330",
  },
  eventCard: {
    flex: 1,
    marginLeft: 12,
    marginBottom: 18,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#E8DED2",
    backgroundColor: "#FFFDF9",
  },
  eventCardCompleted: {
    backgroundColor: "#FFF8EC",
    borderColor: "#E3C789",
  },
  eventCardCurrent: {
    backgroundColor: "#2B2522",
    borderColor: "#D6AA55",
  },
  eventCardFuture: {
    opacity: 0.56,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.textMain,
  },
  eventTitleCurrent: {
    color: "#F1D39A",
  },
  eventTitleFuture: {
    color: "#7D746D",
  },
  eventDesc: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSub,
  },
  eventMeta: {
    marginTop: 9,
    fontSize: 12,
    fontWeight: "800",
    color: "#9A6A33",
  },
  continueBox: {
  marginTop: 4,
  borderRadius: 24,
  backgroundColor: "rgba(244, 238, 230, 0.72)",
  borderWidth: 1,
  borderColor: "rgba(232, 222, 210, 0.7)",
  padding: 18,
  alignItems: "center",
},
  continueTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: colors.textMain,
  },
  continueDesc: {
    marginTop: 6,
    fontSize: 13,
    color: colors.textSub,
  },
  statCard: {
    flexDirection: "row",
    borderRadius: 26,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 18,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 22,
    fontWeight: "900",
    color: colors.textMain,
  },
  statLabel: {
    marginTop: 5,
    fontSize: 12,
    color: colors.textSub,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  bg: {
  flex: 1,
  backgroundColor: "#F7F1E8",
  position: "relative",
},

backgroundPoster: {
  position: "absolute",
  top: 84,
  left: "4%",
  width: "92%",
  height: 720,
  opacity: 0.72,
},

screen: {
  flex: 1,
  backgroundColor: "transparent",
},

walkerWrap: {
  alignItems: "center",
  marginTop: -4,
  marginBottom: -4,
},

walkerImage: {
  width: 128,
  height: 180,
  opacity: 0.9,
},

walkerCaption: {
  marginTop: -8,
  fontSize: 13,
  fontWeight: "800",
  color: "#6B4F46",
},

fogBottom: {
  position: "absolute",
  left: 0,
  right: 0,
  bottom: 0,
  height: 180,
  opacity: 0.35,
  pointerEvents: "none",
},
pathPreviewWrap: {
  height: 150,
  marginTop: -18,
  marginBottom: -18,
  position: "relative",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
},

goldPathImage: {
  width: "120%",
  height: 160,
  opacity: 0.72,
},

currentPositionMarker: {
  position: "absolute",
  bottom: 28,
  alignSelf: "center",
  paddingHorizontal: 13,
  paddingVertical: 7,
  borderRadius: 999,
  backgroundColor: "rgba(43, 37, 34, 0.88)",
  borderWidth: 1,
  borderColor: "#D6AA55",
},

currentPositionText: {
  fontSize: 12,
  fontWeight: "900",
  color: "#F1D39A",
},

eventCardGlow: {
  shadowColor: "#D6AA55",
  shadowOpacity: 0.35,
  shadowRadius: 14,
  shadowOffset: { width: 0, height: 5 },
  elevation: 8,
},
walkerStageText: {
  marginTop: 4,
  fontSize: 11,
  fontWeight: "800",
  color: "#9A8F81",
},
continueIcon: {
  fontSize: 28,
  fontWeight: "900",
  color: "#C9A25B",
  marginBottom: 4,
},
journeyScene: {
  position: "relative",
  marginTop: -11,
  marginLeft: -16,
  marginRight: -16,

  borderTopLeftRadius: 0,
  borderTopRightRadius: 0,
  borderBottomLeftRadius: 0,
  borderBottomRightRadius: 0,

  borderWidth: 0,
  overflow: "hidden",
  backgroundColor: "#F7F1E8",
  marginBottom: 0,
},

sceneWalker: {
  position: "absolute",
  width: 82,
  height: 124,
  opacity: 0.96,
  zIndex: 5,
},

sceneMilestone: {
  position: "absolute",
  width: 110,
  alignItems: "center",
  zIndex: 6,
},

sceneDot: {
  width: 38,
  height: 38,
  borderRadius: 19,
  backgroundColor: "rgba(242, 238, 232, 0.92)",
  borderWidth: 2,
  borderColor: "#D8CEC2",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 6,
},

sceneDotCompleted: {
  backgroundColor: "#F4E2B5",
  borderColor: "#C9A25B",
},

sceneDotCurrent: {
  backgroundColor: "#2B2522",
  borderColor: "#D6AA55",
  shadowColor: "#D6AA55",
  shadowOpacity: 0.45,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 3 },
  elevation: 8,
},

sceneDotFuture: {
  opacity: 0.75,
},

sceneTextBoxFuture: {
  backgroundColor: "rgba(255, 253, 249, 0.38)",
  borderColor: "rgba(214, 170, 85, 0.28)",
},

sceneDotText: {
  fontSize: 13,
  fontWeight: "900",
  color: "#8C6330",
},

sceneDotTextCurrent: {
  color: "#F1D39A",
},

sceneTextBox: {
  width: 110,
  borderRadius: 13,
  paddingHorizontal: 9,
  paddingVertical: 7,
  backgroundColor: "rgba(255, 253, 249, 0.72)",
  borderWidth: 1,
  borderColor: "rgba(214, 170, 85, 0.45)",
},

sceneTextBoxCurrent: {
  backgroundColor: "rgba(43, 37, 34, 0.86)",
  borderRadius: 14,
  paddingHorizontal: 10,
  paddingVertical: 8,
  borderWidth: 1,
  borderColor: "#D6AA55",
},


sceneMilestoneTitle: {
  fontSize: 16,
  fontWeight: "900",
  color: "#3A2E26",
  textShadowColor: "rgba(255,255,255,0.7)",
  textShadowRadius: 4,
},

sceneMilestoneTitleCurrent: {
  color: "#F1D39A",
},

sceneMilestoneTitleFuture: {
  color: "#4A382C",
},
sceneMilestoneDescFuture: {
  color: "#6F6258",
},
sceneMilestoneDesc: {
  marginTop: 4,
  fontSize: 11,
  lineHeight: 16,
  color: "#6F6258",
},

sceneMilestoneDescCurrent: {
  color: "rgba(255, 253, 249, 0.72)",
},

sceneMilestoneMeta: {
  marginTop: 6,
  fontSize: 10,
  fontWeight: "900",
  color: "#A26B25",
},

sceneContinue: {
  position: "absolute",
  top: 32,
  left: 24,
  right: 24,
  borderRadius: 22,
  backgroundColor: "rgba(255, 253, 249, 0.72)",
  borderWidth: 1,
  borderColor: "rgba(232, 222, 210, 0.74)",
  padding: 16,
  alignItems: "center",
  zIndex: 8,
},

sceneContinueTitle: {
  fontSize: 16,
  fontWeight: "900",
  color: colors.textMain,
},

sceneContinueDesc: {
  marginTop: 5,
  fontSize: 12,
  color: colors.textSub,
},
journeyBlockLayer: {
  ...StyleSheet.absoluteFillObject,
  zIndex: 0,
},

journeyBlockImage: {
  width: "100%",
  height: 250,
},
sceneTopFog: {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  height: 260,
  opacity: 0.45,
  zIndex: 7,
},
customEventBadge: {
  marginTop: 4,
  fontSize: 10,
  fontWeight: "900",
  color: "#D6AA55",
},
sceneProfileCard: {
  position: "absolute",
  top: 22,
  left: 18,
  zIndex: 10,
  width: 165,
  borderRadius: 18,
  backgroundColor: "rgba(255, 252, 246, 0.74)",
  borderWidth: 1,
  borderColor: "rgba(224, 214, 200, 0.82)",
  paddingHorizontal: 16,
  paddingVertical: 14,
},

sceneProfileName: {
  fontSize: 18,
  fontWeight: "900",
  color: "#2F2520",
},

sceneProfileMeta: {
  marginTop: 7,
  fontSize: 12,
  color: "#6F6258",
},

sceneProfileWalkText: {
  marginTop: 7,
  fontSize: 12,
  fontWeight: "800",
  color: "#4D3A2F",
},
journeyFullImage: {
  width: "100%",
  height: "100%",
},
sceneMilestoneRight: {
  alignItems: "flex-start",
},

sceneMilestoneLeft: {
  alignItems: "flex-end",
},

trainingStatsCard: {
  marginTop: -62,
  marginHorizontal: 8,
  borderRadius: 30,
  backgroundColor: "rgba(255, 253, 249, 0.98)",
  borderWidth: 1,
  borderColor: "rgba(232, 222, 210, 0.95)",
  padding: 18,
  shadowColor: "#5A3A1D",
  shadowOpacity: 0.08,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 8 },
  elevation: 5,
  zIndex: 20,
},

trainingStatsHeader: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 18,
},

trainingStatsTitleRow: {
  flexDirection: "row",
  alignItems: "center",
  gap: 10,
},

trainingStatsIconImage: {
  width: 34,
  height: 34,
},

trainingStatsTitle: {
  fontSize: 17,
  fontWeight: "800",
  color: colors.textMain,
  letterSpacing: -0.3,
},

trainingStatsViewButton: {
  borderRadius: 999,
  backgroundColor: "rgba(255, 248, 234, 0.92)",
  borderWidth: 1,
  borderColor: "rgba(214, 170, 85, 0.34)",
  paddingHorizontal: 16,
  paddingVertical: 8,
},

trainingStatsViewButtonText: {
  fontSize: 13,
  fontWeight: "800",
  color: "#8C6330",
},

trainingStatsMainRow: {
  minHeight: 80,
  borderRadius: 20,
  borderWidth: 1,
  borderColor: "rgba(232, 222, 210, 0.92)",
  backgroundColor: "rgba(255, 255, 255, 0.62)",
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: 14,
  marginBottom: 12,
},

trainingStatsMainItem: {
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
},

trainingStatsMainValue: {
  fontSize: 25,
  fontWeight: "700",
  color: "#2E2118",
  letterSpacing: -0.8,
},


trainingStatsMainLabel: {
  marginTop: 5,
  fontSize: 12,
  fontWeight: "700",
  color: "#8A7663",
},

trainingStatsCenterDot: {
  width: 7,
  height: 7,
  borderRadius: 4,
  backgroundColor: "#D6AA55",
  marginHorizontal: 12,
},

trainingStatsGoalPanel: {
  borderRadius: 24,
  borderWidth: 1,
  borderColor: "rgba(232, 222, 210, 0.86)",
  backgroundColor: "rgba(250, 246, 238, 0.78)",
  padding: 18,
  marginBottom: 16,
},

trainingStatsGoalSmallLabel: {
  fontSize: 13,
  fontWeight: "700",
  color: "#A77A3F",
},

trainingStatsGoalTitleRow: {
  marginTop: 8,
  flexDirection: "row",
  alignItems: "center",
  gap: 12,
},

trainingStatsGoalBigTitle: {
  flexShrink: 0,
  fontSize: 18,
  lineHeight: 26,
  fontWeight: "800",
  color: "#2E2118",
  letterSpacing: -0.4,
},
trainingStatsProgressTrackInline: {
  flex: 1,
  height: 8,
  borderRadius: 999,
  backgroundColor: "rgba(222, 215, 205, 0.82)",
  overflow: "hidden",
},

trainingStatsGoalDesc: {
  marginTop: 9,
  fontSize: 12,
  lineHeight: 18,
  color: "#8A7663",
  fontWeight: "700",
},

trainingStatsProgressFill: {
  height: "100%",
  borderRadius: 999,
  backgroundColor: "#D6AA55",
},

trainingStatsBottomGrid: {
  flexDirection: "row",
  gap: 10,
},

trainingStatsBottomItem: {
  flex: 1,
  minHeight: 82,
  borderRadius: 16,
  borderWidth: 1,
  borderColor: "rgba(232, 222, 210, 0.9)",
  backgroundColor: "rgba(255, 255, 255, 0.58)",
  alignItems: "center",
  justifyContent: "center",
  paddingVertical: 10,
},

trainingStatsBottomLabel: {
  fontSize: 12,
  fontWeight: "700",
  color: "#9A8674",
},

trainingStatsBottomValue: {
  marginTop: 6,
  fontSize: 21,
  fontWeight: "700",
  color: "#2E2118",
  letterSpacing: -0.3,
},

journeyTopFade: {
  position: "absolute",
  top: -10,
  left: 0,
  right: 0,
  height: 115,
  zIndex: 3,
},

journeyBottomFade: {
  position: "absolute",
  left: 0,
  right: 0,
  bottom: 0,
  height: 190,
  zIndex: 3,
},
});