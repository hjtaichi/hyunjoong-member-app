import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useFocusEffect } from "@react-navigation/native";

import { getMemberCalendar } from "../../api/memberCalendar";
import {
  getMemberWeeklyGoal,
  importMemberWeeklyGoalState,
  saveMemberWeeklyGoalSettings,
} from "../../api/memberWeeklyGoal";
import { subscribeAttendanceDataChanged } from "../../events/attendanceRefreshEvents";
import {
  hasSeenPreviousWeekAchievement,
  loadWeeklyGoalState,
  markPreviousWeekAchievementSeen,
  saveWeeklyGoalState,
} from "./weeklyGoalStorage";
import {
  applyCurrentWeekGoal,
  applyRecurringGoal,
  applyRestWeek,
  buildWeeklyGoalSummary,
  countWeeklyGeneralAttendance,
  getKoreaWeekRange,
  getPreviousKoreaWeekRange,
  getPreviousWeekAchievementStreak,
  getPreviousWeekAchievementCarryoverStreak,
  getWeekMonthKeys,
  hasConfiguredWeeklyGoalState,
  resolveCurrentWeeklyGoalState,
  resolvePreviousWeekGoalAchievement,
} from "./weeklyGoalUtils";

function splitMonthKey(monthKey) {
  const [year, month] = String(monthKey)
    .split("-")
    .map(Number);

  return {
    year,
    month,
  };
}

export function useWeeklyGoal({
  token,
  memberKey,
  enabled = true,
}) {
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState(null);
  const [attendanceCount, setAttendanceCount] =
    useState(0);
  const [autoResumeMessage, setAutoResumeMessage] =
    useState(null);
  const [
    previousWeekAchievement,
    setPreviousWeekAchievement,
  ] = useState(null);
  const [
    previousWeekAchievementPopup,
    setPreviousWeekAchievementPopup,
  ] = useState(null);
  const loadSequenceRef = useRef(0);

  const [weekRange, setWeekRange] =
    useState(() =>
      getKoreaWeekRange(new Date()),
    );

  const applyPreviousWeekAchievement =
    useCallback(
      async (
        achievement,
        currentWeekKey,
      ) => {
        const achieved =
          achievement?.achieved === true
            ? achievement
            : null;

        setPreviousWeekAchievement(
          achieved,
        );

        if (
          !achieved ||
          !memberKey ||
          !currentWeekKey
        ) {
          return;
        }

        try {
          const alreadySeen =
            await hasSeenPreviousWeekAchievement(
              memberKey,
              currentWeekKey,
            );

          if (alreadySeen) {
            return;
          }

          await markPreviousWeekAchievementSeen(
            memberKey,
            currentWeekKey,
          );

          setPreviousWeekAchievementPopup(
            achieved,
          );
        } catch (error) {
          console.log(
            "지난주 목표 달성 팝업 상태 저장 실패:",
            error,
          );
        }
      },
      [memberKey],
    );

  const applySnapshot = useCallback(
    async (snapshot) => {
      const normalizedState =
        await saveWeeklyGoalState(
          memberKey,
          snapshot?.state,
        );

      setState(normalizedState);
      setAttendanceCount(
        Math.max(
          0,
          Number(
            snapshot?.attendanceCount || 0,
          ),
        ),
      );

      await applyPreviousWeekAchievement(
        snapshot?.previousWeekAchievement ||
          null,
        snapshot?.weekRange?.weekKey ||
          weekRange.weekKey,
      );

      if (snapshot?.autoResumed) {
        setAutoResumeMessage(
          "일반수련에 출석해 이번 주 목표가 다시 시작됐어요.",
        );
      }

      return normalizedState;
    },
    [
      memberKey,
      weekRange.weekKey,
      applyPreviousWeekAchievement,
    ],
  );

  const persistResolvedLocalState = useCallback(
    async (
      rawState,
      nextAttendanceCount,
      previousAttendanceCount = null,
    ) => {
      const resolved = resolveCurrentWeeklyGoalState(
        rawState,
        {
          weekKey: weekRange.weekKey,
          attendanceCount: nextAttendanceCount,
        },
      );
      const previousWeekRange =
        getPreviousKoreaWeekRange(
          weekRange.weekKey,
        );
      const storedPreviousAttendanceCount =
        Math.max(
          0,
          Number(
            resolved.state?.weeks?.[
              previousWeekRange.weekKey
            ]?.attendanceCount || 0,
          ),
        );
      const previousResolved =
        resolvePreviousWeekGoalAchievement(
          resolved.state,
          {
            weekRange:
              previousWeekRange,
            attendanceCount:
              previousAttendanceCount == null
                ? storedPreviousAttendanceCount
                : previousAttendanceCount,
          },
        );

      const saved = await saveWeeklyGoalState(
        memberKey,
        previousResolved.state,
      );

      setState(saved);
      setAttendanceCount(nextAttendanceCount);

      await applyPreviousWeekAchievement(
        previousResolved.achievement,
        weekRange.weekKey,
      );

      if (resolved.autoResumed) {
        setAutoResumeMessage(
          "일반수련에 출석해 이번 주 목표가 다시 시작됐어요.",
        );
      }

      return saved;
    },
    [
      memberKey,
      weekRange.weekKey,
      applyPreviousWeekAchievement,
    ],
  );

  const loadFallbackFromCalendar = useCallback(
    async (storedState) => {
      const previousWeekRange =
        getPreviousKoreaWeekRange(
          weekRange.weekKey,
        );
      const monthKeys = Array.from(
        new Set([
          ...getWeekMonthKeys(
            weekRange.startDate,
            weekRange.endDate,
          ),
          ...getWeekMonthKeys(
            previousWeekRange.startDate,
            previousWeekRange.endDate,
          ),
        ]),
      );

      const calendarResponses = await Promise.all(
        monthKeys.map((monthKey) => {
          const { year, month } =
            splitMonthKey(monthKey);

          return getMemberCalendar(
            token,
            year,
            month,
          );
        }),
      );

      const scheduleByDate = calendarResponses.reduce(
        (result, response) => ({
          ...result,
          ...(response?.scheduleByDate || {}),
        }),
        {},
      );

      const nextAttendanceCount =
        countWeeklyGeneralAttendance(
          scheduleByDate,
          weekRange,
        );
      const previousAttendanceCount =
        countWeeklyGeneralAttendance(
          scheduleByDate,
          previousWeekRange,
        );

      return persistResolvedLocalState(
        storedState,
        nextAttendanceCount,
        previousAttendanceCount,
      );
    },
    [
      token,
      weekRange,
      persistResolvedLocalState,
    ],
  );

  const load = useCallback(async () => {
    if (!enabled || !token || !memberKey) {
      setLoading(false);
      return;
    }

    const sequence = loadSequenceRef.current + 1;
    loadSequenceRef.current = sequence;

    try {
      setLoading(true);

      const storedState =
        await loadWeeklyGoalState(memberKey);

      try {
        let snapshot =
          await getMemberWeeklyGoal(token);

        if (
          snapshot?.hasServerState === false &&
          snapshot?.hasConfiguredGoal !== true &&
          hasConfiguredWeeklyGoalState(
            storedState,
          )
        ) {
          snapshot =
            await importMemberWeeklyGoalState(
              token,
              storedState,
            );
        }

        if (
          loadSequenceRef.current !== sequence
        ) {
          return;
        }

        await applySnapshot(snapshot);
        return;
      } catch (serverError) {
        console.log(
          "주간 목표 서버 동기화 실패, 로컬 데이터로 계속합니다:",
          serverError,
        );
      }

      if (
        loadSequenceRef.current !== sequence
      ) {
        return;
      }

      await loadFallbackFromCalendar(
        storedState,
      );
    } catch (error) {
      console.log(
        "주간 목표 불러오기 실패:",
        error,
      );

      try {
        const storedState =
          await loadWeeklyGoalState(memberKey);
        const storedAttendanceCount = Math.max(
          0,
          Number(
            storedState?.weeks?.[
              weekRange.weekKey
            ]?.attendanceCount || 0,
          ),
        );

        await persistResolvedLocalState(
          storedState,
          storedAttendanceCount,
        );
      } catch {
        setState(null);
        setAttendanceCount(0);
      }
    } finally {
      if (
        loadSequenceRef.current === sequence
      ) {
        setLoading(false);
      }
    }
  }, [
    enabled,
    token,
    memberKey,
    weekRange,
    applySnapshot,
    loadFallbackFromCalendar,
    persistResolvedLocalState,
  ]);

  useEffect(() => {
    void load();
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      const nextWeekRange =
        getKoreaWeekRange(new Date());

      if (
        nextWeekRange.weekKey !==
        weekRange.weekKey
      ) {
        setWeekRange(
          nextWeekRange,
        );
      }

      return undefined;
    }, [weekRange.weekKey]),
  );

  useFocusEffect(
    useCallback(() => {
      if (!enabled || !token || !memberKey) {
        return undefined;
      }

      void load();
      return undefined;
    }, [enabled, token, memberKey, load]),
  );

  useEffect(() => {
    if (!enabled || !token || !memberKey) {
      return undefined;
    }

    return subscribeAttendanceDataChanged(() => {
      void load();
    });
  }, [enabled, token, memberKey, load]);

  const currentRecord =
    state?.weeks?.[weekRange.weekKey] || null;

  const summary = useMemo(
    () =>
      buildWeeklyGoalSummary({
        record: currentRecord,
        recurringGoal: state?.recurringGoal,
        pendingRecurringGoal:
          state?.pendingRecurringGoal,
        attendanceCount,
        loading,
      }),
    [
      currentRecord,
      state?.recurringGoal,
      state?.pendingRecurringGoal,
      attendanceCount,
      loading,
    ],
  );

  const saveSettingsLocally = useCallback(
    async ({
      currentGoal,
      isRestWeek,
      recurringGoal,
      currentChanged,
      recurringChanged,
    }) => {
      let nextState =
        state ||
        (await loadWeeklyGoalState(
          memberKey,
        ));
      const messages = [];

      if (recurringChanged) {
        const recurringResult =
          applyRecurringGoal(
            nextState,
            {
              weekKey:
                weekRange.weekKey,
              nextWeekKey:
                weekRange.nextWeekKey,
              attendanceCount,
              goal: recurringGoal,
            },
          );

        nextState =
          recurringResult.state;
        messages.push(
          recurringResult.message,
        );
      }

      if (currentChanged) {
        const currentResult = isRestWeek
          ? applyRestWeek(nextState, {
              weekKey:
                weekRange.weekKey,
              attendanceCount,
            })
          : applyCurrentWeekGoal(
              nextState,
              {
                weekKey:
                  weekRange.weekKey,
                attendanceCount,
                goal: currentGoal,
              },
            );

        nextState =
          currentResult.state;
        messages.push(
          currentResult.message,
        );
      }

      const saved =
        await saveWeeklyGoalState(
          memberKey,
          nextState,
        );

      setState(saved);

      return {
        state: saved,
        message:
          messages.length > 1
            ? "주간 목표 설정을 저장했어요."
            : messages[0] ||
              "주간 목표 설정을 저장했어요.",
      };
    },
    [
      state,
      memberKey,
      weekRange.weekKey,
      weekRange.nextWeekKey,
      attendanceCount,
    ],
  );

  const saveSettings = useCallback(
    async (payload) => {
      if (!memberKey) {
        throw new Error(
          "회원 정보를 확인할 수 없습니다.",
        );
      }

      if (
        !payload?.currentChanged &&
        !payload?.recurringChanged
      ) {
        return {
          state,
          message: "변경된 목표가 없습니다.",
        };
      }

      try {
        const snapshot =
          await saveMemberWeeklyGoalSettings(
            token,
            payload,
          );

        const saved =
          await applySnapshot(snapshot);

        return {
          state: saved,
          message:
            snapshot?.message ||
            "주간 목표 설정을 저장했어요.",
        };
      } catch (serverError) {
        console.log(
          "주간 목표 서버 저장 실패, 로컬에 임시 저장합니다:",
          serverError,
        );

        return saveSettingsLocally(payload);
      }
    },
    [
      memberKey,
      state,
      token,
      applySnapshot,
      saveSettingsLocally,
    ],
  );

  const previousWeekAchievementStreak = useMemo(
    () =>
      previousWeekAchievement?.achieved === true
        ? getPreviousWeekAchievementStreak(
            state,
            previousWeekAchievement.weekKey,
          )
        : 0,
    [
      state,
      previousWeekAchievement,
    ],
  );

  const previousWeekAchievementCarryoverStreak =
    useMemo(
      () =>
        previousWeekAchievement?.achieved === true
          ? getPreviousWeekAchievementCarryoverStreak(
              state,
              previousWeekAchievement.weekKey,
            )
          : 0,
      [
        state,
        previousWeekAchievement,
      ],
    );

  const previousWeekAchievementStreakSeasonContinues =
    useMemo(() => {
      const previousWeekMonthKey =
        previousWeekAchievement?.weekKey
          ?.slice(0, 7);
      const currentWeekMonthKey =
        weekRange.weekKey?.slice(0, 7);

      return Boolean(
        previousWeekMonthKey &&
          currentWeekMonthKey &&
          previousWeekMonthKey ===
            currentWeekMonthKey,
      );
    }, [
      previousWeekAchievement,
      weekRange.weekKey,
    ]);

  const clearPreviousWeekAchievementPopup =
    useCallback(() => {
      setPreviousWeekAchievementPopup(
        null,
      );
    }, []);

  return {
    loading,
    summary,
    attendanceCount,
    currentGoal:
      currentRecord?.goal || null,
    currentMode:
      currentRecord?.mode || "unset",
    isRestWeek:
      currentRecord?.isRestWeek === true,
    recurringGoal:
      state?.recurringGoal || null,
    pendingRecurringGoal:
      state?.pendingRecurringGoal || null,
    autoResumeMessage,
    clearAutoResumeMessage: () =>
      setAutoResumeMessage(null),
    previousWeekAchievement,
    previousWeekAchievementStreak,
    previousWeekAchievementCarryoverStreak,
    previousWeekAchievementStreakSeasonContinues,
    previousWeekAchievementPopup,
    clearPreviousWeekAchievementPopup,
    saveSettings,
    refresh: load,
  };
}
