import React from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { DEFAULT_EMBROIDERY_COLORS } from "../showroomConstants";
import styles from "../styles/showroomStyles";

export default function EmbroiderySheet({ visible, title, selectedHex, colors = DEFAULT_EMBROIDERY_COLORS, onClose, onSelect }) {
  return <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <View style={styles.modalBackdrop}><View style={[styles.sheet, styles.smallSheet]}>
      <View style={styles.sheetHandle} />
      <View style={styles.sheetHeader}><Text style={styles.sheetTitle}>{title}</Text><Pressable onPress={onClose}><Text style={styles.close}>×</Text></Pressable></View>
      <ScrollView
        style={{ maxHeight: 470 }}
        contentContainerStyle={{ paddingBottom: 28 }}
        showsVerticalScrollIndicator
        nestedScrollEnabled
      >
        <View style={styles.embroideryGrid}>
          {colors.filter((item) => item?.hex).map((item) => {
            const active =
              String(item.hex).toUpperCase() ===
              String(selectedHex || "").toUpperCase();

            return (
              <Pressable
                key={item.key}
                onPress={() => onSelect(item.hex)}
                style={styles.embroideryItem}
              >
                <View
                  style={[
                    styles.embroideryRing,
                    active && styles.embroideryRingActive,
                  ]}
                >
                  <View
                    style={[
                      styles.embroideryDot,
                      { backgroundColor: item.hex },
                    ]}
                  />
                </View>
                <Text style={styles.embroideryLabel}>{item.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
      <Pressable onPress={onClose} style={styles.primaryButton}>
        <Text style={styles.primaryButtonText}>선택 완료</Text>
      </Pressable>
    </View></View>
  </Modal>;
}
