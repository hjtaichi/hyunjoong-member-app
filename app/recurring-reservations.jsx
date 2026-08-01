import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useAuth } from "../src/contexts/AuthContext";
import {
  getRecurringReservations,
  saveRecurringReservations,
} from "../src/api/memberRecurringReservations";
import { getMemberHome } from "../src/api/memberHome";
import { colors, radius, shadow } from "../src/theme";
import ScreenHeader from "../src/components/ScreenHeader";
import { emitAttendanceDataChanged } from "../src/events/attendanceRefreshEvents";

const fonts = {
  medium: "PretendardMedium",
  semiBold: "PretendardSemiBold",
  bold: "PretendardBold",
  title: "MaruBuriBold",
  titleSemi: "MaruBuriSemiBold",
};

const YUDANJA_SESSION_TIME_KEY = "MON_YUDANJA";

export default function RecurringReservationsScreen() {
  const { token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimerRef = useRef(null);

  const [isYudanjaEnabled, setIsYudanjaEnabled] = useState(false);
  const [canUseYudanja, setCanUseYudanja] = useState(false);

  const loadData = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);

      const [result, homeResult] = await Promise.all([
        getRecurringReservations(token),
        getMemberHome(token),
      ]);

      const hasYudanjaAccess =
        homeResult?.member?.canAccessYudanjaClass === true;
      const items = Array.isArray(result?.items) ? result.items : [];
      const yudanjaItem = items.find(
        (item) => item?.sessionTimeKey === YUDANJA_SESSION_TIME_KEY
      );

      setCanUseYudanja(hasYudanjaAccess);
      setIsYudanjaEnabled(hasYudanjaAccess && Boolean(yudanjaItem));
    } catch (error) {
      Alert.alert(
        "오류",
        error.message || "유단자수련 정기예약 설정을 불러오지 못했습니다."
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const showSavedToast = useCallback(() => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    setToastVisible(true);
    toastTimerRef.current = setTimeout(() => {
      setToastVisible(false);
      toastTimerRef.current = null;
    }, 1800);
  }, []);

  const handleSave = useCallback(async () => {
    try {
      setSaving(true);

      const items =
        canUseYudanja && isYudanjaEnabled
          ? [
              {
                weekday: 1,
                sessionTimeKey: YUDANJA_SESSION_TIME_KEY,
              },
            ]
          : [];

      await saveRecurringReservations(token, {
        isEnabled: items.length > 0,
        items,
      });

      emitAttendanceDataChanged();
      showSavedToast();
    } catch (error) {
      Alert.alert(
        "오류",
        error.message || "유단자수련 정기예약 저장에 실패했습니다."
      );
    } finally {
      setSaving(false);
    }
  }, [canUseYudanja, isYudanjaEnabled, token, showSavedToast]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>
          유단자수련 정기예약 설정을 불러오는 중입니다.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <ScreenHeader title="유단자수련 정기예약" />

        <Text style={styles.subtitle}>
          월요일 유단자수련만 자동 예약할 수 있어요. {"\n"}
          일반 수업은 일정에서 수업과 실제 출석만 확인합니다.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>월요일 유단자수련</Text>
          <Text style={styles.helperText}>
            사용하면 매주 월요일 유단자수련이 자동으로 예약됩니다.
          </Text>

          {canUseYudanja ? (
            <Pressable
              style={[
                styles.toggleButton,
                isYudanjaEnabled && styles.toggleButtonActive,
              ]}
              onPress={() => setIsYudanjaEnabled((prev) => !prev)}
            >
              <Text
                style={[
                  styles.toggleButtonText,
                  isYudanjaEnabled && styles.toggleButtonTextActive,
                ]}
              >
                {isYudanjaEnabled
                  ? "유단자수련 정기예약 사용 중"
                  : "유단자수련 정기예약 사용 안 함"}
              </Text>
            </Pressable>
          ) : (
            <Text style={styles.blockedText}>
              유단자수련 권한이 있는 회원만 설정할 수 있습니다.
            </Text>
          )}
        </View>

        <View style={styles.noticeCard}>
          <Text style={styles.noticeTitle}>일반 수업 예약 안내</Text>
          <Text style={styles.noticeText}>
            화요일부터 토요일까지의 일반 수업은 개별 예약과 정기예약을
            사용하지 않으며, 실제 출석 완료만 일정에 표시됩니다.
          </Text>
        </View>

        <Pressable
          style={[
            styles.saveButton,
            (saving || !canUseYudanja) && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={saving || !canUseYudanja}
        >
          <Text style={styles.saveButtonText}>
            {saving ? "저장 중..." : "저장"}
          </Text>
        </Pressable>
      </ScrollView>

      {toastVisible ? (
        <View pointerEvents="none" style={styles.toastWrap}>
          <View style={styles.toast}>
            <Text style={styles.toastText}>✓ 저장되었습니다.</Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 110,
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
  },
  center: {
    flex: 1,
    backgroundColor: "#f6f3ee",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "#666",
  },
  subtitle: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.textSub,
    lineHeight: 22,
    marginBottom: 18,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    paddingHorizontal: 16,
    paddingVertical: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: fonts.titleSemi,
    color: colors.textMain,
    marginBottom: 8,
  },
  helperText: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colors.textSub,
    lineHeight: 20,
    marginBottom: 14,
  },
  toggleButton: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  toggleButtonActive: {
    backgroundColor: "#F6EFE3",
    borderWidth: 1,
    borderColor: colors.warmBrown,
  },
  toggleButtonText: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: "#374151",
  },
  toggleButtonTextActive: {
    color: colors.warmBrown,
  },
  blockedText: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: "#B91C1C",
    lineHeight: 20,
  },
  noticeCard: {
    backgroundColor: "#F8F5EF",
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  noticeTitle: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: colors.textMain,
    marginBottom: 6,
  },
  noticeText: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colors.textSub,
    lineHeight: 20,
  },
  saveButton: {
    marginTop: 6,
    height: 54,
    borderRadius: 16,
    backgroundColor: colors.warmBrown,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: colors.white,
  },
  toastWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 28,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  toast: {
    minWidth: 180,
    backgroundColor: "rgba(31, 26, 23, 0.92)",
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 12,
    alignItems: "center",
  },
  toastText: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: colors.white,
  },
});
