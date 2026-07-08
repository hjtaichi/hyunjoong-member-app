import React from "react";
import {
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
  setEditMemberMemo,
  setMemoEditModalVisible,
  setMemoHistoryModalVisible,
}) {
  return (
    <>
        <View style={styles.formPeriodRow}>
          <View>
            <Text style={styles.formPeriodTitle}>공력 기록</Text>
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
        setTodayGongbeopRecord({
          ilsimyangui: "",
          yobujeonsa: "",
          duyoMinutes: "",
          ohaengjeonsa: "",
        });
      
        setRecordModalVisible(true);
      }}
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
      
        <View style={styles.memoImageCard}>
          <Image
            source={MEMO_BG}
            style={styles.memoCardBg}
            resizeMode="stretch"
          />
      
          <Text
        style={styles.memoPreviewText}
        numberOfLines={3}
      
      >
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
    </>
  );
}

export default React.memo(GongbeopSection);