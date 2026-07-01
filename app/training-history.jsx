import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Animated,
  PanResponder,
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
const fonts = {
  medium: "PretendardMedium",
  semiBold: "PretendardSemiBold",
  bold: "PretendardBold",
  titleSemi: "MaruBuriSemiBold",
};
const goldenGoalMarker = require("../assets/images/golden-goal-marker.png");


const fogLayer = require("../assets/images/fog-layer.png");
const goldPath = require("../assets/images/gold-path.png");
const WALKER_IMAGES = [
  require("../assets/images/walker-stage-0.png"),
  require("../assets/images/walker-stage-1.png"),
  require("../assets/images/walker-stage-2.png"),
  require("../assets/images/walker-stage-3.png"),
  require("../assets/images/walker-stage-4.png"),
  require("../assets/images/walker-stage-5.png"),
  require("../assets/images/walker-stage-6.png"),
  require("../assets/images/walker-stage-7.png"),
  require("../assets/images/walker-stage-8.png"),
  require("../assets/images/walker-stage-9.png"),
  require("../assets/images/walker-stage-10.png"),
  require("../assets/images/walker-stage-11.png"),
  require("../assets/images/walker-stage-12.png"),
  require("../assets/images/walker-stage-13.png"),
  require("../assets/images/walker-stage-14.png"),
  require("../assets/images/walker-stage-15.png"),
  require("../assets/images/walker-stage-16.png"),
  require("../assets/images/walker-stage-17.png"),
  require("../assets/images/walker-stage-18.png"),
  require("../assets/images/walker-stage-19.png"),
  require("../assets/images/walker-stage-20.png"),
  require("../assets/images/walker-stage-21.png"),
  require("../assets/images/walker-stage-22.png"),
  require("../assets/images/walker-stage-23.png"),
  require("../assets/images/walker-stage-24.png"),
  require("../assets/images/walker-stage-25.png"),
  require("../assets/images/walker-stage-26.png"),
  require("../assets/images/walker-stage-27.png"),
  require("../assets/images/walker-stage-28.png"),
  require("../assets/images/walker-stage-29.png"),
  require("../assets/images/walker-stage-30.png"),
  require("../assets/images/walker-stage-31.png"),
  require("../assets/images/walker-stage-32.png"),
  require("../assets/images/walker-stage-33.png"),
  require("../assets/images/walker-stage-34.png"),
  require("../assets/images/walker-stage-35.png"),
];
const statsIcon = require("../assets/images/stats-icon.png");
const backIcon = require("../assets/images/back.png");
const JOURNEY_IMAGES = {
  spring: {
    start: require("../assets/journey/spring/spring-start.png"),
    1: require("../assets/journey/spring/spring-1.png"),
    2: require("../assets/journey/spring/spring-2.png"),
    3: require("../assets/journey/spring/spring-3.png"),
    4: require("../assets/journey/spring/spring-4.png"),
    5: require("../assets/journey/spring/spring-5.png"),
    6: require("../assets/journey/spring/spring-6.png"),
    7: require("../assets/journey/spring/spring-7.png"),
    8: require("../assets/journey/spring/spring-8.png"),
    end: require("../assets/journey/spring/spring-end.png"),
  },
  summer: {
    start: require("../assets/journey/summer/summer-start.png"),
    1: require("../assets/journey/summer/summer-1.png"),
    2: require("../assets/journey/summer/summer-2.png"),
    3: require("../assets/journey/summer/summer-3.png"),
    4: require("../assets/journey/summer/summer-4.png"),
    5: require("../assets/journey/summer/summer-5.png"),
    6: require("../assets/journey/summer/summer-6.png"),
    7: require("../assets/journey/summer/summer-7.png"),
    8: require("../assets/journey/summer/summer-8.png"),
    end: require("../assets/journey/summer/summer-end.png"),
  },
  autumn: {
    start: require("../assets/journey/autumn/autumn-start.png"),
    1: require("../assets/journey/autumn/autumn-1.png"),
    2: require("../assets/journey/autumn/autumn-2.png"),
    3: require("../assets/journey/autumn/autumn-3.png"),
    4: require("../assets/journey/autumn/autumn-4.png"),
    5: require("../assets/journey/autumn/autumn-5.png"),
    6: require("../assets/journey/autumn/autumn-6.png"),
    7: require("../assets/journey/autumn/autumn-7.png"),
    8: require("../assets/journey/autumn/autumn-8.png"),
    end: require("../assets/journey/autumn/autumn-end.png"),
  },
  winter: {
    start: require("../assets/journey/winter/winter-start.png"),
    1: require("../assets/journey/winter/winter-1.png"),
    2: require("../assets/journey/winter/winter-2.png"),
    3: require("../assets/journey/winter/winter-3.png"),
    4: require("../assets/journey/winter/winter-4.png"),
     5: require("../assets/journey/winter/winter-5.png"),
    6: require("../assets/journey/winter/winter-6.png"),
    7: require("../assets/journey/winter/winter-7.png"),
    8: require("../assets/journey/winter/winter-8.png"),
    end: require("../assets/journey/winter/winter-end.png"),
  },
};

const promotionScroll = require("../assets/images/promotion-scroll.png");

const JOURNEY_PATH_POINTS = {
  start: [
    { progress: 0, x: 0.4, y: 0.671, scale: 1.4 }, //0
    { progress: 0.5, x: 0.4, y: 0.585, scale: 1.1 }, //25
    { progress: 0.8, x: 0.36, y: 0.530, scale: 0.6 }, //40
    { progress: 1, x: 0.361, y: 0.512, scale: 0.4 },
  ],
  1: [
    { progress: 0, x: 0.403, y: 0.74, scale: 2 }, //50
    { progress: 0.5, x: 0.35, y: 0.57, scale: 1.3 },//175
    { progress: 0.803, x: 0.34, y: 0.46, scale: 1 },//250
    { progress: 1, x: 0.35, y: 0.40, scale: 0.6 }, //300
  ],
  2: [
    { progress: 0, x: 0.597, y: 0.780, scale: 2 }, //300
    { progress: 0.5, x: 0.71, y: 0.561, scale: 1.4 }, //425
    { progress: 0.72, x: 0.58, y: 0.488, scale: 1 },
    { progress: 0.88, x: 0.68, y: 0.412, scale: 0.8 }, //520
    { progress: 1, x: 0.5, y: 0.392, scale: 0.6 },
  ],
  3: [
    { progress: 0, x: 0.35, y: 0.74, scale: 2 }, //550
    { progress: 0.25, x: 0.36, y: 0.622, scale: 1.7 },
    { progress: 0.5, x: 0.472, y: 0.494, scale: 1.4 },
    { progress: 0.76, x: 0.74, y: 0.350, scale: 1 },
    { progress: 0.92, x: 0.67, y: 0.256, scale: 0.7 },
    { progress: 1, x: 0.71, y: 0.220, scale: 0.6 }, //799
  ],
  4: [
    { progress: 0, x: 0.35, y: 0.74, scale: 2 },  //800
    { progress: 0.25, x: 0.3, y: 0.622, scale: 1.7 },
    { progress: 0.5, x: 0.444, y: 0.494, scale: 1.4 },
    { progress: 0.73, x: 0.75, y: 0.311, scale: 1 }, //982
    { progress: 0.92, x: 0.69, y: 0.286, scale: 0.7 }, //1029
    { progress: 1, x: 0.7, y: 0.220, scale: 0.6 }, //1049
  ],
  5: [
    { progress: 0, x: 0.42, y: 0.74, scale: 2 },  //1050
    { progress: 0.48, x: 0.444, y: 0.494, scale: 1.4 }, //1170
    { progress: 0.68, x: 0.68, y: 0.4, scale: 1.2 }, //1219
    { progress: 0.84, x: 0.49, y: 0.29, scale: 1 }, //1259
    { progress: 0.92, x: 0.62, y: 0.23, scale: 0.8}, //1279
    { progress: 1, x: 0.48, y: 0.185, scale: 0.6 }, // 1299
  ],
6: [
    { progress: 0, x: 0.47, y: 0.74, scale: 2 }, //1300
    { progress: 0.44, x: 0.71, y: 0.48, scale: 1.5 }, //1410
    { progress: 0.64, x: 0.55, y: 0.36, scale: 1 }, //1459
    { progress: 0.752, x: 0.655, y: 0.282, scale: 0.9 }, //1487
    { progress: 0.9, x: 0.7, y: 0.19, scale: 0.8 }, //1524
    { progress: 1, x: 0.58, y: 0.125, scale: 0.6 }, //1549
  ],
7: [
  { progress: 0,    x: 0.4,  y: 0.74,  scale: 2 },    // 1550
  { progress: 0.32, x: 0.5,  y: 0.45,  scale: 1.35 }, // 1630
  { progress: 0.48, x: 0.48, y: 0.38,  scale: 1.15 }, // 1670
  { progress: 0.68, x: 0.82, y: 0.26,  scale: 0.8 },  // 1719
  { progress: 0.84, x: 0.67,  y: 0.23, scale: 0.65 }, // 1759
  { progress: 1,    x: 0.763, y: 0.2, scale: 0.6 },  // 1799~1800
],
8:  [ 
    { progress: 0, x: 0.45, y: 0.74, scale: 2 }, //1800
    { progress: 0.4, x: 0.64, y: 0.54, scale: 1.6 }, //1900
    { progress: 0.6, x: 0.48, y: 0.45, scale: 1.2 }, //1950
    { progress: 0.88, x: 0.75, y: 0.3, scale: 0.9 }, //2020
    { progress: 1, x: 0.53, y: 0.2, scale: 0.6 }, //2049 
  ],
  end: [
    { progress: 0, x: 0.389, y: 0.74, scale: 2 }, //2050
    { progress: 0.35, x: 0.395, y: 0.63, scale: 1.7 }, //2080
    { progress: 0.3667, x: 0.1, y: 0.59, scale: 1.6 }, //2105
    { progress: 0.533, x: 0.39, y: 0.49, scale: 1.5 }, //2130
    { progress: 0.733, x: 0.13, y: 0.35, scale: 1.1 }, //2160
    { progress: 0.87, x: 0.43, y: 0.272, scale: 0.8 }, //2180
    { progress: 0.92, x: 0.33, y: 0.235, scale: 0.72 }, //2188
    { progress: 1, x: 0.42, y: 0.19, scale: 0.6 }, //2200
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
  5: {
  current: { top: 500, right: 16 },
  next: { top: 190, left: 28 },
},
6: {
  current: { top: 500, right: 16 },
  next: { top: 190, left: 28 },
},
7: {
  current: { top: 500, right: 16 },
  next: { top: 190, left: 28 },
},
8: {
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

const JOURNEY_QUOTES = {
  50: "좋아, 첫걸음을 내디뎠어.",
  100: "잘하고 있어. 계속 가보자.",
  150: "조금씩 몸이 길을 기억하고 있어.",
  200: "오늘의 한 걸음이 내일을 만든다.",
  250: "포기하지 않은 것만으로도 대단해.",
  300: "이제 수련이 일상이 되어가고 있어.",
  350: "급할 필요 없어. 꾸준함이 답이야.",
  400: "천천히 가도 괜찮아.",
  450: "여기까지 온 너를 칭찬해.",
  500: "벌써 이렇게 멀리 왔구나.",
  550: "몸이 먼저 움직이기 시작했어.",
  600: "반복은 실력을 만든다.",
  650: "익숙함 속에서도 배움은 있다.",
  700: "흔들려도 다시 중심을 잡으면 돼.",
  750: "수련은 경쟁이 아니라 성장이다.",
  800: "길은 아직도 계속 이어진다.",
  850: "조금씩 깊이가 생기고 있어.",
  900: "지금까지의 노력이 쌓이고 있다.",
  950: "꾸준함은 재능을 이긴다.",
  1000: "천 일을 걸어온 사람은 다르다.",
  1050: "높은 산도 한 걸음부터였다.",
  1100: "익숙함 속에서도 기본을 잊지 마.",
  1150: "정체된 것 같아도 앞으로 가고 있어.",
  1200: "조용히 계속 가는 사람이 결국 도착한다.",
  1250: "마음이 흔들릴수록 호흡을 돌아봐.",
  1300: "기술보다 중요한 건 지속함이다.",
  1350: "어제의 나보다 조금 더 나아지면 충분해.",
  1400: "수련은 몸과 마음을 함께 다듬는다.",
  1450: "길이 보이지 않아도 길 위에 있다.",
  1500: "벌써 많은 이들의 본보기가 되었어.",
  1550: "이제는 배움보다 체화의 시간이다.",
  1600: "조급함은 내려놓고 흐름을 따라가자.",
  1650: "진짜 실력은 보이지 않는 곳에서 자란다.",
  1700: "산 정상은 아직 멀지만 길은 분명하다.",
  1750: "수련은 결국 자신을 만나는 과정이다.",
  1800: "고요함 속에서 더 많은 것을 본다.",
  1850: "강함은 부드러움 속에 숨어있다.",
  1900: "중심을 잃지 않는 사람이 멀리 간다.",
  1950: "조용히 쌓인 시간이 힘이 된다.",
  2000: "이천 일을 걸어온 발걸음은 결코 가볍지 않다.",
  2050: "이제 길을 걷는 사람이 아니라 길이 되어간다.",
  2100: "몸과 마음이 하나로 이어지고 있다.",
  2150: "수련은 끝이 아니라 평생의 여정이다.",
  2200: "고수를 향한 길은 오늘도 계속된다.",
};

function getJourneyQuote(days) {
  const quoteDay = Math.max(50, Math.min(2200, Math.floor(days / 50) * 50));
  return JOURNEY_QUOTES[quoteDay] || "오늘도 한 걸음이면 충분해.";
}

function shouldShowJourneyQuote(days) {
  const nearestQuoteDay = Math.round(days / 50) * 50;

  if (nearestQuoteDay < 50 || nearestQuoteDay > 2200) {
    return false;
  }

  return Math.abs(days - nearestQuoteDay) <= 3;
}

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
  if (days < 1300) return { start: 1050, end: 1300 };
  if (days < 1550) return { start: 1300, end: 1550 };
  if (days < 1800) return { start: 1550, end: 1800 };
  if (days < 2050) return { start: 1800, end: 2050 };
  return { start: 2050, end: 2200 };
}

function getJourneySegment(days) {
  if (days < 50) return "start";
  if (days < 300) return "1";
  if (days < 550) return "2";
  if (days < 800) return "3";
  if (days < 1050) return "4";
  if (days < 1300) return "5";
  if (days < 1550) return "6";
  if (days < 1800) return "7";
  if (days < 2050) return "8";
  return "end";
}

function getWalkerStageIndex(attendanceCount) {
  return Math.min(
    35,
    Math.max(0, Math.floor(attendanceCount / 100))
  );
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
function formatShortDate(dateValue) {
  if (!dateValue) return "";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return "";

  const year = String(date.getFullYear()).slice(2);
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return `${year}.${month}.${day}`;
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

const COLLAPSED_HEIGHT = 82;
const EXPANDED_HEIGHT = 320;

const [statsExpanded, setStatsExpanded] = useState(false);

const sheetHeight = useMemo(
  () => new Animated.Value(COLLAPSED_HEIGHT),
  []
);

const openSheet = () => {
  setStatsExpanded(true);
  Animated.spring(sheetHeight, {
    toValue: EXPANDED_HEIGHT,
    useNativeDriver: false,
    tension: 60,
    friction: 10,
  }).start();
};

const closeSheet = () => {
  Animated.spring(sheetHeight, {
    toValue: COLLAPSED_HEIGHT,
    useNativeDriver: false,
    tension: 60,
    friction: 10,
  }).start(() => setStatsExpanded(false));
};

const sheetPanResponder = useMemo(
  () =>
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 8,
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy < -20) openSheet();
        if (gesture.dy > 20) closeSheet();
      },
    }),
  [sheetHeight]
);

  const handleBack = () => {
    if (router.canGoBack?.()) {
      router.back();
    } else {
      router.replace("/(tabs)");
    }
  };
  const [sceneSize, setSceneSize] = useState({
  width: 360,
  height: 820,
});

  useEffect(() => {
  async function load() {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const [home, history, common] = await Promise.all([
        getMemberHome(token),
        getMyHistoryEvents(token),
        getCommonHistoryMilestones(token),
      ]);

      setHomeData(home);
      setHistoryEvents(Array.isArray(history) ? history : []);
      setCommonMilestones(Array.isArray(common) ? common : []);
    } catch (error) {
      console.log("수련의 길 로딩 실패:", error);
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
  homeData?.trainingStats?.totalAttendanceCount ??
  homeData?.totalAttendanceCount ??
  0;

const attendanceCount = Number(realAttendanceCount || 0);


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

const sceneHeight = 930;

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

function getStageLayout(stage) {
  const isFuture = stage.days > attendanceCount;

  if (isFuture) {
  const endPoint = getWalkerLikePositionByDay(stage.days);

  const markerWidth = 70;
const markerHeight = 220;

const markerLeft = endPoint.left - markerWidth / 2 + 50;
const markerTop = endPoint.top - markerHeight / 2 + 70;
const markerScale = Math.max(
  0.65,
  Math.min(1.35, endPoint.scale || 1)
);

return {
  top: markerTop,
  left: markerLeft,
  markerScale,
};
}

  const position = getPositionByDay(stage.days);

const BOTTOM_SHEET_SAFE_TOP = sceneHeight - COLLAPSED_HEIGHT - 150;

return {
  top: Math.min(
    Math.max(120, position.top - 20),
    BOTTOM_SHEET_SAFE_TOP
  ),
  right: 16,
};
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
function getWalkerLikePositionByDay(day) {
  const points = JOURNEY_PATH_POINTS[segment] || JOURNEY_PATH_POINTS.start;

  const targetProgress = Math.min(
    1,
    Math.max(0, (day - range.start) / (range.end - range.start))
  );

  let previous = points[0];
  let next = points[points.length - 1];

  for (let i = 0; i < points.length - 1; i++) {
    if (
      targetProgress >= points[i].progress &&
      targetProgress <= points[i + 1].progress
    ) {
      previous = points[i];
      next = points[i + 1];
      break;
    }
  }

  const sectionProgress =
    (targetProgress - previous.progress) /
    (next.progress - previous.progress || 1);

  const x = previous.x + (next.x - previous.x) * sectionProgress;
  const y = previous.y + (next.y - previous.y) * sectionProgress;
  const scale =
    (previous.scale ?? 1) +
    ((next.scale ?? 1) - (previous.scale ?? 1)) * sectionProgress;

  return {
    top: sceneSize.height * y,
    left: sceneSize.width * x,
    scale,
  };
}
function getPositionByDay(day) {
  const targetSegment = getJourneySegment(day);
  const points = JOURNEY_PATH_POINTS[targetSegment] || JOURNEY_PATH_POINTS.start;
  const targetRange = getJourneyRange(day);

  const progress = Math.min(
    1,
    Math.max(0, (day - targetRange.start) / (targetRange.end - targetRange.start))
  );

  let previous = points[0];
  let next = points[points.length - 1];

  for (let i = 0; i < points.length - 1; i++) {
    if (progress >= points[i].progress && progress <= points[i + 1].progress) {
      previous = points[i];
      next = points[i + 1];
      break;
    }
  }

  const sectionProgress =
    (progress - previous.progress) / (next.progress - previous.progress || 1);

  const x = previous.x + (next.x - previous.x) * sectionProgress;
  const y = previous.y + (next.y - previous.y) * sectionProgress;

  return {
  top: sceneSize.height * y,
  left: sceneSize.width * x,
  scale: previous.scale + (next.scale - previous.scale) * sectionProgress,
};
}

  const progressText = nextStage
    ? `${Math.max(0, nextStage.days - attendanceCount)}일 더 수련하면 ${nextStage.title}`
    : "수련의 길은 계속 이어집니다";
const promotionGoal = homeData?.trainingGoals?.promotion;

const danPromotions = Array.isArray(member?.danPromotions)
  ? member.danPromotions
  : [];

const latestPromotion = [...danPromotions]
  .sort((a, b) => Number(b.danRank || 0) - Number(a.danRank || 0))[0];

const latestPromotionRank = Number(latestPromotion?.danRank || 0);
const latestPromotionAttendanceDay = Number(
  latestPromotion?.attendanceDay || 0
);

const afterPromotionCount = latestPromotion
  ? Math.max(0, attendanceCount - latestPromotionAttendanceDay)
  : attendanceCount;

const requiredAfterPromotionCount =
  Number(promotionGoal?.requiredAttendanceCount || 0);

const remainingAfterPromotionCount =
  Math.max(0, requiredAfterPromotionCount - afterPromotionCount);

const promotionRequiredDays = Number(
  promotionGoal?.requiredAttendanceCount || 0
);

const promotionTargetDays =
  Number(promotionGoal?.targetAttendanceCount) ||
  Number(promotionGoal?.requiredAttendanceCount) ||
  attendanceCount + Number(promotionGoal?.remainingCount || 0);
const promotionRemainDays = Math.max(
  0,
  promotionTargetDays - attendanceCount
);

const shouldShowPromotionScroll =
  promotionRemainDays <= 0 &&
  attendanceCount >= promotionTargetDays &&
  attendanceCount <= promotionTargetDays + 10;

const shouldHidePromotionStage =
  promotionRemainDays <= 0 &&
  attendanceCount >= promotionTargetDays;

const nextDanEvent = promotionGoal
  ? {
      days: promotionTargetDays,
      title: promotionGoal.label || `${promotionGoal.nextRankLevel}단 승단심사`,
      desc:
        promotionRemainDays <= 0
          ? `${promotionGoal.nextRankLevel}단 승단심사 자격이 되었습니다.`
          : `${promotionGoal.nextRankLevel}단까지 앞으로 ${promotionRemainDays}일 남았습니다.`,
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

const statsNextGoal = nextDanEvent || displayNextStage; 

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
const journeyQuote = getJourneyQuote(attendanceCount);
const showJourneyQuote = shouldShowJourneyQuote(attendanceCount);

const walkerPosition = getWalkerPosition();
const walkerScale = walkerPosition.transform?.[0]?.scale || 1;

const speechBubblePosition = {
  top: Math.max(
    70,
    walkerPosition.top - 80 * walkerScale
  ),

  left: Math.max(
    16,
    Math.min(
      sceneSize.width - 190,
      walkerPosition.left - 30 * walkerScale
    )
  ),
};

  const visibleStages = mergedStages.filter((stage) => {
  return stage.days >= range.start && stage.days < range.end;
});
const roadmapItems = useMemo(() => {
  const items = [];

  if (joinedAt) {
    items.push({
      key: "join",
      title: "입관",
      desc: formatShortDate(joinedAt),
      completed: true,
      current: false,
    });
  }

  danPromotions.forEach((promotion) => {
    items.push({
      key: `dan-${promotion.danRank}`,
      title: `${promotion.danRank}단 승단`,
      desc: promotion.promotedAt
        ? formatShortDate(promotion.promotedAt)
        : `${promotion.attendanceDay || ""}일`,
      completed: true,
      current: false,
    });
  });

  const achievedHundred = Math.floor(attendanceCount / 100) * 100;

  if (achievedHundred >= 100) {
    items.push({
      key: `day-${achievedHundred}`,
      title: `${achievedHundred}일 달성`,
      desc: "꾸준한 수련 기록",
      completed: true,
      current: false,
    });
  }

  items.push({
  key: "current",
  title: "현재",
  desc: `${attendanceCount}일째`,
  completed: true,
  current: true,
});

if (statsNextGoal && statsNextGoal.days > attendanceCount) {
  items.push({
    key: "next-goal",
    title: statsNextGoal.title,
    desc: `${statsNextGoal.days - attendanceCount}일 남음`,
    completed: false,
    current: false,
    future: true,
  });
}

return items.slice(-6);

}, [joinedAt, member?.danPromotions, attendanceCount]);
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

<View style={styles.journeySceneWrap}>
  <View
    style={[styles.journeyScene, { height: sceneHeight }]}
    onLayout={(event) => {
      const { width, height } = event.nativeEvent.layout;
      setSceneSize({ width, height });
    }}
  >
    <Image
      source={currentJourneyImage}
      style={styles.journeyFullImage}
      resizeMode="cover"
    />

    <LinearGradient
      pointerEvents="none"
      colors={[
  "rgba(247,241,232,1)",
  "rgba(247,241,232,0.82)",
  "rgba(247,241,232,0.38)",
  "rgba(247,241,232,0)",
]}
locations={[0, 0.28, 0.66, 1]}
      style={styles.journeyHeaderFade}
    />

    <View style={styles.headerRow}>
      <Pressable
        style={styles.backButton}
        onPress={handleBack}
        hitSlop={16}
      >
        <Image
          source={backIcon}
          style={styles.backIcon}
          resizeMode="contain"
        />
      </Pressable>
{shouldShowPromotionScroll ? (
  <View style={styles.promotionScrollWrap} pointerEvents="none">
    <Image
      source={promotionScroll}
      style={styles.promotionScrollImage}
      resizeMode="stretch"
    />

    <Text style={styles.promotionScrollText}>
      {nextDanEvent?.title || "승단심사"} 자격이 되었습니다.
    </Text>
  </View>
) : null}

      <View style={styles.headerTextWrap}>
        <Text style={styles.title}>수련의 길</Text>
        <Text style={styles.subtitle}>
          고수를 향해, {attendanceCount}회째 수련 중
        </Text>
      </View>
    </View>

    <View pointerEvents="box-none" style={styles.roadmapRail}>
      {[...roadmapItems].reverse().map((item, index, arr) => {
        const isLast = index === arr.length - 1;

        return (
          <View key={item.key} style={styles.roadmapItem}>
            <View style={styles.roadmapMarkerWrap}>
              <View
                style={[
                  styles.roadmapDot,
                  item.completed && styles.roadmapDotCompleted,
                  item.current && styles.roadmapDotCurrent,
                  item.future && styles.roadmapDotFuture,
                ]}
              >
                {item.current ? (
                  <Text style={styles.roadmapCurrentText}>현</Text>
                ) : null}
              </View>

              {!isLast ? <View style={styles.roadmapLine} /> : null}
            </View>

            <View
              style={[
                styles.roadmapLabel,
                item.current && styles.roadmapLabelCurrent,
                item.future && styles.roadmapLabelFuture,
              ]}
            >
              <Text
                style={[
                  styles.roadmapTitle,
                  item.current && styles.roadmapTitleCurrent,
                ]}
              >
                {item.title}
              </Text>

              <Text
                style={[
                  styles.roadmapDesc,
                  item.current && styles.roadmapDescCurrent,
                ]}
              >
                {item.desc}
              </Text>
            </View>
          </View>
        );
      })}
    </View>

    <Image
      source={currentWalkerImage}
      style={[styles.sceneWalker, walkerPosition]}
      resizeMode="contain"
    />

    {showJourneyQuote && (
      <View
        pointerEvents="none"
        style={[styles.journeySpeechBubble, speechBubblePosition]}
      >
        <Text style={styles.journeySpeechText}>{journeyQuote}</Text>
      </View>
    )}

    {mergedStages.map((stage, index) => {
      const completed = attendanceCount > stage.days;
      const current = attendanceCount === stage.days;
      const future = attendanceCount < stage.days;

      const visible = visibleStages.some((item) => item.days === stage.days);
      if (!visible) return null;

      const layout = getStageLayout(stage);

      if (stage.kind === "promotion") {
  return null;
}
      
      if (future) {
        return (
          <View
            key={`${stage.kind}-${stage.days}-${index}`}
            style={[
              styles.sceneFutureGoalWrap,
              {
                top: layout.top,
                left: layout.left,
              },
            ]}
          >
            <Image
  source={goldenGoalMarker}
  style={[
    styles.sceneGoalMarkerIcon,
    {
      transform: [{ scale: layout.markerScale }],
    },
  ]}
  resizeMode="contain"
/>
   </View>
        );
      }

      return (
        <View
          key={`${stage.kind}-${stage.days}-${index}`}
          style={[
            styles.sceneMilestone,
            future && styles.sceneMilestoneFuture,
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
    "rgba(247,241,232,0)",
    "rgba(247,241,232,0.26)",
    "rgba(247,241,232,0.72)",
    "rgba(247,241,232,1)",
  ]}
  locations={[0, 0.38, 0.72, 1]}
  style={styles.journeyBottomFade}
/>
{statsExpanded ? (
  <Pressable
    style={styles.statsSheetBackdrop}
    onPress={closeSheet}
  />
) : null}
<Animated.View
  style={[
    styles.statsBottomSheet,
    { height: sheetHeight },
  ]}
>
  <Pressable
  style={styles.bottomSheetHandleArea}
  onPress={statsExpanded ? closeSheet : openSheet}
  {...sheetPanResponder.panHandlers}
>
    <View style={styles.bottomSheetHandle} />
  </Pressable>

  <View style={styles.trainingStatsMiniContent}>
    <Image
      source={statsIcon}
      style={styles.trainingStatsIconImage}
      resizeMode="contain"
    />

    <View style={styles.trainingStatsMiniTextRow}>
  <Text style={styles.trainingStatsMiniTitle}>내 수련 통계</Text>

  <Text style={styles.trainingStatsMiniSub}>
    {attendanceCount}회 · {expectedTrainingHours}시간
  </Text>
</View>
  </View>

  {statsExpanded ? (
    <View style={styles.bottomSheetFullContent}>
      <View style={styles.trainingStatsFullHeader}>

  <Pressable onPress={() => router.push("/training-stats")}>
    <Text style={styles.trainingStatsInlineLink}>자세히 보기</Text>
  </Pressable>
</View>
      <View style={styles.trainingStatsMainRow}>
        <View style={styles.trainingStatsMainItem}>
          <Text style={styles.trainingStatsMainValue}>{attendanceCount}회</Text>
          <Text style={styles.trainingStatsMainLabel}>총 출석횟수</Text>
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
            {statsNextGoal?.title || "수련의 길은 계속 이어집니다"}
          </Text>

          {statsNextGoal ? (
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
          {statsNextGoal
  ? latestPromotion
    ? `${latestPromotionRank}단 승단 후 ${afterPromotionCount}회째 · 목표 ${requiredAfterPromotionCount}회 · 앞으로 ${remainingAfterPromotionCount}회`
    : `현재 ${attendanceCount}회 · 목표 ${statsNextGoal.days}회 · 앞으로 ${Math.max(
        0,
        statsNextGoal.days - attendanceCount
      )}회`
  : "꾸준히 한 걸음씩 나아가고 있어요"}
        </Text>
      </View>
    </View>
  ) : null}
</Animated.View>
      </View>
    </View>
  </ScrollView>
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
  paddingTop: 0,
  paddingBottom: 0,
  gap: 0,
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
  position: "absolute",
  top: 22,
  left: 18,
  right: 18,
  flexDirection: "row",
  alignItems: "center",
  zIndex: 50,
},
  backButton: {
  width: 44,
  height: 44,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "transparent",
  borderWidth: 0,
  zIndex: 200,
  elevation: 20,
},

backIcon: {
  width: 28,
  height: 28,
},
  headerTextWrap: {
    flex: 1,
    alignItems: "center",
    marginRight: 42,
  },
  title: {
  marginTop: 18,
  fontSize: 28,
  lineHeight: 36,
  fontFamily: fonts.titleSemi,
  color: "#2E2118",
  textShadowColor: "rgba(255,255,255,0.75)",
  textShadowRadius: 10,
},
  subtitle: {
  marginTop: 2,
  fontSize: 14,
  lineHeight: 20,
  fontFamily: fonts.medium,
  color: "rgba(75, 60, 48, 0.72)",
  textShadowColor: "rgba(255,255,255,0.8)",
  textShadowRadius: 8,
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
  marginTop: -16,
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
  zIndex: 20,
},

sceneMilestone: {
  position: "absolute",
  width: 110,
  alignItems: "center",
  zIndex: 6,
},


sceneTextBox: {
  width: 110,
  borderRadius: 13,
  paddingHorizontal: 9,
  paddingVertical: 5,
  backgroundColor: "rgba(255, 253, 249, 0.72)",
  borderWidth: 1,
  borderColor: "rgba(214, 170, 85, 0.45)",
  opacity:0.85,
},

sceneTextBoxCurrent: {
  backgroundColor: "rgba(43, 37, 34, 0.86)",
  borderRadius: 14,
  paddingHorizontal: 10,
  paddingVertical: 8,
  borderWidth: 1,
  borderColor: "#D6AA55",
  opacity:0.85,
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
  fontSize: 13,
  lineHeight: 17,
  color: "#F1D39A",
  textShadowColor: "transparent",
},

sceneMilestoneDescFuture: {
  fontSize: 10,
  lineHeight: 14,
  color: "rgba(255,253,249,0.74)",
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

customEventBadge: {
  marginTop: 4,
  fontSize: 10,
  fontWeight: "900",
  color: "#D6AA55",
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
  minHeight: 68,
  borderRadius: 18,
  borderWidth: 1,
  borderColor: "rgba(232, 222, 210, 0.65)",
  backgroundColor: "rgba(255, 255, 255, 0.42)",
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: 12,
  marginBottom: 10,
},

trainingStatsGoalPanel: {
  borderRadius: 20,
  borderWidth: 1,
  borderColor: "rgba(232, 222, 210, 0.62)",
  backgroundColor: "rgba(250, 246, 238, 0.48)",
  padding: 13,
  marginBottom: 0,
},

trainingStatsMainItem: {
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
},

trainingStatsMainValue: {
  fontSize: 22,
  lineHeight: 30,
  fontFamily: fonts.bold,
  color: "#2E2118",
},

trainingStatsMainLabel: {
  marginTop: 4,
  fontSize: 12,
  lineHeight: 18,
  fontFamily: fonts.medium,
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
  lineHeight: 19,
  fontFamily: fonts.semiBold,
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
  fontSize: 17,
  lineHeight: 25,
  fontFamily: fonts.bold,
  color: "#2E2118",
},
trainingStatsProgressTrackInline: {
  flex: 1,
  height: 8,
  borderRadius: 999,
  backgroundColor: "rgba(222, 215, 205, 0.82)",
  overflow: "hidden",
},

trainingStatsGoalDesc: {
  marginTop: 8,
  fontSize: 12,
  lineHeight: 18,
  fontFamily: fonts.medium,
  color: "#8A7663",
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

journeyOutsideFade: {
  height: 190,
  marginTop: -190,
  marginLeft: -20,
  marginRight: -20,
  zIndex: 8,
},
journeyOutsideTopFade: {
  height: 80,
  marginBottom: -80,
  marginLeft: -24,
  marginRight: -24,
  zIndex: 2,
  pointerEvents: "none",
},
journeySceneWrap: {
  position: "relative",
  marginLeft: -16,
  marginRight: -16,
},

trainingStatsMiniTitle: {
  fontSize: 18,
  lineHeight: 23,
  fontFamily: fonts.bold,
  color: "#2E2118",
},

trainingStatsMiniSub: {
  fontSize: 15,
  lineHeight: 20,
  fontFamily: fonts.medium,
  color: "#8A7663",
},
trainingStatsMiniTitleLine: {
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
},

trainingStatsMiniArrow: {
  fontSize: 24,
  fontWeight: "700",
  color: "#A77A3F",
  marginTop: -4,
},

trainingStatsTitleTextRow: {
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
},

trainingStatsInlineLink: {
  fontSize: 13,
  lineHeight: 16,
  fontFamily: fonts.medium,
  color: "#8C6330",
  textDecorationLine: "underline",
  textAlign: "right",
},

journeySpeechBubble: {
  position: "absolute",

  backgroundColor: "rgba(247, 232, 204, 0.78)",

  borderWidth: 2,
  borderColor: "#C9A96A",

  borderRadius: 14,

  paddingHorizontal: 16,
  paddingVertical: 7,

  minWidth: 170,

  shadowColor: "#7A5A2B",
  shadowOpacity: 0.18,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 2 },

  zIndex: 12,
},

journeySpeechText: {
  fontSize: 15,
  lineHeight: 18,

  fontWeight: "600",

  color: "#5E4528",

  textAlign: "center",
},

trainingStatsMiniContent: {
  flexDirection: "row",
  alignItems: "center",
  gap: 10,
},

statsBottomSheet: {
  position: "absolute",
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(255,253,249,0.98)",
  borderTopLeftRadius: 32,
  borderTopRightRadius: 32,
  paddingHorizontal: 20,
  paddingTop: 8,

  zIndex: 999,
  elevation: 999,

  shadowColor: "#000",
  shadowOpacity: 0.12,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: -4 },
  overflow: "hidden",
},

statsBottomSheetCollapsed: {
  height: 96,
},

statsBottomSheetExpanded: {
  height: 320,
},
bottomSheetHandleArea: {
  alignItems: "center",
  paddingTop: 7,
  paddingBottom: 7,
},

bottomSheetHandle: {
  alignSelf: "center",
  width: 52,
  height: 5,
  borderRadius: 999,
  backgroundColor: "#CFC3B3",
  marginTop: -4,
  marginBottom: 10,
},

bottomSheetFullContent: {
  paddingTop: 12,
},

trainingStatsMiniTextRow: {
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
},
sceneMilestoneFuture: {
  width: 160,
  opacity: 0.92,

  flexDirection: "row",
  alignItems: "center",
  gap: 8,
},
sceneFutureGoalWrap: {
  position: "absolute",
  width: 70,
  height: 220,
  zIndex: 18,
  overflow: "visible",
  opacity: 0.9,
},

sceneTextBoxFuture: {
  position: "absolute",
  top: 58,
  width: 120,
  borderRadius: 13,
  paddingHorizontal: 8,
  paddingVertical: 7,
  backgroundColor: "rgba(43, 37, 34, 0.68)",
  borderColor: "rgba(214, 170, 85, 0.58)",
  opacity:0.85,
},
roadmapRail: {
  position: "absolute",
  left: 14,
  bottom: 90,
  zIndex: 20,
},

roadmapItem: {
  flexDirection: "row",
  alignItems: "flex-start",
  minHeight: 52,
},

roadmapMarkerWrap: {
  width: 24,
  alignItems: "center",
},

roadmapDot: {
  width: 18,
  height: 18,
  borderRadius: 999,
  borderWidth: 2,
  borderColor: "rgba(214, 170, 85, 0.78)",
  backgroundColor: "rgba(255, 253, 249, 0.72)",
},

roadmapDotCompleted: {
  backgroundColor: "rgba(241, 211, 154, 0.92)",
  borderColor: "#D6AA55",
},

roadmapDotCurrent: {
  width: 27,
  height: 27,
  borderRadius: 999,
  backgroundColor: "#2B2522",
  borderColor: "#D6AA55",
  alignItems: "center",
  justifyContent: "center",
  marginTop: -4,
},

roadmapCurrentText: {
  fontSize: 14,
  fontWeight: "700",
  color: "#F1D39A",
},

roadmapLine: {
  width: 2.5,
  flex: 1,
  minHeight: 30,
  backgroundColor: "rgba(214, 170, 85, 0.62)",
  marginTop: 4,
},

roadmapLabel: {
  marginLeft: 4,
  marginTop: -4,
  maxWidth: 96,
  borderRadius: 12,
  paddingHorizontal: 8,
  paddingVertical: 5,
  backgroundColor: "rgba(43, 37, 34, 0.38)",
  borderWidth: 1,
  borderColor: "rgba(214, 170, 85, 0.26)",
},

roadmapLabelCurrent: {
  backgroundColor: "rgba(43, 37, 34, 0.76)",
  borderColor: "rgba(214, 170, 85, 0.72)",
},

roadmapTitle: {
  fontSize: 13,
  lineHeight: 15,
  fontWeight: "700",
  color: "#F1D39A",
},

roadmapTitleCurrent: {
  color: "#F8DFA8",
},

roadmapDesc: {
  marginTop: 2,
  fontSize: 10.5,
  lineHeight: 12,
  fontWeight: "600",
  color: "rgba(255,253,249,0.72)",
},

roadmapDescCurrent: {
  color: "rgba(255,253,249,0.9)",
},
roadmapDotFuture: {
  backgroundColor: "rgba(255, 253, 249, 0.72)",
  borderColor: "#D6AA55",
  borderStyle: "dashed",
},

roadmapLabelFuture: {
  backgroundColor: "rgba(43, 37, 34, 0.58)",
  borderColor: "rgba(214, 170, 85, 0.56)",
},
journeyHeaderFade: {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  height: 180,
  zIndex: 2,
},

journeyBottomFade: {
  position: "absolute",
  left: 0,
  right: 0,
  bottom: 0,
  height: 190,
  zIndex: 70,
  pointerEvents: "none",
},

sceneMiniStatsSheet: {
  position: "absolute",
  left: 28,
  right: 28,
  bottom: -5,
  height: 85,
  borderTopLeftRadius: 25,
  borderTopRightRadius: 25,
  backgroundColor: "rgba(255,253,249,0.96)",
  paddingHorizontal: 18,
  paddingTop: 18,
  zIndex: 90,
},
sceneGoalMarkerImage: {
  position: "absolute",
  left: -27,
  top: -68,
  width: 80,
  height: 120,
  zIndex: 12,
},
sceneGoalMarkerIcon: {
  position: "absolute",
  left: 0,
  top: 0,
  width: 70,
  height: 220,
  zIndex: 8,
},
statsSheetBackdrop: {
  position: "absolute",
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  zIndex: 998,
  backgroundColor: "rgba(0,0,0,0.08)",
},
trainingStatsFullHeader: {
  flexDirection: "row",
  justifyContent: "flex-end",
  alignItems: "center",
  marginBottom: 8,
},

trainingStatsFullTitle: {
  fontSize: 15,
  lineHeight: 22,
  fontFamily: fonts.semiBold,
  color: "#2E2118",
},
promotionScrollWrap: {
  position: "absolute",
  top: 90,
  left: 34,
  right: 34,
  height: 58,
  zIndex: 80,
  alignItems: "center",
  justifyContent: "center",
},

promotionScrollImage: {
  position: "absolute",
  width: "115%",
  height: "100%",
  opacity: 0.8,
},

promotionScrollText: {
  fontSize: 17,
  lineHeight: 24,
  fontFamily: fonts.titleSemi,
  color: "#3A2A1E",
  textAlign: "center",
  textShadowColor: "rgba(255,255,255,0.7)",
  textShadowRadius: 6,
},
});