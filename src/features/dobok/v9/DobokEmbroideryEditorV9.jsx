import React, { useMemo, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import {
  DOBOK_V9_EMBROIDERY_ZONE_LABELS,
  clearEmbroideryEditorState,
  cloneEmbroideryLayouts,
  makeEmbroideryConfigText,
  saveEmbroideryEditorState,
} from "./dobokV9EditorState";

const ZONES = [
  "chest",
  "collarLeftOuter",
  "collarLeftInner",
  "collarRightInner",
  "collarRightOuter",
  "leftCuff",
  "rightCuff",
];

function SmallButton({ label, onPress, selected = false }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.smallButton, selected && styles.smallButtonSelected]}
    >
      <Text style={[styles.smallButtonText, selected && styles.smallButtonTextSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

function NumberField({ label, value, onChange, step = 1, min = -9999, max = 9999 }) {
  const change = (delta) => {
    const next = Math.min(max, Math.max(min, Number(value || 0) + delta));
    onChange(next);
  };

  return (
    <View style={styles.numberRow}>
      <Text style={styles.numberLabel}>{label}</Text>
      <TextInput
        value={String(value)}
        onChangeText={(text) => {
          const parsed = Number(text.replace(/[^0-9.-]/g, ""));
          if (Number.isFinite(parsed)) onChange(Math.min(max, Math.max(min, parsed)));
        }}
        keyboardType="numeric"
        style={styles.input}
      />
      <SmallButton label={`−${step}`} onPress={() => change(-step)} />
      <SmallButton label={`+${step}`} onPress={() => change(step)} />
    </View>
  );
}

export default function DobokEmbroideryEditorV9({
  comboKey,
  comboLabel,
  layouts,
  defaultLayouts,
  onChange,
  onStatus,
}) {
  const [selectedZone, setSelectedZone] = useState("chest");
  const current = layouts[comboKey][selectedZone];

  const summary = useMemo(
    () => `${DOBOK_V9_EMBROIDERY_ZONE_LABELS[selectedZone]} · ${comboLabel || comboKey}`,
    [comboKey, comboLabel, selectedZone]
  );

  function updateField(field, value) {
    const next = cloneEmbroideryLayouts(layouts);
    next[comboKey][selectedZone][field] = value;
    onChange(next);
  }

  async function copyConfig() {
    const text = makeEmbroideryConfigText(layouts);
    try {
      if (Platform.OS === "web" && navigator?.clipboard) {
        await navigator.clipboard.writeText(text);
        onStatus("설정 코드가 클립보드에 복사되었습니다.");
      } else {
        onStatus("웹에서만 클립보드 복사가 지원됩니다.");
      }
    } catch {
      onStatus("클립보드 복사에 실패했습니다.");
    }
  }

  function saveBrowser() {
    const ok = saveEmbroideryEditorState(layouts);
    onStatus(ok ? "이 브라우저에 조정값을 저장했습니다." : "브라우저 저장에 실패했습니다.");
  }

  function resetCurrent() {
    const next = cloneEmbroideryLayouts(layouts);
    next[comboKey][selectedZone] = cloneEmbroideryLayouts(defaultLayouts)[comboKey][selectedZone];
    onChange(next);
    onStatus("선택한 자수 영역을 초기값으로 복원했습니다.");
  }

  function resetAll() {
    clearEmbroideryEditorState();
    onChange(cloneEmbroideryLayouts(defaultLayouts));
    onStatus("모든 자수 조정값을 초기화했습니다.");
  }
  function copyCurrentCombo() {
    if (typeof window === "undefined" || !window.localStorage) {
      onStatus("브라우저에서만 조합 복사가 지원됩니다.");
      return;
    }
    window.localStorage.setItem(
      "hjtaichi.dobok.v9.embroideryComboClipboard",
      JSON.stringify(layouts[comboKey])
    );
    onStatus("현재 조합의 전체 자수 설정을 복사했습니다.");
  }

  function pasteCurrentCombo() {
    if (typeof window === "undefined" || !window.localStorage) {
      onStatus("브라우저에서만 조합 붙여넣기가 지원됩니다.");
      return;
    }
    try {
      const raw = window.localStorage.getItem(
        "hjtaichi.dobok.v9.embroideryComboClipboard"
      );
      if (!raw) {
        onStatus("복사된 조합 설정이 없습니다.");
        return;
      }
      const next = cloneEmbroideryLayouts(layouts);
      next[comboKey] = JSON.parse(raw);
      onChange(next);
      onStatus("복사한 설정을 현재 조합에 붙여넣었습니다.");
    } catch {
      onStatus("조합 설정 붙여넣기에 실패했습니다.");
    }
  }


  return (
    <View style={styles.editor}>
      <View style={styles.editorHeader}>
        <View>
          <Text style={styles.title}>자수 위치·크기 조정 모드</Text>
          <Text style={styles.description}>
            로컬 개발용입니다. 그림 파일은 수정하지 않고 화면 배치값만 조정합니다.
          </Text>
        </View>
        <Text style={styles.current}>{summary}</Text>
      </View>

      <View style={styles.zoneGrid}>
        {ZONES.map((zone) => (
          <SmallButton
            key={zone}
            label={DOBOK_V9_EMBROIDERY_ZONE_LABELS[zone]}
            selected={selectedZone === zone}
            onPress={() => setSelectedZone(zone)}
          />
        ))}
      </View>

      <View style={styles.controls}>
        <NumberField label="위치 X" value={current.left} onChange={(v) => updateField("left", v)} step={1} />
        <NumberField label="위치 Y" value={current.top} onChange={(v) => updateField("top", v)} step={1} />
        <NumberField label="가로 크기" value={current.width} onChange={(v) => updateField("width", v)} step={1} min={1} />
        <NumberField label="세로 크기" value={current.height} onChange={(v) => updateField("height", v)} step={1} min={1} />
        <NumberField label="회전" value={current.rotation || 0} onChange={(v) => updateField("rotation", v)} step={0.5} min={-45} max={45} />
        <NumberField label="개수" value={current.count ?? 1} onChange={(v) => updateField("count", Math.round(v))} step={1} min={0} max={6} />
        <NumberField label="간격" value={current.gap ?? 10} onChange={(v) => updateField("gap", v)} step={1} min={0} max={200} />
      </View>

      <View style={styles.quickRow}>
        <SmallButton label="← 5px" onPress={() => updateField("left", current.left - 5)} />
        <SmallButton label="→ 5px" onPress={() => updateField("left", current.left + 5)} />
        <SmallButton label="↑ 5px" onPress={() => updateField("top", current.top - 5)} />
        <SmallButton label="↓ 5px" onPress={() => updateField("top", current.top + 5)} />
        <SmallButton label="크기 −5%" onPress={() => {
          updateField("width", Math.max(1, Math.round(current.width * 0.95)));
          const next = cloneEmbroideryLayouts(layouts);
          next[comboKey][selectedZone].width = Math.max(1, Math.round(current.width * 0.95));
          next[comboKey][selectedZone].height = Math.max(1, Math.round(current.height * 0.95));
          onChange(next);
        }} />
        <SmallButton label="크기 +5%" onPress={() => {
          const next = cloneEmbroideryLayouts(layouts);
          next[comboKey][selectedZone].width = Math.max(1, Math.round(current.width * 1.05));
          next[comboKey][selectedZone].height = Math.max(1, Math.round(current.height * 1.05));
          onChange(next);
        }} />
      </View>

      <View style={styles.actions}>
        <SmallButton label="선택 영역 초기화" onPress={resetCurrent} />
        <SmallButton label="전체 초기화" onPress={resetAll} />
        <SmallButton label="현재 조합 복사" onPress={copyCurrentCombo} />
        <SmallButton label="현재 조합에 붙여넣기" onPress={pasteCurrentCombo} />
        <SmallButton label="브라우저에 저장" onPress={saveBrowser} />
        <SmallButton label="config 코드 복사" onPress={copyConfig} />
      </View>

      <Text style={styles.footnote}>
        “브라우저에 저장”은 이 PC의 현재 브라우저에만 보존됩니다. 최종 코드 반영은
        “config 코드 복사” 후 `dobokV9Config.js`의 배치 설정을 교체하면 됩니다.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  editor: {
    marginTop: 18,
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#D8C9B3",
    backgroundColor: "#FFFDF8",
  },
  editorHeader: { gap: 8, marginBottom: 14 },
  title: { fontSize: 18, fontWeight: "900", color: "#102C55" },
  description: { marginTop: 4, color: "#6D6257", lineHeight: 19 },
  current: { color: "#8A5B16", fontWeight: "800" },
  zoneGrid: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginBottom: 14 },
  controls: { gap: 8 },
  numberRow: { flexDirection: "row", alignItems: "center", gap: 7, flexWrap: "wrap" },
  numberLabel: { width: 80, color: "#3D352E", fontWeight: "800" },
  input: {
    width: 78,
    minHeight: 38,
    paddingHorizontal: 9,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#CDBDA5",
    backgroundColor: "#FFFFFF",
    color: "#251F1A",
  },
  smallButton: {
    minHeight: 38,
    paddingHorizontal: 11,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#CDBDA5",
    backgroundColor: "#FFFDF9",
  },
  smallButtonSelected: { borderColor: "#102C55", backgroundColor: "#102C55" },
  smallButtonText: { color: "#40372F", fontWeight: "800", fontSize: 12 },
  smallButtonTextSelected: { color: "#FFFFFF" },
  quickRow: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginTop: 13 },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginTop: 14 },
  footnote: { marginTop: 12, color: "#786C60", fontSize: 12, lineHeight: 18 },
});
