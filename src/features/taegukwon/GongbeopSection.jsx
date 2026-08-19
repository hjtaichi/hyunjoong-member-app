import React from "react";
import {
  Alert,
  Platform,
  Animated,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../../theme";
import { getGongbeopPercent } from "./gongbeopMeta";
const FLOW_IMAGE = require("../../../assets/images/gongbeop-flow-full.png");
const RIVER_IMAGE = require("../../../assets/images/river-highlight.png");
const GOAL_ICON = require("../../../assets/images/goal-setting-icon.png");
const MEMO_BG = require("../../../assets/images/memo-card-bg.png");
function GongbeopSection({
  styles,
  AnimatedPercentCircle,
  riverGlowAnim,
  gongbeopRecord,
  gongbeopGoals,
  gongbeopUpdatedAt,
  setTodayGongbeopRecord,
  setRecordModalVisible,
  setGoalModalVisible,
  personalProgress,
  memberMemo,
  setEditMemberMemo,
  setMemoEditModalVisible,
  setMemoHistoryModalVisible,
}) {
  const memoPreviewText =
    memberMemo || "아직 작성한 메모가 없습니다.";

  const [memoPreviewLayoutState, setMemoPreviewLayoutState] =
    React.useState({
      text: "",
      density: "large",
    });

  const memoPreviewDensity =
    memoPreviewLayoutState.text === memoPreviewText
      ? memoPreviewLayoutState.density
      : "large";

  const memoPreviewTypography =
    memoPreviewDensity === "dense"
      ? styles.memoPreviewTextDense
      : memoPreviewDensity === "medium"
        ? styles.memoPreviewTextMedium
        : styles.memoPreviewTextLarge;

  const memoPreviewLineHeight =
    memoPreviewDensity === "dense"
      ? 19
      : memoPreviewDensity === "medium"
        ? 21
        : 23;

  const handleMemoPreviewLayout =
    React.useCallback(
      (event) => {
        const height = Number(
          event?.nativeEvent?.layout?.height || 0
        );

        if (
          !Number.isFinite(height) ||
          height <= 0
        ) {
          return;
        }

        const estimatedLines = Math.max(
          1,
          Math.round(
            height / memoPreviewLineHeight
          )
        );

        setMemoPreviewLayoutState(
          (currentState) => {
            const currentDensity =
              currentState.text === memoPreviewText
                ? currentState.density
                : "large";

            let nextDensity = currentDensity;

            if (
              currentDensity === "large" &&
              estimatedLines >= 6
            ) {
              nextDensity = "dense";
            } else if (
              currentDensity === "large" &&
              estimatedLines >= 4
            ) {
              nextDensity = "medium";
            } else if (
              currentDensity === "medium" &&
              estimatedLines >= 6
            ) {
              nextDensity = "dense";
            }

            if (
              currentState.text === memoPreviewText &&
              currentState.density === nextDensity
            ) {
              return currentState;
            }

            return {
              text: memoPreviewText,
              density: nextDensity,
            };
          }
        );
      },
      [
        memoPreviewLineHeight,
        memoPreviewText,
      ]
    );

  return (
    <>
        <View style={styles.formPeriodRow}>
          <View>
            <Text style={styles.formPeriodTitle}>도전! 내 최고 공력</Text>
            <Text style={styles.formPeriodSub}>
              목표는 달성할 때마다 새롭게 시작됩니다.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.formPeriodTextButton}
            activeOpacity={0.85}
            onPress={() => router.push("/gongbeop-record-history")}
          >
            <Text style={styles.formPeriodTextButtonLabel}>완료 기록 보기 〉</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.flowSection}>

          <Image
        source={FLOW_IMAGE}
        style={styles.flowBackground}
        resizeMode="stretch"
      />

      <LinearGradient
        colors={["rgba(255,252,250,0)", colors.background]}
        style={styles.flowBottomFade}
        pointerEvents="none"
      />

          <Animated.Image
        source={RIVER_IMAGE}
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
        onPress={() => {
        const hasAnyGongbeopGoal = Object.values(gongbeopGoals || {}).some(
          (value) => Number(value) > 0
        );

        if (!hasAnyGongbeopGoal) {
          if (Platform.OS === "web") {
            if (typeof window !== "undefined") {
              window.alert("목표를 먼저 설정해주세요.");
            }
          } else {
            Alert.alert("안내", "목표를 먼저 설정해주세요.");
          }
          return;
        }

        setTodayGongbeopRecord({
          ilsimyangui: "",
          yobujeonsa: "",
          duyoMinutes: "",
          ohaengjeonsa: "",
        });

        setRecordModalVisible(true);
      }}
      >
        <Text style={styles.flowTodayRecordText}>기록하기</Text>
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
          <Text style={styles.recordOverlayGoal}>{Number(gongbeopGoals.ilsimyangui) > 0 ? " / " + gongbeopGoals.ilsimyangui + "회" : " / -"}</Text>
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
          <Text style={styles.recordOverlayGoal}>{Number(gongbeopGoals.yobujeonsa) > 0 ? " / " + gongbeopGoals.yobujeonsa + "회" : " / -"}</Text>
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
          <Text style={styles.recordOverlayGoal}>{Number(gongbeopGoals.duyoMinutes) > 0 ? " / " + gongbeopGoals.duyoMinutes + "분" : " / -"}</Text>
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
          <Text style={styles.recordOverlayGoal}>{Number(gongbeopGoals.ohaengjeonsa) > 0 ? " / " + gongbeopGoals.ohaengjeonsa + "회" : " / -"}</Text>
        </Text>
       </View>
      </View>

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
          setGoalModalVisible(true);
        }}
      >
        <Image
          source={GOAL_ICON}
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
        {Number(gongbeopGoals.ilsimyangui) > 0 ? gongbeopGoals.ilsimyangui + "회" : "-"}
      </Text>
        </View>

        <View style={styles.goalItem}>
          <Text style={styles.goalItemTitle}>요부전사</Text>
          <Text style={[styles.goalGoalValue, styles.goalValueGreen]}
          numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.65}
        >
        {Number(gongbeopGoals.yobujeonsa) > 0 ? gongbeopGoals.yobujeonsa : "-"}{Number(gongbeopGoals.yobujeonsa) > 0 ? <Text style={styles.goalUnit}>회</Text> : null}
      </Text>
        </View>

        <View style={styles.goalItem}>
          <Text style={styles.goalItemTitle}>두요</Text>
          <Text style={[styles.goalGoalValue, styles.goalValueGold]}
          numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.65}
        >
        {Number(gongbeopGoals.duyoMinutes) > 0 ? gongbeopGoals.duyoMinutes : "-"}{Number(gongbeopGoals.duyoMinutes) > 0 ? <Text style={styles.goalUnit}>분</Text> : null}
      </Text>
        </View>

        <View style={styles.goalItem}>
          <Text style={styles.goalItemTitle}>오행전사</Text>
          <Text style={[styles.goalGoalValue, styles.goalValueBlue]}
          numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.65}
        >
        {Number(gongbeopGoals.ohaengjeonsa) > 0 ? gongbeopGoals.ohaengjeonsa : "-"}{Number(gongbeopGoals.ohaengjeonsa) > 0 ? <Text style={styles.goalUnit}>회</Text> : null}
      </Text>
        </View>
      </View>
      </View>

        <View style={styles.memoImageCard}>
          <Image
            source={MEMO_BG}
            style={styles.memoCardBg}
            resizeMode="stretch"
          />

          <Text
            onLayout={handleMemoPreviewLayout}
            style={[
              styles.memoPreviewText,
              memoPreviewTypography,
            ]}
          >
            {memoPreviewText}
          </Text>

          <TouchableOpacity
        style={styles.memoEditHotspot}
        onPress={() => {
  setEditMemberMemo(memberMemo || "");
  setMemoEditModalVisible(true);
}}
      />

          <TouchableOpacity
        style={[
          styles.memoDetailButton,
          memoPreviewDensity === "dense"
            ? styles.memoDetailButtonDense
            : memoPreviewDensity === "medium"
              ? styles.memoDetailButtonMedium
              : null,
        ]}
        onPress={() => setMemoHistoryModalVisible(true)}
        activeOpacity={0.85}
      >
        <Text style={styles.memoDetailButtonText}>이전 기록 보기</Text>
      </TouchableOpacity>
        </View>
    </>
  );
}

export default React.memo(GongbeopSection);