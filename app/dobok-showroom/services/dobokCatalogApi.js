import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  DOBOK_V9_EMBROIDERY_CONFIG,
  DOBOK_V9_EMBROIDERY_LAYOUTS,
  DOBOK_V9_FABRIC_GROUPS,
  DOBOK_V9_SLEEVE_LABELS,
  DOBOK_V9_STYLE_LABELS,
} from "../../../src/features/dobok/v9/dobokV9Config";
import { DEFAULT_EMBROIDERY_COLORS } from "../showroomConstants";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "https://api.hjtaichi.com/api";
const CATALOG_URL = `${API_BASE_URL.replace(/\/$/, "")}/member/dobok-showroom`;
const CACHE_KEY = "hjtaichi:dobok-showroom:published-config:v2";

function normalizeHex(value) {
  const hex = String(value || "").trim();
  return /^#[0-9a-fA-F]{6}$/.test(hex) ? hex.toUpperCase() : "#FFFFFF";
}


function normalizeEmbroideryColors(value) {
  const source = Array.isArray(value) ? value : [];
  const colors = source
    .filter((item) => item?.enabled !== false && item?.hex)
    .sort(
      (a, b) => Number(a?.sortOrder ?? 0) - Number(b?.sortOrder ?? 0)
    )
    .map((item, index) => ({
      key: String(item?.id || item?.key || `embroidery-${index + 1}`),
      label: String(item?.name || item?.label || `실색 ${index + 1}`),
      hex: normalizeHex(item.hex),
    }));

  return colors.length > 0 ? colors : DEFAULT_EMBROIDERY_COLORS;
}

function mapFabric(fabric, fabricIndex) {
  const colors = Array.isArray(fabric?.colors)
    ? fabric.colors
        .filter((color) => color?.enabled !== false)
        .sort(
          (a, b) => Number(a?.sortOrder ?? 0) - Number(b?.sortOrder ?? 0)
        )
        .map((color, colorIndex) => ({
          key: String(color?.id || `${fabric?.id || fabricIndex}-${colorIndex}`),
          position: String(
            color?.code || color?.label || `색상 ${colorIndex + 1}`
          ),
          label: String(
            color?.label || color?.code || `색상 ${colorIndex + 1}`
          ),
          hex: normalizeHex(color?.hex),
        }))
    : [];

  return {
    key: String(fabric?.key || fabric?.id || `fabric-${fabricIndex + 1}`),
    sourceId: String(fabric?.id || ""),
    label: String(fabric?.name || `원단 ${fabricIndex + 1}`),
    description: String(fabric?.description || ""),
    chartImageUrl: fabric?.chartImageUrl || null,
    futureTexture: {
      enabled: Boolean(fabric?.texture?.enabled),
      textureAsset: fabric?.textureImageUrl || null,
      blendMode: String(fabric?.texture?.blendMode || "multiply"),
      opacity: Number(fabric?.texture?.opacity || 0),
      roughness: null,
      sheen: null,
    },
    colors,
  };
}

function makeFallbackConfig() {
  return {
    schemaVersion: 0,
    canvas: { width: 1024, height: 1536 },
    styleLabels: DOBOK_V9_STYLE_LABELS,
    sleeveLabels: DOBOK_V9_SLEEVE_LABELS,
    fabrics: DOBOK_V9_FABRIC_GROUPS,
    embroideryColors: DEFAULT_EMBROIDERY_COLORS,
    embroidery: {
      config: DOBOK_V9_EMBROIDERY_CONFIG,
      layouts: DOBOK_V9_EMBROIDERY_LAYOUTS,
    },
  };
}

export function normalizePublishedCatalog(payload) {
  const rawConfig = payload?.config;
  if (!rawConfig || typeof rawConfig !== "object" || Array.isArray(rawConfig)) {
    throw new Error("게시된 도복 설정이 올바르지 않습니다.");
  }

  const fabrics = Array.isArray(rawConfig.fabrics)
    ? rawConfig.fabrics
        .filter((fabric) => fabric?.enabled !== false)
        .sort(
          (a, b) =>
            Number(a?.displayOrder ?? 0) - Number(b?.displayOrder ?? 0)
        )
        .map(mapFabric)
        .filter((fabric) => fabric.colors.length > 0)
    : [];

  if (!fabrics.length) {
    throw new Error("게시된 원단 또는 색상이 없습니다.");
  }

  const layouts = rawConfig?.embroidery?.layouts;
  if (!layouts || typeof layouts !== "object" || Array.isArray(layouts)) {
    throw new Error("게시된 자수 위치정보가 없습니다.");
  }

  // 관리자웹에서 게시한 전체 설정을 보존하고, 회원 화면용 원단만 정규화합니다.
  const config = {
    ...rawConfig,
    styleLabels: {
      ...DOBOK_V9_STYLE_LABELS,
      ...(rawConfig.styleLabels || {}),
    },
    sleeveLabels: {
      ...DOBOK_V9_SLEEVE_LABELS,
      ...(rawConfig.sleeveLabels || {}),
    },
    fabrics,
    embroideryColors: normalizeEmbroideryColors(rawConfig.embroideryColors),
    embroidery: {
      ...(rawConfig.embroidery || {}),
      config: {
        ...DOBOK_V9_EMBROIDERY_CONFIG,
        ...(rawConfig?.embroidery?.config || {}),
        zones: {
          ...DOBOK_V9_EMBROIDERY_CONFIG.zones,
          ...(rawConfig?.embroidery?.config?.zones || {}),
        },
      },
      layouts,
    },
  };

  return {
    version: Number(payload?.version || 0),
    published: Boolean(payload?.published),
    config,
    fabrics: config.fabrics,
  };
}

async function fetchRemoteCatalog() {
  const response = await fetch(CATALOG_URL, {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  const body = await response.json().catch(() => null);

  if (!response.ok || !body?.ok || !body?.data) {
    throw new Error(
      body?.message || `도복 쇼룸 설정 요청 실패 (${response.status})`
    );
  }

  return normalizePublishedCatalog(body.data);
}

export async function loadDobokCatalog() {
  try {
    const remote = await fetchRemoteCatalog();
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(remote));
    return { ...remote, source: "remote" };
  } catch (remoteError) {
    try {
      const cachedRaw = await AsyncStorage.getItem(CACHE_KEY);
      if (cachedRaw) {
        const cached = JSON.parse(cachedRaw);
        if (
          Array.isArray(cached?.config?.fabrics) &&
          cached.config.fabrics.length > 0 &&
          cached?.config?.embroidery?.layouts
        ) {
          return { ...cached, fabrics: cached.config.fabrics, source: "cache" };
        }
      }
    } catch {
      // 손상된 캐시는 무시하고 내장 데이터를 사용합니다.
    }

    const config = makeFallbackConfig();
    return {
      version: 0,
      published: false,
      config,
      fabrics: config.fabrics,
      source: "fallback",
      error:
        remoteError instanceof Error
          ? remoteError.message
          : "도복 쇼룸 설정을 불러오지 못했습니다.",
    };
  }
}
