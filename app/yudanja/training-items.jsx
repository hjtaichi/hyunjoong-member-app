import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import ScreenHeader from "../../src/components/ScreenHeader";
import { useAuth } from "../../src/contexts/AuthContext";
import { colors } from "../../src/theme";
import { getYudanjaContent } from "../../src/api/yudanjaContent";

const fonts = {
  regular: "PretendardRegular",
  medium: "PretendardMedium",
  semi: "PretendardSemiBold",
  semiBold: "PretendardSemiBold",
  bold: "PretendardBold",
  title: "MaruBuriBold",
  titleSemi: "MaruBuriSemiBold",
  hanja: "ZhaoKai",
};

function parseTrainingLine(text = "") {
  const raw = String(text || "").trim();
  const match = raw.match(/^(\d+(?:\.\d+)*\.?)\s*(.*)$/);

  if (!match) {
    return {
      number: "",
      title: raw,
      level: 0,
    };
  }

  const number = match[1].replace(/\.$/, "");
  const title = match[2] || "";
  const level = number.split(".").length;

  return {
    number,
    title,
    level,
  };
}

function splitHanjaText(text = "") {
  const match = String(text).match(/^(.*?)(\s*\([^()]+\))$/);

  if (!match) {
    return {
      korean: text,
      hanja: "",
    };
  }

  return {
    korean: match[1].trim(),
    hanja: match[2].trim(),
  };
}

function getStructuredText(category) {
  const categoryDescription = String(category?.description || "").trim();

  if (categoryDescription) {
    return categoryDescription;
  }

  const itemDescriptions = (category?.items || [])
    .map((item) => String(item?.description || "").trim())
    .filter(Boolean);

  if (itemDescriptions.length > 0) {
    return itemDescriptions.join("\n");
  }

  return "";
}

function hasStructuredDescription(category) {
  return Boolean(getStructuredText(category));
}

function getCategoryIconImage(categoryName = "") {
  if (categoryName.includes("추수")) {
    return require("../../assets/images/yudanja/icon-chusu.png");
  }

  if (categoryName.includes("투로")) {
    return require("../../assets/images/yudanja/icon-sword.png");
  }

  if (categoryName.includes("발경")) {
    return require("../../assets/images/yudanja/icon-taiji.png");
  }

  if (categoryName.includes("용형") || categoryName.includes("편간")) {
    return require("../../assets/images/yudanja/icon-dragon.png");
  }

  return require("../../assets/images/yudanja/icon-training.png");
}

function getCategoryDecoration(categoryName = "") {
  if (categoryName.includes("추수")) {
    return require("../../assets/images/yudanja/deco-bamboo.png");
  }

  if (categoryName.includes("투로")) {
    return require("../../assets/images/yudanja/deco-cloud.png");
  }

  if (categoryName.includes("발경")) {
    return require("../../assets/images/yudanja/deco-mountain.png");
  }

  if (categoryName.includes("용형") || categoryName.includes("편간")) {
    return require("../../assets/images/yudanja/deco-pavilion.png");
  }

  return require("../../assets/images/yudanja/card-mountain.png");
}

function formatDescriptionLines(text = "") {
  return String(text || "")
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}
function parseCurriculumSections(text = "") {
  const lines = String(text || "")
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const sections = [];
  let current = null;

  lines.forEach((line) => {
    if (line.startsWith("-")) {
      if (current) sections.push(current);

      current = {
        id: line,
        name: line.replace(/^-/, "").replace(/:$/, "").trim(),
        lines: [],
      };

      return;
    }

    if (!current) {
      current = {
        id: "default",
        name: "수련항목",
        lines: [],
      };
    }

    current.lines.push(line);
  });

  if (current) sections.push(current);

  return sections;
}
function StructuredLine({ line, prevLine }) {
  const parsed = parseTrainingLine(line);
  const prevParsed = parseTrainingLine(prevLine || "");

  const isRepeatedMajor =
    parsed.level === 1 &&
    prevParsed.level === 1 &&
    parsed.number === prevParsed.number;

  const isLevel1 = parsed.level === 1;
  const isLevel2 = parsed.level === 2;
  const isLevel3Plus = parsed.level >= 3;
  const textParts = splitHanjaText(parsed.title || line);

  return (
    <View
      style={[
        styles.trainingLine,
        isLevel2 && styles.trainingLineLevel2,
        isLevel3Plus && styles.trainingLineLevel3,
      ]}
    >
      {(isLevel2 || isLevel3Plus) ? (
  <View
    style={[
      styles.treeLine,
      isLevel3Plus && styles.treeLineLevel3,
    ]}
  />
) : null}

{isLevel3Plus ? <View style={styles.treeDot} /> : null}
      {parsed.number && !isRepeatedMajor ? (
  <View
    style={[
      styles.numberBadge,
      isLevel2 && styles.numberBadgeLevel2,
      isLevel3Plus && styles.numberBadgeLevel3,
    ]}
  >
    <Text
      style={[
        styles.numberText,
        (isLevel2 || isLevel3Plus) && styles.numberTextSmall,
      ]}
    >
      {parsed.number}
    </Text>
  </View>
) : isRepeatedMajor ? (
  <View style={styles.repeatedNumberSpace} />
) : (
  <View style={styles.bulletDot} />
)}

      <Text
  style={[
    styles.trainingLineText,
    isLevel1 && styles.trainingLineTextLevel1,
    isLevel2 && styles.trainingLineTextLevel2,
    isLevel3Plus && styles.trainingLineTextLevel3,
    !textParts.korean && textParts.hanja && styles.hanjaText,
  ]}
>
  {textParts.korean ? <Text>{textParts.korean}</Text> : null}
  {textParts.hanja ? (
    <Text style={styles.hanjaText}>
      {textParts.korean ? " " : ""}
      {textParts.hanja}
    </Text>
  ) : null}
</Text>
    </View>
  );
}

function CategoryCard({ category }) {
  return (
    <View style={styles.categoryCard}>
      <Image
        source={getCategoryDecoration(category.name)}
        style={styles.categoryDecoration}
        resizeMode="contain"
      />

      <View style={styles.categoryHeader}>
        <View style={styles.categoryIconCircle}>
  <Image
    source={getCategoryIconImage(category.name)}
    style={styles.categoryIconImage}
    resizeMode="contain"
  />
</View>

        <Text style={styles.categoryTitle}>{category.name}</Text>
      </View>

      <View style={styles.itemList}>
  
  {(category.lines || []).map((line, index) => (
  <StructuredLine
    key={`${category.id}-${index}-${line}`}
    line={line}
    prevLine={(category.lines || [])[index - 1]}
  />
))}
</View>
    </View>
  );
}

export default function YudanjaTrainingItemsScreen() {
  const { token } = useAuth();

  const [contentData, setContentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadData = useCallback(
    
    async ({ silent = false } = {}) => {
      
      if (!token) return;

      try {
        if (!silent) setLoading(true);
        setError("");

        const result = await getYudanjaContent(token, "curriculum");
setContentData(result || null);

      } catch (err) {
        setError(err?.message || "수련항목을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token],
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  const sections = useMemo(() => {
  return parseCurriculumSections(contentData?.content || "");
}, [contentData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData({ silent: true });
  }, [loadData]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={styles.loadingText}>수련항목을 불러오는 중입니다.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="수련항목" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.heroWrap}>
  <View style={styles.heroCardBg}>
    <Image
      source={require("../../assets/images/yudanja/card-mountain.png")}
      style={styles.heroInkMountain}
      resizeMode="contain"
    />

    <View style={styles.heroSpeechBox}>
      <Text style={styles.heroQuoteMark}>“</Text>

      <Text style={styles.heroSpeechText}>
        유단자회에서는{"\n"}
        추수, 투로 교정, 발경,{"\n"}
        용형편간을 함께 수련해요.
      </Text>
    </View>
  </View>

  <Image
    source={require("../../assets/images/yudanja/yudanja-guide-karina.png")}
    style={styles.heroGuideImage}
    resizeMode="contain"
    pointerEvents="none"
  />
</View>
        {error ? (
  <View style={styles.emptyCard}>
    <Text style={styles.emptyTitle}>불러오기 실패</Text>
    <Text style={styles.emptyText}>{error}</Text>
  </View>
) : sections.length === 0 ? (
  <View style={styles.emptyCard}>
    <Text style={styles.emptyTitle}>등록된 내용이 없습니다.</Text>
    <Text style={styles.emptyText}>
      관리자웹 콘텐츠관리의 커리큘럼을 등록하면 이곳에 표시됩니다.
    </Text>
  </View>
) : (
  <View style={styles.categoryList}>
    {sections.map((section) => (
      <CategoryCard key={section.id} category={section} />
    ))}
  </View>
)}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background || "#FFFCFA",
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  content: {
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    backgroundColor: colors.background || "#FFFCFA",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 10,
    fontFamily: fonts.medium,
    color: "#7A6C63",
  },

  heroWrap: {
  position: "relative",
  minHeight: 236,
  marginTop: -15,
  marginBottom: 18,
  overflow: "visible",
},

heroCardBg: {
  position: "absolute",
  left: 0,
  right: 0,
  bottom: 0,
  height: 198,
  borderRadius: 22,
  backgroundColor: "#FFFDF8",
  borderWidth: 1,
  borderColor: "rgba(232, 216, 196, 0.85)",
  overflow: "hidden",
  shadowColor: "#7A5B3D",
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.1,
  shadowRadius: 16,
  elevation: 3,
},

heroInkMountain: {
  position: "absolute",
  left: -22,
  bottom: -8,
  width: 245,
  height: 125,
  opacity: 0.28,
  zIndex: 1,
},

heroSpeechBox: {
  position: "absolute",
  left: 14,
  top: 30,
  width: "56%",
  minHeight: 88,
  borderRadius: 18,
  borderWidth: 1,
  borderColor: "rgba(184, 148, 93, 0.45)",
  backgroundColor: "rgba(255, 253, 248, 0.8)",
  paddingHorizontal: 6,
  paddingVertical: 10,
  justifyContent: "center",
  zIndex: 3,
},
heroQuoteMark: {
  position: "absolute",
  left: 4,
  top: -2,
  fontFamily: fonts.title,
  fontSize: 36,
  lineHeight: 30,
  color: "#B8945D",
  opacity: 0.85,
},

heroSpeechText: {
  marginTop: 3,
  marginLeft: 15,
  fontFamily: fonts.titleSemi,
  fontSize: 14,
  lineHeight: 23,
  color: "#3A2C27",
  letterSpacing: -0.25,
},

heroGuideImage: {
  position: "absolute",
  right: -10,
  bottom: -37,
  width: 320,
  height: 260,
  opacity: 0.98,
  zIndex: 10,
  elevation: 10,
},
  heroTextArea: {
    width: "66%",
    zIndex: 2,
  },
  heroLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    letterSpacing: 1.2,
    color: "#A47C4F",
  },
  heroTitle: {
    marginTop: 0,
    fontFamily: fonts.title,
    fontSize: 26,
    lineHeight: 40,
    color: "#2F241F",
  },
  heroDesc: {
    marginTop: 10,
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 22,
    color: "#5F5148",
  },
  heroMountain: {
    position: "absolute",
    right: -2,
    bottom: -10,
    width: 180,
    height: 125,
    opacity: 0.42,
  },

  categoryList: {
    gap: 14,
  },
  categoryCard: {
    borderRadius: 22,
    padding: 18,
    backgroundColor: "#FFFDF8",
    overflow: "hidden",
    shadowColor: "#7A5B3D",
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 3,
  },
  categoryDecoration: {
    position: "absolute",
    right: -18,
    top: -3,
    width: 150,
    height: 80,
    opacity: 0.8,
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E8D8C4",
  },
  categoryIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#B8945D",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  categoryIconText: {
    fontFamily: fonts.hanja,
    fontSize: 24,
    color: "#FFFFFF",
  },
  categoryTitle: {
    flex: 1,
    fontFamily: fonts.title,
    fontSize: 26,
    lineHeight: 34,
    color: "#2F241F",
  },

  itemList: {
  marginTop: 12,
  position: "relative",
},

  trainingLine: {
    position: "relative",
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(216,190,157,0.32)",
  },
 trainingLineLevel2: {
  paddingLeft: 30,
},

trainingLineLevel3: {
  paddingLeft: 65,
},
  numberBadge: {
    minWidth: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#B8945D",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    paddingHorizontal: 7,
  },
  numberBadgeLevel2: {
    minWidth: 42,
    height: 25,
    borderRadius: 13,
    backgroundColor: "#E8D8C4",
  },
  numberBadgeLevel3: {
    minWidth: 52,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#F3E9DA",
  },
  numberText: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: "#FFFFFF",
  },
  numberTextSmall: {
    color: "#8A6238",
    fontSize: 13,
  },
  bulletDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#C8A26A",
    marginTop: 9,
    marginRight: 12,
  },
  trainingLineText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 15,
    lineHeight: 24,
    color: "#3A2C27",
  },
  trainingLineTextLevel1: {
    flex: 1,
    fontFamily: fonts.titleSemi,
    fontSize: 20,
    lineHeight: 25,
    color: "#2F241F",
  },
  trainingLineTextLevel2: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 18,
    lineHeight: 24,
    color: "#3A2C27",
  },
  trainingLineTextLevel3: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 16,
    lineHeight: 23,
    color: "#6F625A",
  },
  itemTextWrap: {
    flex: 1,
  },
  itemDesc: {
    marginTop: 3,
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 20,
    color: "#7A6C63",
  },

  emptyCard: {
    borderRadius: 24,
    padding: 24,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EEE3D8",
    alignItems: "center",
  },
  emptyTitle: {
    fontFamily: fonts.semi,
    fontSize: 17,
    color: colors.textMain || "#3A2C27",
  },
  emptyText: {
    marginTop: 8,
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 22,
    color: "#7A6C63",
    textAlign: "center",
  },
  categoryIconCircle: {
  width: 42,
  height: 42,
  borderRadius: 27,
  backgroundColor: "#B8945D",
  alignItems: "center",
  justifyContent: "center",
  marginRight: 14,
  shadowColor: "#7A5B3D",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.18,
  shadowRadius: 8,
  elevation: 3,
},

categoryIconImage: {
  width: 34,
  height: 34,
},
hanjaText: {
  fontFamily: fonts.hanja,
  color: "#6F625A",
},
repeatedNumberSpace: {
  width: 0,
  marginRight: 35,
},
});