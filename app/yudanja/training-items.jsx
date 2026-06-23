import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import ScreenHeader from "../../src/components/ScreenHeader";
import { useAuth } from "../../src/contexts/AuthContext";
import { getYudanjaTrainingItems } from "../../src/api/yudanjaContent";
import { colors } from "../../src/theme";

const fonts = {
  title: "MaruBuriBold",
  semi: "PretendardSemiBold",
  medium: "PretendardMedium",
};

export default function YudanjaTrainingItemsScreen() {
  const { token } = useAuth();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadData = useCallback(
    async ({ silent = false } = {}) => {
      if (!token) return;

      try {
        if (!silent) setLoading(true);
        setError("");

        const result = await getYudanjaTrainingItems(token);
        setCategories(Array.isArray(result) ? result : []);
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
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>YUDANJA TRAINING</Text>
          <Text style={styles.heroTitle}>유단자회 수련항목</Text>
          <Text style={styles.heroDesc}>
            유단자회에서 함께 수련하는 추수, 투로교정, 발경, 용형편간 항목입니다.
          </Text>
        </View>

        {error ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>불러오기 실패</Text>
            <Text style={styles.emptyText}>{error}</Text>
          </View>
        ) : categories.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>등록된 항목이 없습니다.</Text>
            <Text style={styles.emptyText}>
              관리자가 수련항목을 등록하면 이곳에 표시됩니다.
            </Text>
          </View>
        ) : (
          <View style={styles.categoryList}>
            {categories.map((category) => (
              <View key={category.id} style={styles.categoryCard}>
                <Text style={styles.categoryTitle}>{category.name}</Text>

                <View style={styles.itemList}>
                  {(category.items || []).map((item) => (
                    <View key={item.id} style={styles.itemRow}>
                      <View style={styles.dot} />
                      <View style={styles.itemTextWrap}>
                        <Text style={styles.itemName}>{item.name}</Text>
                        {item.description ? (
                          <Text style={styles.itemDesc}>
                            {item.description}
                          </Text>
                        ) : null}
                      </View>
                    </View>
                  ))}
                </View>
              </View>
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
    marginBottom: 16,
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
  categoryList: {
    gap: 12,
  },
  categoryCard: {
    borderRadius: 24,
    padding: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EEE3D8",
  },
  categoryTitle: {
    fontFamily: fonts.title,
    fontSize: 21,
    color: colors.textMain || "#3A2C27",
    marginBottom: 12,
  },
  itemList: {
    gap: 10,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#F1E8DE",
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#C89E6A",
    marginTop: 8,
  },
  itemTextWrap: {
    flex: 1,
  },
  itemName: {
    fontFamily: fonts.semi,
    fontSize: 15,
    color: "#3A2C27",
  },
  itemDesc: {
    marginTop: 4,
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
});