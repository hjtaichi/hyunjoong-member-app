import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import ScreenHeader from "../../../src/components/ScreenHeader";
import { useAuth } from "../../../src/contexts/AuthContext";
import { getYudanjaLibrary } from "../../../src/api/yudanjaContent";
import { colors } from "../../../src/theme";
const heroBg = require("../../../assets/images/yudanja/library-hero-bg.png");
const cardMountain = require("../../../assets/images/yudanja/library-bamboo.png");
const bamboo = require("../../../assets/images/yudanja/library-bamboo.png");
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
const CATEGORIES = [
  { key: "all", label: "전체" },
  { key: "chusu", label: "추수" },
  { key: "turo", label: "투로" },
  { key: "fajin", label: "발경" },
  { key: "yonghyeong", label: "용형편간" },
  { key: "theory", label: "이론" },
  { key: "etc", label: "기타" },
];

function getCategoryLabel(value) {
  return CATEGORIES.find((item) => item.key === value)?.label || "기타";
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("ko-KR");
}

export default function YudanjaLibraryScreen() {
  const { token } = useAuth();

  const [items, setItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const PAGE_SIZE = 5;
const [page, setPage] = useState(1);

  const filteredItems = useMemo(() => {
    if (selectedCategory === "all") return items;
    return items.filter((item) => item.libraryCategory === selectedCategory);
  }, [items, selectedCategory]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));

const pagedItems = useMemo(() => {
  const start = (page - 1) * PAGE_SIZE;
  return filteredItems.slice(start, start + PAGE_SIZE);
}, [filteredItems, page]);

  const loadData = useCallback(
    async ({ silent = false } = {}) => {
      if (!token) return;

      try {
        if (!silent) setLoading(true);
        setError("");

        const result = await getYudanjaLibrary(token);
        setItems(Array.isArray(result) ? result : []);
      } catch (err) {
        setError(err?.message || "자료실을 불러오지 못했습니다.");
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
        <Text style={styles.loadingText}>자료실을 불러오는 중입니다.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="자료실" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
  <View style={styles.heroCard}>
  <Text style={styles.heroTitle}>유단자{"\n"}전용자료실</Text>
  <Text style={styles.heroDesc}>
    태극권과 관련된 다양한 {"\n"}
    자료들을 열람할 수 있습니다.
  </Text>

  <Image
    source={require("../../../assets/images/yudanja/card-mountain.png")}
    style={styles.heroBamboo}
    resizeMode="contain"
  />
</View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryRow}
        >
          {CATEGORIES.map((category) => {
            const active = selectedCategory === category.key;

            return (
              <Pressable
                key={category.key}
                style={[styles.categoryButton, active && styles.categoryButtonActive]}
                onPress={() => {
  setSelectedCategory(category.key);
  setPage(1);
}}
              >
                <Text
                  style={[
                    styles.categoryText,
                    active && styles.categoryTextActive,
                  ]}
                >
                  {category.label}
                </Text>
              </Pressable>
              
            );
          })}
        </ScrollView>

        {error ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>불러오기 실패</Text>
            <Text style={styles.emptyText}>{error}</Text>
          </View>
        ) : filteredItems.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>등록된 자료가 없습니다.</Text>
            <Text style={styles.emptyText}>
              관리자가 자료를 등록하면 이곳에 표시됩니다.
            </Text>
          </View>
        ) : (
           <>
          <View style={styles.listWrap}>
            {pagedItems.map((item) => (
              <Pressable
                key={item.id}
                style={styles.itemCard}
                onPress={() =>
                  router.push({
                    pathname: "/yudanja/library/[id]",
                    params: { id: item.id },
                  })
                }
              >
                <View style={styles.itemTopRow}>
                  <Text style={styles.categoryPill}>
                    {getCategoryLabel(item.libraryCategory)}
                  </Text>

                  {item.isPinned ? (
                    <Text style={styles.pinPill}>상단 고정</Text>
                  ) : null}
                  
                </View>

                <Text style={styles.itemTitle} numberOfLines={2}>
  {item.title}
</Text>

                {item.summary ? (
                  <Text style={styles.itemSummary} numberOfLines={1}>
                    {item.summary}
                  </Text>
                ) : null}
                

                <View style={styles.itemBottomRow}>
  <Text style={styles.itemMeta}>
    수정일 {formatDate(item.updatedAt)}
  </Text>
  <Text style={styles.itemArrow}>›</Text>
</View>

<Image source={cardMountain} style={styles.cardMountain} />
              </Pressable>
            ))}
          </View>
          {filteredItems.length > PAGE_SIZE ? (
  <View style={styles.pagination}>
    {Array.from(
      {
        length: totalPages,
      },
      (_, index) => index + 1,
    ).map((pageNumber) => {
      const active = pageNumber === page;

      return (
        <React.Fragment key={pageNumber}>
          {pageNumber > 1 ? (
            <Text style={styles.pageDivider}>
              |
            </Text>
          ) : null}

          <Pressable
            style={[
              styles.pageNumberButton,
              active &&
                styles.pageNumberButtonActive,
            ]}
            onPress={() =>
              setPage(pageNumber)
            }
          >
            <Text
              style={[
                styles.pageNumberText,
                active &&
                  styles.pageNumberTextActive,
              ]}
            >
              {pageNumber}
            </Text>
          </Pressable>
        </React.Fragment>
      );
    })}
  </View>
) : null}
 </>
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
  
  heroLabel: {
  fontFamily: fonts.hanja,
  fontSize: 18,
  letterSpacing: 2,
  color: "#A47C4F",
  zIndex: 2,
},
  heroTitle: {
  marginTop: 8,
  fontFamily: fonts.title,
  fontSize: 28,
  lineHeight: 40,
  color: colors.textMain || "#3A2C27",
},
  heroDesc: {
    marginTop: 8,
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 22,
    color: "#6F625A",
  },
  categoryRow: {
    gap: 8,
    paddingVertical: 16,
  },
  categoryButton: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EEE3D8",
  },
  categoryButtonActive: {
    backgroundColor: "#3A2C27",
    borderColor: "#3A2C27",
  },
  categoryText: {
  fontFamily: fonts.semiBold,
  fontSize: 13,
  color: "#6F625A",
},
  categoryTextActive: {
    color: "#FFFFFF",
  },
  listWrap: {
  gap: 10,
},

itemCard: {
  position: "relative",
  overflow: "hidden",
  borderRadius: 22,
  paddingHorizontal: 16,
  paddingTop: 14,
  paddingBottom: 14,
  backgroundColor: "#FFFFFF",
  borderWidth: 1,
  borderColor: "#EEE3D8",
  minHeight: 132,
},

cardMountain: {
  position: "absolute",
  right: 8,
  bottom: 0,
  width: 78,
  height: 86,
  opacity: 0.38,
},
heroCard: {
  marginTop: 8,
  borderRadius: 20,
  padding: 22,
  minHeight: 205,
  backgroundColor: "#FFFDF8",
  borderWidth: 0,
  overflow: "hidden",
  position: "relative",

  shadowColor: "#7A5B3D",
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.18,
  shadowRadius: 12,
  elevation: 4,
},

heroImage: {
  opacity: 0,
},

heroBamboo: {
  position: "absolute",
  right: 0,
  bottom: 0,
  width: 205,
  height: 150,
  opacity: 0.72,
  zIndex: 1,
},
  itemTopRow: {
  flexDirection: "row",
  gap: 6,
  marginBottom: 8,
},

categoryPill: {
  alignSelf: "flex-start",
  borderRadius: 999,
  overflow: "hidden",
  paddingHorizontal: 10,
  paddingVertical: 4,
  backgroundColor: "#F7EFE4",
  fontFamily: fonts.semi,
  fontSize: 11,
  color: "#9A744D",
},
  pinPill: {
    alignSelf: "flex-start",
    borderRadius: 999,
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "#FFF5D6",
    fontFamily: fonts.semi,
    fontSize: 11,
    color: "#9A6B18",
  },
  itemTitle: {
  fontFamily: fonts.titleSemi,
  fontSize: 19,
  lineHeight: 27,
  color: colors.textMain || "#3A2C27",
  paddingRight: 70,
},

itemSummary: {
  marginTop: 4,
  fontFamily: fonts.medium,
  fontSize: 13,
  lineHeight: 19,
  color: "#6F625A",
  paddingRight: 72,
},

itemBottomRow: {
  marginTop: 10,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
},

itemMeta: {
  fontFamily: fonts.medium,
  fontSize: 12,
  color: "#A79A90",
},


itemArrow: {
  fontSize: 26,
  color: "#B7A89B",
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
  pagination: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
  },

  pageNumberButton: {
    minWidth: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },

  pageNumberButtonActive: {
    backgroundColor: "#3A2C27",
  },

  pageNumberText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: "#6F625A",
  },

  pageNumberTextActive: {
    color: "#FFFFFF",
  },

  pageDivider: {
    marginHorizontal: 4,
    fontFamily: fonts.medium,
    fontSize: 13,
    color: "#C8B7A6",
  },
});