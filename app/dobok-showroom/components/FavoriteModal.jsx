import React from "react";
import { Image, Modal, Pressable, ScrollView, Text, View } from "react-native";
import DobokPreviewV9 from "../../../src/features/dobok/v9/DobokPreviewV9";
import { DOBOK_V9_COMBO_LIST } from "../../../src/features/dobok/v9/dobokV9Assets";
import { FAVORITE_STAR } from "../showroomAssets";
import styles from "../styles/showroomStyles";

export default function FavoriteModal({ visible, saved, appliedFavoriteId, onClose, onApply, onRename, onDelete, onSaveNew, embroideryLayouts, canUseCloudEmbroidery }) {
  return <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <View style={styles.modalBackdrop}><View style={[styles.sheet, styles.favoriteSheet]}>
      <View style={styles.sheetHandle} />
      <View style={styles.sheetHeader}><View><Text style={styles.sheetTitle}>즐겨찾기</Text><Text style={styles.sheetSub}>최대 5개 · 현재 {saved.length}개 저장됨</Text></View><Pressable onPress={onClose}><Text style={styles.close}>×</Text></Pressable></View>
      {saved.length === 0 ? <View style={styles.emptyFavorites}><Image source={FAVORITE_STAR} style={styles.emptyStarIcon} resizeMode="contain" /><Text style={styles.emptyFavoriteTitle}>저장된 도복이 없습니다.</Text><Text style={styles.emptyFavoriteText}>마음에 드는 조합을 만들어 즐겨찾기에 저장해보세요.</Text></View> : <ScrollView style={styles.favoriteList} contentContainerStyle={styles.favoriteListContent} showsVerticalScrollIndicator={false}>{saved.map((item) => {
        const itemCombo = DOBOK_V9_COMBO_LIST.find((comboItem) => comboItem.gender === item.gender && comboItem.style === item.style && comboItem.sleeve === item.sleeve);
        const current = appliedFavoriteId === item.id;
        return <View key={item.id} style={[styles.favoriteCard, current && styles.favoriteCardCurrent]}>
          <Pressable style={styles.favoriteApplyArea} onPress={() => onApply(item)}>
            <View style={styles.favoritePreviewWrap}>{itemCombo ? <DobokPreviewV9 comboKey={itemCombo.key} width={86} topColor={item.topColorHex} pantsColor={item.pantsColorHex} chestEmbroideryColor={item.chestColor} cloudEmbroideryColor={item.cloudColor} showChest={item.showChest !== false} showBlackBeltClouds={canUseCloudEmbroidery && Boolean(item.showClouds)} embroideryLayouts={embroideryLayouts} /> : null}</View>
            <View style={styles.favoriteInfo}><View style={styles.favoriteNameRow}><Text numberOfLines={1} style={styles.favoriteName}>{item.name}</Text>{current ? <Text style={styles.currentBadge}>현재 적용 중</Text> : null}</View><Text style={styles.favoriteMeta}>{item.fabricLabel}</Text><Text style={styles.favoriteMeta}>상의 {item.topColorLabel} · 하의 {item.pantsColorLabel}</Text><Text style={styles.favoriteApplyText}>{current ? "현재 디자인" : "눌러서 적용하기"}</Text></View>
          </Pressable>
          <View style={styles.favoriteActions}><Pressable onPress={() => onRename(item)} style={styles.favoriteActionButton}><Text style={styles.favoriteActionText}>이름 변경</Text></Pressable><Pressable onPress={() => onDelete(item)} style={styles.favoriteActionButton}><Text style={[styles.favoriteActionText, styles.deleteText]}>삭제</Text></Pressable></View>
        </View>;
      })}</ScrollView>}
      <Pressable onPress={onSaveNew} style={[styles.primaryButton, saved.length >= 5 && styles.disabledButton]} disabled={saved.length >= 5}><Text style={styles.primaryButtonText}>{saved.length >= 5 ? "즐겨찾기 5개 저장 완료" : "현재 디자인 새로 저장하기"}</Text></Pressable>
    </View></View>
  </Modal>;
}
