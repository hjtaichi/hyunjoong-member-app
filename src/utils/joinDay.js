export function normalizeJoinDayCount(value) {
  const count = Number(value);

  if (!Number.isInteger(count) || count < 1) {
    return null;
  }

  return count;
}

export function getJoinDayCountFromHome(homeData) {
  return normalizeJoinDayCount(
    homeData?.member?.joinDayCount
  );
}

export function formatJoinDayCountLabel(value) {
  const count = normalizeJoinDayCount(value);

  return count == null
    ? "입관일 확인 필요"
    : `입관 ${count}일째`;
}
