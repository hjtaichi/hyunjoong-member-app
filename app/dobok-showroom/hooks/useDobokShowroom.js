import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import { useAuth } from "../../../src/contexts/AuthContext";
import { DOBOK_V9_COMBO_LIST } from "../../../src/features/dobok/v9/dobokV9Assets";
import {
  DOBOK_V9_EMBROIDERY_CONFIG,
  DOBOK_V9_EMBROIDERY_LAYOUTS,
  DOBOK_V9_FABRIC_GROUPS,
  DOBOK_V9_SLEEVE_LABELS,
  DOBOK_V9_STYLE_LABELS,
} from "../../../src/features/dobok/v9/dobokV9Config";
import { loadDobokCatalog } from "../services/dobokCatalogApi";
import { APPLIED_KEY, DEFAULT_EMBROIDERY_COLORS, SAVE_KEY } from "../showroomConstants";

function getFabricGroup(groups, key) {
  return groups.find((item) => item.key === key) ?? groups[0];
}

function getFabricColor(groups, groupKey, colorKey) {
  const group = getFabricGroup(groups, groupKey);
  return group?.colors.find((item) => item.key === colorKey) ?? group?.colors[0];
}

function makeFabricSelections(groups) {
  return Object.fromEntries(
    groups.map((group) => [
      group.key,
      {
        topColorKey: group.colors[0]?.key,
        pantsColorKey: group.colors[0]?.key,
      },
    ])
  );
}

export default function useDobokShowroom() {
  const { user } = useAuth();
  const [fabricGroups, setFabricGroups] = useState(DOBOK_V9_FABRIC_GROUPS);
  const [catalogSource, setCatalogSource] = useState("fallback");
  const [catalogVersion, setCatalogVersion] = useState(0);
  const [memberRankLevel, setMemberRankLevel] = useState(0);
  const rankLevel = memberRankLevel;
  const canUseCloudEmbroidery = rankLevel >= 1;
  const [catalogConfig, setCatalogConfig] = useState(() => ({
    styleLabels: DOBOK_V9_STYLE_LABELS,
    sleeveLabels: DOBOK_V9_SLEEVE_LABELS,
    embroidery: {
      config: DOBOK_V9_EMBROIDERY_CONFIG,
      layouts: DOBOK_V9_EMBROIDERY_LAYOUTS,
    },
    embroideryColors: DEFAULT_EMBROIDERY_COLORS,
  }));
  const [gender, setGender] = useState("female");
  const [style, setStyle] = useState("straight");
  const [sleeve, setSleeve] = useState("plain");
  const [fabricKey, setFabricKey] = useState(DOBOK_V9_FABRIC_GROUPS[0].key);
  const [topColorKey, setTopColorKey] = useState(DOBOK_V9_FABRIC_GROUPS[0].colors[0].key);
  const [pantsColorKey, setPantsColorKey] = useState(DOBOK_V9_FABRIC_GROUPS[0].colors[0].key);
  const [fabricSelections, setFabricSelections] = useState(() => makeFabricSelections(DOBOK_V9_FABRIC_GROUPS));
  const [showChest, setShowChest] = useState(true);
  const [showClouds, setShowClouds] = useState(false);
  const [chestColor, setChestColor] = useState("#C69A2D");
  const [cloudColor, setCloudColor] = useState("#F7F5EF");
  const [sheet, setSheet] = useState(null);
  const [saved, setSaved] = useState([]);
  const [favoritesVisible, setFavoritesVisible] = useState(false);
  const [nameModalVisible, setNameModalVisible] = useState(false);
  const [favoriteName, setFavoriteName] = useState("");
  const [editingFavoriteId, setEditingFavoriteId] = useState(null);
  const [appliedFavoriteId, setAppliedFavoriteId] = useState(null);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(SAVE_KEY),
      AsyncStorage.getItem(APPLIED_KEY),
      loadDobokCatalog(),
    ])
      .then(([rawSaved, rawApplied, catalog]) => {
        const parsedSaved = rawSaved ? JSON.parse(rawSaved) : [];
        const permissionSafeSaved = Array.isArray(parsedSaved)
          ? parsedSaved.map((item) =>
              canUseCloudEmbroidery
                ? item
                : { ...item, showClouds: false }
            )
          : [];
        setSaved(permissionSafeSaved);
        setAppliedFavoriteId(rawApplied || null);
        if (!canUseCloudEmbroidery && rawSaved) {
          void AsyncStorage.setItem(SAVE_KEY, JSON.stringify(permissionSafeSaved));
        }

        const groups = catalog.fabrics;
        const firstFabric = groups[0];
        const firstColor = firstFabric.colors[0];

        setFabricGroups(groups);
        setCatalogConfig(catalog.config);
        setCatalogSource(catalog.source);
        setCatalogVersion(catalog.version);
        setMemberRankLevel(Number(catalog.rankLevel || 0));
        setFabricSelections(makeFabricSelections(groups));

        setFabricKey((current) =>
          groups.some((group) => group.key === current)
            ? current
            : firstFabric.key
        );
        setTopColorKey((current) =>
          firstFabric.colors.some((color) => color.key === current)
            ? current
            : firstColor.key
        );
        setPantsColorKey((current) =>
          firstFabric.colors.some((color) => color.key === current)
            ? current
            : firstColor.key
        );
      })
      .catch(() => {
        setSaved([]);
        setAppliedFavoriteId(null);
      });
  }, [canUseCloudEmbroidery]);

  const styleLabels = catalogConfig?.styleLabels || DOBOK_V9_STYLE_LABELS;
  const sleeveLabels = catalogConfig?.sleeveLabels || DOBOK_V9_SLEEVE_LABELS;
  const embroideryConfig = catalogConfig?.embroidery?.config || DOBOK_V9_EMBROIDERY_CONFIG;
  const embroideryLayouts = catalogConfig?.embroidery?.layouts || DOBOK_V9_EMBROIDERY_LAYOUTS;
  const embroideryColors = Array.isArray(catalogConfig?.embroideryColors) && catalogConfig.embroideryColors.length > 0
    ? catalogConfig.embroideryColors
    : DEFAULT_EMBROIDERY_COLORS;

  useEffect(() => {
    const firstColor = embroideryColors[0]?.hex;
    if (!firstColor) return;
    if (!embroideryColors.some((item) => item.hex === chestColor)) {
      setChestColor(firstColor);
    }
    if (!embroideryColors.some((item) => item.hex === cloudColor)) {
      setCloudColor(firstColor);
    }
  }, [embroideryColors, chestColor, cloudColor]);

  useEffect(() => {
    if (!canUseCloudEmbroidery) {
      setShowClouds(false);
      setSheet((current) => current === "cloud" ? null : current);
    }
  }, [canUseCloudEmbroidery]);

  const effectiveStyle = gender === "male" ? "straight" : style;
  const combo = useMemo(() => DOBOK_V9_COMBO_LIST.find((item) => item.gender === gender && item.style === effectiveStyle && item.sleeve === sleeve), [gender, effectiveStyle, sleeve]);
  const fabric = getFabricGroup(fabricGroups, fabricKey);
  const topColor = getFabricColor(fabricGroups, fabricKey, topColorKey) || fabric.colors[0];
  const pantsColor = getFabricColor(fabricGroups, fabricKey, pantsColorKey) || fabric.colors[0];

  function openCloudSheet() {
    if (!canUseCloudEmbroidery) {
      Alert.alert("유단자 전용", "구름무늬 자수는 1단 이상 승단한 회원만 선택할 수 있습니다.");
      return;
    }
    setSheet("cloud");
  }

  function chooseFabric(nextKey) {
    const next = getFabricGroup(fabricGroups, nextKey);
    const remembered = fabricSelections[next.key] || {};
    const nextTopKey = remembered.topColorKey && getFabricColor(fabricGroups, next.key, remembered.topColorKey) ? remembered.topColorKey : next.colors[0].key;
    const nextPantsKey = remembered.pantsColorKey && getFabricColor(fabricGroups, next.key, remembered.pantsColorKey) ? remembered.pantsColorKey : next.colors[0].key;
    setFabricKey(next.key);
    setTopColorKey(nextTopKey);
    setPantsColorKey(nextPantsKey);
  }

  function chooseTopColor(item) {
    setTopColorKey(item.key);
    setFabricSelections((current) => ({ ...current, [fabricKey]: { ...(current[fabricKey] || {}), topColorKey: item.key, pantsColorKey: current[fabricKey]?.pantsColorKey || pantsColorKey } }));
  }

  function choosePantsColor(item) {
    setPantsColorKey(item.key);
    setFabricSelections((current) => ({ ...current, [fabricKey]: { ...(current[fabricKey] || {}), topColorKey: current[fabricKey]?.topColorKey || topColorKey, pantsColorKey: item.key } }));
  }

  async function persistFavorites(next) {
    await AsyncStorage.setItem(SAVE_KEY, JSON.stringify(next));
    setSaved(next);
  }

  function openSaveDialog() {
    if (saved.length >= 5) {
      Alert.alert("즐겨찾기 저장 한도", "즐겨찾기는 최대 5개까지 저장할 수 있습니다.");
      return;
    }
    setEditingFavoriteId(null);
    setFavoriteName(`나의 도복 ${saved.length + 1}`);
    setNameModalVisible(true);
  }

  function openRenameDialog(item) {
    setEditingFavoriteId(item.id);
    setFavoriteName(item.name);
    setNameModalVisible(true);
  }

  async function confirmFavoriteName() {
    const trimmed = favoriteName.trim();
    if (!trimmed) {
      Alert.alert("이름을 입력해주세요", "즐겨찾기 이름을 한 글자 이상 입력해주세요.");
      return;
    }
    if (editingFavoriteId) {
      const next = saved.map((item) => item.id === editingFavoriteId ? { ...item, name: trimmed } : item);
      await persistFavorites(next);
      setNameModalVisible(false);
      setEditingFavoriteId(null);
      return;
    }
    if (saved.length >= 5) {
      setNameModalVisible(false);
      Alert.alert("즐겨찾기 저장 한도", "즐겨찾기는 최대 5개까지 저장할 수 있습니다.");
      return;
    }
    const item = {
      id: `${Date.now()}`,
      name: trimmed,
      createdAt: new Date().toISOString(),
      gender,
      style: effectiveStyle,
      sleeve,
      fabricKey,
      fabricLabel: fabric.label,
      topColorKey: topColor.key,
      topColorLabel: topColor.position,
      topColorHex: topColor.hex,
      pantsColorKey: pantsColor.key,
      pantsColorLabel: pantsColor.position,
      pantsColorHex: pantsColor.hex,
      showChest,
      chestColor,
      showClouds: canUseCloudEmbroidery && showClouds,
      cloudColor,
    };
    const next = [...saved, item];
    await persistFavorites(next);
    await AsyncStorage.setItem(APPLIED_KEY, item.id);
    setAppliedFavoriteId(item.id);
    setNameModalVisible(false);
    Alert.alert("즐겨찾기 저장 완료", `${item.name}을(를) 저장했습니다.`);
  }

  async function applyFavorite(item) {
    setGender(item.gender);
    setStyle(item.style);
    setSleeve(item.sleeve);
    setFabricKey(item.fabricKey);
    setTopColorKey(item.topColorKey);
    setPantsColorKey(item.pantsColorKey);
    setFabricSelections((current) => ({ ...current, [item.fabricKey]: { topColorKey: item.topColorKey, pantsColorKey: item.pantsColorKey } }));
    setShowChest(item.showChest !== false);
    setChestColor(item.chestColor || "#C69A2D");
    setShowClouds(canUseCloudEmbroidery && Boolean(item.showClouds));
    setCloudColor(item.cloudColor || "#F7F5EF");
    setAppliedFavoriteId(item.id);
    await AsyncStorage.setItem(APPLIED_KEY, item.id);
    setFavoritesVisible(false);
  }

  function deleteFavorite(item) {
    Alert.alert("즐겨찾기 삭제", `${item.name}을(를) 삭제할까요?`, [
      { text: "취소", style: "cancel" },
      { text: "삭제", style: "destructive", onPress: async () => {
        const next = saved.filter((savedItem) => savedItem.id !== item.id);
        await persistFavorites(next);
        if (appliedFavoriteId === item.id) {
          setAppliedFavoriteId(null);
          await AsyncStorage.removeItem(APPLIED_KEY);
        }
      } },
    ]);
  }

  return {
    fabricGroups, catalogSource, catalogVersion, catalogConfig,
    styleLabels, sleeveLabels, embroideryConfig, embroideryLayouts, embroideryColors,
    rankLevel, canUseCloudEmbroidery,
    gender, setGender, style, setStyle, sleeve, setSleeve,
    fabricKey, topColorKey, pantsColorKey, showChest, setShowChest,
    showClouds, setShowClouds,
    chestColor, setChestColor, cloudColor, setCloudColor,
    sheet, setSheet, saved, favoritesVisible, setFavoritesVisible,
    nameModalVisible, setNameModalVisible, favoriteName, setFavoriteName,
    editingFavoriteId, setEditingFavoriteId, appliedFavoriteId,
    effectiveStyle, combo, fabric, topColor, pantsColor,
    chooseFabric, chooseTopColor, choosePantsColor, openCloudSheet,
    openSaveDialog, openRenameDialog, confirmFavoriteName,
    applyFavorite, deleteFavorite,
  };
}
