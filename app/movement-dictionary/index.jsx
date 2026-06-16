import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { colors } from "../../src/theme/colors";
import { movementForms } from "../../src/data/movementDictionary";
import { useAuth } from "../../src/contexts/AuthContext";
import { getMemberTaegukwon } from "../../src/api/memberTaegukwon";
import ScreenHeader from "../../src/components/ScreenHeader";
const fonts = {
  title: "MaruBuriBold",
  semiBold: "PretendardSemiBold",
  medium: "PretendardMedium",
  hanja: "ZhaoKai",
};
const formIcons = {
  "hyunjung-29": require("../../assets/images/taiji.png"),
  "fan-29": require("../../assets/images/fan.png"),
  "sword-52": require("../../assets/images/sword.png"),
  "daega-79": require("../../assets/images/taiji1.png"),
  "dando-24": require("../../assets/images/single-sword.png"),
  "daga-2-62": require("../../assets/images/taiji2.png"),
};
const lockIcon = require("../../assets/images/menu-lock.png");
const cardBrush = require("../../assets/images/movement-card-brush.png");
const heroFigure = require("../../assets/images/movement-dictionary-hero.png");

export default function MovementDictionaryHomeScreen() {
  const { token } = useAuth();
  const [keyword, setKeyword] = useState("");
  const [rankLevel, setRankLevel] = useState(0);

  const loadRankLevel = useCallback(async () => {
    if (!token) return;

    try {
      const result = await getMemberTaegukwon(token);
      const payload = result?.data || result;
      setRankLevel(Number(payload?.member?.rankLevel || 0));
    } catch (error) {
      console.log("동작 사전 등급 불러오기 실패:", error);
    }
  }, [token]);

  useEffect(() => {
    loadRankLevel();
  }, [loadRankLevel]);

  const filteredForms = useMemo(() => {
    const q = keyword.trim();
    if (!q) return movementForms;

    return movementForms.filter((form) => {
      return (
        form.title.includes(q) ||
        form.subtitle.includes(q) ||
        form.movements.some((movement) => movement.name.includes(q))
      );
    });
  }, [keyword]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ScreenHeader title="동작명 사전" />

      <View style={styles.hero}>
  <Image source={heroFigure} style={styles.heroFigure} resizeMode="contain" />

  <View style={styles.heroTextWrap}>
    <Text style={styles.heroTitle}>투로명이 궁금해요?</Text>
    <Text style={styles.heroDesc}>
      수련 중 들은 동작 이름과 뜻을 그림, 설명, 포인트와 함께 확인해보세요.
    </Text>
  </View>
</View>

      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>⌕</Text>
        <TextInput
          value={keyword}
          onChangeText={setKeyword}
          placeholder="궁금한 동작 이름을 검색해보세요"
          placeholderTextColor={colors.textSub}
          style={styles.searchInput}
        />
      </View>

      <Text style={styles.sectionTitle}>투로별 보기</Text>

      {filteredForms.map((form) => {
        const requiredRank = Number(form.requiredRank || 0);
        const isLocked = rankLevel < requiredRank;

        const lockedText =
  requiredRank > 0
    ? `${requiredRank}단 승단 후 열립니다`
    : "수련 단계에 따라 열립니다";

        return (
          <TouchableOpacity
            key={form.id}
            style={[styles.formCard, isLocked && styles.formCardLocked]}
            activeOpacity={0.86}
            onPress={() => {
              if (isLocked) {
                Alert.alert("아직 열리지 않았어요", lockedText);
                return;
              }

              router.push({
                pathname: "/movement-dictionary/[formId]",
                params: { formId: form.id },
              });
            }}
          >
            <View style={[styles.thumbCircle, isLocked && styles.thumbCircleLocked]}>
  {!isLocked ? (
    <Image source={cardBrush} style={styles.thumbBrush} resizeMode="contain" />
  ) : null}

{isLocked ? (
  <Image
    source={lockIcon}
    style={styles.thumbLockImage}
    resizeMode="contain"
  />
) : (
  <Image
    source={formIcons[form.id] || formIcons["hyunjung-29"]}
    style={styles.thumbIconImage}
    resizeMode="contain"
  />
)}
</View>

            <View style={styles.formTextWrap}>
              <View style={styles.formTitleRow}>
                <Text style={[styles.formTitle, isLocked && styles.formTitleLocked]}>
                  {form.title}
                </Text>

                <View
  style={[
    styles.badge,
    form.badge === "일부 수록" && styles.partialBadge,
    isLocked && styles.lockBadge,
  ]}
>
  <Text
    style={[
      styles.badgeText,
      form.badge === "일부 수록" && styles.partialBadgeText,
      isLocked && styles.lockBadgeText,
    ]}
  >
    {isLocked ? "잠금" : form.badge}
  </Text>
</View>
              </View>

              <Text style={[styles.formDesc, isLocked && styles.formDescLocked]}>
                {isLocked ? lockedText : form.subtitle}
              </Text>
            </View>

            <Text style={[styles.arrow, isLocked && styles.arrowLocked]}>
              {isLocked ? (
  <Image source={lockIcon} style={styles.arrowLockImage} resizeMode="contain" />
) : (
  <Text style={styles.arrow}>〉</Text>
)}
            </Text>
          </TouchableOpacity>
        );
      })}

      <Text style={styles.sectionTitle}>기본 용어</Text>

      <View style={styles.termRow}>
        {["공용", "출석", "마보", "전사", "송견"].map((item) => (
          <View key={item} style={styles.termChip}>
            <Text style={styles.termText}>{item}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
  paddingHorizontal: 16,
  paddingTop: 10,
  paddingBottom: 48,
  width: "100%",
  maxWidth: 430,
  alignSelf: "center",
},

hero: {
  marginTop: 6,
  minHeight: 150,
  paddingHorizontal: 20,
  paddingVertical: 24,
  borderRadius: 24,
  backgroundColor: colors.card,
  borderWidth: 1,
  borderColor: colors.border,
  overflow: "hidden",
  justifyContent: "center",
},

heroTextWrap: {
  width: "64%",
  zIndex: 2,
},

heroFigure: {
  position: "absolute",
  right: -12,
  bottom: -12,
  width: 170,
  height: 170,
  opacity: 0.9,
},

heroTitle: {
  fontSize: 27,
  fontFamily: fonts.title,
  color: colors.textMain,
  marginBottom: 10,
  letterSpacing: -0.8,
},

heroDesc: {
  fontSize: 14,
  lineHeight: 23,
  fontFamily: fonts.medium,
  color: colors.textMain,
},

searchBox: {
  marginTop: 14,
  height: 50,
  borderRadius: 25,
  backgroundColor: colors.card,
  borderWidth: 1,
  borderColor: colors.border,
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: 16,
},

searchIcon: {
  fontSize: 20,
  color: colors.softBrown,
  marginRight: 8,
},

searchInput: {
  flex: 1,
  fontSize: 14,
  fontFamily: fonts.medium,
  color: colors.textMain,
},

sectionTitle: {
  marginTop: 22,
  marginBottom: 10,
  fontSize: 16,
  fontFamily: fonts.semiBold,
  color: colors.textMain,
},

formCard: {
  minHeight: 96,
  borderRadius: 20,
  backgroundColor: colors.card,
  borderWidth: 1,
  borderColor: colors.border,
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: 14,
  paddingVertical: 13,
  marginBottom: 10,
},

thumbCircle: {
  width: 58,
  height: 58,
  borderRadius: 29,
  backgroundColor: "#F8EFE3",
  alignItems: "center",
  justifyContent: "center",
  marginRight: 13,
  overflow: "hidden",
},
  thumbCircleLocked: {
    backgroundColor: "#E9E0D6",
  },

  thumbBrush: {
  position: "absolute",
  width: 56,
  height: 56,
  opacity: 0.65,
},

  thumbIconImage: {
  width: 42,
  height: 42,
  zIndex: 2,
  opacity: 0.85,
},

thumbLockText: {
  fontSize: 20,
  color: colors.softBrown,
  zIndex: 2,
},
  formTextWrap: {
    flex: 1,
  },
  formTitleRow: {
  flexDirection: "row",
  alignItems: "center",
  gap: 7,
  marginBottom: 5,
},

formTitle: {
  flexShrink: 1,
  fontSize: 17,
  fontFamily: fonts.semiBold,
  color: colors.textMain,
},
  formTitleLocked: {
    color: colors.softBrown,
  },
  badge: {
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 999,
  backgroundColor: "#F3D37A",
},

badgeText: {
  fontSize: 10,
  fontFamily: fonts.semiBold,
  color: "#5C3B17",
},

  lockBadge: {
    backgroundColor: "#E5DDD3",
  },
  lockBadgeText: {
    color: colors.warmBrown,
  },
  formDesc: {
  fontSize: 13,
  lineHeight: 20,
  fontFamily: fonts.medium,
  color: colors.textMain,
},
  formDescLocked: {
    color: colors.textSub,
  },
  arrow: {
  fontSize: 26,
  color: colors.warmBrown,
  marginLeft: 8,
  opacity: 0.75,
},
  arrowLocked: {
    fontSize: 18,
    color: colors.softBrown,
  },
  termRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
termChip: {
  paddingHorizontal: 16,
  paddingVertical: 10,
  borderRadius: 14,
  backgroundColor: colors.card,
  borderWidth: 1,
  borderColor: colors.border,
},

termText: {
  fontSize: 14,
  fontFamily: fonts.semiBold,
  color: colors.textMain,
},
thumbLockImage: {
  width: 30,
  height: 30,
  zIndex: 2,
  opacity: 0.9,
},
arrowLockImage: {
  width: 22,
  height: 22,
  marginLeft: 8,
  opacity: 0.55,
},
partialBadge: {
  backgroundColor: "#E8DDD3",
},

partialBadgeText: {
  color: colors.warmBrown,
},
});