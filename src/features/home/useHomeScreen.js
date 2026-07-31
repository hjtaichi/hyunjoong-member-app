import { useCallback, useEffect, useRef, useState } from "react";
import { Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";

import { getMemberHome } from "../../api/memberHome";
import { getMemberCalendar } from "../../api/memberCalendar";
import { getMemberNoticeList } from "../../api/memberNotice";
import { subscribeAttendanceDataChanged } from "../../events/attendanceRefreshEvents";

export const DEBUG_HOME = false;

export function useHomeScreen({
  token,
  logout,
  isPausedMember,
  currentYear,
  currentMonth,
}) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [homeData, setHomeData] = useState(null);
  const [calendarData, setCalendarData] = useState(null);
  const [noticeList, setNoticeList] = useState([]);
  const [memberNotifications, setMemberNotifications] = useState([]);
  const didInitialLoadRef = useRef(false);
  const lastFocusRefreshRef = useRef(0);

  const loadMemberNotifications = useCallback(async () => {
    if (!token) return;

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_BASE_URL}/api/me/notifications?t=${Date.now()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (response.ok) {
        setMemberNotifications(result.data || []);
      } else {
        console.log("회원 알림 조회 실패:", result);
      }
    } catch (error) {
      console.log("회원 알림 조회 실패:", error);
    }
  }, [token]);

  const refreshScreenData = useCallback(async () => {
    if (!token) {
      if (DEBUG_HOME) {
        console.log("⏳ HOME token 아직 없음 - 요청 중단");
      }
      return;
    }

const nextCalendarDate = new Date(currentYear, currentMonth, 1);
const nextCalendarYear = nextCalendarDate.getFullYear();
const nextCalendarMonth = nextCalendarDate.getMonth() + 1;

const [homeRes, calendarRes, nextCalendarRes, noticeRes] = await Promise.all([
  getMemberHome(token),
  getMemberCalendar(token, currentYear, currentMonth),
  getMemberCalendar(token, nextCalendarYear, nextCalendarMonth),
  getMemberNoticeList(token),
]);
    if (DEBUG_HOME) {
      console.log("🔥 HOME homeRes =", homeRes);
      console.log("🔥 HOME member =", homeRes?.member);
      console.log("🔥 HOME groupProgress =", homeRes?.groupProgress);
      console.log("🔥 HOME todayClass =", homeRes?.todayClass);
      console.log("🔥 HOME calendarRes =", calendarRes);
    }

    setHomeData(homeRes);
    setCalendarData({
      ...calendarRes,
      scheduleByDate: {
        ...(calendarRes?.scheduleByDate || {}),
        ...(nextCalendarRes?.scheduleByDate || {}),
      },
    });
    setNoticeList(noticeRes || []);

    if (DEBUG_HOME) {
      console.log("✅ HOME refreshScreenData 완료");
    }
  }, [token, currentYear, currentMonth]);

  const loadAll = useCallback(
    async ({ silent = false } = {}) => {
      if (!token) {
        if (DEBUG_HOME) {
          console.log("⏳ HOME loadAll token 없음 - 대기");
        }
        setLoading(false);
        setRefreshing(false);
        return;
      }

      if (isPausedMember) {
        setLoading(false);
        setRefreshing(false);
        return;
      }

      try {
        if (!silent && !homeData && !calendarData) {
          setLoading(true);
        }

        await Promise.all([
          refreshScreenData(),
          loadMemberNotifications(),
        ]);
      } catch (error) {
        const errorMessage =
          error?.message || error?.response?.data?.message || "";

        if (
          errorMessage.includes("유효하지 않은 토큰") ||
          errorMessage.includes("인증 토큰") ||
          errorMessage.includes("퇴관") ||
          error?.response?.status === 401 ||
          error?.response?.status === 403
        ) {
          Alert.alert("로그인이 필요합니다", "다시 로그인해주세요.");
          await logout();
          router.replace("/login");
          return;
        }

        Alert.alert("오류", error.message || "홈 데이터를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [
  token,
  logout,
  refreshScreenData,
  loadMemberNotifications,
  isPausedMember,
    ]
  );

  useEffect(() => {
  if (didInitialLoadRef.current) return;

  didInitialLoadRef.current = true;
  loadAll();
}, [loadAll]);

  useEffect(() => {
    if (!token || isPausedMember) return undefined;

    return subscribeAttendanceDataChanged(() => {
      refreshScreenData().catch((error) => {
        if (DEBUG_HOME) {
          console.log("HOME attendance refresh 실패:", error);
        }
      });
    });
  }, [token, isPausedMember, refreshScreenData]);
useFocusEffect(
  useCallback(() => {
    if (!token || isPausedMember) return;

    void loadMemberNotifications();

    const now = Date.now();

    if (now - lastFocusRefreshRef.current < 3000) return;

    lastFocusRefreshRef.current = now;

    getMemberHome(token)
      .then((homeRes) => {
        setHomeData(homeRes);
      })
      .catch((error) => {
        if (DEBUG_HOME) {
          console.log("HOME focus refresh 실패:", error);
        }
      });
  }, [token, isPausedMember, loadMemberNotifications])
);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadAll({ silent: true });
  }, [loadAll]);

  return {
    loading,
    refreshing,
    homeData,
    calendarData,
    noticeList,
    memberNotifications,
    setCalendarData,
    refreshScreenData,
    onRefresh,
  };
}
