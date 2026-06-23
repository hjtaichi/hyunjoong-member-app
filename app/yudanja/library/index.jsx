import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
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

const fonts = {
  title: "MaruBuriBold",
  semi: "PretendardSemiBold",
  medium: "PretendardMedium",
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

  const filteredItems = useMemo(() => {
    if (selectedCategory === "all") return items;
    return items.filter((item) => item.libraryCategory === selectedCategory);
  }, [items, selectedCategory]);

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
      <ScreenHeader title="유단자 자료실" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>YUDANJA LIBRARY</Text>
          <Text style={styles.heroTitle}>유단자 자료실</Text>
          <Text style={styles.heroDesc}>
            추수, 투로, 발경, 용형편간, 이론 자료를 본문으로 열람합니다.
          </Text>
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
                onPress={() => setSelectedCategory(category.key)}
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
          <View style={styles.listWrap}>
            {filteredItems.map((item) => (
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

                <Text style={styles.itemTitle}>{item.title}</Text>

                {item.summary ? (
                  <Text style={styles.itemSummary} numberOfLines={2}>
                    {item.summary}
                  </Text>
                ) : null}

                <View style={styles.itemBottomRow}>
                  <Text style={styles.itemMeta}>
                    수정일 {formatDate(item.updatedAt)}
                  </Text>
                  <Text style={styles.itemArrow}>›</Text>
                </View>
              </Pressable>
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
  heroCard: {
    borderRadius: 28,
    padding: 22,
    backgroundColor: "#F7EFE4",
    borderWidth: 1,
    borderColor: "#E8D8C4",
  },
  heroLabel: {
    fontFamily: fonts.semi,
    fontSize: 11,
    letterSpacing: 1,
    color: "#A47C4F",
  },
  heroTitle: {
    marginTop: 8,
    fontFamily: fonts.title,
    fontSize: 26,
    lineHeight: 34,
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
    fontFamily: fonts.semi,
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
    borderRadius: 24,
    padding: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EEE3D8",
  },
  itemTopRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 10,
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
    color: "#8A6238",
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
    fontFamily: fonts.title,
    fontSize: 20,
    lineHeight: 28,
    color: colors.textMain || "#3A2C27",
  },
  itemSummary: {
    marginTop: 7,
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 21,
    color: "#6F625A",
  },
  itemBottomRow: {
    marginTop: 12,
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
});