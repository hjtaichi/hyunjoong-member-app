import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "../src/contexts/AuthContext";
import { getMemberTaegukwon } from "../src/api/memberTaegukwon";
import { colors, spacing, radius, shadow } from "../src/theme";
import ScreenHeader from "../src/components/ScreenHeader";

const COLORS = {
  ink: "#2D2117",
  sub: "#6F6254",
  bg: "#FFFCFA",
  card: "#FFFFFF",
  cardSoft: "#FFFDFC",
  line: "#EFE5DE",
  brown: "#8A5728",
  brownDark: "#5A351A",
  olive: "#7E8550",
  blue: "#3F6F8E",
  gold: "#C58B2A",
};

const steps = [
  {
    no: 1,
    tone: "olive",
    icon: "芽",
    title: "입관후 건강증진 수련",
    badge: "1년",
    desc:      "현중공법을 통해 골격평형, 경락평형, 장부평형, 정신평형을 수련합니다.\n\n" +
      "투로는 현중태극권29식과 현중태극선29식 수련으로 진식현중태극권의 기본기와 건강을 다집니다.\n\n" +
      "이후 세수경으로 심화 수련을 들어갑니다.",
    infoTitle: "수련 기간",
    infoText: "입관 후 1년",
  },
  {
    no: 2,
    tone: "brown",
    icon: "一",
    imageKey: "rankExam",
    title: "1단 심사 안내",
    desc: "입관 후 1년, 최소 출석 147일을 충족하면 심사에 응시할 수 있습니다.",
    bullets: [
      "현중태극권 역사와 원리 구술",
      "현중태극권 29식 투로",
    ],
    note: "수련이 충분히 쌓였다면, 한 번쯤 도전해보셔도 좋습니다.",
  },
  {
    no: 3,
    tone: "olive",
    icon: "劍",
    imageKey: "sword",
    title: "현중태극검 52식 수련",
    desc: "1단 이후부터 배울 수 있는 검 과정입니다.",
  },
  {
    no: 4,
    tone: "brown",
    icon: "二",
    imageKey: "rankExam2",
    title: "2단 심사 안내",
    desc: "1단 승단일 기준 2년, 추가 출석 300일을 충족하면 심사에 응시할 수 있습니다.",
    bullets: ["현중태극검 52식", "공력심사"],
  },
  {
    no: 5,
    tone: "olive",
    icon: "太",
    imageKey: "taiji",
    title: "현중태극권 대가1로 79식 수련",
    desc: "진가태극권의 전통 투로인 대가1로를\n수련합니다.",
  },
  {
    no: 6,
    tone: "brown",
    icon: "三",
    imageKey: "rankExam3",
    title: "3단 심사 안내",
    desc: "2단 승단일 기준 3년, 추가 출석 450일을 충족하면 심사에 응시할 수 있습니다.",
    bullets: ["현중태극권 대가1로 79식", "공력심사"],
  },
  {
  no: 7,
  tone: "olive",
  icon: "大",
  imageKey: "taiji",
  title: "현중태극권 대가2로 수련",
  desc: "진가태극권의 전통 투로인 대가2로를\n수련합니다.",
},
{
  no: 8,
  tone: "brown",
  icon: "四",
  imageKey: "rankExam3",
  title: "4단 심사 안내",
  desc: "3단 승단일 기준 3년, 추가 출석 600일을 충족하면 심사에 응시할 수 있습니다.",
  bullets: ["현중태극권 대가2로", "공력심사"],
},

];
const STEP_IMAGES = {
  rankExam: require("../assets/images/icon-rank-exam.png"),
  pathChoice: require("../assets/images/icon-path-choice.png"),
  sword: require("../assets/images/icon-sword.png"),
  rankExam2: require("../assets/images/icon-rank-exam-2.png"),
  taiji: require("../assets/images/icon-taiji.png"),
  rankExam3: require("../assets/images/icon-rank-exam-3.png"),
  yudanjaTraining: require("../assets/images/icon-yudanja-training.png"),
  healthTraining: require("../assets/images/icon-health-training.png"),
  noticeInfo: require("../assets/images/icon-notice-info.png"),
  calendar: require("../assets/images/icon-calendar.png"),
  star: require("../assets/images/icon-star.png"),
};

const fonts = {
  regular: "PretendardRegular",
  medium: "PretendardMedium",
  semiBold: "PretendardSemiBold",
  bold: "PretendardBold",
  title: "MaruBuriBold",
  titleSemi: "MaruBuriSemiBold",
};

function toneColor(tone) {
  if (tone === "blue") return "#5F8490";
  if (tone === "brown") return colors.warmBrown;
  return "#7E8550";
}

export default function TrainingJourneyScreen() {
  const { token } = useAuth();
const [data, setData] = useState(null);

const loadData = useCallback(async () => {
  if (!token) return;

  try {
    const result = await getMemberTaegukwon(token);
    setData(result);
  } catch (error) {
    console.log("수련 여정 데이터 조회 실패:", error);
  }
}, [token]);

useEffect(() => {
  loadData();
}, [loadData]);

const member = data?.member || {};
const rankLevel = Number(member.rankLevel || 0);
const personalProgress = data?.personalProgress || null;

const currentJourney = useMemo(() => {
  if (rankLevel >= 2) {
  return {
  stepNo: 5,
  title: "현중태극권 대가1로 79식 수련",
  desc: "현중태극권 대가1로 79식",
  progressTitle: "2단 이후 심화 수련 중",
  progressCount: "5 / 8단계",
  progressPercent: 63,
  progressDesc: "3단 심사 준비 과정에 해당합니다.",
};
}

  if (rankLevel >= 1) {
    return {
  stepNo: 3,
  title: "현중태극검 52식 수련",
  desc: "현중태극검 52식",
  progressTitle: "1단 이후 검 수련 중",
  progressCount: "3 / 8단계",
  progressPercent: 38,
  progressDesc: "2단 심사 준비 과정에 해당합니다.",
};
  }

  return {
  stepNo: 1,
  title: "입관 후 기본 수련",
  desc: "현중태극권 29식 · 현중태극선 29식",
  progressTitle: "입관 후 기본 수련 중",
  progressCount: "1 / 8단계",
  progressPercent: 13,
  progressDesc: "1단 심사 응시 가능 시점까지 수련을 쌓아가는 과정입니다.",
};
}, [rankLevel]);
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <ScreenHeader title="수련 여정" />
      <ImageBackground
  source={require("../assets/images/training-journey-mountain.png")}
  style={styles.heroCard}
  imageStyle={styles.heroImage}
  resizeMode="cover"
>
       <Text style={styles.heroTitle}>현중태극권{"\n"}수련의 길</Text>
        <Text style={styles.heroDesc}>
          건강을 위한 꾸준한 수련도,{"\n"}
          심화를 위한 승단 준비도 모두 소중한 과정입니다.
        </Text>

        <View style={styles.philosophyBox}>
          <View style={styles.philosophyIcon}>
  <Image
    source={require("../assets/images/icon-leaf.png")}
    style={styles.philosophyIconImage}
    resizeMode="contain"
  />
</View>
          <Text style={styles.philosophyText}>
            승단은 필수가 아닙니다.{"\n"}
            다만 수련이 충분히 쌓였다면, {"\n"}한 번쯤 도전해보셔도 좋습니다.
          </Text>
        </View>
      </ImageBackground>

      <View style={styles.currentCard}>
        <View style={styles.currentTop}>
          <View style={styles.currentIcon}>
  <Image
    source={require("../assets/images/icon-sprout.png")}
    style={styles.currentIconImage}
    resizeMode="contain"
  />
</View>

          <View style={styles.currentInfo}>
            <Text style={styles.currentLabel}>현재 수련 과정</Text>
            <Text style={styles.currentTitle}>{currentJourney.title}</Text>

          </View>
        </View>

        <View style={styles.progressBlock}>
          <View style={styles.progressRow}>
            <Text style={styles.progressTitle}>{currentJourney.progressTitle}</Text>
<Text style={styles.progressCount}>{currentJourney.progressCount}</Text>
          </View>

          <View style={styles.progressTrack}>
            <View
  style={[
    styles.progressFill,
    { width: `${currentJourney.progressPercent}%` },
  ]}
/>
          </View>

          <Text style={styles.progressDesc}>
            {currentJourney.progressDesc}
          </Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>전체 수련 여정</Text>

      
      {steps.map((step, index) => (
  <React.Fragment key={step.no}>
    <StepCard
      step={step}
      isLast={index === steps.length - 1}
    />

    {step.no === 2 ? <HealthTrainingNoticeCard /> : null}
  </React.Fragment>
))}

      <YudanjaNoticeCard />
      <View style={styles.noticeCard}>
        <View style={styles.noticeIcon}>
  <Image
    source={STEP_IMAGES.noticeInfo}
    style={styles.noticeIconImage}
    resizeMode="contain"
  />
</View>
        <View style={styles.noticeContent}>
          <Text style={styles.noticeTitle}>안내 사항</Text>
          <Text style={styles.noticeText}>
            각 과정의 수련 기간은 개인의 속도와 상황에 따라 달라질 수 있으며, 수련 내용은 현중태극문 지도진의
            판단에 의해 변경될 수 있습니다.{"\n"}
            궁금한 점이 있으시면 관장님께 문의해주세요.            
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

function StepCard({ step, isLast }) {
  const color = toneColor(step.tone);

  return (
    <View style={styles.stepWrap}>
      <View style={styles.timeline}>
        <View style={[styles.stepNumber, { backgroundColor: color }]}>
          <Text style={styles.stepNumberText}>{step.no}</Text>
        </View>
        {!isLast ? <View style={styles.timelineLine} /> : null}
      </View>

      <View style={styles.stepCard}>
        <View style={styles.stepInner}>
          <View style={[styles.stepIcon, { backgroundColor: `${color}22` }]}>
            {step.no === 1 ? (
  <Image
    source={require("../assets/images/icon-sprout.png")}
    style={styles.stepIconImage}
    resizeMode="contain"
  />
) : step.imageKey ? (
  <Image
    source={STEP_IMAGES[step.imageKey]}
    style={styles.stepIconImage}
    resizeMode="contain"
  />
) : (
  <Text style={[styles.stepIconText, { color }]}>{step.icon}</Text>
)}
          </View>

          <View style={styles.stepContent}>
            <View style={styles.stepTitleRow}>
              <Text style={styles.stepTitle}>{step.title}</Text>
              {step.badge ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{step.badge}</Text>
                </View>
              ) : null}
            </View>

            <Text style={styles.stepDesc}>{step.desc}</Text>

            {step.infoTitle ? (
              <View style={styles.infoBox}>
  <Image
    source={STEP_IMAGES.calendar}
    style={styles.infoIconImage}
    resizeMode="contain"
  />

  <View style={styles.infoTextWrap}>
    <Text style={styles.infoLabel}>{step.infoTitle}</Text>
    <Text style={styles.infoValue}>{step.infoText}</Text>
  </View>
</View>
            ) : null}

            {step.bullets ? (
              <View style={styles.bulletBox}>
                <Text style={styles.bulletTitle}>심사 내용</Text>
                {step.bullets.map((item) => (
                  <Text key={item} style={styles.bulletText}>
                    • {item}
                  </Text>
                ))}
              </View>
            ) : null}

            {step.note ? (
              <View style={styles.noteBox}>
                <Image
  source={STEP_IMAGES.star}
  style={styles.noteIconImage}
  resizeMode="contain"
/>
                <Text style={styles.noteText}>{step.note}</Text>
              </View>
            ) : null}

            {step.choices ? (
              <View style={styles.choiceWrap}>
                {step.choices.map((choice) => (
                  <View key={choice.title} style={styles.choiceBox}>
                    <View style={styles.choiceIcon}>
                      {choice.imageKey ? (
  <Image
    source={STEP_IMAGES[choice.imageKey]}
    style={styles.choiceIconImage}
    resizeMode="contain"
  />
) : (
  <Text style={styles.choiceIconText}>{choice.icon}</Text>
)}
                    </View>
                    <View style={styles.choiceTextWrap}>
                      <Text style={styles.choiceTitle}>{choice.title}</Text>
                      <Text style={styles.choiceText}>{choice.text}</Text>
                    </View>
                  </View>
                ))}
                <Text style={styles.choiceBottom}>{step.bottom}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>
    </View>
  );
}
function YudanjaNoticeCard() {
  return (
    <View style={styles.yudanjaNoticeCard}>
      <View style={styles.yudanjaNoticeIcon}>
        <Image
          source={STEP_IMAGES.star}
          style={styles.yudanjaNoticeIconImage}
          resizeMode="contain"
        />
      </View>

      <View style={styles.yudanjaNoticeContent}>
        <Text style={styles.yudanjaNoticeTitle}>
          현중태극문 유단자회 안내
        </Text>

        <Text style={styles.yudanjaNoticeText}>
          유단자는 선택에 의해 유단자회 가입이 가능합니다.{"\n"}
          유단자회에서는 발경, 추수, 편간 등 공력 심화수련을 진행합니다.{"\n\n"}
          ※ 수련은 매주 월요일 저녁 7시부터 진행됩니다.{"\n"}
          ※ 유단자회는 별도 회비가 있습니다.
        </Text>
      </View>
    </View>
  );
}
function HealthTrainingNoticeCard() {
  return (
    <View style={styles.healthNoticeWrap}>
      <View style={styles.healthNoticeCard}>
        <View style={styles.healthNoticeTop}>
          <View style={styles.healthNoticeIcon}>
            <Image
              source={STEP_IMAGES.noticeInfo}
              style={styles.healthNoticeIconImage}
              resizeMode="contain"
            />
          </View>

          <View style={styles.healthNoticeTextWrap}>
            <Text style={styles.healthNoticeTitle}>건강관리 중심 수련 안내</Text>
            <Text style={styles.healthNoticeText}>
              승단은 필수가 아닙니다.{"\n\n"}
              건강관리 중심으로 수련하실 경우 현중태극권 29식과
              현중태극선 29식을 반복하며 몸의 균형을 다져갑니다.{"\n\n"}
              승단 없이 다른 투로 진도를 원하실 경우에는 별도 개인지도
              신청을 통해 가능합니다.
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  screen: {
  flex: 1,
  backgroundColor: colors.background,
},

content: {
  paddingHorizontal: 16,
  paddingTop: 24,
  paddingBottom: 110,
  width: "100%",
  maxWidth: 430,
  alignSelf: "center",
},

  header: {
  height: 54,
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 10,
  position: "relative",
},

backButton: {
  position: "absolute",
  left: 0,
  width: 44,
  height: 44,
  alignItems: "flex-start",
  justifyContent: "center",
},

backIcon: {
  width: 22,
  height: 22,
  opacity: 0.9,
},

headerTitle: {
  fontSize: 24,
  fontFamily: fonts.title,
  color: colors.textMain,
  lineHeight: 32,
},

  heroCard: {
  borderRadius: radius.lg,
  borderWidth: 1,
  borderColor: colors.border,
  backgroundColor: colors.card,
  padding: 20,
  overflow: "hidden",
  marginBottom: 14,
  minHeight: 210,
  ...shadow.card,
},
  heroBgText: {
    position: "absolute",
    right: -10,
    top: -24,
    fontSize: 140,
    fontWeight: "900",
    color: "rgba(45,33,23,0.06)",
  },
  heroTitle: {
  fontSize: 28,
  fontFamily: fonts.title,
  lineHeight: 36,
  color: colors.textMain,
},

heroDesc: {
  marginTop: 9,
  fontSize: 14,
  lineHeight: 21,
  fontFamily: fonts.medium,
  color: colors.textSub,
},
  philosophyBox: {
    marginTop: 18,
    flexDirection: "row",
    gap: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E7D3B9",
    backgroundColor: "#FFF9EF",
    padding: 14,
  },
  philosophyIcon: {
    width: 44,
    height: 44,
    borderRadius: 21,
    backgroundColor: "#EFE8D8",
    alignItems: "center",
    justifyContent: "center",
    marginTop : 7,
  },
  philosophyIconText: {
    color: COLORS.olive,
    fontSize: 20,
    fontWeight: "900",
  },
  philosophyText: {
  flex: 1,
  fontSize: 15,
  lineHeight: 20,
  fontWeight: "600",
  color: COLORS.ink,
},

  currentCard: {
  borderRadius: radius.lg,
  borderWidth: 1,
  borderColor: colors.border,
  backgroundColor: colors.card,
  padding: 16,
  marginBottom: 22,
  ...shadow.card,
},

  currentTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  currentIcon: {
  width: 76,
  height: 76,
  borderRadius: 38,
  backgroundColor: "transparent",
  alignItems: "center",
  justifyContent: "center",
},
  currentIconText: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "900",
  },
  currentInfo: {
    flex: 1,
  },
  currentLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.sub,
  },
  currentTitle: {
  marginTop: 4,
  fontSize: 20,
  lineHeight: 27,
  fontFamily: fonts.titleSemi,
  color: colors.textMain,
},
  currentDesc: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700",
    color: COLORS.sub,
  },
  progressBlock: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#EDE2D4",
    paddingTop: 14,
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 9,
  },
  progressTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.ink,
  },
  progressCount: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.ink,
  },
  progressTrack: {
    height: 12,
    borderRadius: 99,
    backgroundColor: "#EEE6DA",
    overflow: "hidden",
  },
  progressFill: {
    width: "66%",
    height: "100%",
    borderRadius: 99,
    backgroundColor: COLORS.olive,
  },
  progressDesc: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "700",
    color: COLORS.sub,
  },

  sectionTitle: {
  fontSize: 22,
  fontFamily: fonts.titleSemi,
  color: colors.textMain,
  marginBottom: 12,
},

  stepWrap: {
    flexDirection: "row",
  },
  timeline: {
    width: 42,
    alignItems: "center",
  },
  stepNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  stepNumberText: {
    fontSize: 17,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: COLORS.line,
    marginTop: 4,
  },
  stepCard: {
  flex: 1,
  borderRadius: radius.lg,
  borderWidth: 1,
  borderColor: colors.border,
  backgroundColor: colors.card,
  padding: 14,
  marginBottom: 12,
  ...shadow.card,
},
  stepInner: {
    flexDirection: "row",
    gap: 12,
  },
  stepIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  stepIconText: {
    fontSize: 24,
    fontWeight: "900",
  },
  stepContent: {
    flex: 1,
  },
  stepTitleRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  stepTitle: {
  fontSize: 17,
  lineHeight: 24,
  fontFamily: fonts.bold,
  color: colors.textMain,
},
  badge: {
    borderRadius: 99,
    backgroundColor: "#F2E5D3",
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "900",
    color: COLORS.brownDark,
  },
  stepDesc: {
  fontSize: 14,
  lineHeight: 22,
  fontFamily: fonts.medium,
  color: colors.textSub,
},
  infoBox: {
  marginTop: 12,
  borderRadius: 16,
  borderWidth: 1,
  borderColor: "#E8D7C1",
  backgroundColor: "#FBF3E6",
  padding: 12,
  flexDirection: "row",
  alignItems: "center",
  gap: 10,
},
infoIconImage: {
  width: 30,
  height: 30,
},

infoTextWrap: {
  flex: 1,
},

noteIconImage: {
  width: 18,
  height: 18,
  marginTop: 2,
},
  infoLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.sub,
  },
  infoValue: {
  marginTop: 4,
  fontSize: 15,
  fontFamily: fonts.semiBold,
  color: COLORS.ink,
},
  bulletBox: {
    marginTop: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#EEE0CE",
    backgroundColor: "#FBF5EC",
    padding: 12,
  },
  bulletTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.brownDark,
    marginBottom: 6,
  },
  bulletText: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "600",
    color: COLORS.ink,
  },
  noteBox: {
    marginTop: 12,
    flexDirection: "row",
    gap: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E8D1A8",
    backgroundColor: "#FFF8E8",
    padding: 12,
  },
  noteIcon: {
    fontSize: 17,
    color: COLORS.gold,
  },
  noteText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "800",
    color: COLORS.brownDark,
  },
  choiceWrap: {
    marginTop: 12,
    gap: 9,
  },
  choiceBox: {
    flexDirection: "row",
    gap: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#D9E2E6",
    backgroundColor: "#FFFFFF",
    padding: 12,
  },
  choiceIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#EAF3F7",
    alignItems: "center",
    justifyContent: "center",
  },
  choiceIconText: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.blue,
  },
  choiceTextWrap: {
    flex: 1,
  },
  choiceTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: COLORS.ink,
  },
  choiceText: {
    marginTop: 3,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
    color: COLORS.sub,
  },
  choiceBottom: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "900",
    color: COLORS.blue,
  },
  noticeCard: {
    flexDirection: "row",
    gap: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E3D3BE",
    backgroundColor: COLORS.cardSoft,
    padding: 15,
    marginTop: 4,
  },
  noticeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#EEE7D7",
    alignItems: "center",
    justifyContent: "center",
  },
  noticeIconText: {
    fontSize: 23,
    fontWeight: "900",
    color: COLORS.olive,
  },
  noticeContent: {
    flex: 1,
  },
  noticeTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: COLORS.ink,
  },
  noticeText: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "700",
    color: COLORS.sub,
    letterSpacing: -0.4,
  },
  heroImage: {
  opacity: 0.36,
  transform: [
    { translateX: 130 },
    { translateY: 6 },
    { scale: 1 },
  ],
},

philosophyIconImage: {
  width: 26,
  height: 26,
  opacity: 0.9,
},
currentIconImage: {
  width: 76,
  height: 76,
},

stepIconImage: {
  width: 46,
  height: 46,
},
stepIconImage: {
  width: 46,
  height: 46,
},
choiceIconImage: {
  width: 26,
  height: 26,
},

noticeIconImage: {
  width: 34,
  height: 34,
},
healthNoticeWrap: {
  marginLeft: 42,
  marginBottom: 12,
},

healthNoticeCard: {
  borderRadius: radius.lg,
  borderWidth: 1,
  borderColor: "#E8D7C1",
  backgroundColor: "#FFF9EF",
  padding: 15,
  ...shadow.card,
},

healthNoticeTop: {
  flexDirection: "row",
  gap: 12,
},

healthNoticeIcon: {
  width: 44,
  height: 44,
  borderRadius: 22,
  backgroundColor: "#EFE8D8",
  alignItems: "center",
  justifyContent: "center",
},

healthNoticeIconImage: {
  width: 28,
  height: 28,
  opacity: 0.9,
},

healthNoticeTextWrap: {
  flex: 1,
},

healthNoticeTitle: {
  fontSize: 16,
  lineHeight: 22,
  fontFamily: fonts.bold,
  color: COLORS.ink,
},

healthNoticeText: {
  marginTop: 7,
  fontSize: 14,
  lineHeight: 22,
  fontFamily: fonts.medium,
  color: COLORS.sub,
},
yudanjaNoticeCard: {
  flexDirection: "row",
  gap: 12,
  borderRadius: 20,
  borderWidth: 1,
  borderColor: "#D8E1D2",
  backgroundColor: "#FBFDF8",
  padding: 15,
  marginTop: 4,
  marginBottom: 12,
  ...shadow.card,
},

yudanjaNoticeIcon: {
  width: 48,
  height: 48,
  borderRadius: 24,
  backgroundColor: "#EDF2E6",
  alignItems: "center",
  justifyContent: "center",
},

yudanjaNoticeIconImage: {
  width: 30,
  height: 30,
  opacity: 0.9,
},

yudanjaNoticeContent: {
  flex: 1,
},

yudanjaNoticeTitle: {
  fontSize: 17,
  fontFamily: fonts.bold,
  color: COLORS.ink,
},

yudanjaNoticeText: {
  marginTop: 7,
  fontSize: 15,
  lineHeight: 22,
  fontFamily: fonts.medium,
  color: COLORS.sub,
  letterSpacing: -0.3,
},
});