import React, { useMemo } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { colors } from "../../../../src/theme/colors";
import { movementForms } from "../../../../src/data/movementDictionary";

export default function MovementExplainScreen() {
  const { formId, stepOrder } = useLocalSearchParams();

  const form = useMemo(
    () => movementForms.find((item) => item.id === formId),
    [formId]
  );

  const movement = useMemo(() => {
    return form?.movements?.find(
      (item) => Number(item.order) === Number(stepOrder)
    );
  }, [form, stepOrder]);

  if (!form || !movement) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyTitle}>그림 설명을 찾을 수 없어요.</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backHomeButton}>
          <Text style={styles.backHomeText}>돌아가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const points = movement.points || [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>그림 설명</Text>

        <View style={styles.headerRight} />
      </View>

      <View style={styles.titleCard}>
        <Text style={styles.stepText}>
          {String(movement.order).padStart(2, "0")} / {form.totalCount}
        </Text>
        <Text style={styles.movementName}>{movement.name}</Text>
        {movement.hanja ? <Text style={styles.hanjaText}>{movement.hanja}</Text> : null}
      </View>

      <View style={styles.figureCard}>
        <View style={styles.paperCircle} />
        <Text style={styles.figureText}>拳</Text>

        <View style={[styles.bubble, styles.bubbleTop]}>
          <Text style={styles.bubbleText}>시선</Text>
        </View>

        <View style={[styles.bubble, styles.bubbleLeft]}>
          <Text style={styles.bubbleText}>어깨 힘 빼기</Text>
        </View>

        <View style={[styles.bubble, styles.bubbleRight]}>
          <Text style={styles.bubbleText}>손끝 방향</Text>
        </View>

        <View style={[styles.bubble, styles.bubbleBottom]}>
          <Text style={styles.bubbleText}>중심 낮추기</Text>
        </View>
      </View>

      <View style={styles.guideCard}>
        <Text style={styles.guideTitle}>한눈에 보는 동작 포인트</Text>

        {points.length > 0 ? (
          points.map((point, index) => (
            <View key={`${point}-${index}`} style={styles.guideRow}>
              <View style={styles.guideNumber}>
                <Text style={styles.guideNumberText}>{index + 1}</Text>
              </View>
              <Text style={styles.guideText}>{point}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyDesc}>아직 등록된 설명이 없어요.</Text>
        )}
      </View>

      <View style={styles.noteCard}>
        <Text style={styles.noteTitle}>수련 메모</Text>
        <Text style={styles.noteText}>
          처음에는 모양을 외우기보다 중심, 방향, 호흡이 자연스럽게 이어지는지 살펴보세요.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 40 },
  center: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  header: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: { width: 40, height: 40, justifyContent: "center" },
  backText: {
    fontSize: 36,
    color: colors.warmBrown,
    lineHeight: 38,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: colors.textMain,
  },
  headerRight: { width: 40 },
  titleCard: {
    marginTop: 8,
    padding: 18,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  stepText: {
    fontSize: 13,
    fontWeight: "900",
    color: colors.bronzeGold,
    marginBottom: 6,
  },
  movementName: {
    fontSize: 26,
    fontWeight: "900",
    color: colors.textMain,
  },
  hanjaText: {
    marginTop: 5,
    fontSize: 15,
    fontWeight: "700",
    color: colors.warmBrown,
  },
  figureCard: {
    marginTop: 16,
    height: 360,
    borderRadius: 24,
    backgroundColor: "#FFF8EF",
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  paperCircle: {
    position: "absolute",
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: "rgba(255,255,255,0.45)",
    borderWidth: 1,
    borderColor: "rgba(200,158,106,0.25)",
  },
  figureText: {
    fontSize: 90,
    fontWeight: "900",
    color: colors.bronzeGold,
  },
  bubble: {
    position: "absolute",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.border,
  },
  bubbleText: {
    fontSize: 13,
    fontWeight: "900",
    color: colors.textMain,
  },
  bubbleTop: { top: 36, alignSelf: "center" },
  bubbleLeft: { left: 22, top: 126 },
  bubbleRight: { right: 22, top: 150 },
  bubbleBottom: { bottom: 34, alignSelf: "center" },
  guideCard: {
    marginTop: 16,
    padding: 18,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.border,
  },
  guideTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: colors.textMain,
    marginBottom: 12,
  },
  guideRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 10,
  },
  guideNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.bronzeGold,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  guideNumberText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  guideText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 24,
    color: colors.textMain,
  },
  noteCard: {
    marginTop: 14,
    padding: 16,
    borderRadius: 18,
    backgroundColor: "#FFF5E8",
    borderWidth: 1,
    borderColor: colors.border,
  },
  noteTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: colors.warmBrown,
    marginBottom: 6,
  },
  noteText: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.textMain,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.textMain,
    textAlign: "center",
  },
  emptyDesc: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.textSub,
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
});