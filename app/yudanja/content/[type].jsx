import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import ScreenHeader from "../../../src/components/ScreenHeader";
import { useAuth } from "../../../src/contexts/AuthContext";
import { getYudanjaContent } from "../../../src/api/yudanjaContent";
import { colors } from "../../../src/theme";

const fonts = {
  title: "MaruBuriBold",
  semi: "PretendardSemiBold",
  medium: "PretendardMedium",
};

const TABS = [
  { key: "intro", label: "소개" },
  { key: "rules", label: "회칙" },
];

export default function YudanjaContentScreen() {
  const { token } = useAuth();

  const [activeType, setActiveType] = useState("intro");
  const [contentMap, setContentMap] = useState({
    intro: null,
    rules: null,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const content = contentMap[activeType];

  const lines = useMemo(() => {
    return String(content?.content || "")
      .split("\n")
      .map((line) => line.trimEnd());
  }, [content]);

  const loadData = useCallback(
    async ({ silent = false } = {}) => {
      if (!token) return;

      try {
        if (!silent) setLoading(true);
        setError("");

        const [intro, rules] = await Promise.all([
          getYudanjaContent(token, "intro"),
          getYudanjaContent(token, "rules"),
        ]);

        setContentMap({
          intro: intro || null,
          rules: rules || null,
        });
      } catch (err) {
        setError(err?.message || "콘텐츠를 불러오지 못했습니다.");
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

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData({ silent: true });
  }, [loadData]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={styles.loadingText}>내용을 불러오는 중입니다.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="유단자회 안내" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.tabWrap}>
          {TABS.map((tab) => {
            const active = activeType === tab.key;

            return (
              <Pressable
                key={tab.key}
                style={[styles.tabButton, active && styles.tabButtonActive]}
                onPress={() => setActiveType(tab.key)}
              >
                <Text style={[styles.tabText, active && styles.tabTextActive]}>
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {error ? (
          <EmptyCard title="불러오기 실패" text={error} />
        ) : !content ? (
          <EmptyCard
            title="아직 등록된 내용이 없습니다."
            text="관리자가 내용을 등록하면 이곳에 표시됩니다."
          />
        ) : (
  <ContentCard content={content} lines={lines} type={activeType} />
)}
      </ScrollView>
    </View>
  );
}

function ContentCard({ content, lines, type }) {
  const isIntro = type === "intro";

  const firstTitleIndex = lines.findIndex((line) => line.trim() === "수련일");
  const hasSchedule = isIntro && firstTitleIndex >= 0;

  const scheduleLines = hasSchedule
    ? lines.slice(firstTitleIndex + 1).filter((line) => line.trim())
    : [];

  const bodyLines = hasSchedule ? lines.slice(0, firstTitleIndex) : lines;

  return (
    <View style={styles.pageBody}>
      <Image
        source={
          isIntro
            ? require("../../../assets/images/yudanja/intro-scene-wide.png")
            : require("../../../assets/images/yudanja/rules-scroll.png")
        }
        style={isIntro ? styles.introTopImage : styles.rulesTopImage}
        resizeMode="cover"
      />

      <Text style={isIntro ? styles.introTitle : styles.rulesTitle}>
        {content.title || (isIntro ? "유단자회란?" : "현중태극문 유단자회 회칙")}
      </Text>

      {content.summary ? (
        <Text style={styles.mainSummary}>{content.summary}</Text>
      ) : null}

      {bodyLines.some((line) => line.trim()) ? (
        <View style={styles.mainBody}>
          {bodyLines.map((line, index) => {
  const trimmed = line.trim();
 const isSignature =
  trimmed === "현중태극문" || trimmed === "유단자회";

const isFirstSignature = trimmed === "현중태극문";

  return trimmed ? (
    <Text
      key={`${index}-${line}`}
      style={[
  styles.paragraph,
  isSignature && styles.signatureText,
  isFirstSignature && styles.signatureFirstText,
]}
    >
      {line}
    </Text>
  ) : (
    <View key={`space-${index}`} style={styles.blankLine} />
  );
})}
        </View>
      ) : null}

      {hasSchedule ? (
        <View style={styles.scheduleCard}>
          <Text style={styles.scheduleTitle}>수련일</Text>

          <View style={styles.scheduleDivider}>
            <View style={styles.scheduleLine} />
            <Text style={styles.scheduleDiamond}>◇</Text>
            <View style={styles.scheduleLine} />
          </View>

          {scheduleLines.map((line, index) => (
            <Text
              key={`${index}-${line}`}
              style={index === scheduleLines.length - 1 ? styles.scheduleTime : styles.scheduleText}
            >
              {line}
            </Text>
          ))}

          <Image
            source={require("../../../assets/images/yudanja/yudanja-pavilion.png")}
            style={styles.scheduleDecoration}
            resizeMode="contain"
          />
        </View>
      ) : null}
    </View>
  );
}

function EmptyCard({ title, text }) {
  return (
    <View style={styles.emptyCard}>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyText}>{text}</Text>
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
  tabWrap: {
  flexDirection: "row",
  marginHorizontal: -20,
  marginBottom: 22,
  borderBottomWidth: 1,
  borderBottomColor: "#E5D8C8",
},
  tabButton: {
  flex: 1,
  height: 58,
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
},
  tabButtonActive: {
  borderBottomWidth: 3,
  borderBottomColor: "#8A6238",
},
  tabText: {
  fontFamily: fonts.titleSemi || fonts.title,
  fontSize: 18,
  color: "#5F5148",
},

tabTextActive: {
  color: "#2F241F",
},

  pointList: {
    marginTop: 18,
    gap: 14,
  },
  infoPoint: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F7EFE4",
    borderWidth: 1,
    borderColor: "#E8D8C4",
    alignItems: "center",
    justifyContent: "center",
  },
  infoIconText: {
    fontFamily: fonts.title,
    fontSize: 17,
    color: "#8A6238",
  },
  infoTextWrap: {
    flex: 1,
  },
  infoTitle: {
    fontFamily: fonts.semi,
    fontSize: 15,
    color: "#3A2C27",
  },
  infoText: {
    marginTop: 2,
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 19,
    color: "#6F625A",
  },
scheduleCard: {
  marginTop: 34,
  borderRadius: 20,
  paddingHorizontal: 16,
  paddingTop: 10,
  paddingBottom: 20,
  backgroundColor: "rgba(255,253,248,0.76)",
  borderWidth: 1,
  borderColor: "#D8BE9D",
  alignItems: "center",
  overflow: "hidden",
},

scheduleTitle: {
  fontFamily: fonts.title,
  fontSize: 26,
  color: "#9A6F37",
  marginBottom: 18,
},

scheduleDivider: {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 10,
},

scheduleLine: {
  width: 86,
  height: 1,
  borderStyle: "dashed",
  borderWidth: 0.5,
  borderColor: "#C9AA7A",
},

scheduleDiamond: {
  marginHorizontal: 8,
  fontSize: 13,
  color: "#C19B62",
},

scheduleText: {
  fontFamily: fonts.medium,
  fontSize: 20,
  lineHeight: 20,
  color: "#4D403A",
  textAlign: "center",
},

scheduleTime: {
  marginTop: 8,
  fontFamily: fonts.title,
  fontSize: 22,
  lineHeight: 22,
  color: "#2F241F",
  textAlign: "center",
},

scheduleDecoration: {
  position: "absolute",
  right: -7,
  bottom: -1,
  width: 106,
  height: 80,
  opacity: 0.22,
},

scheduleTextWrap: {
  flex: 1,
  zIndex: 2,
},

scheduleTitle: {
  fontFamily: fonts.semi,
  fontSize: 18,
  color: "#3A2C27",
  marginBottom: 6,
  marginTop: 12,
},

scheduleText: {
  fontFamily: fonts.medium,
  fontSize: 17,
  lineHeight: 22,
  color: "#4D403A",
},

pavilionImage: {
  position: "absolute",
  right: -10,
  bottom: -8,
  width: 96,
  height: 72,
  opacity: 0.22,
},

  paperCard: {
    borderRadius: 28,
    padding: 22,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EEE3D8",
  },
  label: {
    fontFamily: fonts.semi,
    fontSize: 11,
    letterSpacing: 1,
    color: "#A47C4F",
  },
  title: {
    marginTop: 8,
    fontFamily: fonts.title,
    fontSize: 25,
    lineHeight: 34,
    color: colors.textMain || "#3A2C27",
  },
  summary: {
    marginTop: 10,
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 22,
    color: "#6F625A",
  },
  divider: {
    height: 1,
    backgroundColor: "#EEE3D8",
    marginVertical: 18,
  },
  body: {
    gap: 0,
  },
pageBody: {
  paddingTop: 4,
},

introTopImage: {
  width: "100%",
  height: 230,
  marginTop: 4,
  marginBottom: 24,
  transform: [{ scaleX: 1.14 }, { scaleY: 1.08 }],
},

rulesTopImage: {
  alignSelf: "center",
  width: "58%",
  height: 200,
  marginTop: 4,
  marginBottom: 28,
},

introTitle: {
  fontFamily: fonts.title,
  fontSize: 28,
  lineHeight: 42,
  color: "#2F241F",
  marginBottom: 12,
},

rulesTitle: {
  fontFamily: fonts.title,
  fontSize: 28,
  lineHeight: 42,
  color: "#2F241F",
  textAlign: "center",
  marginBottom: 20,
},

mainSummary: {
  fontFamily: fonts.medium,
  fontSize: 17,
  lineHeight: 28,
  color: "#4D403A",
  marginBottom: 10,
},

mainBody: {
  gap: 0,
},

paragraph: {
  fontFamily: fonts.medium,
  fontSize: 18,
  lineHeight: 34,
  color: "#4D403A",
},

blankLine: {
  height: 20,
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
signatureText: {
  textAlign: "center",
  fontFamily: fonts.title,
  fontSize: 22,
  lineHeight: 28,
  marginTop: 5,
},

signatureFirstText: {
  marginTop: 24,
},
});