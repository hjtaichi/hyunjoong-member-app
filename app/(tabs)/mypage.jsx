import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "../../src/contexts/AuthContext";
import { getMemberHome } from "../../src/api/memberHome";

export default function MyPageScreen() {
  const { user, token, logout } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [homeData, setHomeData] = useState(null);

  const loadProfile = useCallback(async ({ silent = false } = {}) => {
    if (!token) return;

    try {
      if (!silent) setLoading(true);

      const result = await getMemberHome(token);
      setHomeData(result);
    } catch (error) {
      Alert.alert("오류", error.message || "내 정보를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadProfile({ silent: true });
  }, [loadProfile]);

  async function handleLogout() {
    Alert.alert("로그아웃", "로그아웃 하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "로그아웃",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
            router.replace("/login");
          } catch (error) {
            console.error("logout error:", error);
            Alert.alert("오류", "로그아웃 중 문제가 발생했습니다.");
          }
        },
      },
    ]);
  }

  const memberName =
    homeData?.member?.name ||
    user?.name ||
    "회원";

  const progress = homeData?.progress || null;
  const payment = homeData?.payment || homeData?.tuition || null;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>내 정보를 불러오는 중입니다.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={styles.title}>내정보</Text>
      <Text style={styles.subtitle}>
        회원 정보와 학습 현황을 확인할 수 있어요.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>기본 정보</Text>
        <Text style={styles.cardText}>이름: {memberName}</Text>
        <Text style={styles.cardText}>이메일: {user?.email || "-"}</Text>
        <Text style={styles.cardText}>권한: {user?.role || "member"}</Text>
        <Text style={styles.cardText}>
          도장명: {homeData?.academyName || "현중태극권"}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>내 진도</Text>
        {progress ? (
          <>
            <Text style={styles.cardText}>
              커리큘럼: {progress.curriculumName || "-"}
            </Text>
            <Text style={styles.cardText}>
              현재 진도: {progress.currentStep || 0} / {progress.totalSteps || 0}
            </Text>
            <Text style={styles.cardText}>
              최근 수업 메모: {progress.lastLessonNote || "최근 메모 없음"}
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.cardText}>아직 등록된 진도 정보가 없습니다.</Text>
            <Text style={styles.cardText}>
              백엔드 학습트랙 데이터와 연결되면 여기에 표시됩니다.
            </Text>
          </>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>회비 상태</Text>
        {payment ? (
          <>
            <Text style={styles.cardText}>
              납부일: {payment.dueDate || "-"}
            </Text>
            <Text style={styles.cardText}>
              남은 기간: {typeof payment.daysLeft === "number" ? `${payment.daysLeft}일` : "-"}
            </Text>
            <Text style={styles.cardText}>
              상태: {payment.statusLabel || payment.status || "확인 필요"}
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.cardText}>등록된 회비 정보가 없습니다.</Text>
            <Text style={styles.cardText}>
              회비 알림 설정 후 홈/내정보에 표시됩니다.
            </Text>
          </>
        )}
      </View>

      <Pressable
  style={styles.card}
  onPress={() => router.push("/recurring-reservations")}
>
  <Text style={styles.cardTitle}>정기출석 설정</Text>
  <Text style={styles.cardText}>
    자주 가는 요일과 시간대를 저장해둘 수 있어요.
  </Text>
  <Text style={styles.cardText}>
    예: 화/목/금 오후 7시부, 화/토 오전 10시부
  </Text>
</Pressable>

      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>로그아웃</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8FA",
  },
  content: {
    padding: 20,
    paddingTop: 28,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    backgroundColor: "#F7F8FA",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "#666",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#4B5563",
    lineHeight: 22,
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 10,
  },
  cardText: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 21,
    marginBottom: 4,
  },
  logoutButton: {
    marginTop: 10,
    backgroundColor: "#111827",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  logoutButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});