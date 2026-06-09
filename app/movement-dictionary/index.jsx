import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>동작명 사전</Text>

        <View style={styles.headerRight} />
      </View>

      <View style={styles.hero}>
        <Text style={styles.heroTitle}>투로명이 궁금해요?</Text>
        <Text style={styles.heroDesc}>
          수련 중 들은 동작 이름과 뜻을 그림, 설명, 포인트와 함께 확인해보세요.
        </Text>
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
              <Text style={[styles.thumbText, isLocked && styles.thumbTextLocked]}>
                {isLocked ? "🔒" : "太"}
              </Text>
            </View>

            <View style={styles.formTextWrap}>
              <View style={styles.formTitleRow}>
                <Text style={[styles.formTitle, isLocked && styles.formTitleLocked]}>
                  {form.title}
                </Text>

                <View style={[styles.badge, isLocked && styles.lockBadge]}>
                  <Text style={[styles.badgeText, isLocked && styles.lockBadgeText]}>
                    {isLocked ? "잠금" : form.badge}
                  </Text>
                </View>
              </View>

              <Text style={[styles.formDesc, isLocked && styles.formDescLocked]}>
                {isLocked ? lockedText : form.subtitle}
              </Text>
            </View>

            <Text style={[styles.arrow, isLocked && styles.arrowLocked]}>
              {isLocked ? "🔒" : "〉"}
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
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
  },
  backText: {
    fontSize: 36,
    color: colors.warmBrown,
    lineHeight: 38,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.textMain,
  },
  headerRight: {
    width: 40,
  },
  hero: {
    marginTop: 8,
    padding: 22,
    borderRadius: 22,
    backgroundColor: "#FFF8EF",
    borderWidth: 1,
    borderColor: colors.border,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: colors.textMain,
    marginBottom: 12,
  },
  heroDesc: {
    fontSize: 15,
    lineHeight: 24,
    color: colors.textMain,
  },
  searchBox: {
    marginTop: 16,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  searchIcon: {
    fontSize: 22,
    color: colors.softBrown,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.textMain,
  },
  sectionTitle: {
    marginTop: 24,
    marginBottom: 10,
    fontSize: 16,
    fontWeight: "800",
    color: colors.textMain,
  },
  formCard: {
    minHeight: 104,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    marginBottom: 10,
  },
  formCardLocked: {
    backgroundColor: "#F7F1EA",
    opacity: 0.78,
  },
  thumbCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F8EFE3",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  thumbCircleLocked: {
    backgroundColor: "#E9E0D6",
  },
  thumbText: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.bronzeGold,
  },
  thumbTextLocked: {
    fontSize: 20,
    color: colors.softBrown,
  },
  formTextWrap: {
    flex: 1,
  },
  formTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  formTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: colors.textMain,
  },
  formTitleLocked: {
    color: colors.softBrown,
  },
  badge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#F3D37A",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#5C3B17",
  },
  lockBadge: {
    backgroundColor: "#E5DDD3",
  },
  lockBadgeText: {
    color: colors.warmBrown,
  },
  formDesc: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.textMain,
  },
  formDescLocked: {
    color: colors.textSub,
  },
  arrow: {
    fontSize: 26,
    color: colors.warmBrown,
    marginLeft: 8,
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
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.border,
  },
  termText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textMain,
  },
});