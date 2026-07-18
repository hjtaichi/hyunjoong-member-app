const numberFormatter = new Intl.NumberFormat("ko-KR");

function getTimestamp(value) {
  if (!value) {
    return 0;
  }

  const timestamp = new Date(value).getTime();

  return Number.isFinite(timestamp) ? timestamp : 0;
}

function getDateParts(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
    timestamp: date.getTime(),
  };
}

export function formatNumber(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return "0";
  }

  return numberFormatter.format(numericValue);
}

export function formatRecordDate(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString("ko-KR");
}

export function formatRecordCount(current, target, unit = "회") {
  return `${formatNumber(current)} / ${formatNumber(target)}${unit}`;
}

export function groupFormHistory(history = []) {
  if (!Array.isArray(history)) {
    return [];
  }

  return history.map((period) => {
    const forms = Array.isArray(period?.forms) ? period.forms : [];
    const formMap = new Map();

    forms.forEach((item, index) => {
      const groupKey = String(
        item?.formKey ||
          item?.name ||
          `unknown-form-${index}`
      );

      if (!formMap.has(groupKey)) {
        formMap.set(groupKey, {
          key: groupKey,
          name: item?.name || groupKey,
          records: [],
        });
      }

      const recordKey = String(
        item?.id ||
          [
            groupKey,
            item?.completedAt || "no-date",
            item?.targetCount ?? "no-target",
            item?.currentCount ?? "no-current",
            index,
          ].join("-")
      );

      formMap.get(groupKey).records.push({
        ...item,
        recordKey,
      });
    });

    const formGroups = Array.from(formMap.values()).map(
      (group) => {
        const records = [...group.records].sort(
          (left, right) =>
            getTimestamp(right.completedAt) -
            getTimestamp(left.completedAt)
        );

        return {
          ...group,
          records,
          latestRecord: records[0] || null,
        };
      }
    );

    return {
      ...period,
      formGroups,
      totalRecords: forms.length,
      totalForms: formGroups.length,
    };
  });
}

export function groupGongbeopGoals(completedGoals = []) {
  if (!Array.isArray(completedGoals)) {
    return [];
  }

  const sortedGoals = completedGoals
    .map((item, index) => ({
      ...item,
      originalIndex: index,
      dateParts: getDateParts(item?.completedAt),
    }))
    .sort((left, right) => {
      const leftTimestamp = left.dateParts?.timestamp || 0;
      const rightTimestamp = right.dateParts?.timestamp || 0;

      if (rightTimestamp !== leftTimestamp) {
        return rightTimestamp - leftTimestamp;
      }

      return left.originalIndex - right.originalIndex;
    });

  const monthMap = new Map();

  sortedGoals.forEach((item) => {
    const parts = item.dateParts;

    const monthKey = parts
      ? `${parts.year}-${String(parts.month).padStart(2, "0")}`
      : "unknown-month";

    const monthLabel = parts
      ? `${parts.year}년 ${parts.month}월`
      : "완료일 미상";

    const monthSortValue = parts
      ? new Date(parts.year, parts.month - 1, 1).getTime()
      : 0;

    const dateKey = parts
      ? [
          parts.year,
          String(parts.month).padStart(2, "0"),
          String(parts.day).padStart(2, "0"),
        ].join("-")
      : "unknown-date";

    const dateLabel = parts
      ? `${parts.month}월 ${parts.day}일`
      : "완료일 미상";

    if (!monthMap.has(monthKey)) {
      monthMap.set(monthKey, {
        key: monthKey,
        monthLabel,
        sortValue: monthSortValue,
        dateMap: new Map(),
      });
    }

    const monthGroup = monthMap.get(monthKey);

    if (!monthGroup.dateMap.has(dateKey)) {
      monthGroup.dateMap.set(dateKey, {
        key: dateKey,
        dateLabel,
        sortValue: parts?.timestamp || 0,
        items: [],
      });
    }

    monthGroup.dateMap.get(dateKey).items.push(item);
  });

  return Array.from(monthMap.values())
    .sort((left, right) => right.sortValue - left.sortValue)
    .map((monthGroup) => {
      const dateGroups = Array.from(
        monthGroup.dateMap.values()
      ).sort(
        (left, right) => right.sortValue - left.sortValue
      );

      return {
        key: monthGroup.key,
        monthLabel: monthGroup.monthLabel,
        totalRecords: dateGroups.reduce(
          (sum, dateGroup) =>
            sum + dateGroup.items.length,
          0
        ),
        dateGroups,
      };
    });
}