import React, { useMemo } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { colors } from "../../../src/theme/colors";
import { movementForms } from "../../../src/data/movementDictionary";

export default function MovementDetailScreen() {
  const { formId, stepOrder } = useLocalSearchParams();

  const form = useMemo(() => {
    return movementForms.find((item) => item.id === formId);
  }, [formId]);

  const movements = form?.movements || [];
  const orderNumber = Number(stepOrder);

  const movement = useMemo(() => {
    return movements.find((item) => Number(item.order) === orderNumber);
  }, [movements, orderNumber]);

  const currentIndex = movements.findIndex(
    (item) => Number(item.order) === orderNumber
  );

  const prevMovement = currentIndex > 0 ? movements[currentIndex - 1] : null;
  const nextMovement =
    currentIndex >= 0 && currentIndex < movements.length - 1
      ? movements[currentIndex + 1]
      : null;

  const goMovement = (target) => {
    if (!target || !form) return;

    router.replace({
      pathname: "/movement-dictionary/[formId]/[stepOrder]",
      params: {
        formId: form.id,
        stepOrder: String(target.order),
      },
    });
  };

  if (!form || !movement) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyTitle}>동작 정보를 찾을 수 없어요.</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backHomeButton}>
          <Text style={styles.backHomeText}>돌아가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          {String(movement.order).padStart(2, "0")} / {form.totalCount}
        </Text>

        <TouchableOpacity style={styles.starButton} activeOpacity={0.85}>
          <Text style={styles.starText}>☆</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.movementName}>{movement.name}</Text>

      {movement.hanja ? (
        <Text style={styles.hanjaText}>[{movement.hanja}]</Text>
      ) : null}

      <View style={styles.illustrationCard}>
  {movement.image ? (
    <Image
      source={movement.image}
      style={styles.movementImage}
      resizeMode="contain"
    />
  ) : (
    <>
      <View style={styles.circleBg} />
      <Text style={styles.figureText}>拳</Text>
    </>
  )}
</View>

      <Text style={styles.description}>{movement.description}</Text>

      <View style={styles.pointCard}>
        <Text style={styles.pointTitle}>수련 포인트</Text>

        {(movement.points || []).map((point, index) => (
          <View key={`${point}-${index}`} style={styles.pointRow}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.pointText}>{point}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={styles.explainButton}
        activeOpacity={0.86}
        onPress={() =>
          router.push({
            pathname: "/movement-dictionary/[formId]/[stepOrder]/explain",
            params: {
              formId: form.id,
              stepOrder: String(movement.order),
            },
          })
        }
      >
        <Text style={styles.explainButtonText}>그림 설명 보기</Text>
        <Text style={styles.explainArrow}>〉</Text>
      </TouchableOpacity>

      <View style={styles.navRow}>
        <TouchableOpacity
          style={[styles.navButton, !prevMovement && styles.navButtonDisabled]}
          activeOpacity={prevMovement ? 0.85 : 1}
          onPress={() => goMovement(prevMovement)}
        >
          <Text style={styles.navArrow}>‹</Text>
          <View>
            <Text style={styles.navLabel}>이전 동작</Text>
            <Text style={styles.navName}>
              {prevMovement
                ? `${String(prevMovement.order).padStart(2, "0")} ${prevMovement.name}`
                : "처음 동작"}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, !nextMovement && styles.navButtonDisabled]}
          activeOpacity={nextMovement ? 0.85 : 1}
          onPress={() => goMovement(nextMovement)}
        >
          <View style={styles.navRightText}>
            <Text style={styles.navLabel}>다음 동작</Text>
            <Text style={styles.navName}>
              {nextMovement
                ? `${String(nextMovement.order).padStart(2, "0")} ${nextMovement.name}`
                : "마지막 동작"}
            </Text>
          </View>
          <Text style={styles.navArrow}>〉</Text>
        </TouchableOpacity>
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
    fontSize: 16,
    fontWeight: "900",
    color: colors.textMain,
  },
  starButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  starText: {
    fontSize: 26,
    color: colors.bronzeGold,
  },
  movementName: {
    marginTop: 8,
    fontSize: 28,
    fontWeight: "900",
    color: colors.textMain,
    textAlign: "center",
  },
  hanjaText: {
    marginTop: 4,
    fontSize: 15,
    fontWeight: "700",
    color: colors.warmBrown,
    textAlign: "center",
  },
  illustrationCard: {
    marginTop: 18,
    height: 300,
    borderRadius: 24,
    backgroundColor: "#FFF8EF",
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  circleBg: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1,
    borderColor: "rgba(200,158,106,0.25)",
    backgroundColor: "rgba(255,255,255,0.35)",
  },
  figureText: {
    fontSize: 88,
    fontWeight: "900",
    color: colors.bronzeGold,
  },
  description: {
    marginTop: 18,
    fontSize: 16,
    lineHeight: 26,
    color: colors.textMain,
  },
  pointCard: {
    marginTop: 18,
    padding: 18,
    borderRadius: 18,
    backgroundColor: "#FFF5E8",
    borderWidth: 1,
    borderColor: colors.border,
  },
  pointTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: colors.textMain,
    marginBottom: 10,
  },
  pointRow: {
    flexDirection: "row",
    marginTop: 6,
  },
  bullet: {
    width: 18,
    fontSize: 15,
    color: colors.warmBrown,
    lineHeight: 22,
  },
  pointText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
    color: colors.textMain,
  },
  explainButton: {
    marginTop: 14,
    height: 54,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  explainButtonText: {
    fontSize: 15,
    fontWeight: "900",
    color: colors.textMain,
  },
  explainArrow: {
    fontSize: 22,
    color: colors.warmBrown,
  },
  navRow: {
    marginTop: 16,
    flexDirection: "row",
    gap: 10,
  },
  navButton: {
    flex: 1,
    minHeight: 70,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  navButtonDisabled: {
    opacity: 0.45,
  },
  navArrow: {
    fontSize: 26,
    color: colors.warmBrown,
    marginHorizontal: 4,
  },
  navLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textSub,
    marginBottom: 3,
  },
  navName: {
    fontSize: 13,
    fontWeight: "900",
    color: colors.textMain,
  },
  navRightText: {
    flex: 1,
    alignItems: "flex-end",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.textMain,
    textAlign: "center",
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
  movementImage: {
  width: "100%",
  height: "100%",
},
});