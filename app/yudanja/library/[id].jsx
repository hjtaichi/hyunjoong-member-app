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
import { useLocalSearchParams } from "expo-router";
import ScreenHeader from "../../../src/components/ScreenHeader";
import { useAuth } from "../../../src/contexts/AuthContext";
import { getYudanjaLibraryDetail } from "../../../src/api/yudanjaContent";
import { colors } from "../../../src/theme";
const cloud = require("../../../assets/images/yudanja/library-cloud.png");
const fonts = {
  title: "MaruBuriBold",
  semi: "PretendardSemiBold",
  medium: "PretendardMedium",
};

const CATEGORIES = {
  chusu: "추수",
  turo: "투로",
  fajin: "발경",
  yonghyeong: "용형편간",
  theory: "이론",
  etc: "기타",
};

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("ko-KR");
}

function getWatermarkText(memberName) {
  return memberName || "회원";
}

export default function YudanjaLibraryDetailScreen() {
  const { token, user } = useAuth();
  const { id } = useLocalSearchParams();

  const safeId = Array.isArray(id) ? id[0] : id;

  const [item, setItem] = useState(null);
  const [watermark, setWatermark] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const lines = useMemo(() => {
    return String(item?.content || "")
      .split("\n")
      .map((line) => line.trimEnd());
  }, [item]);
  
const contentBlocks = useMemo(() => {
  const text = String(item?.content || "");
  const normalized = text.replace(/\r\n/g, "\n");
  const blocks = [];

  for (let i = 0; i < normalized.length; i += 260) {
    blocks.push(normalized.slice(i, i + 260));
  }

  return blocks;
}, [item?.content]);

  const watermarkText = useMemo(() => {
    return getWatermarkText(watermark?.memberName || user?.name);
  }, [watermark, user]);

  const loadData = useCallback(
    async ({ silent = false } = {}) => {
      if (!token || !safeId) return;

      try {
        if (!silent) setLoading(true);
        setError("");

        const result = await getYudanjaLibraryDetail(token, safeId);

        if (result?.data) {
          setItem(result.data);
          setWatermark(result.watermark || null);
        } else {
          setItem(result || null);
          setWatermark(null);
        }
      } catch (err) {
        setError(err?.message || "자료를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token, safeId],
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
        <Text style={styles.loadingText}>자료를 불러오는 중입니다.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="자료 상세" />

      <ScrollView
        showsVerticalScrollIndicator={true}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {error ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>불러오기 실패</Text>
            <Text style={styles.emptyText}>{error}</Text>
          </View>
        ) : !item ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>자료가 없습니다.</Text>
            <Text style={styles.emptyText}>
              삭제되었거나 공개되지 않은 자료입니다.
            </Text>
          </View>
        ) : (
          <View style={styles.paperCard}>
            

            <View style={styles.topRow}>
              <Text style={styles.categoryPill}>
                {CATEGORIES[item.libraryCategory] || "기타"}
              </Text>

              <Text style={styles.dateText}>
                수정일 {formatDate(item.updatedAt)}
              </Text>
            </View>

            <Text style={styles.title}>{item.title}</Text>

            {item.summary ? (
              <Text style={styles.summary}>{item.summary}</Text>
            ) : null}
                        <View style={styles.divider} />

            <View style={styles.noticeBox}>
              <Text style={styles.noticeText}>
                이 자료는 유단자회 내부 열람용입니다. {"\n"}자료실 상세 화면에서만
                워터마크가 표시됩니다.
              </Text>
            </View>



  <View style={styles.body}>
  {contentBlocks.map((block, blockIndex) => (
    <View key={`block-${blockIndex}`} style={styles.watermarkBlock}>
      <Text style={[styles.blockWatermark, { left: 10, top: 22 }]}>
        {watermarkText}
      </Text>
      <Text style={[styles.blockWatermark, { left: 120, top: 76 }]}>
        {watermarkText}
      </Text>
      <Text style={[styles.blockWatermark, { right: 20, top: 130 }]}>
        {watermarkText}
      </Text>

      <Text style={styles.paragraph}>{block}</Text>
    </View>
  ))}
</View>

<Image source={cloud} style={styles.detailCloud} />
            
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
  watermarkBlock: {
  position: "relative",
  overflow: "hidden",
  paddingVertical: 8,
},

blockWatermark: {
  position: "absolute",
  fontFamily: fonts.semi,
  fontSize: 22,
  color: "rgba(111, 98, 90, 0.14)",
  transform: [{ rotate: "-24deg" }],
  zIndex: 0,
},

paragraph: {
  position: "relative",
  zIndex: 2,
  fontFamily: fonts.medium,
  fontSize: 18,
  lineHeight: 27,
  color: "#4D403A",
},
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  categoryPill: {
    overflow: "hidden",
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 5,
    backgroundColor: "#F7EFE4",
    fontFamily: fonts.semi,
    fontSize: 12,
    color: "#8A6238",
  },
  dateText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: "#A79A90",
  },
  title: {
    marginTop: 14,
    fontFamily: fonts.title,
    fontSize: 24,
    lineHeight: 34,
    color: colors.textMain || "#3A2C27",
  },
  summary: {
    marginTop: 10,
    fontFamily: fonts.medium,
    fontSize: 16,
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

  blankLine: {
    height: 12,
  },
  noticeBox: {
    marginTop: 2,
    marginBottom: 18,
    borderRadius: 18,
    padding: 14,
    backgroundColor: "#FFFCFA",
    borderWidth: 1,
    borderColor: "#EEE3D8",
  },
  noticeText: {
    fontFamily: fonts.medium,
    fontSize: 15,
    lineHeight: 21,
    color: "#8A7A68",
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
  paperCard: {
  position: "relative",
  overflow: "hidden",
  borderRadius: 24,
  padding: 24,
  backgroundColor: "#FFFFFF",
  borderWidth: 1,
  borderColor: "#EEE3D8",
  shadowColor: "#3A2C27",
  shadowOpacity: 0.08,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 8 },
  elevation: 3,
},
detailCloud: {
  position: "absolute",
  right: 12,
  bottom: 8,
  width: 130,
  height: 54,
  opacity: 0.28,
},
});