import React, { useMemo } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { colors } from "../../src/theme/colors";
import { movementForms } from "../../src/data/movementDictionary";
import ScreenHeader from "../../src/components/ScreenHeader";

export default function MovementFormDetailScreen() {
  const { formId, movementNumber } = useLocalSearchParams();

  const form = useMemo(() => {
    return movementForms.find((item) => item.id === formId);
  }, [formId]);

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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ScreenHeader title={form.title} />

      <View style={styles.introCard}>
        <Text style={styles.introDesc}>{form.description}</Text>

        <View style={styles.countRow}>
          <Text style={styles.countText}>
            수록 동작 {movements.length} / {form.totalCount}
          </Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{form.badge}</Text>
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
        <Text style={styles.movementName}>{targetMovement.name}</Text>
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
          <Text style={styles.movementName}>{movement.name}</Text>
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
});