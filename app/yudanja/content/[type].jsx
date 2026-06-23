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
      <ScreenHeader title="유단자회 소개" />

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
  const hasSchedule = firstTitleIndex >= 0;

  const scheduleLines = hasSchedule
    ? lines.slice(firstTitleIndex + 1).filter((line) => line.trim())
    : [];

  const bodyLines = hasSchedule
    ? lines.slice(0, firstTitleIndex)
    : lines;

  return (
    <View style={styles.introCard}>
      <Image
        source={
          isIntro
            ? require("../../../assets/images/yudanja/yudanja-intro-scene.png")
            : require("../../../assets/images/yudanja/yudanja-pavilion.png")
        }
        style={isIntro ? styles.cardTopImage : styles.cardTopImageSmall}
        resizeMode={isIntro ? "cover" : "contain"}
      />

      <Text style={styles.cardTitle}>
        {content.title || (isIntro ? "유단자회 소개" : "유단자회 회칙")}
      </Text>

      {content.summary ? (
        <Text style={styles.introSummary}>{content.summary}</Text>
      ) : null}

      {bodyLines.some((line) => line.trim()) ? (
        <View style={styles.extraBody}>
          {bodyLines.map((line, index) =>
            line.trim() ? (
              <Text key={`${index}-${line}`} style={styles.paragraph}>
                {line}
              </Text>
            ) : (
              <View key={`space-${index}`} style={styles.blankLine} />
            ),
          )}
        </View>
      ) : null}

      {hasSchedule ? (
        <View style={styles.scheduleCard}>
          <View style={styles.scheduleTextWrap}>
            <Text style={styles.scheduleTitle}>수련일</Text>

            {scheduleLines.map((line, index) => (
              <Text key={`${index}-${line}`} style={styles.scheduleText}>
                {line}
              </Text>
            ))}
          </View>

          <Image
            source={require("../../../assets/images/yudanja/yudanja-pavilion.png")}
            style={styles.pavilionImage}
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
    gap: 8,
    marginBottom: 14,
    padding: 5,
    borderRadius: 999,
    backgroundColor: "#F7EFE4",
    borderWidth: 1,
    borderColor: "#E8D8C4",
  },
  tabButton: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: "center",
  },
  tabButtonActive: {
    backgroundColor: "#3A2C27",
  },
  tabText: {
    fontFamily: fonts.semi,
    fontSize: 14,
    color: "#7A6C63",
  },
  tabTextActive: {
    color: "#FFFFFF",
  },

  introCard: {
  backgroundColor: "transparent",
  borderWidth: 0,
  padding: 0,
},
  cardTopImage: {
  width: "100%",
  height: 155,
  marginBottom: 18,
  borderRadius: 0,
  opacity: 0.96,
},

cardTopImageSmall: {
  alignSelf: "center",
  width: "100%",
  height: 110,
  marginBottom: 16,
  opacity: 0.9,
},
  
  cardTitle: {
  paddingHorizontal: 4,
  fontFamily: fonts.title,
  fontSize: 22,
  color: colors.textMain || "#3A2C27",
  lineHeight: 30,
},

introSummary: {
  paddingHorizontal: 4,
  marginTop: 8,
  fontFamily: fonts.medium,
  fontSize: 14,
  lineHeight: 22,
  color: "#4D403A",
},

extraBody: {
  marginTop: 18,
  paddingHorizontal: 4,
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
  marginTop: 22,
  borderRadius: 22,
  paddingLeft: 16,
  paddingVertical: 16,
  paddingRight: 6,
  backgroundColor: "#FFFCFA",
  borderWidth: 1,
  borderColor: "#EEE3D8",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  overflow: "hidden",
},

scheduleTextWrap: {
  flex: 1,
  zIndex: 2,
},

scheduleTitle: {
  fontFamily: fonts.semi,
  fontSize: 15,
  color: "#3A2C27",
  marginBottom: 8,
},

scheduleText: {
  fontFamily: fonts.medium,
  fontSize: 14,
  lineHeight: 22,
  color: "#4D403A",
},

pavilionImage: {
  width: 118,
  height: 82,
  opacity: 0.86,
  marginRight: -8,
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
  paragraph: {
    fontFamily: fonts.medium,
    fontSize: 15,
    lineHeight: 26,
    color: "#4D403A",
  },
  blankLine: {
    height: 12,
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

pavilionImage: {
  width: 96,
  height: 72,
  opacity: 0.85,
},
});