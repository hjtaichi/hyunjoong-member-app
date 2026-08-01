export function pad(n) {
  return String(n).padStart(2, "0");
}

export function toDateString(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}`;
}

export function getDateDiffInDays(fromDateString, toDateStringValue) {
  const from = new Date(`${fromDateString}T00:00:00`);
  const to = new Date(`${toDateStringValue}T00:00:00`);

  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
    return null;
  }

  const diffMs = to.getTime() - from.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}


export function getCurrentWeekDateKeys(dateString) {
  const base = new Date(`${dateString}T00:00:00Z`);

  if (Number.isNaN(base.getTime())) {
    return [];
  }

  const weekday = base.getUTCDay();
  const daysFromMonday = (weekday + 6) % 7;
  const monday = new Date(base);

  monday.setUTCDate(base.getUTCDate() - daysFromMonday);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setUTCDate(monday.getUTCDate() + index);
    return date.toISOString().slice(0, 10);
  });
}

export function getCalendarMonthKeysForDates(dateKeys = []) {
  return Array.from(
    new Set(
      (Array.isArray(dateKeys) ? dateKeys : [])
        .filter((dateKey) => /^\d{4}-\d{2}-\d{2}$/.test(String(dateKey)))
        .map((dateKey) => String(dateKey).slice(0, 7))
    )
  );
}

export function isExcludedScheduleAttendance(item) {
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

export function shouldShowWeeklyAttendedSchedule(
  item,
  { isYudanjaMember = false } = {}
) {
  if (item?.attendanceStatus !== "present") {
    return false;
  }

  if (isExcludedScheduleAttendance(item)) {
    return false;
  }

  if (isYudanjaSchedule(item) && !isYudanjaMember) {
    return false;
  }

  return true;
}

export function getMonthMatrix(year, month) {
  const firstDay = new Date(year, month - 1, 1);
  const lastDate = new Date(year, month, 0).getDate();
  const startWeekday = firstDay.getDay();

  const cells = [];

  for (let i = 0; i < startWeekday; i += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= lastDate; day += 1) {
    cells.push(new Date(year, month - 1, day));
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  return weeks;
}

const weekdayLabelMap = {
  0: "일",
  1: "월",
  2: "화",
  3: "수",
  4: "목",
  5: "금",
  6: "토",
};

export function formatRecurringTime(timeText) {
  if (!timeText) return "";
  if (String(timeText).includes("MON_YUDANJA")) return "유단자회";
  if (String(timeText).includes("10")) return "10시";
  if (String(timeText).includes("16") || String(timeText).includes("4")) return "4시";
  if (String(timeText).includes("19") || String(timeText).includes("7")) return "7시";
  if (String(timeText).includes("13") || String(timeText).includes("1:30")) return "1시 30분";

  return String(timeText);
}

export function formatRecurringReservations(list = []) {
  if (!Array.isArray(list) || list.length === 0) return "";

  return list
    .map((item) => {
      const weekday =
        item.weekday ??
        item.dayOfWeek ??
        item.weekDay ??
        item.day;

      const dayLabel =
        typeof weekday === "number"
          ? weekdayLabelMap[weekday]
          : String(weekday || "");

      const timeLabel = formatRecurringTime(
        item.sessionTimeKey ||
          item.time ||
          item.startTime ||
          item.classTime ||
          item.sessionTime
      );

      if (!dayLabel || !timeLabel) return null;

      return `${dayLabel}(${timeLabel})`;
    })
    .filter(Boolean)
    .join(" · ");
}

export function getSessionDisplayLabel(item) {
  const title = item?.title || item?.name || "";
  const className = item?.className || "";

  if (title.includes("유단자") || className.includes("유단자")) {
    return "유단자수련";
  }

  const startText = item?.startTime || "";

  if (startText.includes("오전 10:00")) return "오전 10시 수업";
  if (startText.includes("오후 4:00")) return "오후 4시 수업";
  if (startText.includes("오후 7:00")) return "오후 7시 수업";
  if (startText.includes("오후 1:30")) return "오후 1시 30분 수업";

  const regularTitles = [
    "오전 10시 태극권반",
    "오후 4시 태극권반",
    "오후 7시 태극권반",
    "토요 1시 30분 태극권반",
    "현중태극권 수업",
  ];

  const isRegularTitle = regularTitles.some((text) => title.includes(text));

  if (title && !isRegularTitle) {
    return title;
  }

  return item?.timeLabel || title || "수업";
}

export function isSpecialScheduleNotice(item) {
  const text = [
    item?.title,
    item?.name,
    item?.className,
    item?.topicTitle,
    item?.description,
  ]
    .filter(Boolean)
    .join(" ");

  return ["세미나", "행사", "특강", "워크숍", "워크샵"].some((keyword) =>
    text.includes(keyword)
  );
}

export function isYudanjaSchedule(item) {
  const title = String(item?.title || item?.name || "");
  const className = String(item?.className || "");
  const sessionTimeKey = String(
    item?.sessionTimeKey ||
      item?.recurringMeta?.sessionTimeKey ||
      item?.recurringMeta?.matchedSessionTimeKey ||
      ""
  );

  return (
    title.includes("유단자") ||
    className.includes("유단자") ||
    sessionTimeKey === "MON_YUDANJA"
  );
}

export function shouldShowSelectedSchedule(
  item,
  { dateDiff, isYudanjaMember = false }
) {
  if (dateDiff === null || dateDiff === undefined) {
    return false;
  }

  const isPresent = item?.attendanceStatus === "present";
  const isSpecial = isSpecialScheduleNotice(item);
  const isYudanjaItem =
    isYudanjaSchedule(item);
  const isVisibleYudanja =
    isYudanjaMember && isYudanjaItem;

  if (dateDiff < 0) {
    return isPresent || isSpecial;
  }

  if (dateDiff === 0) {
    if (isYudanjaItem) {
      return isVisibleYudanja;
    }

    return true;
  }

  return isSpecial || isVisibleYudanja;
}

export function shouldOpenScheduleBottomSheet({
  dateDiff,
  dayInfo,
  schedules = [],
  isYudanjaMember = false,
}) {
  if (dateDiff === null || dateDiff === undefined || dateDiff < 0) {
    return false;
  }

  const isHoliday = dayInfo?.isHoliday === true;
  const isOpenHoliday = dayInfo?.isOpenHoliday === true;

  if (isHoliday) {
    return isOpenHoliday && dateDiff === 0 && schedules.length > 0;
  }

  return schedules.some((item) =>
    shouldShowSelectedSchedule(item, {
      dateDiff,
      isYudanjaMember,
    })
  );
}

export function getScheduleUiMeta(item, { isReservableDate }) {
  const attendanceStatus = item?.attendanceStatus || null;
  const recurringMeta = item?.recurringMeta || {};
  const isYudanja = isYudanjaSchedule(item);

  const hasMatchedRecurringRule =
    recurringMeta?.matchedRecurringRule === true &&
    !!recurringMeta?.memberRecurringReservationId;

  const hasRecurringException =
    recurringMeta?.hasRecurringException === true &&
    !!recurringMeta?.memberRecurringReservationId;

  const isRecurringReserved =
    attendanceStatus === "reserved" &&
    recurringMeta?.isRecurring === true &&
    !hasRecurringException;

  const isManualReserved =
    attendanceStatus === "reserved" &&
    recurringMeta?.isRecurring !== true;

  const canUndoSkip =
    isReservableDate &&
    hasRecurringException &&
    item?.canReserve !== false;

  const canCancelReservation = item?.canCancelReservation === true;

  const canSkipOnce =
    isReservableDate &&
    isRecurringReserved &&
    !hasRecurringException &&
    canCancelReservation;

  const canCancelReserve =
    isReservableDate &&
    isManualReserved &&
    !hasRecurringException &&
    canCancelReservation;

  const canReserve =
    isReservableDate &&
    !attendanceStatus &&
    !hasRecurringException &&
    item?.canReserve !== false;

  const canCancelAttendance = item?.canCancelAttendance === true;

  if (attendanceStatus === "present") {
    return {
      tone: "done",
      label: "출석 완료",
      helperText: canCancelAttendance
        ? "출석 후 10분 이내에는 취소할 수 있어요."
        : item?.cancelAttendanceReason || null,
      actionLabel: canCancelAttendance ? "출석 취소" : null,
      actionType: canCancelAttendance ? "cancelAttendance" : null,
      isRecurring: isYudanja && hasMatchedRecurringRule,
      isYudanja,
    };
  }

  // 일반 수업은 수업 자체만 표시하고 예약 상태·예약 동작은 감춥니다.
  if (!isYudanja) {
    return {
      tone: "plain",
      label: null,
      helperText: null,
      actionLabel: null,
      actionType: null,
      isRecurring: false,
      isYudanja: false,
    };
  }

  if (hasRecurringException) {
    return {
      tone: canUndoSkip ? "available" : "disabled",
      label: canUndoSkip ? "예약 가능" : "이번만 쉬기",
      helperText: canUndoSkip ? null : item?.reserveBlockedReason || null,
      actionLabel: canUndoSkip ? "출석 예정" : null,
      actionType: canUndoSkip ? "undoSkip" : null,
      isRecurring: false,
      isYudanja: true,
    };
  }

  if (isRecurringReserved) {
    return {
      tone: "reserved",
      label: "정기출석 예정",
      helperText: canSkipOnce
        ? "유단자회 정기예약으로 자동 등록된 수련입니다."
        : item?.cancelReservationReason || null,
      actionLabel: canSkipOnce ? "이번만 쉬기" : null,
      actionType: canSkipOnce ? "skipOnce" : null,
      isRecurring: true,
      isYudanja: true,
    };
  }

  if (isManualReserved) {
    return {
      tone: "reserved",
      label: "출석 예정",
      helperText: canCancelReserve ? null : item?.cancelReservationReason || null,
      actionLabel: canCancelReserve ? "예약 취소" : null,
      actionType: canCancelReserve ? "cancelReserve" : null,
      isRecurring: false,
      isYudanja: true,
    };
  }

  if (canReserve) {
    return {
      tone: "available",
      label: "예약 가능",
      helperText: null,
      actionLabel: "출석 예정",
      actionType: "reserve",
      isRecurring: hasMatchedRecurringRule,
      isYudanja: true,
    };
  }

  return {
    tone: "disabled",
    label: attendanceStatus === "absent" ? "결석" : "예약 불가",
    helperText:
      item?.reserveBlockedReason ||
      item?.cancelAttendanceReason ||
      (isReservableDate ? null : "예약 가능 기간이 아닙니다."),
    actionLabel: null,
    actionType: null,
    isRecurring: hasMatchedRecurringRule,
    isYudanja: true,
  };
}

export function getScheduleCardStyle(styles, tone) {
  switch (tone) {
    case "plain":
      return {
        container: null,
        chip: null,
        chipText: null,
      };
    case "done":
      return {
        container: styles.scheduleCardDone,
        chip: styles.scheduleStatusChipDone,
        chipText: styles.scheduleStatusChipTextDone,
      };
    case "reserved":
      return {
        container: styles.scheduleCardReserved,
        chip: styles.scheduleStatusChipReserved,
        chipText: styles.scheduleStatusChipTextReserved,
      };
    case "available":
      return {
        container: styles.scheduleCardAvailable,
        chip: styles.scheduleStatusChipAvailable,
        chipText: styles.scheduleStatusChipTextAvailable,
      };
    case "cancelled":
      return {
        container: styles.scheduleCardCancelled,
        chip: styles.scheduleStatusChipCancelled,
        chipText: styles.scheduleStatusChipTextCancelled,
      };
    default:
      return {
        container: styles.scheduleCardDisabled,
        chip: styles.scheduleStatusChipDisabled,
        chipText: styles.scheduleStatusChipTextDisabled,
      };
  }
}
