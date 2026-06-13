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
import ScreenHeader from "../src/components/ScreenHeader";
import { LinearGradient } from "expo-linear-gradient";
const fonts = {
  medium: "PretendardMedium",
  semiBold: "PretendardSemiBold",
  bold: "PretendardBold",
  titleSemi: "MaruBuriSemiBold",
  titleBold: "MaruBuriBold",
};
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
placeholderAvatar: require("../assets/images/awards/award-avatar-placeholder.png"),
stage: require("../assets/images/awards/award-stage.png"),
landscapeBg: require("../assets/images/awards/award-landscape-bg.png"),
profileEmblemGold: require("../assets/images/awards/award-profile-emblem-gold.png"),
profileEmblemSilver: require("../assets/images/awards/award-profile-emblem-silver.png"),
profileEmblemBronze: require("../assets/images/awards/award-profile-emblem-bronze.png"),
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
function getProfileEmblem(rank) {
  if (rank === 1) return IMG.profileEmblemGold;
  if (rank === 2) return IMG.profileEmblemSilver;
  return IMG.profileEmblemBronze;
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
    <View style={styles.stageOnlyWrap}>
      <Image
        source={IMG.stage}
        style={styles.stageOnlyImage}
        resizeMode="contain"
      />

      <Image source={IMG.placeholderAvatar} style={styles.stageAvatarSecond} />
      <Image source={IMG.placeholderAvatar} style={styles.stageAvatarFirst} />
      <Image source={IMG.placeholderAvatar} style={styles.stageAvatarThird} />

      <View style={styles.stageDimOverlay} />

      <View style={styles.stageMessageBox}>
  <Text style={styles.stageMessageTitle}>
    누가 영광의 자리에 오를까요?
  </Text>

  <Image
    source={IMG.trophy}
    style={styles.stageMessageTrophy}
  />

  <Text style={styles.stageMessageDesc}>
    상반기 수련은 아직 진행중입니다.
  </Text>
</View>
    </View>
  );
}

function CompletedPodium({ data = [], countMode = false }) {
  const first = data[0] || null;
  const second = data[1] || null;
  const third = data[2] || null;
  const rest = data.slice(3, 10);

  if (!data.length) {
    return (
      <View style={styles.completedEmptyBox}>
        <Image source={IMG.trophy} style={styles.completedEmptyTrophy} />
        <Text style={styles.completedEmptyTitle}>아직 발표할 기록이 없습니다.</Text>
        <Text style={styles.completedEmptyDesc}>
          기록이 집계되면 이곳에 시상 결과가 표시됩니다.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.completedWrap}>
      <View style={styles.completedStageWrap}>
        <CompletedWinner
          item={second}
          rank={2}
          style={styles.completedWinnerSecond}
        />

        <CompletedWinner
          item={first}
          rank={1}
          style={styles.completedWinnerFirst}
          isFirst
        />

        <CompletedWinner
          item={third}
          rank={3}
          style={styles.completedWinnerThird}
        />

        <Image
          source={IMG.stage}
          style={styles.completedStageImage}
          resizeMode="contain"
        />
      </View>

      <View style={styles.completedMessageCard}>
        <Image source={IMG.trophy} style={styles.completedMessageTrophy} />
        <View style={{ flex: 1 }}>
          <Text style={styles.completedMessageTitle}>
            축하합니다, 수련의 결실입니다.
          </Text>
          <Text style={styles.completedMessageDesc}>
            꾸준히 쌓아온 기록이 오늘의 자리를 만들었습니다.
          </Text>
        </View>
      </View>

      
    </View>
  );
}
function CompletedWinner({ item, rank, style, isFirst = false }) {
  const name = item?.name || "-";
  const value = item?.valueText || item?.value || "-";

  return (
    <View style={[styles.completedWinner, style]}>
      <View
        style={[
          styles.emblemPhotoWrap,
          isFirst && styles.emblemPhotoWrapFirst,
        ]}
      >
        <Image
          source={IMG.placeholderAvatar}
          style={[
            styles.emblemProfilePhoto,
            isFirst && styles.emblemProfilePhotoFirst,
          ]}
          resizeMode="cover"
        />

        <Image
          source={getProfileEmblem(rank)}
          style={[
            styles.emblemFrame,
            isFirst && styles.emblemFrameFirst,
          ]}
          resizeMode="contain"
        />
      </View>

      <Text
        style={[
          styles.completedWinnerName,
          isFirst && styles.completedWinnerNameFirst,
        ]}
        numberOfLines={1}
      >
        {name}
      </Text>

      <Text
        style={[
          styles.completedWinnerValue,
          isFirst && styles.completedWinnerValueFirst,
        ]}
      >
        {value}
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
function MyRecordCard({ item }) {
  if (!item) return null;

  return (
    <View style={styles.myRecordCard}>
      <Text style={styles.myRecordTitle}>내 기록</Text>

      <View style={styles.myRecordBody}>
        <Text style={styles.myRecordMain}>
          {item.name || "회원"}님은 현재 {item.rank}위입니다.
        </Text>

        <Text style={styles.myRecordSub}>
          목표 {item.target || 0}회 / 기록 {item.count || 0}회 / 달성률 {item.valueText || item.value}
        </Text>
      </View>
    </View>
  );
}

function AwardBottomSection({
  title,
  data = [],
  myItem,
  isCompletedAward = false,
  isHall = false,
}) {
  return (
    <View style={styles.bottomSectionWrap}>
      <View style={styles.bottomSectionHeader}>
        <View style={styles.bottomSectionHeaderLine} />
        <Text style={styles.bottomSectionTitle}>{title}</Text>
        <View style={styles.bottomSectionHeaderLine} />
      </View>

      <View style={styles.bottomSectionBody}>
        <View style={styles.bottomRankingCard}>
  {data.length > 0 ? (
    data.map((item) => {
      const isMine =
        myItem &&
        (
          (item.memberId && myItem.memberId && item.memberId === myItem.memberId) ||
          (item.id && myItem.id && item.id === myItem.id) ||
          item.name === myItem.name
        );

      return (
        <View
          key={`bottom-rank-${item.rank}-${item.name}`}
          style={[
            styles.bottomRankRow,
            isMine && styles.bottomRankRowMine,
          ]}
        >
          <View style={styles.bottomRankNoWrap}>
            <Text
              style={[
                styles.bottomRankNo,
                item.rank <= 3 && styles.bottomRankNoTop3,
              ]}
            >
              {item.rank}
            </Text>
          </View>

          <View style={styles.bottomRankInfo}>
            <Text
              style={[
                styles.bottomRankName,
                isMine && styles.bottomRankNameMine,
              ]}
              numberOfLines={1}
            >
              {isMine ? `${item.name} (내 기록)` : item.name}
            </Text>
          </View>

          <Text
            style={[
              styles.bottomRankValue,
              isMine && styles.bottomRankValueMine,
            ]}
          >
            {item.valueText || item.value}
          </Text>
        </View>
      );
    })
  ) : (
    <View style={styles.bottomEmptyBox}>
      <Text style={styles.bottomEmptyText}>
        아직 순위에 반영할 기록이 없습니다.
      </Text>
    </View>
  )}
</View>

        <View style={styles.sideRecordCard}>
          <Text style={styles.sideRecordTitle}>내 기록</Text>

          <View style={styles.sideRecordBadge}>
            <Text style={styles.sideRecordBadgeText}>◎</Text>
          </View>

          <Text style={styles.sideRecordLabel}>현재 순위</Text>
          <Text
  style={[
    styles.sideRecordRank,
    !myItem?.rank && styles.sideRecordRankEmpty,
  ]}
>
  {myItem?.rank ? `${myItem.rank}위` : "순위 없음"}
</Text>

          <View style={styles.sideRecordDivider} />

          <Text style={styles.sideRecordLabel}>목표</Text>
          <Text style={styles.sideRecordValue}>{myItem?.target ?? 0}회</Text>

          <View style={styles.sideRecordDivider} />

          <Text style={styles.sideRecordLabel}>기록</Text>
          <Text style={styles.sideRecordValue}>{myItem?.count ?? 0}회</Text>

          <View style={styles.sideRecordDivider} />

          <Text style={styles.sideRecordLabel}>달성률</Text>
          <Text style={styles.sideRecordPercent}>
            {myItem?.valueText || myItem?.value || "0%"}
          </Text>

          <View style={styles.progressWrap}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.max(
                    0,
                    Math.min(
                      100,
                      Number(
                        String(myItem?.valueText || myItem?.value || 0).replace(
                          "%",
                          ""
                        )
                      )
                    )
                  )}%`,
                },
              ]}
            />
          </View>

          <View style={styles.progressLabels}>
            <Text style={styles.progressLabelText}>0%</Text>
            <Text style={styles.progressLabelText}>50%</Text>
            <Text style={styles.progressLabelText}>100%</Text>
          </View>
        </View>
      </View>
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
  view === "first" ? "completed" : view === "second" ? "scheduled" : "scheduled";

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
    if (!hasActualRecord(item)) return false;

    if (isHall) return true;

    if (category === "form") {
      return item.formKey === selectedAwardType.key;
    }

    return item.type === selectedAwardType.key;
  })
);

function hasActualRecord(item) {
  if (!item) return false;

  const count = Number(item.count ?? item.recordCount ?? 0);
  const value = Number(
    String(item.valueText ?? item.value ?? "0")
      .replace("%", "")
      .trim()
  );

  return count > 0 || value > 0;
}

const myRawRecord =
  category === "form"
    ? currentAward?.myFormRecords?.[selectedAwardType.key]
    : currentAward?.myGongbeopRecords?.[selectedAwardType.key];

const matchedMyRecord = list.find((item) => {
  if (!myRawRecord) return false;

  if (item.memberId && myRawRecord.memberId) {
    return item.memberId === myRawRecord.memberId;
  }

  if (item.id && myRawRecord.id) {
    return item.id === myRawRecord.id;
  }

  return item.name === myRawRecord.name;
});

const myDisplayRecord = hasActualRecord(myRawRecord)
  ? matchedMyRecord || {
      ...myRawRecord,
      rank: null,
    }
  : {
      ...myRawRecord,
      rank: null,
      value: "0%",
      valueText: "0%",
    };
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
  <ScrollView
    contentContainerStyle={styles.content}
    showsVerticalScrollIndicator={false}
  >
    <View style={styles.headerLayer}>
  <ScreenHeader
    title=""
    onBack={() => (isMain ? router.back() : setView("main"))}
  />
</View>

    {!isMain ? (
      <LinearGradient
  colors={[
    "rgba(255,252,250,1)",
    "rgba(255,252,250,0.88)",
    "rgba(255,252,250,0)"
  ]}
  style={styles.topGradient}
  pointerEvents="none"
/>
    ) : null}

    {!isMain ? (
      <Image
        source={IMG.landscapeBg}
        style={styles.detailBackground}
        resizeMode="cover"
      />
    ) : null}

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
            
<View style={styles.awardDetailHeader}>

  {!isHall ? (

    <>
      <View style={styles.awardTitleWithLaurel}>
        <Image source={IMG.laurelLeft} style={styles.sideLaurel} />
        <Text style={styles.detailBigTitle}>{title}</Text>
        <Image source={IMG.laurelRight} style={styles.sideLaurel} />
      </View>
      <Text style={styles.detailPeriodText}>
        {view === "first" ? "1월부터 6월까지" : "7월부터 12월까지"}

      </Text>
      <Text style={styles.detailDescText}>
       목표를 향해 꾸준히 달려온 회원들을 축하합니다.
      </Text>
    </>

  ) : (

    <>
      <Image source={IMG.hall} style={styles.subHeroIcon} />
      <Text style={styles.hallTitle}>{title}</Text>
      <Text style={styles.hallDesc}>

        1년 동안 가장 많은 수련을 쌓은 회원을 기립니다.
      </Text>
    </>
  )}
</View>     

{!isHall ? (

  <View style={styles.inlineTypeSelector}>
  <TouchableOpacity onPress={handlePrevType}>
    <Text style={styles.inlineArrow}>‹</Text>
  </TouchableOpacity>

  <Text style={styles.inlineTypeTitle}>
    {selectedAwardType.title}
  </Text>

  <TouchableOpacity onPress={handleNextType}>
    <Text style={styles.inlineArrow}>›</Text>
  </TouchableOpacity>
</View>

) : null}
       
{isHall ? (
  <Podium data={list} countMode={isHall} />
) : isCompletedAward ? (
  <CompletedPodium data={list} />
) : (
  <EmptyPodium />
)}

<View style={styles.awardDivider} />

<AwardBottomSection
  title={
    isHall
      ? "누적 TOP 10"
      : isCompletedAward
      ? "최종 TOP 10"
      : "실시간 TOP 10"
  }
  data={list}
  myItem={myDisplayRecord}
  isCompletedAward={isCompletedAward}
  isHall={isHall}
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
    content: {
  paddingHorizontal: 16,
  paddingTop: 24,
  paddingBottom: 110,
  width: "100%",
  maxWidth: 430,
  alignSelf: "center",
},

topGradient: {
  position: "absolute",
  top: 25,
  left: 0,
  right: 0,
  height: 130,
  zIndex: 1,
},

detailBackground: {
  position: "absolute",
  top: 42,
  left: 0,
  right: 0,
  height: 520,
  opacity: 0.28,
  zIndex: 0,
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
  marginTop: 0,
  marginHorizontal: 6,
  padding: 3,
  height: 40,
  borderRadius: 999,
  backgroundColor: "rgba(239,228,214,0.72)",
  flexDirection: "row",
  zIndex: 5,
  elevation: 5,
},

segmentBtn: {
  flex: 1,
  borderRadius: 999,
  alignItems: "center",
  justifyContent: "center",
},
segmentText: {
  fontSize: 13,
  fontFamily: fonts.semiBold,
  color: colors.textSub,
},

segmentActive: {
  backgroundColor: "rgba(58,44,39,0.94)",
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
  marginTop: 10,
  paddingHorizontal: 4,
  paddingTop: 4,
  paddingBottom: 4,
  backgroundColor: "transparent",
},
  sectionTitle: {
  fontSize: 20,
  fontFamily: fonts.titleSemi,
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
  fontSize: 15,
  fontFamily: fonts.bold,
  color: colors.textMain,
},

rankItem: {
  marginTop: 3,
  fontSize: 12,
  fontFamily: fonts.medium,
  color: colors.textSub,
},

rankValue: {
  fontSize: 15,
  fontFamily: fonts.bold,
  color: "#9B5E25",
},

notice: {
  marginTop: 14,
  textAlign: "center",
  fontSize: 12,
  fontFamily: fonts.medium,
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
  marginTop: 8,
  paddingVertical: 8,
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

awardTitleWithLaurel: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
},
sideLaurel: {
  width: 28,
  height: 44,
  resizeMode: "contain",
},

inlineTypeSelector: {
  marginTop: 12,
  marginBottom: 8,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
},

inlineArrow: {
  fontSize: 28,
  fontWeight: "900",
  color: colors.bronzeGold,
  paddingHorizontal: 18,
},

inlineTypeTitle: {
  fontSize: 22,
  fontFamily: fonts.bold,
  color: colors.textMain,
},
awardDetailHeader: {
  paddingTop: 30,
  paddingBottom: 4,
  alignItems: "center",
},
detailBigTitle: {
  fontSize: 25,
  lineHeight: 34,
  fontFamily: fonts.titleSemi,
  color: colors.textMain,
  textAlign: "center",
},

detailPeriodText: {
  marginTop: 8,
  fontSize: 13,
  fontFamily: fonts.semiBold,
  color: colors.textSub,
},

detailDescText: {
  marginTop: 5,
  fontSize: 12,
  lineHeight: 18,
  fontFamily: fonts.medium,
  color: colors.textSub,
  textAlign: "center",
},
awardDivider: {
  marginTop: 10,
  height: 1,
  backgroundColor: "#E8DCCF",
  shadowColor: "#7A5A3A",
  shadowOpacity: 0.12,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 2 },
  elevation: 2,
},
emptyAvatarFirst: {
  position: "absolute",
  width: 56,
  height: 56,
  borderRadius: 27,
  top: 70,
  left: "42%",
},

emptyAvatarSecond: {
  position: "absolute",
  width: 48,
  height: 48,
  borderRadius: 24,
  top: 114,
  left: "9.5%",
},

emptyAvatarThird: {
  position: "absolute",
  width: 48,
  height: 48,
  borderRadius: 24,
  top: 114,
  right: "9.5%",
},
stagePreviewCard: {
  marginTop: 16,
  height: 250,
  borderRadius: 20,
  overflow: "hidden",
  borderWidth: 1,
  borderColor: "#D8B56C",
  backgroundColor: "#F7EFE2",
},

stageLandscapeBg: {
  position: "absolute",
  width: "100%",
  height: "100%",
  opacity: 0.9,
},

stagePodium: {
  position: "absolute",
  left: "4%",
  right: "4%",
  bottom: 8,
  width: "92%",
  height: 130,
  opacity: 0.38,
},

stageSoftOverlay: {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(255,252,250,0.45)",
},

stageMessageBox: {
  position: "absolute",
  top: 34,
  left: 0,
  right: 0,
  alignItems: "center",
  paddingHorizontal: 24,
  zIndex: 4,
},
stageMessageTrophy: {
  width: 110,
  height: 110,
  resizeMode: "contain",
  marginTop: 25,
  marginBottom: 15,
},

stageMessageTitle: {
  fontSize: 21,
  fontFamily: fonts.bold,
  color: colors.textMain,
  textAlign: "center",
},

stageMessageDesc: {
  marginTop: 3,
  fontSize: 15,
  fontFamily: fonts.medium,
  color: colors.textSub,
  textAlign: "center",
},
stageOnlyWrap: {
  marginTop: 18,
  height: 305,
  alignItems: "center",
  justifyContent: "flex-end",
  overflow: "hidden",
},

stageOnlyImage: {
  position: "absolute",
  bottom: 0,
  width: "116%",
  height: 215,
},
stageAvatarFirst: {
  position: "absolute",
  width: 65,
  height: 65,
  borderRadius: 31,
  top: 30,
  left: "41%",
},

stageAvatarSecond: {
  position: "absolute",
  width: 56,
  height: 56,
  borderRadius: 27,
  top: 83,
  left: "18%",
},

stageAvatarThird: {
  position: "absolute",
  width: 56,
  height: 56,
  borderRadius: 27,
  top: 90,
  right: "18%",
},
stageDimOverlay: {
  position: "absolute",
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  backgroundColor: "rgba(255,252,250,0.8)",
  zIndex: 3,
},
stageBlurOverlay: {
  position: "absolute",
  left: 0,
  right: 0,
  bottom: 0,
  height: 260,
  backgroundColor: "rgba(255,252,250,0.12)",
},
headerLayer: {
  height: 42,
  zIndex: 10,
  elevation: 10,
},
myRecordCard: {
  marginTop: 16,
  padding: 16,
  borderRadius: 16,
  backgroundColor: "rgba(255,248,236,0.92)",
  borderWidth: 1,
  borderColor: "#E3C88E",
  ...shadow.card,
},

myRecordTitle: {
  fontSize: 17,
  fontFamily: fonts.titleSemi,
  color: colors.textMain,
  marginBottom: 10,
},

myRecordBody: {
  gap: 4,
},

myRecordMain: {
  fontSize: 14,
  fontFamily: fonts.bold,
  color: colors.textMain,
},

myRecordSub: {
  fontSize: 12,
  lineHeight: 18,
  fontFamily: fonts.medium,
  color: colors.textSub,
},
completedWrap: {
  marginTop: 18,
},

completedStageWrap: {
  position: "relative",
  height: 330,
  marginTop: 4,
  alignItems: "center",
  justifyContent: "flex-end",
  overflow: "hidden",
},

completedStageImage: {
  position: "absolute",
  bottom: 0,
  width: "116%",
  height: 215,
  zIndex: 1,
},

completedWinner: {
  position: "absolute",
  alignItems: "center",
  width: 108,
  zIndex: 4,
},

completedWinnerFirst: {
  top: -20,
  left: "50%",
  marginLeft: -61,
  width: 122,
  zIndex: 6,
},

completedWinnerSecond: {
  top: 70,
  left: "7%",
  zIndex: 5,
},

completedWinnerThird: {
  top: 75,
  right: "7%",
  zIndex: 5,
},

completedWinnerNameFirst: {
  fontSize: 15,
  maxWidth: 100,
},

completedWinnerValueFirst: {
  fontSize: 12,
  color: "#76564B",
},

completedMessageCard: {
  marginTop: 12,
  paddingVertical: 13,
  paddingHorizontal: 15,
  borderRadius: 20,
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "rgba(255,248,236,0.9)",
  borderWidth: 1,
  borderColor: "#E3C88E",
},

completedMessageTrophy: {
  width: 42,
  height: 42,
  marginRight: 12,
  resizeMode: "contain",
},

completedMessageTitle: {
  fontSize: 15,
  fontFamily: fonts.bold,
  color: colors.textMain,
},

completedMessageDesc: {
  marginTop: 3,
  fontSize: 12,
  lineHeight: 17,
  fontFamily: fonts.medium,
  color: colors.textSub,
},

completedRankBox: {
  marginTop: 12,
  paddingHorizontal: 4,
  paddingTop: 4,
  paddingBottom: 2,
},

completedRankHeader: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 8,
},

completedRankTitle: {
  fontSize: 20,
  fontFamily: fonts.titleSemi,
  color: colors.textMain,
},

completedRankBadgeText: {
  fontSize: 11,
  fontFamily: fonts.bold,
  color: colors.bronzeGold,
},

completedRankRow: {
  flexDirection: "row",
  alignItems: "center",
  paddingVertical: 11,
  borderBottomWidth: 1,
  borderBottomColor: "#F0E6DC",
},

completedRankNo: {
  width: 28,
  fontSize: 15,
  fontFamily: fonts.bold,
  color: "#B58A43",
},

completedRankInfo: {
  flex: 1,
},

completedRankName: {
  fontSize: 15,
  fontFamily: fonts.bold,
  color: colors.textMain,
},

completedRankItem: {
  marginTop: 3,
  fontSize: 12,
  fontFamily: fonts.medium,
  color: colors.textSub,
},

completedRankValue: {
  fontSize: 15,
  fontFamily: fonts.bold,
  color: "#9B5E25",
},

completedRankEmpty: {
  paddingVertical: 18,
  textAlign: "center",
  fontSize: 13,
  fontFamily: fonts.medium,
  color: colors.textSub,
},

completedEmptyBox: {
  marginTop: 18,
  paddingVertical: 32,
  paddingHorizontal: 18,
  borderRadius: 22,
  alignItems: "center",
  backgroundColor: "rgba(255,248,236,0.9)",
  borderWidth: 1,
  borderColor: "#E3C88E",
},

completedEmptyTrophy: {
  width: 70,
  height: 70,
  resizeMode: "contain",
  marginBottom: 10,
},

completedEmptyTitle: {
  fontSize: 16,
  fontFamily: fonts.bold,
  color: colors.textMain,
},

completedEmptyDesc: {
  marginTop: 5,
  fontSize: 13,
  lineHeight: 19,
  fontFamily: fonts.medium,
  color: colors.textSub,
  textAlign: "center",
},
bottomSectionWrap: {
  marginTop: 14,
},

bottomSectionHeader: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 14,
  gap: 8,
},

bottomSectionHeaderLine: {
  flex: 1,
  height: 1,
  backgroundColor: "#DCC9A5",
  maxWidth: 110,
},

bottomSectionTitle: {
  fontSize: 18,
  fontFamily: fonts.titleSemi,
  color: colors.textMain,
},

bottomSectionBody: {
  flexDirection: "row",
  alignItems: "stretch",
  gap: 10,
},

bottomRankingCard: {
  flex: 1,
  backgroundColor: "rgba(255,255,255,0.82)",
  borderRadius: 18,
  borderWidth: 1,
  borderColor: "#E7DDD1",
  overflow: "hidden",
},

bottomRankRow: {
  minHeight: 44,
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: 14,
  borderBottomWidth: 1,
  borderBottomColor: "#F1E8DE",
  backgroundColor: "transparent",
},

bottomRankRowMine: {
  backgroundColor: "rgba(214, 187, 133, 0.18)",
},

bottomRankNoWrap: {
  width: 34,
  alignItems: "center",
  justifyContent: "center",
},

bottomRankNo: {
  fontSize: 15,
  fontFamily: fonts.bold,
  color: "#3F342E",
},

bottomRankNoTop3: {
  color: "#A67A2B",
},

bottomRankInfo: {
  flex: 1,
  paddingRight: 8,
},

bottomRankName: {
  fontSize: 13,
  fontFamily: fonts.medium,
  color: colors.textMain,
},

bottomRankNameMine: {
  color: "#8B6422",
  fontFamily: fonts.semiBold,
},

bottomRankValue: {
  fontSize: 13,
  fontFamily: fonts.semiBold,
  color: "#3F342E",
},

bottomRankValueMine: {
  color: "#A67A2B",
},

sideRecordCard: {
  width: 112,
  backgroundColor: "rgba(255,252,247,0.95)",
  borderRadius: 18,
  borderWidth: 1,
  borderColor: "#D9C6A0",
  paddingHorizontal: 12,
  paddingVertical: 14,
  alignItems: "center",
},

sideRecordTitle: {
  fontSize: 15,
  fontFamily: fonts.titleSemi,
  color: colors.textMain,
},

sideRecordBadge: {
  marginTop: 8,
  marginBottom: 6,
  width: 28,
  height: 28,
  borderRadius: 14,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "rgba(214,187,133,0.18)",
  borderWidth: 1,
  borderColor: "#D9C6A0",
},

sideRecordBadgeText: {
  fontSize: 12,
  color: "#A67A2B",
},

sideRecordLabel: {
  marginTop: 6,
  fontSize: 11,
  fontFamily: fonts.medium,
  color: colors.textSub,
},

sideRecordRank: {
  marginTop: 2,
  fontSize: 27,
  lineHeight: 34,
  fontFamily: fonts.titleBold,
  color: "#A67A2B",
},

sideRecordValue: {
  marginTop: 3,
  fontSize: 17,
  fontFamily: fonts.titleSemi,
  color: colors.textMain,
},

sideRecordPercent: {
  marginTop: 3,
  fontSize: 27,
  lineHeight: 32,
  fontFamily: fonts.titleBold,
  color: "#A67A2B",
},

sideRecordDivider: {
  width: "100%",
  height: 1,
  backgroundColor: "#EDE2D1",
  marginTop: 10,
  marginBottom: 4,
},

progressWrap: {
  marginTop: 10,
  width: "100%",
  height: 8,
  borderRadius: 999,
  backgroundColor: "#ECE6DE",
  overflow: "hidden",
},

progressFill: {
  height: "100%",
  backgroundColor: "#C89E6A",
  borderRadius: 999,
},

progressLabels: {
  marginTop: 5,
  width: "100%",
  flexDirection: "row",
  justifyContent: "space-between",
},

progressLabelText: {
  fontSize: 10,
  fontFamily: fonts.medium,
  color: colors.textSub,
},
emblemPhotoWrap: {
  width: 92,
  height: 116,
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
},

emblemPhotoWrapFirst: {
  width: 118,
  height: 148,
},

emblemProfilePhoto: {
  position: "absolute",
  top: 27,
  width: 54,
  height: 54,
  borderRadius: 27,
  zIndex: 1,
},

emblemProfilePhotoFirst: {
  top: 34,
  width: 68,
  height: 68,
  borderRadius: 34,
},

emblemFrame: {
  width: 92,
  height: 116,
  zIndex: 2,
},

emblemFrameFirst: {
  width: 118,
  height: 148,
},

completedWinnerName: {
  marginTop: 2,
  fontSize: 13,
  fontFamily: fonts.bold,
  color: colors.textMain,
  maxWidth: 86,
  textAlign: "center",
},

completedWinnerNameFirst: {
  marginTop: 0,
  fontSize: 15,
  maxWidth: 110,
},

completedWinnerValue: {
  marginTop: 2,
  fontSize: 12,
  fontFamily: fonts.semiBold,
  color: "#9B5E25",
  textAlign: "center",
},

completedWinnerValueFirst: {
  fontSize: 14,
  color: "#8B5B1E",
},
sideRecordRankEmpty: {
  fontSize: 17,
  lineHeight: 26,
  color: colors.textSub,
},
bottomEmptyBox: {
  flex: 1,
  minHeight: 220,
  alignItems: "center",
  justifyContent: "center",
  paddingHorizontal: 14,
},

bottomEmptyText: {
  fontSize: 12,
  lineHeight: 18,
  fontFamily: fonts.medium,
  color: colors.textSub,
  textAlign: "center",
},
});