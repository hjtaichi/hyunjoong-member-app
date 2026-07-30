import React, { useMemo } from "react";
import { Image, Pressable, ScrollView, Text, useWindowDimensions, View } from "react-native";
import ScreenHeader from "../../src/components/ScreenHeader";
import FavoriteModal from "./components/FavoriteModal";
import OptionCard from "./components/OptionCard";
import PreviewCard from "./components/PreviewCard";
import SaveNameModal from "./components/SaveNameModal";
import SegmentedButton from "./components/SegmentedButton";
import useDobokShowroom from "./hooks/useDobokShowroom";
import {
  DOBOK_CHEST_ICON,
  DOBOK_CLOUD_ICON,
  DOBOK_FABRIC_ICON,
  DOBOK_FORM_ICON,
  DOBOK_NOTICE_BADGE,
  DOBOK_PANTS_COLOR_ICON,
  DOBOK_TOP_COLOR_ICON,
  FAVORITE_STAR,
} from "./showroomAssets";
import ColorSheet from "./sheets/ColorSheet";
import EmbroiderySheet from "./sheets/EmbroiderySheet";
import styles from "./styles/showroomStyles";

export default function DobokShowroomScreen() {
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(430, Math.max(320, width));
  const previewWidth = Math.min(contentWidth - 32, 390);
  const showroom = useDobokShowroom();
  const {
    gender, setGender, setStyle, style, sleeve, setSleeve,
    fabricGroups, fabricKey, showChest, showClouds, setShowClouds, canUseCloudEmbroidery, embroideryColors,
    chestColor, setChestColor, cloudColor, setCloudColor,
    sheet, setSheet, saved, favoritesVisible, setFavoritesVisible,
    nameModalVisible, setNameModalVisible, favoriteName, setFavoriteName,
    editingFavoriteId, setEditingFavoriteId, appliedFavoriteId,
    effectiveStyle, combo, fabric, topColor, pantsColor,
    styleLabels, sleeveLabels, embroideryLayouts,
    chooseFabric, chooseTopColor, choosePantsColor, openCloudSheet,
    openSaveDialog, openRenameDialog, confirmFavoriteName,
    applyFavorite, deleteFavorite,
  } = showroom;

  const embroideryColorOptions = useMemo(() => {
    const candidates = [
      {
        key: "garment-top-color",
        label: "상의와 같은 색",
        hex: topColor?.hex,
      },
      {
        key: "garment-pants-color",
        label: "하의와 같은 색",
        hex: pantsColor?.hex,
      },
      ...(Array.isArray(embroideryColors) ? embroideryColors : []),
    ];

    const seen = new Set();

    return candidates
      .map((item, index) => ({
        ...item,
        key: String(item?.key || `embroidery-option-${index + 1}`),
        label: String(item?.label || `실색 ${index + 1}`),
        hex: String(item?.hex || "").toUpperCase(),
      }))
      .filter((item) => {
        if (!/^#[0-9A-F]{6}$/.test(item.hex) || seen.has(item.hex)) {
          return false;
        }
        seen.add(item.hex);
        return true;
      });
  }, [embroideryColors, topColor?.hex, pantsColor?.hex]);

  return <ScrollView style={styles.screen} contentContainerStyle={[styles.page, { width: contentWidth }]}>
    <ScreenHeader title="나만의 맞춤 도복" />

    <View style={styles.introRow}><Text style={styles.subtitle}>원단과 색상, 자수를 조합해{"\n"}나에게 어울리는 도복을 미리 착용해보세요.</Text></View>

    <View style={styles.topActions}>
      <View style={styles.genderTabs}>
        <SegmentedButton label="남성" variant="gender" active={gender === "male"} onPress={() => { setGender("male"); setStyle("straight"); }} />
        <SegmentedButton label="여성" variant="gender" active={gender === "female"} onPress={() => setGender("female")} />
      </View>
      <Pressable style={styles.savedListButton} onPress={() => setFavoritesVisible(true)} accessibilityRole="button" accessibilityLabel="저장 목록 열기">
        <View style={styles.savedListIconBox}><Image source={FAVORITE_STAR} style={styles.savedListIcon} resizeMode="contain" /></View>
        <Text style={styles.savedListText}>저장 목록 {saved.length}/5</Text><Text style={styles.savedListArrow}>›</Text>
      </Pressable>
    </View>

    <PreviewCard combo={combo} previewWidth={previewWidth} gender={gender} effectiveStyle={effectiveStyle} sleeve={sleeve} fabric={fabric} topColor={topColor} pantsColor={pantsColor} chestColor={chestColor} cloudColor={cloudColor} showChest={showChest} blackBelt={canUseCloudEmbroidery} showClouds={showClouds} styleLabels={styleLabels} sleeveLabels={sleeveLabels} embroideryLayouts={embroideryLayouts} canUseCloudEmbroidery={canUseCloudEmbroidery} />

    <View style={styles.sectionCard}>
      <View style={styles.sectionHeadingRow}><Image source={DOBOK_FORM_ICON} style={styles.sectionHeadingIcon} resizeMode="contain" /><Text style={styles.sectionHeadingText}>상의 및 소매 형태</Text></View>
      <Text style={styles.subsectionLabel}>상의 형태</Text>
      <View style={styles.rowWrap}>
        <SegmentedButton label={styleLabels?.straight || "일자형"} active={effectiveStyle === "straight"} onPress={() => setStyle("straight")} />
        {gender === "female" ? <><SegmentedButton label={styleLabels?.chest || "가슴 사선형"} active={effectiveStyle === "chest"} onPress={() => setStyle("chest")} /><SegmentedButton label={styleLabels?.["diagonal-waist"] || "가슴·허리 사선형"} active={effectiveStyle === "diagonal-waist"} onPress={() => setStyle("diagonal-waist")} /></> : null}
      </View>
      <Text style={[styles.subsectionLabel, styles.sectionSpacing]}>소매 형태</Text>
      <View style={styles.rowWrap}><SegmentedButton label={sleeveLabels?.plain || "민자"} active={sleeve === "plain"} onPress={() => setSleeve("plain")} /><SegmentedButton label={sleeveLabels?.["2button"] || "단추 2개"} active={sleeve === "2button"} onPress={() => setSleeve("2button")} /><SegmentedButton label={sleeveLabels?.["3button"] || "단추 3개"} active={sleeve === "3button"} onPress={() => setSleeve("3button")} /></View>
    </View>

    <View style={styles.sectionCard}>
      <View style={styles.sectionHeadingRow}><Image source={DOBOK_FABRIC_ICON} style={styles.sectionHeadingIcon} resizeMode="contain" /><Text style={styles.sectionHeadingText}>원단 선택</Text></View>
      <Text style={styles.sectionHint}>상의와 하의에는 같은 원단을 적용하고 색상은 각각 선택합니다.</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.fabricRow}>
        {fabricGroups.map((group) => <Pressable key={group.key} onPress={() => chooseFabric(group.key)} style={[styles.fabricCard, group.key === fabricKey && styles.fabricCardActive]}><View style={styles.fabricCardContent}><Text style={styles.fabricLabel}>{group.label}</Text><Text style={styles.fabricCount}>전체 {group.colors.length}색</Text></View></Pressable>)}
      </ScrollView>
    </View>

    <View style={styles.twoColumns}><OptionCard icon={DOBOK_TOP_COLOR_ICON} title="상의 색상" subtitle={`${fabric.label} · ${topColor.position}`} swatch={topColor.hex} onPress={() => setSheet("top")} /><OptionCard icon={DOBOK_PANTS_COLOR_ICON} title="하의 색상" subtitle={`${fabric.label} · ${pantsColor.position}`} swatch={pantsColor.hex} onPress={() => setSheet("pants")} /></View>
    <View style={styles.twoColumns}><OptionCard icon={DOBOK_CHEST_ICON} title="가슴 자수" subtitle={`${showChest ? "사용함" : "사용 안 함"} · ${embroideryColorOptions.find((x) => x.hex === chestColor)?.label || "색상"}`} swatch={chestColor} onPress={() => setSheet("chest")} /><OptionCard icon={DOBOK_CLOUD_ICON} title="구름무늬" subtitle={canUseCloudEmbroidery ? `${showClouds ? "사용함" : "사용 안 함"} · ${embroideryColorOptions.find((x) => x.hex === cloudColor)?.label || "색상"}` : "유단자 전용"} swatch={canUseCloudEmbroidery ? cloudColor : null} locked={!canUseCloudEmbroidery} onPress={openCloudSheet} /></View>

    <View style={styles.notice}><Image source={DOBOK_NOTICE_BADGE} style={styles.noticeBadgeIcon} resizeMode="contain" /><View style={{ flex: 1 }}><Text style={styles.noticeTitle}>도장에서 관장님께 문의해주세요.</Text><Text style={styles.noticeText}>화면의 색상은 기기와 조명에 따라 실제 원단과 다를 수 있습니다.</Text></View></View>

    <Pressable onPress={openSaveDialog} style={styles.saveButton}><Image source={FAVORITE_STAR} style={styles.saveStarIcon} resizeMode="contain" /><Text style={styles.saveButtonText}>현재 디자인 저장하기</Text><Text style={styles.saveLimitText}>{saved.length}/5</Text></Pressable>

    <FavoriteModal visible={favoritesVisible} saved={saved} appliedFavoriteId={appliedFavoriteId} onClose={() => setFavoritesVisible(false)} onApply={applyFavorite} onRename={openRenameDialog} onDelete={deleteFavorite} onSaveNew={() => { setFavoritesVisible(false); openSaveDialog(); }} embroideryLayouts={embroideryLayouts} canUseCloudEmbroidery={canUseCloudEmbroidery} />
    <SaveNameModal visible={nameModalVisible} editingFavoriteId={editingFavoriteId} favoriteName={favoriteName} onChangeName={setFavoriteName} onClose={() => { setNameModalVisible(false); setEditingFavoriteId(null); }} onConfirm={confirmFavoriteName} />
    <ColorSheet visible={sheet === "top"} title="상의 색상 선택" group={fabric} selectedKey={topColor.key} onClose={() => setSheet(null)} onSelect={chooseTopColor} />
    <ColorSheet visible={sheet === "pants"} title="하의 색상 선택" group={fabric} selectedKey={pantsColor.key} onClose={() => setSheet(null)} onSelect={choosePantsColor} />
    <EmbroiderySheet visible={sheet === "chest"} title="가슴 자수 색상 선택" colors={embroideryColorOptions} selectedHex={chestColor} onClose={() => setSheet(null)} onSelect={setChestColor} />
    <EmbroiderySheet
      visible={sheet === "cloud" && canUseCloudEmbroidery}
      title="구름무늬 선택"
      colors={embroideryColorOptions}
      selectedHex={cloudColor}
      enabled={showClouds}
      onToggleEnabled={setShowClouds}
      onClose={() => setSheet(null)}
      onSelect={(hex) => {
        setCloudColor(hex);
        setShowClouds(true);
      }}
    />
  </ScrollView>;
}
