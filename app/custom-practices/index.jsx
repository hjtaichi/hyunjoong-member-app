import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";

import { useAuth } from "../../src/contexts/AuthContext";
import { getMyCustomPractices } from "../../src/api/customPractices";

const FILTERS = [
  { key: "all", label: "전체" },
  { key: "goal", label: "목표 달성형" },
  { key: "free", label: "자유 기록형" },
];

function formatDate(value) {
  if (!value) return "";
  return String(value).replaceAll("-", ".");
}

function PracticeCard({ practice }) {
  const isGoal = practice.mode === "goal";
  const isAdminCreated = practice.createdBy?.role === "admin";
  const progress = Number(practice.progressPercent || 0);

  return (
    <TouchableOpacity
      style={styles.practiceCard}
      activeOpacity={0.88}
      onPress={() =>
        router.push({
          pathname: "/custom-practices/[practiceId]",
          params: { practiceId: practice.id },
        })
      }
    >
      <View style={styles.cardTopRow}>
        <View style={styles.badgeRow}>
          {isAdminCreated ? (
            <View style={styles.adminBadge}>
              <Text style={styles.adminBadgeText}>관장님 지정</Text>
            </View>
          ) : (
            <View style={styles.memberBadge}>
              <Text style={styles.memberBadgeText}>내가 만든 수련</Text>
            </View>
          )}

          <View style={styles.modeBadge}>
            <Text style={styles.modeBadgeText}>
              {isGoal ? "목표 달성형" : "자유 기록형"}
            </Text>
          </View>
        </View>

        <Text style={styles.chevron}>〉</Text>
      </View>

      <Text style={styles.practiceName}>{practice.name}</Text>

      {practice.description ? (
        <Text style={styles.practiceDescription} numberOfLines={2}>
          {practice.description}
        </Text>
      ) : null}

      {isGoal ? (
        <>
          <View style={styles.countRow}>
            <Text style={styles.goalCaption}>
              목표 {Number(practice.targetCount || 0).toLocaleString("ko-KR")}회
            </Text>
            <Text style={styles.goalCount}>
              {Number(practice.currentCount || 0).toLocaleString("ko-KR")}
              <Text style={styles.goalCountSub}>
                {" "}
                / {Number(practice.targetCount || 0).toLocaleString("ko-KR")}회
              </Text>
            </Text>
          </View>

          <View style={styles.progressRow}>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.max(0, Math.min(100, progress))}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>{progress}%</Text>
          </View>
        </>
      ) : (
        <View style={styles.freeCountBox}>
          <Text style={styles.freeCountLabel}>누적 기록</Text>
          <Text style={styles.freeCount}>
            {Number(practice.currentCount || 0).toLocaleString("ko-KR")}회
          </Text>
        </View>
      )}

      <View style={styles.periodRow}>
        <MaterialCommunityIcons
          name="calendar-blank-outline"
          size={15}
          color="#9a8c80"
        />
        <Text style={styles.periodText}>
          {formatDate(practice.startDate)}
          {practice.endDate ? ` ~ ${formatDate(practice.endDate)}` : "부터"}
        </Text>

        {practice.status === "completed" ? (
          <Text style={styles.completedText}>목표 완료</Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

export default function CustomPracticesScreen() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [practices, setPractices] = useState([]);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");

  const load = useCallback(
    async ({ silent = false } = {}) => {
      if (!token) return;

      try {
        if (!silent) setLoading(true);
        setError("");

        const result = await getMyCustomPractices(token);
        setEnabled(result?.enabled === true);
        setPractices(Array.isArray(result?.practices) ? result.practices : []);
      } catch (loadError) {
        setError(
          loadError?.message || "개별수련 정보를 불러오지 못했습니다."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token]
  );

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const visiblePractices = useMemo(() => {
    const active = practices.filter((practice) => practice.status !== "archived");

    if (filter === "all") return active;
    return active.filter((practice) => practice.mode === filter);
  }, [filter, practices]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#a56f34" />
          <Text style={styles.loadingText}>개별수련을 불러오는 중입니다.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!enabled) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>개별수련</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.center}>
          <MaterialCommunityIcons
            name="door-closed-lock"
            size={52}
            color="#b6a89b"
          />
          <Text style={styles.emptyTitle}>현재 열려 있는 개별수련방이 없습니다.</Text>
          <Text style={styles.emptyDesc}>
            관리자에게 권한이 열리면 태극권 탭에서 다시 확인할 수 있습니다.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>개별수련</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load({ silent: true });
            }}
            tintColor="#a56f34"
          />
        }
      >
        <View style={styles.introCard}>
          <View style={styles.introIcon}>
            <MaterialCommunityIcons
              name="meditation"
              size={30}
              color="#9a6835"
            />
          </View>

          <View style={styles.introTextWrap}>
            <Text style={styles.introTitle}>나에게 필요한 수련을 기록해보세요.</Text>
            <Text style={styles.introDesc}>
              목표를 정해 채우거나, 목표 없이 꾸준히 횟수를 남길 수 있습니다.
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.createButton}
          activeOpacity={0.88}
          onPress={() => router.push("/custom-practices/new")}
        >
          <MaterialCommunityIcons name="plus" size={21} color="#ffffff" />
          <Text style={styles.createButtonText}>새 수련 만들기</Text>
        </TouchableOpacity>

        <View style={styles.filterRow}>
          {FILTERS.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={[
                styles.filterButton,
                filter === item.key && styles.filterButtonActive,
              ]}
              onPress={() => setFilter(item.key)}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.filterText,
                  filter === item.key && styles.filterTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {visiblePractices.length > 0 ? (
          <View style={styles.list}>
            {visiblePractices.map((practice) => (
              <PracticeCard key={practice.id} practice={practice} />
            ))}
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <MaterialCommunityIcons
              name="notebook-edit-outline"
              size={40}
              color="#b6a89b"
            />
            <Text style={styles.emptyTitle}>아직 등록된 개별수련이 없습니다.</Text>
            <Text style={styles.emptyDesc}>
              새 수련을 만들거나 관리자가 지정한 수련을 기다려주세요.
            </Text>
          </View>
        )}

        <View style={styles.tipCard}>
          <MaterialCommunityIcons
            name="sprout-outline"
            size={21}
            color="#9a6835"
          />
          <Text style={styles.tipText}>
            한 번에 많이 하기보다 꾸준히 기록하는 것이 가장 좋은 수련입니다.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f8f5ef",
  },
  header: {
    height: 58,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fffdf9",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e7ded3",
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  backText: {
    marginTop: -4,
    fontSize: 38,
    color: "#493a32",
    fontFamily: "PretendardRegular",
  },
  headerTitle: {
    fontSize: 19,
    color: "#362b26",
    fontFamily: "PretendardSemiBold",
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    padding: 20,
    paddingBottom: 48,
  },
  center: {
    flex: 1,
    paddingHorizontal: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 14,
    fontSize: 14,
    color: "#74675e",
    fontFamily: "PretendardRegular",
  },
  introCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    borderRadius: 22,
    backgroundColor: "#fffaf2",
    borderWidth: 1,
    borderColor: "#ead9c2",
  },
  introIcon: {
    width: 52,
    height: 52,
    marginRight: 14,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f4e5cf",
  },
  introTextWrap: {
    flex: 1,
  },
  introTitle: {
    fontSize: 16,
    lineHeight: 22,
    color: "#3c302a",
    fontFamily: "PretendardSemiBold",
  },
  introDesc: {
    marginTop: 5,
    fontSize: 13,
    lineHeight: 19,
    color: "#7f7065",
    fontFamily: "PretendardRegular",
  },
  createButton: {
    height: 52,
    marginTop: 16,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#a56f34",
  },
  createButtonText: {
    marginLeft: 6,
    fontSize: 15,
    color: "#ffffff",
    fontFamily: "PretendardSemiBold",
  },
  filterRow: {
    marginTop: 20,
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5ddd3",
  },
  filterButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  filterButtonActive: {
    borderBottomColor: "#9a6835",
  },
  filterText: {
    fontSize: 13,
    color: "#9a8e84",
    fontFamily: "PretendardMedium",
  },
  filterTextActive: {
    color: "#6d4726",
    fontFamily: "PretendardSemiBold",
  },
  list: {
    marginTop: 16,
    gap: 12,
  },
  practiceCard: {
    padding: 18,
    borderRadius: 20,
    backgroundColor: "#fffdf9",
    borderWidth: 1,
    borderColor: "#e8dfd5",
    shadowColor: "#6c543c",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  adminBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "#f4e4cc",
  },
  adminBadgeText: {
    fontSize: 10,
    color: "#8b5c2e",
    fontFamily: "PretendardSemiBold",
  },
  memberBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "#f0ece7",
  },
  memberBadgeText: {
    fontSize: 10,
    color: "#74685e",
    fontFamily: "PretendardSemiBold",
  },
  modeBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "#fff8ed",
    borderWidth: 1,
    borderColor: "#eedcc2",
  },
  modeBadgeText: {
    fontSize: 10,
    color: "#9a6835",
    fontFamily: "PretendardMedium",
  },
  chevron: {
    fontSize: 24,
    color: "#a4968a",
    fontFamily: "PretendardRegular",
  },
  practiceName: {
    marginTop: 14,
    fontSize: 19,
    color: "#362b26",
    fontFamily: "PretendardSemiBold",
  },
  practiceDescription: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 19,
    color: "#81746a",
    fontFamily: "PretendardRegular",
  },
  countRow: {
    marginTop: 17,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  goalCaption: {
    fontSize: 12,
    color: "#8f8176",
    fontFamily: "PretendardRegular",
  },
  goalCount: {
    fontSize: 20,
    color: "#75491f",
    fontFamily: "PretendardBold",
  },
  goalCountSub: {
    fontSize: 13,
    color: "#796b61",
    fontFamily: "PretendardMedium",
  },
  progressRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  progressTrack: {
    flex: 1,
    height: 10,
    overflow: "hidden",
    borderRadius: 999,
    backgroundColor: "#ede5dc",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#c58b4b",
  },
  progressText: {
    width: 46,
    marginLeft: 10,
    textAlign: "right",
    fontSize: 14,
    color: "#4d4038",
    fontFamily: "PretendardSemiBold",
  },
  freeCountBox: {
    marginTop: 16,
    padding: 14,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8f3ec",
  },
  freeCountLabel: {
    fontSize: 13,
    color: "#87796e",
    fontFamily: "PretendardRegular",
  },
  freeCount: {
    fontSize: 19,
    color: "#75491f",
    fontFamily: "PretendardBold",
  },
  periodRow: {
    marginTop: 15,
    paddingTop: 13,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#e8dfd5",
    flexDirection: "row",
    alignItems: "center",
  },
  periodText: {
    marginLeft: 6,
    flex: 1,
    fontSize: 12,
    color: "#8c7f74",
    fontFamily: "PretendardRegular",
  },
  completedText: {
    fontSize: 11,
    color: "#8a5b2f",
    fontFamily: "PretendardSemiBold",
  },
  emptyCard: {
    marginTop: 22,
    paddingVertical: 44,
    paddingHorizontal: 24,
    borderRadius: 20,
    alignItems: "center",
    backgroundColor: "#fffdf9",
    borderWidth: 1,
    borderColor: "#e8dfd5",
  },
  emptyTitle: {
    marginTop: 13,
    textAlign: "center",
    fontSize: 16,
    color: "#4d4038",
    fontFamily: "PretendardSemiBold",
  },
  emptyDesc: {
    marginTop: 7,
    textAlign: "center",
    fontSize: 13,
    lineHeight: 19,
    color: "#8c7f74",
    fontFamily: "PretendardRegular",
  },
  tipCard: {
    marginTop: 18,
    padding: 15,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fbf3e7",
  },
  tipText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 12,
    lineHeight: 18,
    color: "#735d49",
    fontFamily: "PretendardRegular",
  },
  errorText: {
    marginTop: 15,
    textAlign: "center",
    fontSize: 13,
    color: "#b44444",
    fontFamily: "PretendardMedium",
  },
});
