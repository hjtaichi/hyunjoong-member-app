import React, { useState, useMemo } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  useFocusEffect,
  router,
  useLocalSearchParams,
} from "expo-router";
import { colors } from "../../src/theme/colors";
import { movementForms } from "../../src/data/movementDictionary";
import ScreenHeader from "../../src/components/ScreenHeader";



import { speakChinese, speakChineseSequence, stopChineseSpeech } from "../../src/utils/chineseSpeech";
// HJTAICHI_CHINESE_TTS_IMPORT
// HJTAICHI_CHINESE_TTS_INLINE_LIST_SPEAKER_V24
export default function MovementFormDetailScreen() {
  const { formId, movementNumber } = useLocalSearchParams();

  const form = useMemo(() => {
    return movementForms.find((item) => item.id === formId);
  }, [formId]);


  const [isPlayingAll, setIsPlayingAll] = useState(false);
  // HJTAICHI_CHINESE_TTS_AUTO_STOP_ON_LEAVE
  useFocusEffect(
    React.useCallback(() => {
      return () => {
        stopChineseSpeech();
      };
    }, [])
  );

  React.useEffect(() => {
    if (typeof document === "undefined") {
      return undefined;
    }

    const stopWhenHidden = () => {
      if (document.hidden) {
        stopChineseSpeech();
      }
    };

    document.addEventListener(
      "visibilitychange",
      stopWhenHidden
    );

    return () => {
      document.removeEventListener(
        "visibilitychange",
        stopWhenHidden
      );
    };
  }, []);
if (!form) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyTitle}>투로 정보를 찾을 수 없어요.</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backHomeButton}>
          <Text style={styles.backHomeText}>돌아가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const movements = form.movements || [];
  const targetMovement = movements.find(
  (movement) => String(movement.order) === String(movementNumber)
);


  const handleWholeListen = () => {
    if (isPlayingAll) {
      stopChineseSpeech();
      setIsPlayingAll(false);
      return;
    }

    const phrases = movements
      .map((movement) => String(movement?.hanja || "").trim())
      .filter(Boolean);

    if (phrases.length === 0) {
      return;
    }

    setIsPlayingAll(true);

    const started = speakChineseSequence(phrases, {
      rate: 0.78,
      gapMs: 750,
      onComplete: () => setIsPlayingAll(false),
      onStop: () => setIsPlayingAll(false),
    });

    if (!started) {
      setIsPlayingAll(false);
    }
  };
return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ScreenHeader title={form.title} />
<View style={styles.introCard}>
        <Text style={styles.introDesc}>{form.description}</Text>

        <View style={styles.countRow}>
          <Text style={styles.countText}>
            수록 동작 {movements.length} / {form.totalCount}
          </Text>
          {/* HJTAICHI_CHINESE_TTS_FULL_LISTEN_COMPACT */}
          <View style={styles.metaActions}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{form.badge}</Text>
            </View>

            <TouchableOpacity
              style={[
                styles.listenAllCompactButton,
                isPlayingAll && styles.listenAllCompactButtonActive,
              ]}
              activeOpacity={0.78}
              accessibilityRole="button"
              accessibilityLabel={
                isPlayingAll
                  ? "투로 전체 듣기 중지"
                  : "투로 전체 중국어 발음 듣기"
              }
              onPress={handleWholeListen}
            >
              <Image
                source={require("../../assets/icons/chinese-tts-speaker.png")}
                style={styles.listenAllCompactIcon}
                resizeMode="contain"
              />
              <Text style={[styles.badgeText, styles.listenAllCompactText]}>
                {isPlayingAll ? "중지" : "전체듣기"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.tabRow}>
        <View style={styles.tabActive}>
          <Text style={styles.tabActiveText}>목록</Text>
        </View>
      </View>

      {movementNumber && targetMovement ? (
  <View style={styles.listCard}>
    <TouchableOpacity
      style={[styles.movementRow, styles.movementRowLast]}
      activeOpacity={0.86}
      onPress={() =>
        router.push({
          pathname: "/movement-dictionary/[formId]/[stepOrder]",
          params: {
            formId: form.id,
            stepOrder: String(targetMovement.order),
          },
        })
      }
    >
      <View style={styles.numberCircle}>
        <Text style={styles.numberText}>
          {String(targetMovement.stepLabel || targetMovement.order).padStart(2, "0")}
        </Text>
      </View>

      <View style={styles.movementTextWrap}>
        <View style={styles.movementTitleRow}>
            <Text style={styles.movementName}>{targetMovement.name}</Text>
            {targetMovement.hanja ? (
        <TouchableOpacity
          style={styles.inlineSpeakerButton}
          activeOpacity={0.72}
          accessibilityRole="button"
          accessibilityLabel={`${targetMovement.name} 중국어 발음 듣기`}
          onPress={(event) => {
            event?.stopPropagation?.();
            void speakChinese(targetMovement.hanja);
          }}
        >
          <Image source={require("../../assets/icons/chinese-tts-speaker.png")} style={styles.inlineSpeakerIcon} resizeMode="contain" />
        </TouchableOpacity>
      ) : null}
          </View>
        <Text style={styles.movementDesc}>{targetMovement.shortDesc}</Text>
      </View>




      <Text style={styles.arrow}>〉</Text>
    </TouchableOpacity>
  </View>
) : movements.length > 0 ? (
  <View style={styles.listCard}>
    {movements.map((movement, index) => (
      <TouchableOpacity
        key={`${movement.order}-${movement.name}`}
        style={[
          styles.movementRow,
          index === movements.length - 1 && styles.movementRowLast,
        ]}
        activeOpacity={0.86}
        onPress={() =>
          router.push({
            pathname: "/movement-dictionary/[formId]/[stepOrder]",
            params: {
              formId: form.id,
              stepOrder: String(movement.order),
            },
          })
        }
      >
        <View style={styles.numberCircle}>
          <Text style={styles.numberText}>
            {String(movement.stepLabel || movement.order).padStart(2, "0")}
          </Text>
        </View>

        <View style={styles.movementTextWrap}>
          <View style={styles.movementTitleRow}>
            <Text style={styles.movementName}>{movement.name}</Text>
            {movement.hanja ? (
          <TouchableOpacity
            style={styles.inlineSpeakerButton}
            activeOpacity={0.72}
            accessibilityRole="button"
            accessibilityLabel={`${movement.name} 중국어 발음 듣기`}
            onPress={(event) => {
              event?.stopPropagation?.();
              void speakChinese(movement.hanja);
            }}
          >
            <Image source={require("../../assets/icons/chinese-tts-speaker.png")} style={styles.inlineSpeakerIcon} resizeMode="contain" />
          </TouchableOpacity>
        ) : null}
          </View>
          <Text style={styles.movementDesc}>{movement.shortDesc}</Text>
        </View>




        <Text style={styles.arrow}>〉</Text>
      </TouchableOpacity>
    ))}
  </View>
) : (
  <View style={styles.emptyCard}>
    <Text style={styles.emptyTitle}>대표 동작 준비 중</Text>
    <Text style={styles.emptyDesc}>
      이 투로는 핵심 동작부터 차례대로 추가할 예정이에요.
    </Text>
  </View>
)}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },

  introCard: {
    marginTop: 8,
    padding: 20,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.border,
  },

  introDesc: {
    fontSize: 15,
    lineHeight: 23,
    color: colors.textMain,
  },
  countRow: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  countText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.warmBrown,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "#F3D37A",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#5C3B17",
  },
  tabRow: {
    marginTop: 18,
    height: 44,
    flexDirection: "row",
    backgroundColor: "#FFF7ED",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  tabActive: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.warmBrown,
  },
  tabActiveText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.warmBrown,
  },
  listCard: {
    marginTop: 14,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  movementRow: {
    minHeight: 85,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  movementRowLast: {
    borderBottomWidth: 0,
  },
  numberCircle: {
    width: 36,
    height: 36,
    borderRadius: 19,
    backgroundColor: colors.bronzeGold,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  numberText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  movementTextWrap: {
    flex: 1,
  },
  movementName: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textMain,
    marginBottom: 5,
  },
  movementDesc: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMain,
  },
  arrow: {
    fontSize: 20,
    color: colors.warmBrown,
    marginLeft: 8,
  },
  emptyCard: {
    marginTop: 14,
    padding: 22,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.textMain,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyDesc: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.textSub,
    textAlign: "center",
  },
  slideButton: {
    marginTop: 16,
    height: 54,
    borderRadius: 16,
    backgroundColor: "#FFF3E3",
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  slideIcon: {
    fontSize: 15,
    color: colors.warmBrown,
    marginRight: 8,
  },
  slideButtonText: {
    fontSize: 15,
    fontWeight: "900",
    color: colors.warmBrown,
  },
  backHomeButton: {
    marginTop: 16,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: colors.warmBrown,
  },
  backHomeText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  // HJTAICHI_CHINESE_TTS_STYLES
  speakerButton: {
    minWidth: 38,
    minHeight: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8EFE3",
    marginLeft: 6,
  },

  speakerText: {
    fontSize: 18,
  },

  // HJTAICHI_CHINESE_TTS_ICON_STYLES
  speakerIcon: {
    width: 24,
    height: 24,
  },

  // HJTAICHI_CHINESE_TTS_FULL_LISTEN_STYLES
  listenAllRow: {
    width: "100%",
    alignItems: "flex-end",
    marginTop: 2,
    marginBottom: 12,
  },

  listenAllButton: {
    minHeight: 38,
    paddingHorizontal: 13,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: "#E6D4C0",
    backgroundColor: "#F8EFE4",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  listenAllButtonActive: {
    backgroundColor: "#EEDFCF",
  },

  listenAllIcon: {
    width: 22,
    height: 22,
  },

  listenAllText: {
    color: "#7B5B49",
    fontSize: 13,
    fontFamily: "PretendardSemiBold",
  },

  // HJTAICHI_CHINESE_TTS_COMPACT_LISTEN_STYLES
  metaActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 6,
    flexShrink: 0,
  },

  listenAllCompactButton: {
    minHeight: 26,
    paddingHorizontal: 8,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#E6D4C0",
    backgroundColor: "#F8EFE4",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },

  listenAllCompactButtonActive: {
    backgroundColor: "#EEDFCF",
  },

  listenAllCompactIcon: {
    width: 14,
    height: 14,
  },

  listenAllCompactText: {
    color: "#8E6E45",
  },

  // HJTAICHI_CHINESE_TTS_INLINE_LIST_STYLES_V24
  movementTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
  },

  inlineSpeakerButton: {
    minWidth: 24,
    minHeight: 24,
    marginLeft: 6,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },

  inlineSpeakerIcon: {
    width: 19,
    height: 19,
  },
});
