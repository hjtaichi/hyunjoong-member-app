const INVALID_DATE_LABEL = "날짜 정보 없음";

function isMissingDateValue(value) {
  return (
    value === null ||
    value === undefined ||
    (typeof value === "string" &&
      value.trim() === "")
  );
}

export function formatMemberNotificationDate(value) {
  if (isMissingDateValue(value)) {
    return INVALID_DATE_LABEL;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return INVALID_DATE_LABEL;
  }

  const year = String(date.getFullYear())
    .slice(-2)
    .padStart(2, "0");

  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();

  const minute = String(
    date.getMinutes()
  ).padStart(2, "0");

  return (
    `${year}.${month}.${day} ` +
    `${hour}:${minute}`
  );
}
