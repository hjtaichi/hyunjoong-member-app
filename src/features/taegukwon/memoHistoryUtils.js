export function getMemoDateValue(memo) {
  const candidates = [
    memo?.createdAt,
    memo?.created_at,
    memo?.updatedAt,
    memo?.updated_at,
    memo?.recordedAt,
    memo?.recorded_at,
    memo?.date,
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;

    const date = new Date(candidate);
    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }

  return null;
}

export function formatMemoDate(dateValue) {
  const date =
    dateValue instanceof Date
      ? dateValue
      : new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return `${date.getFullYear()}. ${date.getMonth() + 1}. ${date.getDate()}.`;
}

export function buildMemoHistoryList({
  memberMemoHistory = [],
  memberMemo = "",
  now = new Date(),
} = {}) {
  const rows = Array.isArray(memberMemoHistory)
    ? memberMemoHistory.filter(
        (memo) => String(memo?.content || "").trim()
      )
    : [];

  if (rows.length === 0) {
    const fallbackContent = String(
      memberMemo || ""
    ).trim();

    if (!fallbackContent) {
      return [];
    }

    return [
      {
        id: "current-fallback",
        content: fallbackContent,
        dateLabel: formatMemoDate(now),
        canDelete: false,
      },
    ];
  }

  const firstValidDate =
    rows
      .map(getMemoDateValue)
      .find(Boolean) || now;

  let previousValidDate = firstValidDate;

  return rows.map((memo, index) => {
    const validDate = getMemoDateValue(memo);

    if (validDate) {
      previousValidDate = validDate;
    }

    const rawId = memo?.id;
    const hasStoredId =
      rawId !== null &&
      rawId !== undefined &&
      String(rawId).trim() !== "";

    return {
      ...memo,
      id: hasStoredId
        ? String(rawId)
        : `memo-fallback-${index}`,
      content: String(memo?.content || "").trim(),
      dateLabel: formatMemoDate(
        validDate || previousValidDate
      ),
      canDelete: hasStoredId,
    };
  });
}
