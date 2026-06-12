import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { colors, radius, shadow, spacing } from "../src/theme";
import { useAuth } from "../src/contexts/AuthContext";
import { API_BASE_URL } from "../src/config/env";

const IMG = {
  boardGold: require("../assets/images/awards/award-board-gold.png"),
  boardSilver: require("../assets/images/awards/award-board-silver.png"),
  boardBronze: require("../assets/images/awards/award-board-bronze.png"),
  medal1: require("../assets/images/awards/award-medal-1.png"),
  medal2: require("../assets/images/awards/award-medal-2.png"),
  medal3: require("../assets/images/awards/award-medal-3.png"),
  laurel: require("../assets/images/awards/award-laurel.png"),
  trophy: require("../assets/images/awards/award-trophy-main.png"),
  crown: require("../assets/images/awards/award-icon-crown.png"),
  hall: require("../assets/images/awards/award-icon-hall.png"),
  shield: require("../assets/images/awards/award-shield-gold.png"),
  heroBg: require("../assets/images/awards/award-main-hero.png"),
  emptyPodium: require("../assets/images/awards/award-empty-podium.png"),
laurelLeft: require("../assets/images/awards/award-laurel-left.png"),
laurelRight: require("../assets/images/awards/award-laurel-right.png"),
};

const FORM_AWARD_TYPES = [
  { key: "taeguk-29", title: "현중태극권 29식" },
  { key: "taeguk-fan-29", title: "현중태극선 29식" },
  { key: "taeguk-sword-52", title: "현중태극검 52식" },
  { key: "daega-1-79", title: "현중태극권 대가1로" },
  { key: "dando-24", title: "현중태극단도" },
  { key: "daega-2-62", title: "현중태극권 대가2로" },
];

const GONGBEOP_AWARD_TYPES = [
  { key: "ilsimyangui", title: "일심양의" },
  { key: "yobujeonsa", title: "요부전사" },
  { key: "duyoMinutes", title: "두요" },
  { key: "ohaengjeonsa", title: "오행전사" },
];

function rankAgain(rows) {
  return rows
    .slice()
    .sort((a, b) => Number(b.value || 0) - Number(a.value || 0))
    .map((item, index) => ({
      ...item,
      rank: index + 1,
    }));
}

function getBoard(rank) {
  if (rank === 1) return IMG.boardGold;
  if (rank === 2) return IMG.boardSilver;
  return IMG.boardBronze;
}

function getMedal(rank) {
  if (rank === 1) return IMG.medal1;
  if (rank === 2) return IMG.medal2;
  return IMG.medal3;
}

function Podium({ data, countMode = false }) {
  return (
    <View style={styles.podium}>
      {data.slice(0, 3).map((item) => (
        <View
          key={item.rank}
          style={[styles.podiumCard, item.rank === 1 && styles.firstCard]}
        >
          <Image source={getBoard(item.rank)} style={styles.boardImg} />
          <Image source={getMedal(item.rank)} style={styles.medalImg} />

          <View style={styles.podiumTextBox}>
            <Text style={styles.podiumName}>{item.name}</Text>
            <Text style={styles.podiumItem}>{item.item}</Text>
            <Text style={countMode ? styles.countValue : styles.percentValue}>
              {item.valueText || item.value}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function EmptyPodium() {
  return (
    <View style={styles.emptyPodiumImageWrap}>
      <Image
        source={IMG.emptyPodium}
        style={styles.emptyPodiumImage}
        resizeMode="stretch"
      />

      <View style={[styles.emptyCircle, styles.emptyCircleSecond]} />
      <View style={[styles.emptyCircle, styles.emptyCircleFirst]} />
      <View style={[styles.emptyCircle, styles.emptyCircleThird]} />

      <Text style={[styles.emptyPodiumDash, styles.emptyPodiumDashSecond]}>-</Text>
      <Text style={[styles.emptyPodiumDash, styles.emptyPodiumDashFirst]}>-</Text>
      <Text style={[styles.emptyPodiumDash, styles.emptyPodiumDashThird]}>-</Text>

      <Text style={[styles.emptyPodiumLabel, styles.emptyPodiumLabelSecond]}>
        달성률  -
      </Text>
      <Text style={[styles.emptyPodiumLabel, styles.emptyPodiumLabelFirst]}>
        달성률  -
      </Text>
      <Text style={[styles.emptyPodiumLabel, styles.emptyPodiumLabelThird]}>
        달성률  -
      </Text>
    </View>
  );
}

function RankList({ title, data }) {
  return (
    <View style={styles.rankBox}>
      <Text style={styles.sectionTitle}>{title}</Text>

      {data.map((item) => (
        <View key={`${title}-${item.rank}`} style={styles.rankRow}>
          <Text style={styles.rankNo}>{item.rank}</Text>

          <View style={styles.rankInfo}>
            <Text style={styles.rankName}>{item.name}</Text>
            <Text style={styles.rankItem}>{item.item}</Text>
          </View>

          <Text style={styles.rankValue}>{item.valueText || item.value}</Text>
        </View>
      ))}
    </View>
  );
}

export default function TrainingAwardsScreen() {
  const [view, setView] = useState("main");
  const [category, setCategory] = useState("form");
  const [formIndex, setFormIndex] = useState(0);
  const [gongbeopIndex, setGongbeopIndex] = useState(0);

  const isMain = view === "main";
  const isHall = view === "hall";
const awardStatus =
  view === "first" ? "active" : view === "second" ? "scheduled" : "scheduled";

const isActiveAward = awardStatus === "active";
const isCompletedAward = awardStatus === "completed";
  const title =
    view === "first"
      ? "2026 상반기 시상식"
      : view === "second"
      ? "2026 하반기 시상식"
      : view === "hall"
      ? "2026 명예의 전당"
      : "현중 수련 시상식";
const { token } = useAuth();
const [awardData, setAwardData] = useState(null);
const [loading, setLoading] = useState(true);
const currentAward =
  view === "first"
    ? awardData?.firstHalf
    : view === "second"
    ? awardData?.secondHalf
    : awardData?.hallOfFame;

const selectedTypes =
  category === "form" ? FORM_AWARD_TYPES : GONGBEOP_AWARD_TYPES;

const selectedIndex = category === "form" ? formIndex : gongbeopIndex;
const selectedAwardType = selectedTypes[selectedIndex] || selectedTypes[0];

const baseList =
  category === "form"
    ? currentAward?.formRanking || []
    : currentAward?.gongbeopRanking || [];

const list = rankAgain(
  baseList.filter((item) => {
    if (isHall) return true;

    if (category === "form") {
      return item.formKey === selectedAwardType.key;
    }

    return item.type === selectedAwardType.key;
  })
);

const handlePrevType = () => {
  if (category === "form") {
    setFormIndex((prev) =>
      prev === 0 ? FORM_AWARD_TYPES.length - 1 : prev - 1
    );
    return;
  }

  setGongbeopIndex((prev) =>
    prev === 0 ? GONGBEOP_AWARD_TYPES.length - 1 : prev - 1
  );
};

const handleNextType = () => {
  if (category === "form") {
    setFormIndex((prev) =>
      prev === FORM_AWARD_TYPES.length - 1 ? 0 : prev + 1
    );
    return;
  }

  setGongbeopIndex((prev) =>
    prev === GONGBEOP_AWARD_TYPES.length - 1 ? 0 : prev + 1
  );
};


useEffect(() => {
  if (!token) return;

  const loadAwards = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/api/member/me/training-awards?t=${Date.now()}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "수련 시상식 정보를 불러오지 못했습니다.");
      }

      setAwardData(result.data);
    } catch (error) {
      Alert.alert("오류", error.message);
    } finally {
      setLoading(false);
    }
  };

  loadAwards();
}, [token]);
if (loading) {
  return (
    <View style={styles.loadingWrap}>
      <ActivityIndicator />
      <Text style={styles.loadingText}>수련 시상식 정보를 불러오는 중입니다.</Text>
    </View>
  );
}
  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => (isMain ? router.back() : setView("main"))}>
          <Text style={styles.back}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {isMain ? (
          <>
  <View style={styles.mainHeroImageCard}>
    <Image
      source={IMG.heroBg}
      style={styles.mainHeroImage}
      resizeMode="cover"
    />

    <View style={styles.mainHeroTextBox}>
      <Text style={styles.mainHeroTitle}>현중 수련 시상식</Text>
      <Text style={styles.mainHeroDesc}>
        스스로 세운 목표를 향해{"\n"}
        묵묵히 쌓아온 수련의 시간을{"\n"}
        함께 축하합니다.
      </Text>
    </View>
  </View>

  <View style={styles.mainTabRow}>
    <TouchableOpacity
      style={[
        styles.mainTabButton,
        view === "first" && styles.mainTabButtonActive,
      ]}
      onPress={() => setView("first")}
      activeOpacity={0.86}
    >
      <Text style={styles.mainTabText}>상반기 시상식</Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={styles.mainTabButton}
      onPress={() => setView("second")}
      activeOpacity={0.86}
    >
      <Text style={styles.mainTabText}>하반기 시상식</Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={styles.mainTabButton}
      onPress={() => setView("hall")}
      activeOpacity={0.86}
    >
      <Text style={styles.mainTabText}>명예의 전당</Text>
    </TouchableOpacity>
  </View>

  <View style={styles.awardInfoCard}>
    <View style={styles.awardInfoHeaderRow}>
      <Text style={styles.awardInfoTitle}>2026 상반기 목표달성 시상식</Text>
      <View style={[styles.awardStatusPill, styles.awardStatusPillBlue]}>
  <Text style={styles.awardStatusText}>진행중</Text>
</View>
    </View>

    <View style={styles.awardMetaRow}>
      <Text style={styles.awardMetaLabel}>기간</Text>
      <Text style={styles.awardMetaText}>2026.01.01 ~ 2026.06.30</Text>
    </View>

    <Text style={styles.awardInfoDesc}>
      상반기 동안 목표를 향해 노력한 회원들을 소개합니다.
    </Text>

    <TouchableOpacity
      style={styles.awardOutlineButton}
      activeOpacity={0.86}
      onPress={() => setView("first")}
    >
      <Text style={styles.awardOutlineButtonText}>시상식 보기</Text>
      <Text style={styles.awardOutlineButtonArrow}>→</Text>
    </TouchableOpacity>
  </View>

  <View style={styles.awardInfoCard}>
    <View style={styles.awardInfoHeaderRow}>
      <Text style={styles.awardInfoTitle}>2026 하반기 목표달성 시상식</Text>
      <View style={[styles.awardStatusPill, styles.awardStatusPillGray]}>
  <Text style={styles.awardStatusText}>예정</Text>
</View>
    </View>

    <View style={styles.awardMetaRow}>
      <Text style={styles.awardMetaLabel}>기간</Text>
      <Text style={styles.awardMetaText}>2026.07.01 ~ 2026.12.31</Text>
    </View>

    <Text style={styles.awardInfoDesc}>
      하반기 수련 기록이 시작되면 시상식이 진행됩니다.
    </Text>

    <TouchableOpacity
      style={[styles.awardOutlineButton, styles.awardOutlineButtonBlue]}
      activeOpacity={0.86}
      onPress={() => setView("second")}
    >
      <Text style={[styles.awardOutlineButtonText, styles.awardOutlineButtonTextBlue]}>
        내 기록 보기
      </Text>
      <Text style={[styles.awardOutlineButtonArrow, styles.awardOutlineButtonTextBlue]}>
        →
      </Text>
    </TouchableOpacity>
  </View>

  <View style={styles.awardInfoCard}>
    <View style={styles.awardInfoHeaderRow}>
      <Text style={styles.awardInfoTitle}>2026 연말 명예의 전당</Text>
      <View style={[styles.awardStatusPill, styles.awardStatusPillGray]}>
        <Text style={styles.awardStatusText}>예정</Text>
      </View>
    </View>

    <View style={styles.awardMetaRow}>
      <Text style={styles.awardMetaLabel}>기간</Text>
      <Text style={styles.awardMetaText}>2026.01.01 ~ 2026.12.31</Text>
    </View>

    <Text style={styles.awardInfoDesc}>
      1년 동안 가장 많은 수련을 쌓은 회원들을 기록합니다.
    </Text>

    <TouchableOpacity
      style={[styles.awardOutlineButton, styles.awardOutlineButtonGray]}
      activeOpacity={0.86}
      onPress={() => setView("hall")}
    >
      <Text style={[styles.awardOutlineButtonText, styles.awardOutlineButtonTextGray]}>
        명예의 전당 안내
      </Text>
      <Text style={[styles.awardOutlineButtonArrow, styles.awardOutlineButtonTextGray]}>
        →
      </Text>
    </TouchableOpacity>
  </View>

  <Text style={styles.awardFootnote}>
    ◉ 시상식은 반기별 목표달성률을 기준으로 운영됩니다.
  </Text>
</>
        ) : (
          <>
            <View style={isHall ? styles.hallHero : styles.subHero}>
              {!isHall ? (
  <View style={styles.awardTitleWithLaurel}>
    <Image source={IMG.laurelLeft} style={styles.sideLaurel} />
    <Text style={styles.subTitle}>{title}</Text>
    <Image source={IMG.laurelRight} style={styles.sideLaurel} />
  </View>
) : (
  <>
    <Image source={IMG.hall} style={styles.subHeroIcon} />
    <Text style={styles.hallTitle}>{title}</Text>
  </>
)}
              <Text style={isHall ? styles.hallDesc : styles.subDesc}>
                {isHall
                  ? "1년 동안 가장 많은 수련을 쌓은 회원을 기립니다."
                  : "반기 동안 목표를 향해 꾸준히 달려온 회원들을 축하합니다."}
              </Text>
            </View>

            <View style={styles.segment}>
              <TouchableOpacity
                style={[styles.segmentBtn, category === "form" && styles.segmentActive]}
                onPress={() => setCategory("form")}
              >
                <Text style={[styles.segmentText, category === "form" && styles.segmentTextActive]}>
                  투로 {isHall ? "누적" : "순위"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.segmentBtn, category === "gongbeop" && styles.segmentActive]}
                onPress={() => setCategory("gongbeop")}
              >
                <Text style={[styles.segmentText, category === "gongbeop" && styles.segmentTextActive]}>
                  공력 {isHall ? "누적" : "순위"}
                </Text>
              </TouchableOpacity>
            </View>

            {!isHall ? (
  <View style={styles.awardTypeSelector}>
    <TouchableOpacity
      style={styles.awardTypeArrowButton}
      onPress={handlePrevType}
      activeOpacity={0.8}
    >
      <Text style={styles.awardTypeArrow}>‹</Text>
    </TouchableOpacity>

    <View style={styles.awardTypeCenter}>
      <Text style={styles.awardTypeTitle}>{selectedAwardType.title}</Text>
      <Text style={styles.awardTypeCount}>
        {selectedIndex + 1} / {selectedTypes.length}
      </Text>
    </View>

    <TouchableOpacity
      style={styles.awardTypeArrowButton}
      onPress={handleNextType}
      activeOpacity={0.8}
    >
      <Text style={styles.awardTypeArrow}>›</Text>
    </TouchableOpacity>
  </View>
) : null}

            {isCompletedAward || isHall ? (
  <Podium data={list} countMode={isHall} />
) : (
  <EmptyPodium />
)}

<RankList
             title={
  isHall
    ? category === "form"
      ? "투로 누적 횟수 순위"
      : "공력 누적 수련량 순위"
    : isActiveAward
    ? "실시간 TOP 10"
    : `${selectedAwardType.title} 목표달성률 순위`
}
              data={list}
            />

            <Text style={styles.notice}>
              * 실제 순위는 기록 데이터와 시상 기준에 따라 변경될 수 있습니다.
            </Text>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    height: 58,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: "rgba(255,252,250,0.96)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  back: {
    fontSize: 32,
    color: colors.textMain,
    lineHeight: 34,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: colors.textMain,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 44,
  },
  
  laurel: {
    position: "absolute",
    top: 18,
    right: 22,
    width: 96,
    height: 58,
    opacity: 0.85,
  },
  trophy: {
    position: "absolute",
    right: 18,
    bottom: 18,
    width: 126,
    height: 126,
  },
  heroSmall: {
    marginTop: 18,
    fontSize: 13,
    color: colors.softBrown,
  },
  heroTitle: {
    marginTop: 8,
    fontSize: 30,
    fontWeight: "900",
    color: colors.textMain,
  },
  heroDesc: {
    marginTop: 16,
    width: "62%",
    fontSize: 14,
    lineHeight: 23,
    color: colors.textSub,
  },
  mainHeroImageCard: {
  height: 245,
  borderRadius: radius.xl,
  overflow: "hidden",
  backgroundColor: "#F7EFE2",
  borderWidth: 1,
  borderColor: "#E8D4AF",
  ...shadow.card,
},
mainHeroImage: {
  position: "absolute",
  width: "100%",
  height: "100%",
},
mainHeroTextBox: {
  padding: 24,
  paddingTop: 34,
},
mainHeroTitle: {
  fontSize: 28,
  fontWeight: "900",
  color: colors.textMain,
},
mainHeroDesc: {
  marginTop: 16,
  fontSize: 14,
  lineHeight: 24,
  color: colors.textSub,
},
mainTabRow: {
  marginTop: 12,
  padding: 4,
  borderRadius: 16,
  backgroundColor: "#FFFFFF",
  borderWidth: 1,
  borderColor: "#E5D8CB",
  flexDirection: "row",
},
mainTabButton: {
  flex: 1,
  paddingVertical: 12,
  borderRadius: 12,
  alignItems: "center",
},
mainTabButtonActive: {
  backgroundColor: "#1F2933",
},
mainTabText: {
  fontSize: 13,
  fontWeight: "800",
  color: colors.textMain,
},
mainTabTextActive: {
  fontSize: 13,
  fontWeight: "900",
  color: "#FFF8EC",
},
awardInfoCard: {
  marginTop: 14,
  padding: 18,
  borderRadius: radius.xl,
  backgroundColor: colors.card,
  borderWidth: 1,
  borderColor: "#E8DCCF",
  ...shadow.card,
},
awardInfoHeaderRow: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
},
awardInfoTitle: {
  flex: 1,
  fontSize: 19,
  fontWeight: "900",
  color: colors.textMain,
},
awardStatusPill: {
  paddingHorizontal: 11,
  paddingVertical: 5,
  borderRadius: 999,
  backgroundColor: colors.bronzeGold,
},
awardStatusPillBlue: {
  backgroundColor: "#2F638C",
},
awardStatusPillGray: {
  backgroundColor: "#8A837C",
},
awardStatusText: {
  fontSize: 11,
  fontWeight: "900",
  color: "#FFFFFF",
},
awardMetaRow: {
  marginTop: 14,
  flexDirection: "row",
  alignItems: "center",
},
awardMetaLabel: {
  width: 44,
  fontSize: 13,
  color: colors.textSub,
},
awardMetaText: {
  fontSize: 13,
  color: colors.textMain,
},
awardInfoDesc: {
  marginTop: 16,
  fontSize: 14,
  lineHeight: 23,
  color: colors.textSub,
},
awardOutlineButton: {
  marginTop: 18,
  alignSelf: "flex-start",
  paddingHorizontal: 18,
  paddingVertical: 10,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: colors.bronzeGold,
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
},
awardOutlineButtonBlue: {
  borderColor: "#2F638C",
},
awardOutlineButtonGray: {
  borderColor: "#8A837C",
},
awardOutlineButtonText: {
  fontSize: 13,
  fontWeight: "900",
  color: "#9B6A22",
},
awardOutlineButtonTextBlue: {
  color: "#2F638C",
},
awardOutlineButtonTextGray: {
  color: "#5F5A55",
},
awardOutlineButtonArrow: {
  fontSize: 15,
  fontWeight: "900",
  color: "#9B6A22",
},
awardFootnote: {
  marginTop: 16,
  fontSize: 12,
  lineHeight: 18,
  color: colors.textSub,
},
  menuIcon: {
    width: 48,
    height: 48,
    resizeMode: "contain",
    marginRight: 14,
  },
  menuText: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.textMain,
  },
  menuDesc: {
    marginTop: 5,
    fontSize: 13,
    color: colors.textSub,
  },
  hallMenuTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#FFF5D8",
  },
  hallMenuDesc: {
    marginTop: 5,
    fontSize: 13,
    color: "#D9C7A5",
  },
  arrow: {
    fontSize: 22,
    color: colors.bronzeGold,
  },
  hallArrow: {
    fontSize: 22,
    color: "#E5C16F",
  },
  subHero: {
    alignItems: "center",
    padding: 22,
    borderRadius: radius.xl,
    backgroundColor: "#FFF8EC",
    borderWidth: 1,
    borderColor: "#E8D2A5",
  },
  hallHero: {
    alignItems: "center",
    padding: 22,
    borderRadius: radius.xl,
    backgroundColor: "#211F1B",
    borderWidth: 1,
    borderColor: "#B9904F",
  },
  subHeroIcon: {
    width: 90,
    height: 70,
    resizeMode: "contain",
    marginBottom: 8,
  },
  subTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.textMain,
  },
  subDesc: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 22,
    color: colors.textSub,
    textAlign: "center",
  },
  hallTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#FFF5D8",
  },
  hallDesc: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 22,
    color: "#D8C7A5",
    textAlign: "center",
  },
  segment: {
    marginTop: 16,
    padding: 4,
    borderRadius: 999,
    backgroundColor: "#EFE4D6",
    flexDirection: "row",
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    alignItems: "center",
  },
  segmentActive: {
    backgroundColor: colors.textMain,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.textSub,
  },
  segmentTextActive: {
    color: "#FFF8EC",
  },
  podium: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  podiumCard: {
    width: "31.5%",
    height: 192,
    alignItems: "center",
  },
  firstCard: {
    height: 218,
  },
  boardImg: {
    position: "absolute",
    width: "100%",
    height: "100%",
    resizeMode: "stretch",
  },
  medalImg: {
    width: 46,
    height: 46,
    resizeMode: "contain",
    marginTop: -6,
  },
  podiumTextBox: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 8,
    paddingTop: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  podiumName: {
    fontSize: 13,
    fontWeight: "900",
    color: "#2F241F",
    textAlign: "center",
  },
  podiumItem: {
    marginTop: 5,
    fontSize: 10,
    color: "#7B685D",
    textAlign: "center",
  },
  percentValue: {
    marginTop: 8,
    fontSize: 17,
    fontWeight: "900",
    color: "#9B5E25",
  },
  countValue: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "900",
    color: "#9B5E25",
  },
  rankBox: {
    marginTop: 18,
    padding: 18,
    borderRadius: radius.xl,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.textMain,
    marginBottom: 8,
  },
  rankRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: "#F0E6DC",
  },
  rankNo: {
    width: 28,
    fontSize: 15,
    fontWeight: "900",
    color: "#B58A43",
  },
  rankInfo: {
    flex: 1,
  },
  rankName: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.textMain,
  },
  rankItem: {
    marginTop: 3,
    fontSize: 12,
    color: colors.textSub,
  },
  rankValue: {
    fontSize: 15,
    fontWeight: "900",
    color: "#9B5E25",
  },
  notice: {
    marginTop: 14,
    textAlign: "center",
    fontSize: 12,
    color: colors.textSub,
  },
  loadingWrap: {
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.background,
},
loadingText: {
  marginTop: 10,
  fontSize: 13,
  color: colors.textSub,
},
awardTypeSelector: {
  marginTop: 12,
  paddingVertical: 10,
  paddingHorizontal: 10,
  borderRadius: 18,
  backgroundColor: "#FFF8EC",
  borderWidth: 1,
  borderColor: "#E7D2A9",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
},
awardTypeArrowButton: {
  width: 42,
  height: 42,
  borderRadius: 21,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "rgba(200,158,106,0.12)",
},
awardTypeArrow: {
  fontSize: 30,
  lineHeight: 32,
  fontWeight: "700",
  color: colors.bronzeGold,
},
awardTypeCenter: {
  flex: 1,
  alignItems: "center",
  paddingHorizontal: 8,
},
awardTypeTitle: {
  fontSize: 17,
  fontWeight: "900",
  color: colors.textMain,
  textAlign: "center",
},
awardTypeCount: {
  marginTop: 3,
  fontSize: 11,
  fontWeight: "700",
  color: colors.textSub,
},
emptyPodiumImageWrap: {
  marginTop: 10,
  height: 178,
  position: "relative",
  overflow: "hidden",
},

emptyPodiumImage: {
  position: "absolute",
  left: -20,
  right: -20,
  bottom: -6,
  width: "112%",
  height: 178,
  opacity: 0.95,
},
emptyCircle: {
  position: "absolute",
  width: 42,
  height: 42,
  borderRadius: 21,
  backgroundColor: "rgba(95,85,75,0.18)",
},
emptyCircleSecond: {
  left: "14%",
  top: 86,
},
emptyCircleFirst: {
  left: "44%",
  top: 62,
},
emptyCircleThird: {
  right: "14%",
  top: 86,
},
emptyPodiumDash: {
  position: "absolute",
  fontSize: 15,
  fontWeight: "900",
  color: colors.textSub,
},
emptyPodiumDashSecond: {
  left: "20%",
  top: 132,
},
emptyPodiumDashFirst: {
  left: "50%",
  top: 108,
},
emptyPodiumDashThird: {
  right: "20%",
  top: 132,
},
emptyPodiumLabel: {
  position: "absolute",
  fontSize: 11,
  fontWeight: "800",
  color: colors.textSub,
},
emptyPodiumLabelSecond: {
  left: "11%",
  top: 152,
},
emptyPodiumLabelFirst: {
  left: "41%",
  top: 128,
},
emptyPodiumLabelThird: {
  right: "11%",
  top: 152,
},
awardTitleWithLaurel: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
},
sideLaurel: {
  width: 34,
  height: 54,
  resizeMode: "contain",
},
});