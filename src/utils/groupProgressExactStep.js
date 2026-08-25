const EXACT_STEP_MARKER = 100000;

function parseGroupStep(value) {
  const text = String(value ?? "").trim();
  if (!text) return null;

  const displayMatch = text.match(/^(\d+)(?:-(\d+))?$/);
  if (!displayMatch) return null;

  if (displayMatch[2] !== undefined) {
    const base = Number(displayMatch[1]);
    const suffix = Number(displayMatch[2]);

    if (!Number.isInteger(base) || base <= 0) return null;
    if (!Number.isInteger(suffix) || suffix <= 0 || suffix > 99) {
      return null;
    }

    return {
      base,
      suffix,
      encoded: false,
      numericValue: base,
    };
  }

  const numericValue = Number(displayMatch[1]);
  if (!Number.isSafeInteger(numericValue) || numericValue <= 0) {
    return null;
  }

  if (numericValue >= EXACT_STEP_MARKER) {
    const raw = numericValue - EXACT_STEP_MARKER;
    const base = Math.floor(raw / 100);
    const suffix = raw % 100;

    if (base <= 0 || suffix <= 0 || suffix > 99) {
      return null;
    }

    return {
      base,
      suffix,
      encoded: true,
      numericValue,
    };
  }

  return {
    base: numericValue,
    suffix: 0,
    encoded: false,
    numericValue,
  };
}

export function encodeGroupRangeStep(value) {
  const parts = parseGroupStep(value);
  if (!parts) return null;

  if (parts.encoded) return parts.numericValue;

  return parts.suffix > 0
    ? EXACT_STEP_MARKER + parts.base * 100 + parts.suffix
    : parts.base;
}

export function decodeGroupRangeStep(value) {
  const parts = parseGroupStep(value);
  if (!parts) return "";

  return parts.suffix > 0
    ? `${parts.base}-${parts.suffix}`
    : String(parts.base);
}

export function baseGroupStep(value) {
  return parseGroupStep(value)?.base ?? null;
}

export function groupStepSortKey(value) {
  const parts = parseGroupStep(value);
  if (!parts) return 0;

  return parts.base * 100 + parts.suffix;
}

export function isStepInExactGroupRange(
  displayStep,
  startStep,
  endStep,
) {
  const row = groupStepSortKey(displayStep);
  const start = groupStepSortKey(startStep);
  const end = groupStepSortKey(endStep);

  return (
    row > 0 &&
    start > 0 &&
    end >= start &&
    row >= start &&
    row <= end
  );
}
