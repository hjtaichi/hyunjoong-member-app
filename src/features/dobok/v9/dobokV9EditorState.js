export const DOBOK_V9_EDITOR_STORAGE_KEY = "hjtaichi.dobok.v9.embroideryEditor.v2";
const LEGACY_STORAGE_KEY = "hjtaichi.dobok.v9.embroideryEditor.v1";

export const DOBOK_V9_EMBROIDERY_ZONE_LABELS = {
  chest: "가슴 문양",
  collarLeftOuter: "목깃 왼쪽 바깥",
  collarLeftInner: "목깃 왼쪽 안쪽",
  collarRightInner: "목깃 오른쪽 안쪽",
  collarRightOuter: "목깃 오른쪽 바깥",
  leftCuff: "왼쪽 소매",
  rightCuff: "오른쪽 소매",
};

export function cloneEmbroideryLayouts(layouts) {
  return JSON.parse(JSON.stringify(layouts));
}

function looksLikeComboLayouts(value) {
  return Boolean(
    value &&
      typeof value === "object" &&
      (value["female-straight-plain"] || value["male-straight-plain"])
  );
}

function migrateLegacyGenderLayouts(legacy, defaults) {
  const next = cloneEmbroideryLayouts(defaults);
  if (!legacy || typeof legacy !== "object") return next;

  for (const comboKey of Object.keys(next)) {
    const gender = comboKey.startsWith("male-") ? "male" : "female";
    if (legacy[gender]) next[comboKey] = cloneEmbroideryLayouts(legacy[gender]);
  }
  return next;
}

export function loadEmbroideryEditorState(defaultLayouts) {
  if (typeof window === "undefined" || !window.localStorage) {
    return cloneEmbroideryLayouts(defaultLayouts);
  }

  try {
    const raw = window.localStorage.getItem(DOBOK_V9_EDITOR_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (looksLikeComboLayouts(parsed)) return parsed;
    }

    const legacyRaw = window.localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacyRaw) {
      const legacyParsed = JSON.parse(legacyRaw);
      const migrated = migrateLegacyGenderLayouts(legacyParsed, defaultLayouts);
      window.localStorage.setItem(
        DOBOK_V9_EDITOR_STORAGE_KEY,
        JSON.stringify(migrated)
      );
      return migrated;
    }

    return cloneEmbroideryLayouts(defaultLayouts);
  } catch {
    return cloneEmbroideryLayouts(defaultLayouts);
  }
}

export function saveEmbroideryEditorState(layouts) {
  if (typeof window === "undefined" || !window.localStorage) return false;

  try {
    window.localStorage.setItem(
      DOBOK_V9_EDITOR_STORAGE_KEY,
      JSON.stringify(layouts)
    );
    return true;
  } catch {
    return false;
  }
}

export function clearEmbroideryEditorState() {
  if (typeof window === "undefined" || !window.localStorage) return false;

  try {
    window.localStorage.removeItem(DOBOK_V9_EDITOR_STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

export function makeEmbroideryConfigText(layouts) {
  return `export const DOBOK_V9_EMBROIDERY_LAYOUTS = ${JSON.stringify(
    layouts,
    null,
    2
  )};`;
}
