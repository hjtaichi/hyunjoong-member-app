import React, {
  useCallback,
  useMemo,
  useState,
} from "react";
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
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";

import ScreenHeader from "../src/components/ScreenHeader";
import { getMemberTrainingMedals } from "../src/api/memberTrainingMedals";
import { FORM_DEFINITIONS } from "../src/features/taegukwon/taegukwonMeta";
import {
  TRAINING_MEDAL_CABINET_IMAGE,
  getTrainingMedalImageSource,
} from "../src/features/home/trainingMedalAssets";

const TRAINING_MEDAL_ORNAMENT_IMAGE = require(
  "../assets/images/training-medals/training-medal-ornament.png"
);

const FORM_TITLE = Object.fromEntries(
  FORM_DEFINITIONS.map((item) => [
    item.id,
    item.name,
  ])
);

const ITEMS_PER_CABINET = 12;

function chunk(list, size) {
  const chunks = [];
  for (let index = 0; index < list.length; index += size) {
    chunks.push(list.slice(index, index + size));
  }
  return chunks;
}

function buildDisplayItems(data) {
  const annual = (
    Array.isArray(data?.annual)
      ? data.annual
      : []
  ).map((item) => ({
    ...item,
    type: "annual",
    displayTitle: `${item.year} 연간 메달`,
  }));

  const halves = (
    Array.isArray(data?.collection)
      ? data.collection
      : []
  ).map((item) => ({
    ...item,
    type: "half",
    displayTitle:
      FORM_TITLE[item.formKey] ||
      item.formKey ||
      "종목 미확인",
  }));

  return [...annual, ...halves]
    .filter((item) =>
      Boolean(getTrainingMedalImageSource(item))
    )
    .sort((a, b) => {
      const earnedDiff =
        new Date(b.earnedAt || 0).getTime() -
        new Date(a.earnedAt || 0).getTime();

      if (earnedDiff !== 0) {
        return earnedDiff;
      }

      if (a.type !== b.type) {
        return a.type === "annual" ? -1 : 1;
      }

      return String(b.id || "").localeCompare(
        String(a.id || "")
      );
    });
}

function CabinetSlot({ item }) {
  if (!item) {
    return <View style={styles.slot} />;
  }

  const source = getTrainingMedalImageSource(item);
  const annual = item.type === "annual";
  const periodLabel = annual
    ? `${item.year}년 연간`
    : `${item.year}년 ${
        Number(item.half) === 1
          ? "상반기"
          : "하반기"
      }`;

  return (
    <View style={styles.slot}>
      <Image
        source={source}
        resizeMode="contain"
        style={
          annual
            ? styles.annualMedal
            : styles.halfMedal
        }
      />

      <View style={styles.slotLabelWrap}>
        <Text
          style={styles.periodLabel}
          numberOfLines={1}
        >
          {periodLabel}
        </Text>

        <Text
          style={styles.formLabel}
          numberOfLines={1}
        >
          {annual
            ? "수련 목표달성"
            : item.displayTitle}
        </Text>
      </View>
    </View>
  );
}

function Cabinet({ items }) {
  const rows = [0, 1, 2, 3].map((row) =>
    items.slice(row * 3, row * 3 + 3)
  );

  return (
    <View style={styles.cabinetFrame}>
      <View style={styles.cabinet}>
        <Image
          source={TRAINING_MEDAL_CABINET_IMAGE}
          resizeMode="stretch"
          style={styles.cabinetImage}
        />

        <View
          pointerEvents="none"
          style={styles.cabinetOverlay}
        >
          {rows.map((rowItems, rowIndex) => (
            <View
              key={`row-${rowIndex}`}
              style={[
                styles.shelfRow,
                styles[`shelfRow${rowIndex + 1}`],
              ]}
            >
              {[0, 1, 2].map((columnIndex) => (
                <CabinetSlot
                  key={`slot-${rowIndex}-${columnIndex}`}
                  item={rowItems[columnIndex]}
                />
              ))}
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

export default function TrainingMedalsScreen() {
  const [data, setData] = useState({
    collection: [],
    home: [],
    annual: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] =
    useState(false);
  const [error, setError] = useState("");
  const [pageIndex, setPageIndex] = useState(0);

  const load = useCallback(
    async ({ refresh = false } = {}) => {
      try {
        refresh
          ? setRefreshing(true)
          : setLoading(true);

        setError("");

        const result =
          await getMemberTrainingMedals();

        setData(
          result && typeof result === "object"
            ? result
            : {
                collection: [],
                home: [],
                annual: [],
              }
        );
      } catch (loadError) {
        setError(
          loadError?.response?.data?.message ||
            loadError?.message ||
            "메달 정보를 불러오지 못했습니다."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const displayItems = useMemo(
    () => buildDisplayItems(data),
    [data]
  );

  const cabinets = useMemo(
    () =>
      displayItems.length > 0
        ? chunk(displayItems, ITEMS_PER_CABINET)
        : [[]],
    [displayItems]
  );

  const pageCount = Math.max(cabinets.length, 1);
  const safePageIndex = Math.min(
    pageIndex,
    pageCount - 1
  );
  const currentCabinetItems =
    cabinets[safePageIndex] || [];

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator />
        <Text style={styles.loadingText}>
          수련 메달을 불러오는 중입니다.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() =>
              load({ refresh: true })
            }
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          title="수련의 결실"
          onBack={() => router.back()}
        />

        <View style={styles.hero}>

          <Image
            source={TRAINING_MEDAL_ORNAMENT_IMAGE}
            resizeMode="contain"
            style={styles.ornament}
          />

          <Text style={styles.desc}>
            목표를 이루며 쌓아온 수련의 시간을
            {"\n"}
            한 자리에서 돌아보세요.
          </Text>
        </View>

        {error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>
              {error}
            </Text>
          </View>
        ) : null}

        {displayItems.length > 0 ? (
          <Text style={styles.summaryText}>
            보유 메달 {displayItems.length}개
          </Text>
        ) : (
          <View style={styles.emptyInfo}>
            <Text style={styles.emptyTitle}>
              아직 진열된 메달이 없습니다
            </Text>
            <Text style={styles.emptyDesc}>
              투로 목표를 달성하면 메달이
              진열장에 하나씩 놓입니다.
            </Text>
          </View>
        )}

                <Cabinet items={currentCabinetItems} />

        {pageCount > 1 ? (
          <View style={styles.pagination}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="이전 메달 진열장"
              disabled={safePageIndex <= 0}
              onPress={() =>
                setPageIndex((value) =>
                  Math.max(0, value - 1)
                )
              }
              style={[
                styles.pageButton,
                safePageIndex <= 0 &&
                  styles.pageButtonDisabled,
              ]}
            >
              <Text style={styles.pageButtonText}>
                이전
              </Text>
            </Pressable>

            <View style={styles.pageDots}>
              {Array.from(
                { length: pageCount },
                (_, index) => (
                  <Pressable
                    key={`page-dot-${index}`}
                    accessibilityRole="button"
                    accessibilityLabel={`메달 진열장 ${
                      index + 1
                    }페이지`}
                    onPress={() =>
                      setPageIndex(index)
                    }
                    style={[
                      styles.pageDot,
                      index === safePageIndex &&
                        styles.pageDotActive,
                    ]}
                  />
                )
              )}
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="다음 메달 진열장"
              disabled={
                safePageIndex >= pageCount - 1
              }
              onPress={() =>
                setPageIndex((value) =>
                  Math.min(
                    pageCount - 1,
                    value + 1
                  )
                )
              }
              style={[
                styles.pageButton,
                styles.pageButtonNext,
                safePageIndex >= pageCount - 1 &&
                  styles.pageButtonDisabled,
              ]}
            >
              <Text style={[styles.pageButtonText, styles.pageButtonTextNext]}>
                다음
              </Text>
            </Pressable>
          </View>
        ) : null}

        <Text style={styles.footer}>
          현중태극권 · 수련의 기록
        </Text>
      </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FBF8F2",
  },
content: {
    paddingHorizontal: 12,
    paddingBottom: 54,
    paddingTop: 24,
  },
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FBF8F2",
  },
  loadingText: {
    marginTop: 10,
    color: "#725E4B",
    fontFamily: "PretendardMedium",
    fontSize: 13,
  },
  hero: {
    paddingHorizontal: 12,
    paddingTop: 0,
    paddingBottom: 12,
  },
  ornament: {
    width: "95%",
    height: 50,
    alignSelf: "center",
    marginTop: -10,
    marginBottom: 10,
    opacity: 1,
  },
  desc: {
    marginTop: 5,
    color: "#806E5E",
    fontFamily: "MaruBuriBold",
    fontSize: 16,
    lineHeight: 21,
  },
  errorCard: {
    marginHorizontal: 12,
    marginBottom: 10,
    padding: 12,
    borderRadius: 14,
    backgroundColor: "#FFF0EC",
  },
  errorText: {
    color: "#865244",
    fontFamily: "PretendardMedium",
    fontSize: 12,
  },
  summaryText: {
    paddingHorizontal: 12,
    paddingBottom: 8,
    color: "#8E755E",
    fontFamily: "PretendardMedium",
    fontSize: 14,
  },
  emptyInfo: {
    marginHorizontal: 12,
    marginBottom: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: "#F6F0E8",
  },
  emptyTitle: {
    color: "#66503D",
    fontFamily: "PretendardSemiBold",
    fontSize: 12,
  },
  emptyDesc: {
    marginTop: 4,
    color: "#9A8774",
    fontFamily: "PretendardMedium",
    fontSize: 10,
    lineHeight: 16,
  },
  cabinetFrame: {
    width: "100%",
    marginBottom: 10,
  },
  cabinet: {
    width: "100%",
    aspectRatio: 1150 / 2000,
    position: "relative",
    overflow: "hidden",
  },
  cabinetImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },
  cabinetOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  shelfRow: {
    position: "absolute",
    left: "9%",
    right: "9%",
    height: "18%",
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  shelfRow1: {
    top: "2%",
  },
  shelfRow2: {
    top: "25.8%",
  },
  shelfRow3: {
    top: "49.3%",
  },
  shelfRow4: {
    top: "72.8%",
  },
  slot: {
    width: "30%",
    height: "100%",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 1,
    transform: [{ translateY: 15.5 }],
  },
  halfMedal: {
    width: 48,
    height: 69,
  },
  annualMedal: {
    width: 78,
    height: 78,
  },
  slotLabelWrap: {
    width: 108,
    marginTop: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  periodLabel: {
    color: "#9A8066",
    fontFamily: "PretendardMedium",
    fontSize: 12,
    lineHeight: 11,
    textAlign: "center",
    textShadowColor: "rgba(255,255,255,0.98)",
    textShadowRadius: 3,
  },
  formLabel: {
    marginTop: 1,
    color: "#5F4A39",
    fontFamily: "PretendardSemiBold",
    fontSize: 14,
    lineHeight: 14,
    textAlign: "center",
    textShadowColor: "rgba(255,255,255,0.98)",
    textShadowRadius: 3,
  },
  pagination: {
    marginTop: 10,
    marginBottom: 8,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pageButton: {
    minWidth: 48,
    minHeight: 34,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#D8C8B4",
    backgroundColor: "#FFFDF9",
  },
  pageButtonNext: {
    borderColor: "#7B5B38",
    backgroundColor: "#7B5B38",
  },
  pageButtonDisabled: {
    opacity: 0.3,
  },
  pageButtonText: {
    color: "#6B5542",
    fontFamily: "PretendardSemiBold",
    fontSize: 11,
  },
  pageButtonTextNext: {
    color: "#FFFFFF",
  },
  pageDots: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  pageDot: {
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: "#D8C8B4",
  },
  pageDotActive: {
    width: 9,
    height: 9,
    backgroundColor: "#8F6A45",
  },  footer: {
    marginTop: 4,
    color: "#B19E89",
    fontFamily: "PretendardMedium",
    fontSize: 9,
    textAlign: "center",
  },
});