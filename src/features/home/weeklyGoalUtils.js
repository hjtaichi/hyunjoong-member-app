const MIN_GOAL = 1;
const MAX_GOAL = 5;
const KOREA_OFFSET_MS = 9 * 60 * 60 * 1000;

function clampGoal(value) {
  const number = Number(value);

  if (!Number.isInteger(number)) {
    return null;
  }

  if (number < MIN_GOAL || number > MAX_GOAL) {
    return null;
  }

  return number;
}

function toUtcDate(dateKey) {
  const date = new Date(`${dateKey}T00:00:00Z`);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function addDateKeyDays(dateKey, days) {
  const date = toUtcDate(dateKey);

  if (!date) {
    return null;
  }

  date.setUTCDate(date.getUTCDate() + Number(days || 0));
  return date.toISOString().slice(0, 10);
}

export function getKoreaDateKey(date = new Date()) {
  const shifted = new Date(date.getTime() + KOREA_OFFSET_MS);
  return shifted.toISOString().slice(0, 10);
}

export function getKoreaWeekRange(date = new Date()) {
  const dateKey =
    typeof date === "string"
      ? date
      : getKoreaDateKey(date);

  const utcDate = toUtcDate(dateKey);

  if (!utcDate) {
    return {
      weekKey: null,
      startDate: null,
      endDate: null,
      nextWeekKey: null,
    };
  }

  const weekday = utcDate.getUTCDay();
  const daysFromMonday = (weekday + 6) % 7;
  const startDate = addDateKeyDays(dateKey, -daysFromMonday);
  const endDate = addDateKeyDays(startDate, 6);
  const nextWeekKey = addDateKeyDays(startDate, 7);

  return {
    weekKey: startDate,
    startDate,
    endDate,
    nextWeekKey,
  };
}

export function getWeekMonthKeys(startDate, endDate) {
  return Array.from(
    new Set(
      [startDate, endDate]
        .filter(Boolean)
        .map((dateKey) => dateKey.slice(0, 7)),
    ),
  );
}

export function isYudanjaWeeklyGoalSchedule(item) {
  const title = String(item?.title || item?.name || "");
  const className = String(item?.className || "");
  const sessionTimeKey = String(
    item?.sessionTimeKey ||
      item?.recurringMeta?.sessionTimeKey ||
      item?.recurringMeta?.matchedSessionTimeKey ||
      "",
  );

  return (
    title.includes("유단자") ||
    className.includes("유단자") ||
    sessionTimeKey === "MON_YUDANJA"
  );
}

export function isExcludedWeeklyGoalAttendance(item) {
  const excludedFlag =
    item?.isAdminAdjustment === true ||
    item?.isAdminAdjusted === true ||
    item?.isAttendanceAdjustment === true ||
    item?.isSecretAttendance === true ||
    item?.isHiddenAttendance === true ||
    item?.attendance?.isAdminAdjustment === true ||
    item?.attendance?.isSecretAttendance === true;

  if (excludedFlag) {
    return true;
  }

  const sourceText = [
    item?.attendanceSource,
    item?.attendance?.source,
    item?.attendanceType,
    item?.recordSource,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return [
    "admin_adjustment",
    "admin-adjustment",
    "secret_attendance",
    "secret-attendance",
    "attendance_adjustment",
    "attendance-adjustment",
    "보정출석",
    "비밀출석",
  ].some((keyword) => sourceText.includes(keyword));
}

export function countWeeklyGeneralAttendance(
  scheduleByDate,
  {
    startDate,
    endDate,
  },
) {
  if (!startDate || !endDate) {
    return 0;
  }

  const source =
    scheduleByDate && typeof scheduleByDate === "object"
      ? scheduleByDate
      : {};

  const countedSessions = new Set();
  let count = 0;

  Object.entries(source).forEach(([dateKey, schedules]) => {
    if (dateKey < startDate || dateKey > endDate) {
      return;
    }

    (Array.isArray(schedules) ? schedules : []).forEach((item, index) => {
      if (item?.attendanceStatus !== "present") {
        return;
      }

      if (
        isYudanjaWeeklyGoalSchedule(item) ||
        isExcludedWeeklyGoalAttendance(item)
      ) {
        return;
      }

      const attendanceIdentity = String(
        item?.attendanceId ||
          item?.memberAttendanceId ||
          "",
      );
      const sessionIdentity = String(
        item?.classSessionId ||
          item?.sessionId ||
          item?.id ||
          "",
      );
      const timeIdentity = String(
        item?.startDateTime ||
          item?.startTime ||
          item?.timeLabel ||
          item?.title ||
          index,
      );
      const sessionKey = attendanceIdentity
        ? [
            dateKey,
            "attendance",
            attendanceIdentity,
          ].join("|")
        : [
            dateKey,
            "session",
            sessionIdentity,
            timeIdentity,
          ].join("|");

      if (countedSessions.has(sessionKey)) {
        return;
      }

      countedSessions.add(sessionKey);
      count += 1;
    });
  });

  return count;
}

function normalizeWeekRecord(record, recurringGoal) {
  const goal = clampGoal(record?.goal);
  const isRestWeek = record?.isRestWeek === true;
  const mode = isRestWeek
    ? "rest"
    : ["recurring", "one-time", "unset"].includes(record?.mode)
      ? record.mode
      : goal
        ? "recurring"
        : "unset";

  return {
    goal: isRestWeek ? null : goal,
    mode,
    isRestWeek,
    attendanceCount: Math.max(0, Number(record?.attendanceCount || 0)),
    completedAt:
      typeof record?.completedAt === "string"
        ? record.completedAt
        : null,
    createdAt:
      typeof record?.createdAt === "string"
        ? record.createdAt
        : null,
    updatedAt:
      typeof record?.updatedAt === "string"
        ? record.updatedAt
        : null,
    autoResumedAt:
      typeof record?.autoResumedAt === "string"
        ? record.autoResumedAt
        : null,
    baseRecurringGoal:
      clampGoal(record?.baseRecurringGoal) || recurringGoal || null,
  };
}

export function normalizeWeeklyGoalState(rawState) {
  const recurringGoal = clampGoal(rawState?.recurringGoal);
  const pendingRecurringGoal = clampGoal(
    rawState?.pendingRecurringGoal,
  );
  const pendingRecurringWeekKey =
    typeof rawState?.pendingRecurringWeekKey === "string"
      ? rawState.pendingRecurringWeekKey
      : null;

  const rawWeeks =
    rawState?.weeks && typeof rawState.weeks === "object"
      ? rawState.weeks
      : {};

  const weeks = {};

  Object.entries(rawWeeks).forEach(([weekKey, record]) => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(weekKey)) {
      weeks[weekKey] = normalizeWeekRecord(
        record,
        recurringGoal,
      );
    }
  });

  return {
    version: 1,
    recurringGoal,
    pendingRecurringGoal,
    pendingRecurringWeekKey,
    weeks,
  };
}

export function hasConfiguredWeeklyGoalState(rawState) {
  const state = normalizeWeeklyGoalState(rawState);

  return Boolean(
    state.recurringGoal ||
      state.pendingRecurringGoal ||
      Object.values(state.weeks).some(
        (record) =>
          record?.goal ||
          record?.isRestWeek,
      )
  );
}

function reconcileCompletion(record, attendanceCount, nowIso) {
  const next = {
    ...record,
    attendanceCount: Math.max(0, Number(attendanceCount || 0)),
    updatedAt: nowIso,
  };

  const completed =
    !next.isRestWeek &&
    next.goal != null &&
    next.attendanceCount >= next.goal;

  return {
    ...next,
    completedAt: completed
      ? next.completedAt || nowIso
      : null,
  };
}

function pruneWeeks(weeks) {
  const keys = Object.keys(weeks).sort();

  if (keys.length <= 104) {
    return weeks;
  }

  return keys.slice(-104).reduce((result, key) => {
    result[key] = weeks[key];
    return result;
  }, {});
}

export function resolveCurrentWeeklyGoalState(
  rawState,
  {
    weekKey,
    attendanceCount,
    nowIso = new Date().toISOString(),
  },
) {
  const state = normalizeWeeklyGoalState(rawState);

  if (
    state.pendingRecurringGoal &&
    state.pendingRecurringWeekKey &&
    state.pendingRecurringWeekKey <= weekKey
  ) {
    state.recurringGoal = state.pendingRecurringGoal;
    state.pendingRecurringGoal = null;
    state.pendingRecurringWeekKey = null;
  }

  let record = state.weeks[weekKey];

  if (!record) {
    record = normalizeWeekRecord(
      {
        goal: state.recurringGoal,
        mode: state.recurringGoal ? "recurring" : "unset",
        isRestWeek: false,
        createdAt: nowIso,
        baseRecurringGoal: state.recurringGoal,
      },
      state.recurringGoal,
    );
  }

  let autoResumed = false;

  if (record.isRestWeek && attendanceCount > 0) {
    record = {
      ...record,
      goal: state.recurringGoal,
      mode: state.recurringGoal ? "recurring" : "unset",
      isRestWeek: false,
      autoResumedAt: nowIso,
    };
    autoResumed = true;
  }

  record = reconcileCompletion(
    record,
    attendanceCount,
    nowIso,
  );

  state.weeks = pruneWeeks({
    ...state.weeks,
    [weekKey]: record,
  });

  return {
    state,
    record,
    autoResumed,
  };
}

function requireGoal(value) {
  const goal = clampGoal(value);

  if (!goal) {
    throw new Error("목표 횟수는 1회부터 5회까지 선택해주세요.");
  }

  return goal;
}

function getCurrentRecord(state, weekKey) {
  return (
    state.weeks[weekKey] ||
    normalizeWeekRecord(
      {
        goal: state.recurringGoal,
        mode: state.recurringGoal ? "recurring" : "unset",
      },
      state.recurringGoal,
    )
  );
}

export function applyCurrentWeekGoal(
  rawState,
  {
    weekKey,
    attendanceCount,
    goal: goalValue,
    nowIso = new Date().toISOString(),
  },
) {
  const goal = requireGoal(goalValue);
  const state = normalizeWeeklyGoalState(rawState);
  const current = getCurrentRecord(state, weekKey);
  const currentGoal = clampGoal(current.goal);

  if (attendanceCount > 0) {
    if (currentGoal && goal <= currentGoal) {
      throw new Error(
        "출석을 시작한 뒤에는 이번 주 목표를 높이는 것만 가능합니다.",
      );
    }

    if (!currentGoal && goal <= attendanceCount) {
      throw new Error(
        "이미 출석한 횟수보다 높은 목표를 선택해주세요.",
      );
    }
  }

  const nextRecord = reconcileCompletion(
    {
      ...current,
      goal,
      mode: "one-time",
      isRestWeek: false,
    },
    attendanceCount,
    nowIso,
  );

  state.weeks = pruneWeeks({
    ...state.weeks,
    [weekKey]: nextRecord,
  });

  return {
    state,
    record: nextRecord,
    message: `이번 주 목표를 ${goal}회로 설정했어요.`,
  };
}

export function applyRecurringGoal(
  rawState,
  {
    weekKey,
    nextWeekKey,
    attendanceCount,
    goal: goalValue,
    nowIso = new Date().toISOString(),
  },
) {
  const goal = requireGoal(goalValue);
  const state = normalizeWeeklyGoalState(rawState);
  const current = getCurrentRecord(state, weekKey);
  const currentGoal = clampGoal(current.goal);

  const canApplyThisWeek =
    attendanceCount === 0 ||
    (currentGoal && goal >= currentGoal) ||
    (!currentGoal && goal > attendanceCount);

  if (!canApplyThisWeek) {
    state.pendingRecurringGoal = goal;
    state.pendingRecurringWeekKey = nextWeekKey;

    return {
      state,
      record: current,
      message: `매주 ${goal}회 목표는 다음 주부터 적용돼요.`,
      appliesFromNextWeek: true,
    };
  }

  state.recurringGoal = goal;
  state.pendingRecurringGoal = null;
  state.pendingRecurringWeekKey = null;

  const nextRecord = reconcileCompletion(
    {
      ...current,
      goal,
      mode: "recurring",
      isRestWeek: false,
      baseRecurringGoal: goal,
    },
    attendanceCount,
    nowIso,
  );

  state.weeks = pruneWeeks({
    ...state.weeks,
    [weekKey]: nextRecord,
  });

  return {
    state,
    record: nextRecord,
    message: `매주 ${goal}회 목표로 설정했어요.`,
    appliesFromNextWeek: false,
  };
}

export function applyRestWeek(
  rawState,
  {
    weekKey,
    attendanceCount,
    nowIso = new Date().toISOString(),
  },
) {
  if (attendanceCount > 0) {
    throw new Error(
      "일반수련에 출석하기 전까지만 쉬는 주를 설정할 수 있어요.",
    );
  }

  const state = normalizeWeeklyGoalState(rawState);
  const current = getCurrentRecord(state, weekKey);

  const nextRecord = {
    ...current,
    goal: null,
    mode: "rest",
    isRestWeek: true,
    attendanceCount: 0,
    completedAt: null,
    updatedAt: nowIso,
  };

  state.weeks = pruneWeeks({
    ...state.weeks,
    [weekKey]: nextRecord,
  });

  return {
    state,
    record: nextRecord,
    message: "이번 주를 쉬는 주로 설정했어요.",
  };
}

export function buildWeeklyGoalSummary({
  record,
  recurringGoal,
  pendingRecurringGoal,
  attendanceCount,
  loading = false,
}) {
  if (loading) {
    return {
      loading: true,
      isConfigured: false,
      isRestWeek: false,
      attendanceCount: 0,
      goal: null,
      title: "이번 주 출석 목표",
      valueText: "불러오는 중",
      helperText: null,
    };
  }

  if (record?.isRestWeek) {
    return {
      loading: false,
      isConfigured: true,
      isRestWeek: true,
      attendanceCount,
      goal: null,
      title: "이번 주 출석 목표",
      valueText: "쉬는 주",
      helperText: recurringGoal
        ? `다음 주부터 매주 ${recurringGoal}회 목표가 다시 시작됩니다.`
        : "다음 주 목표는 아직 설정되지 않았어요.",
    };
  }

  const goal = clampGoal(record?.goal);

  if (!goal) {
    return {
      loading: false,
      isConfigured: false,
      isRestWeek: false,
      attendanceCount,
      goal: null,
      title: "이번 주 출석 목표",
      valueText: "설정",
      helperText: "이번 주 목표를 설정해주세요.",
    };
  }

  const remaining = Math.max(0, goal - attendanceCount);
  const isCompleted = attendanceCount >= goal;

  return {
    loading: false,
    isConfigured: true,
    isRestWeek: false,
    attendanceCount,
    goal,
    isCompleted,
    title: "이번 주 출석 목표",
    valueText: `${attendanceCount} / ${goal}회`,
    helperText: isCompleted
      ? "이번 주 목표를 달성했어요."
      : `목표까지 ${remaining}회 남았어요.`,
    pendingText: pendingRecurringGoal
      ? `다음 주부터 매주 ${pendingRecurringGoal}회`
      : null,
  };
}

export const WEEKLY_GOAL_MIN = MIN_GOAL;
export const WEEKLY_GOAL_MAX = MAX_GOAL;
