import React, { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import styles from "../styles/showroomStyles";

export default function ColorSheet({ visible, title, group, selectedKey, onClose, onSelect }) {
  const [query, setQuery] = useState("");
  useEffect(() => { if (!visible) setQuery(""); }, [visible]);
  const colors = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return group.colors;
    return group.colors.filter((item) => `${item.position} ${item.label} ${item.key}`.toLowerCase().includes(q));
  }, [group, query]);
  const selected = group.colors.find((item) => item.key === selectedKey);
  return <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <View style={styles.modalBackdrop}><View style={styles.sheet}>
      <View style={styles.sheetHandle} />
      <View style={styles.sheetHeader}><View><Text style={styles.sheetTitle}>{title}</Text><Text style={styles.sheetSub}>{group.label} · 전체 {group.colors.length}색</Text></View><Pressable onPress={onClose}><Text style={styles.close}>×</Text></Pressable></View>
      <TextInput value={query} onChangeText={setQuery} placeholder="색상번호 검색" placeholderTextColor="#A79B91" style={styles.search} />
      {selected ? <View style={styles.selectedColor}><View style={[styles.selectedCircle, { backgroundColor: selected.hex }]} /><View style={{ flex: 1 }}><Text style={styles.selectedLabel}>선택한 색상</Text><Text style={styles.selectedName}>{selected.position}</Text></View><Text style={styles.check}>✓</Text></View> : null}
      <ScrollView style={styles.colorScroll} contentContainerStyle={styles.colorGrid} showsVerticalScrollIndicator={false}>
        {colors.map((item) => { const active = item.key === selectedKey; return <Pressable key={item.key} onPress={() => onSelect(item)} style={[styles.colorTile, active && styles.colorTileActive]}><View style={[styles.colorBlock, { backgroundColor: item.hex }]} /><Text numberOfLines={1} style={styles.colorCode}>{item.position}</Text>{active ? <View style={styles.miniCheck}><Text style={styles.miniCheckText}>✓</Text></View> : null}</Pressable>; })}
      </ScrollView>
      <Pressable onPress={onClose} style={styles.primaryButton}><Text style={styles.primaryButtonText}>선택 완료</Text></Pressable>
    </View></View>
  </Modal>;
}
