const KOREA_OFFSET_MS = 9 * 60 * 60 * 1000;

function toKoreaDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Date(
    date.getTime() + KOREA_OFFSET_MS
  );
}

function pad2(value) {
  return String(value).padStart(2, "0");
}

export function getKoreaRecordParts(value) {
  const date = toKoreaDate(value);

  if (!date) {
    return null;
  }

  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
    hour: date.getUTCHours(),
    minute: date.getUTCMinutes(),
    weekday: date.getUTCDay(),
  };
}

export function getKoreaRecordDateKey(value) {
  const parts = getKoreaRecordParts(value);

  if (!parts) {
    return "";
  }

  return [
    parts.year,
    pad2(parts.month),
    pad2(parts.day),
  ].join("-");
}

export function formatKoreaRecordDate(value) {
  const parts = getKoreaRecordParts(value);

  if (!parts) {
    return "";
  }

  const weekdayNames = [
    "일요일",
    "월요일",
    "화요일",
    "수요일",
    "목요일",
    "금요일",
    "토요일",
  ];

  return `${parts.year}.${pad2(parts.month)}.${pad2(parts.day)} ${weekdayNames[parts.weekday]}`;
}

export function formatKoreaRecordShortDate(value) {
  const parts = getKoreaRecordParts(value);

  if (!parts) {
    return "";
  }

  return `${parts.month}월 ${parts.day}일`;
}

export function formatKoreaRecordTime(value) {
  const parts = getKoreaRecordParts(value);

  if (!parts) {
    return "";
  }

  return `${pad2(parts.hour)}:${pad2(parts.minute)}`;
}

function newestFirst(left, right) {
  return (
    new Date(right?.createdAt || 0).getTime() -
    new Date(left?.createdAt || 0).getTime()
  );
}

export function groupFormActivityByDate(items = []) {
  const groups = new Map();

  [...items]
    .sort(newestFirst)
    .forEach((item) => {
      const key =
        getKoreaRecordDateKey(
          item?.createdAt
        );

      if (!key) {
        return;
      }

      if (!groups.has(key)) {
        groups.set(key, {
          key,
          createdAt: item.createdAt,
          items: [],
          totalCount: 0,
          formKeys: new Set(),
        });
      }

      const group = groups.get(key);
      group.items.push(item);
      group.totalCount += Number(
        item?.count || 0
      );
      group.formKeys.add(
        item?.formKey || ""
      );
    });

  return [...groups.values()].map(
    (group) => ({
      key: group.key,
      createdAt: group.createdAt,
      items: group.items,
      totalCount: group.totalCount,
      formCount: [...group.formKeys].filter(
        Boolean
      ).length,
    })
  );
}

export function groupFormActivityByForm(items = []) {
  const groups = new Map();

  [...items]
    .sort(newestFirst)
    .forEach((item) => {
      const key = item?.formKey || "";

      if (!key) {
        return;
      }

      if (!groups.has(key)) {
        groups.set(key, {
          formKey: key,
          formName:
            item?.formName || key,
          items: [],
          totalCount: 0,
          latestAt: item.createdAt,
        });
      }

      const group = groups.get(key);
      group.items.push(item);
      group.totalCount += Number(
        item?.count || 0
      );
    });

  return [...groups.values()];
}