export const ALL_TRIAL_TIME_OPTIONS = Object.freeze([
  Object.freeze({
    label: "오전 10시",
    value: "10:00",
  }),
  Object.freeze({
    label: "13시 30분(토)",
    value: "13:30",
  }),
  Object.freeze({
    label: "오후 4시",
    value: "16:00",
  }),
  Object.freeze({
    label: "오후 7시",
    value: "19:00",
  }),
]);

const TIME_VALUES_BY_WEEKDAY = Object.freeze({
  2: Object.freeze(["10:00", "16:00", "19:00"]),
  3: Object.freeze(["10:00", "16:00", "19:00"]),
  4: Object.freeze(["10:00", "16:00", "19:00"]),
  5: Object.freeze(["10:00", "16:00", "19:00"]),
  6: Object.freeze(["10:00", "13:30"]),
});

// TRIAL_APPLICATION_PAST_DATE_POLICY_V2
const KOREA_UTC_OFFSET_MS =
  9 * 60 * 60 * 1000;

function parseDateKey(value) {
  const match =
    /^(\d{4})-(\d{2})-(\d{2})$/.exec(
      String(value || "").trim()
    );

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const date = new Date(
    Date.UTC(year, month - 1, day)
  );

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return {
    value:
      `${match[1]}-${match[2]}-${match[3]}`,
    weekday: date.getUTCDay(),
  };
}

export function getKoreaTodayDateKey(
  now = new Date()
) {
  const source =
    now instanceof Date
      ? now
      : new Date(now);

  const shifted = new Date(
    source.getTime() +
      KOREA_UTC_OFFSET_MS
  );

  const year =
    shifted.getUTCFullYear();
  const month = String(
    shifted.getUTCMonth() + 1
  ).padStart(2, "0");
  const day = String(
    shifted.getUTCDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function isPastTrialDate(
  dateKey,
  now = new Date()
) {
  const parsed = parseDateKey(dateKey);

  if (!parsed) {
    return false;
  }

  return (
    parsed.value <
    getKoreaTodayDateKey(now)
  );
}

export function isTrialDateSelectable(
  dateKey,
  now = new Date()
) {
  const parsed = parseDateKey(dateKey);

  return Boolean(
    parsed &&
    !isPastTrialDate(
      parsed.value,
      now
    ) &&
    TIME_VALUES_BY_WEEKDAY[
      parsed.weekday
    ]
  );
}

export function getTrialTimeOptionsForDate(
  dateKey,
  now = new Date()
) {
  const parsed = parseDateKey(dateKey);

  if (
    !parsed ||
    !isTrialDateSelectable(
      parsed.value,
      now
    )
  ) {
    return [];
  }

  const values =
    TIME_VALUES_BY_WEEKDAY[
      parsed.weekday
    ] || [];

  return ALL_TRIAL_TIME_OPTIONS.filter(
    (option) =>
      values.includes(option.value)
  );
}

export function validateTrialScheduleSelection(
  {
    hopeDate,
    hopeTime,
  },
  now = new Date()
) {
  if (!hopeDate) {
    return {
      ok: false,
      message:
        "희망 날짜를 선택해주세요.",
    };
  }

  if (
    isPastTrialDate(
      hopeDate,
      now
    )
  ) {
    return {
      ok: false,
      message:
        "지난 날짜에는 체험을 신청할 수 없습니다.",
    };
  }

  if (
    !isTrialDateSelectable(
      hopeDate,
      now
    )
  ) {
    return {
      ok: false,
      message:
        "체험 신청은 화요일부터 토요일까지만 가능합니다.",
    };
  }

  if (!hopeTime) {
    return {
      ok: false,
      message:
        "희망 시간을 선택해주세요.",
    };
  }

  const available =
    getTrialTimeOptionsForDate(
      hopeDate,
      now
    );

  if (
    hopeTime === "13:30" &&
    !available.some(
      (option) =>
        option.value === "13:30"
    )
  ) {
    return {
      ok: false,
      message:
        "오후 1시 30분 체험은 토요일에만 신청할 수 있습니다.",
    };
  }

  if (
    !available.some(
      (option) =>
        option.value === hopeTime
    )
  ) {
    return {
      ok: false,
      message:
        "선택한 날짜에는 해당 시간으로 체험을 신청할 수 없습니다.",
    };
  }

  return {
    ok: true,
    message: "",
  };
}
