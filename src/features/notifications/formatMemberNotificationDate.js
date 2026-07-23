const INVALID_DATE_LABEL =
  "날짜 정보 없음";

function isMissingDateValue(value) {
  return (
    value === null ||
    value === undefined ||
    (
      typeof value === "string" &&
      value.trim() === ""
    )
  );
}

function getKoreaDateParts(date) {
  const formatter =
    new Intl.DateTimeFormat(
      "ko-KR",
      {
        timeZone: "Asia/Seoul",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      }
    );

  const parts =
    formatter.formatToParts(date);

  return Object.fromEntries(
    parts.map((part) => [
      part.type,
      part.value,
    ])
  );
}

export function formatMemberNotificationDate(
  value
) {
  if (isMissingDateValue(value)) {
    return INVALID_DATE_LABEL;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return INVALID_DATE_LABEL;
  }

  const parts =
    getKoreaDateParts(date);

  if (
    !parts.year ||
    !parts.month ||
    !parts.day ||
    !parts.hour ||
    !parts.minute
  ) {
    return INVALID_DATE_LABEL;
  }

  return (
    `${parts.year}.` +
    `${parts.month}.` +
    `${parts.day} ` +
    `${parts.hour}:` +
    `${parts.minute}`
  );
}
