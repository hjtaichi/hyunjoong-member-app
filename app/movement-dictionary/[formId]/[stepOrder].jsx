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

  const fonts = {
  regular: "PretendardRegular",
  medium: "PretendardMedium",
  semiBold: "PretendardSemiBold",
  bold: "PretendardBold",
  title: "MaruBuriBold",
  titleSemi: "MaruBuriSemiBold",
  hanja: "ZhaoCaiKaiShu",
};

const parseHanjaMeaning = (text = "") => {
  return text
    .replace(/\n또는\n/g, "\n")
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const pieces = part.split(" ").filter(Boolean);
      return {
        char: pieces[0] || "",
        meaning: pieces[1] || "",
        sound: pieces[2] || "",
      };
    })
    .filter((item) => item.char);
};

const sectionIcon = require("../../../assets/images/movement-section-icon.png");
const cardBrush = require("../../../assets/images/movement-card-brush.png");

function SectionTitle({ title }) {
  return (
    <View style={styles.sectionTitleRow}>
      <Image source={sectionIcon} style={styles.sectionIcon} resizeMode="contain" />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

export default function MovementDetailScreen() {

const movementBg = require("../../../assets/images/movement-bg-circle.png");
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
  {String(movement.stepLabel || movement.order).padStart(2, "0")} / {form.title.includes("29식") ? "29" : form.totalCount}
</Text>

        <TouchableOpacity style={styles.starButton} activeOpacity={0.85}>
          <Text style={styles.starText}>☆</Text>
        </TouchableOpacity>
      </View>

 <View style={styles.heroCard}>
  <View style={styles.heroTextArea}>
    <Text style={styles.heroName}>{movement.name}</Text>

    {movement.hanja ? (
      <Text style={styles.heroHanja}>[{movement.hanja}]</Text>
    ) : null}

    {movement.meaning ? (
      <Text style={styles.heroShortDesc}>{movement.meaning}</Text>
    ) : null}
  </View>

  <View style={styles.heroImageArea}>
  <Image source={movementBg} style={styles.heroBgImage} resizeMode="contain" />

  <TouchableOpacity
    activeOpacity={0.9}
    onPress={() => movement.image && setImageModalVisible(true)}
    style={styles.heroPersonTouch}
  >
    <Image
      source={
        movement.image ||
        require("../../../assets/images/movement-placeholder-taiji.png")
      }
      style={[
        styles.heroMovementImage,
        !movement.image && styles.heroPlaceholderImage,
      ]}
      resizeMode="contain"
    />
  </TouchableOpacity>
</View>
</View>

<View style={styles.infoCard}>
  <Image source={cardBrush} style={styles.cardBrush} resizeMode="contain" />
  <SectionTitle title="글자별 풀이" />

  <View style={styles.hanjaHorizontalWrap}>
  {parseHanjaMeaning(movement.hanjaMeaning).map((item, index) => (
    <View key={`${item.char}-${index}`} style={styles.hanjaSquareCard}>
      <Image source={cardBrush} style={styles.hanjaBrush} resizeMode="contain" />
      <Text style={styles.hanjaSquareChar}>{item.char}</Text>
      <Text style={styles.hanjaSquareText}>
        {item.meaning} {item.sound}
      </Text>
    </View>
  ))}
</View>
</View>

<View style={styles.infoCard}>
  <SectionTitle title="투로명 뜻" />
  <Text style={styles.cardText}>{movement.meaning}</Text>
</View>

<View style={styles.infoCard}>
  <SectionTitle title="동작 설명" />
  <Text style={styles.cardText}>{movement.description}</Text>
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
  paddingTop: 20,
  paddingBottom: 110,
  width: "100%",
  maxWidth: 430,
  alignSelf: "center",
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
heroCard: {
  position: "relative",
  minHeight: 320,
  marginTop: 20,
  marginBottom: 10,
  overflow: "visible",
},

heroTextArea: {
  zIndex: 3,
  paddingHorizontal: 4,
  width: "64%",
},

heroName: {
  fontSize: 46,
  fontFamily: fonts.title,
  color: colors.textMain,
  letterSpacing: -1.8,
},

heroHanja: {
  marginTop: 12,
  fontSize: 22,
  fontFamily: fonts.hanja,
  color: colors.warmBrown,
},

heroShortDesc: {
  marginTop: 22,
  width: "100%",
  fontSize: 16,
  lineHeight: 27,
  fontFamily: fonts.medium,
  color: colors.textMain,
},

heroImageArea: {
  position: "absolute",
  left: -60,
  right: -60,
  bottom: 0,
  height: 420,
  alignItems: "center",
  justifyContent: "flex-end",
},

heroBgImage: {
  position: "absolute",
  width: "100%",
  height: "100%",
  opacity: 0.85,
  bottom: -30,
  left: "50%",
  transform: [{ translateX: -300 }],
},

heroPersonTouch: {
  position: "absolute",
  right: 88,
  bottom: 20,
  width: 170,
  height: 270,
  opacity: 0.9,
  alignItems: "center",
  justifyContent: "flex-end",
},

heroMovementImage: {
  width: "100%",
  height: "100%",
},
meaningCard: {
  marginTop: 14,
  paddingHorizontal: 20,
  paddingVertical: 22,
  borderRadius: 24,
  backgroundColor: colors.card,
  borderWidth: 0.4,
  borderColor: colors.border,
  shadowColor: "#BFA79B",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.05,
  shadowRadius: 12,
  elevation: 2,
},

feelCard: {
  marginTop: 14,
  paddingHorizontal: 20,
  paddingVertical: 22,
  borderRadius: 24,
  backgroundColor: colors.card,
  borderWidth: 0.4,
  borderColor: colors.border,
  shadowColor: "#BFA79B",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.05,
  shadowRadius: 12,
  elevation: 2,
},

cardTitle: {
  fontSize: 22,
  fontFamily: fonts.title,
  color: colors.textMain,
  marginBottom: 14,
},

infoCard: {
  marginTop: 10,
  paddingHorizontal: 20,
  paddingVertical: 24,
  borderRadius: 26,
  backgroundColor: "rgba(255, 253, 249, 0.96)",
  borderWidth: 1,
  borderColor: "#E2C9A6",
  overflow: "hidden",
},

sectionTitleRow: {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 18,
},

sectionTitle: {
  fontSize: 28,
  fontFamily: fonts.title,
  color: colors.textMain,
  letterSpacing: -0.5,
},

cardText: {
  fontSize: 17,
  lineHeight: 32,
  fontFamily: fonts.medium,
  color: colors.textMain,
},


heroPlaceholderImage: {
  opacity: 0.35,
},

hanjaExplainRow: {
  flexDirection: "row",
  alignItems: "center",
  gap: 16,
},

hanjaCircle: {
  width: 78,
  height: 78,
  borderRadius: 39,
  borderWidth: 1,
  borderColor: "#dcc39d",
  backgroundColor: "#FFF8EF",
  alignItems: "center",
  justifyContent: "center",
},

hanjaCircleText: {
  fontSize: 26,
  fontWeight: "900",
  color: colors.textMain,
},

hanjaExplainTextWrap: {
  flex: 1,
},

hanjaExplainTitle: {
  fontSize: 18,
  fontWeight: "900",
  color: colors.textMain,
  marginBottom: 6,
},

sectionIcon: {
  width: 34,
  height: 34,
  marginRight: 10,
},

hanjaHorizontalWrap: {
  flexDirection: "row",
  justifyContent: "space-between",
  gap: 10,
},

hanjaSquareCard: {
  flex: 1,
  minHeight: 124,
  borderRadius: 17,
  borderWidth: 1,
  borderColor: "#E2C9A6",
  backgroundColor: "rgba(255,255,255,0.76)",
  alignItems: "center",
  justifyContent: "center",
  paddingVertical: 14,
  paddingHorizontal: 6,
  overflow: "hidden",
},
hanjaBrush: {
  position: "absolute",
  top: 12,
  width: 72,
  height: 72,
  opacity: 0.42,
},
hanjaSquareChar: {
  fontSize: 42,
  fontFamily: fonts.hanja,
  color: colors.textMain,
  marginBottom: 8,
  zIndex: 2,
},

hanjaSquareText: {
  fontSize: 14,
  lineHeight: 20,
  fontFamily: fonts.semiBold,
  color: colors.textMain,
  textAlign: "center",
  zIndex: 2,
},
cardBrush: {
  position: "absolute",
  right: -34,
  bottom: -34,
  width: 150,
  height: 150,
  opacity: 0.7,
},
});