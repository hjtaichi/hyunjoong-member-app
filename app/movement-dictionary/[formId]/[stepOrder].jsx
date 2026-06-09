import React, { useMemo, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { colors } from "../../../src/theme/colors";
import { movementForms } from "../../../src/data/movementDictionary";

export default function MovementDetailScreen() {
  const { formId, stepOrder } = useLocalSearchParams();

  const form = useMemo(() => {
    return movementForms.find((item) => item.id === formId);
  }, [formId]);
  const [imageModalVisible, setImageModalVisible] = useState(false);
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
    <>
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

      <View style={styles.titleRow}>
  <TouchableOpacity
    onPress={() => goMovement(prevMovement)}
    disabled={!prevMovement}
    style={styles.titleArrowButton}
  >
    <Text style={[styles.titleArrow, !prevMovement && styles.titleArrowDisabled]}>
      ‹
    </Text>
  </TouchableOpacity>

  <View style={styles.titleCenter}>
    <Text style={styles.movementName}>{movement.name}</Text>
    {movement.hanja ? (
      <Text style={styles.hanjaText}>[{movement.hanja}]</Text>
    ) : null}
  </View>

  <TouchableOpacity
    onPress={() => goMovement(nextMovement)}
    disabled={!nextMovement}
    style={styles.titleArrowButton}
  >
    <Text style={[styles.titleArrow, !nextMovement && styles.titleArrowDisabled]}>
      ›
    </Text>
  </TouchableOpacity>
</View>

      <View style={styles.coreInfoCard}>
  <Text style={styles.coreInfoTitle}>동작 핵심 정보</Text>

  <View style={styles.coreInfoBody}>
    <View style={styles.coreImageArea}>
  <Image
    source={
      movement.image ||
      require("../../../assets/images/movement-placeholder-taiji.png")
    }
    style={movement.image ? styles.coreMovementImage : styles.corePlaceholderImage}
    resizeMode="contain"
  />

  {movement.image ? (
    <TouchableOpacity
      style={styles.imageZoomButton}
      activeOpacity={0.85}
      onPress={() => setImageModalVisible(true)}
    >
      <Text style={styles.imageZoomText}>⌕</Text>
    </TouchableOpacity>
  ) : null}
</View>

    <View style={styles.coreInfoList}>
      <View style={styles.coreInfoItem}>
        <View style={styles.coreIconCircle}>
          <Image
  source={require("../../../assets/images/icon-weight.png")}
  style={styles.coreIconImage}
  resizeMode="contain"
/>
        </View>
        <View style={styles.coreTextWrap}>
          <Text style={styles.coreItemTitle}>무게중심</Text>
<Text style={styles.coreItemDesc}>
  {movement.coreInfo?.weight || "-"}
</Text>
        </View>
      </View>

      <View style={styles.coreInfoItem}>
        <View style={styles.coreIconCircle}>
          <Image
  source={require("../../../assets/images/icon-technique.png")}
  style={styles.coreIconImage}
  resizeMode="contain"
/>
        </View>
        <View style={styles.coreTextWrap}>
          <Text style={styles.coreItemTitle}>주요기법</Text>
<Text style={styles.coreItemDesc}>
  {movement.coreInfo?.technique || "-"}
</Text>
        </View>
      </View>

      <View style={[styles.coreInfoItem, styles.coreInfoItemLast]}>
        <View style={styles.coreIconCircle}>
          <Image
  source={require("../../../assets/images/icon-intent.png")}
  style={styles.coreIconImage}
  resizeMode="contain"
/>
        </View>
        <View style={styles.coreTextWrap}>
          <Text style={styles.coreItemTitle}>의념</Text>
<Text style={styles.coreItemDesc}>
  {movement.coreInfo?.intent || "-"}
</Text>
        </View>
      </View>
    </View>
  </View>
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

      
    </ScrollView>
    {movement.image ? (
  <Modal visible={imageModalVisible} transparent animationType="fade">
    <View style={styles.imageModalOverlay}>
      <TouchableOpacity
        style={styles.imageModalCloseArea}
        activeOpacity={1}
        onPress={() => setImageModalVisible(false)}
      />

      <View style={styles.imageModalCard}>
        <TouchableOpacity
          style={styles.imageModalCloseButton}
          onPress={() => setImageModalVisible(false)}
        >
          <Text style={styles.imageModalCloseText}>×</Text>
        </TouchableOpacity>

        <Image
          source={movement.image}
          style={styles.imageModalImage}
          resizeMode="contain"
        />
      </View>
    </View>
  </Modal>
) : null}
  </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
  paddingHorizontal: 22,
  paddingTop: 16,
  paddingBottom: 56,
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
  coreInfoCard: {
  marginTop: 18,
  borderRadius: 20,
  backgroundColor: "#FFF8EF",
  borderWidth: 1,
  borderColor: "#eadcc8",
  padding: 14,
},

coreInfoTitle: {
  fontSize: 15,
  fontWeight: "900",
  color: colors.textMain,
  marginBottom: 12,
},

coreInfoBody: {
  flexDirection: "row",
  borderRadius: 16,
  overflow: "hidden",
  borderWidth: 1,
  borderColor: "rgba(234,220,200,0.9)",
  backgroundColor: "rgba(255,253,249,0.7)",
},

coreImageArea: {
  flex: 1.15,
  minHeight: 180,
  alignItems: "center",
  justifyContent: "center",
  padding: 10,
  borderRightWidth: 1,
  borderRightColor: "rgba(234,220,200,0.8)",
},

coreMovementImage: {
  width: "95%",
  height: "95%",
},

corePlaceholderImage: {
  width: "92%",
  height: "92%",
  opacity: 0.82,
},

coreInfoList: {
  flex: 1,
},

coreInfoItem: {
  flex: 1,
  minHeight: 70,
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: 10,
  borderBottomWidth: 1,
  borderBottomColor: "rgba(234,220,200,0.8)",
},

coreInfoItemLast: {
  borderBottomWidth: 0,
},

coreIconCircle: {
  width: 38,
  height: 38,
  borderRadius: 19,
  borderWidth: 1,
  borderColor: "#e3cda8",
  backgroundColor: "rgba(255,255,255,0.78)",
  alignItems: "center",
  justifyContent: "center",
  marginRight: 9,
},

coreIconText: {
  fontSize: 19,
  fontWeight: "900",
  color: colors.warmBrown,
},

coreTextWrap: {
  flex: 1,
},

coreItemTitle: {
  fontSize: 14,
  fontWeight: "900",
  color: colors.textMain,
  marginBottom: 3,
},

coreItemDesc: {
  fontSize: 12,
  lineHeight: 17,
  color: colors.warmBrown,
  fontWeight: "600",
},
  description: {
    marginTop: 18,
    fontSize: 17,
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
    fontSize: 17,
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
    fontSize: 16,
    lineHeight: 22,
    color: colors.textMain,
  },
  
  navRow: {
  marginTop: 18,
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
  imageZoomButton: {
  position: "absolute",
  right: 8,
  bottom: 8,
  width: 30,
  height: 30,
  borderRadius: 15,
  backgroundColor: "rgba(255, 255, 255, 0.88)",
  borderWidth: 1,
  borderColor: "#e3cda8",
  alignItems: "center",
  justifyContent: "center",
},

imageZoomText: {
  fontSize: 18,
  color: colors.warmBrown,
  fontWeight: "900",
},
imageModalOverlay: {
  flex: 1,
  backgroundColor: "rgba(35, 25, 18, 0.72)",
  alignItems: "center",
  justifyContent: "center",
  padding: 18,
},

imageModalCloseArea: {
  ...StyleSheet.absoluteFillObject,
},

imageModalCard: {
  width: "100%",
  maxHeight: "82%",
  borderRadius: 22,
  backgroundColor: "#FFF8EF",
  borderWidth: 1,
  borderColor: "#e3cda8",
  padding: 14,
},

imageModalCloseButton: {
  position: "absolute",
  right: 10,
  top: 8,
  zIndex: 2,
  width: 34,
  height: 34,
  borderRadius: 17,
  backgroundColor: "rgba(255,255,255,0.9)",
  alignItems: "center",
  justifyContent: "center",
},

imageModalCloseText: {
  fontSize: 26,
  lineHeight: 28,
  color: colors.warmBrown,
},

imageModalImage: {
  width: "100%",
  height: 520,
},
coreIconImage: {
  width: 32,
  height: 32,
},
titleRow: {
  marginTop: 8,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
},

titleCenter: {
  flex: 1,
  alignItems: "center",
},

titleArrow: {
  width: 44,
  textAlign: "center",
  fontSize: 32,
  fontWeight: "700",
  color: colors.warmBrown,
},
});