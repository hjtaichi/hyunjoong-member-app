const KOREA_OFFSET_MS =
  9 * 60 * 60 * 1000;

function toValidDate(value = new Date()) {
  const date =
    value instanceof Date
      ? value
      : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

export function getKoreaDateKey(
  value = new Date()
) {
  const date = toValidDate(value);

  if (!date) {
    return "";
  }

  const shifted = new Date(
    date.getTime() + KOREA_OFFSET_MS
  );

  return shifted
    .toISOString()
    .slice(0, 10);
}

export function getKoreaFormPeriod(
  value = new Date()
) {
  const dateKey = getKoreaDateKey(value);

  if (!dateKey) {
    return null;
  }

  const [yearText, monthText] =
    dateKey.split("-");

  const periodYear = Number(yearText);
  const month = Number(monthText);
  const periodHalf = month <= 6 ? 1 : 2;

  return {
    periodYear,
    periodHalf,
    periodLabel:
      periodHalf === 1
        ? "상반기"
        : "하반기",
    periodSub:
      periodHalf === 1
        ? "1월 ~ 6월"
        : "7월 ~ 12월",
    dateKey,
  };
}