import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

const rows = [
  { time: "10:00 ~ 11:20", tue: "정규반", wed: "정규반", thu: "정규반", fri: "정규반", sat: "정규반" },
  { time: "13:00 ~ 14:00", tue: "개인지도", wed: "개인지도", thu: "개인지도", fri: "개인지도", sat: "-" },
  { time: "13:30 ~ 14:50", tue: "-", wed: "-", thu: "-", fri: "-", sat: "정규반" },
  { time: "14:20 ~ 15:20", tue: "개인지도", wed: "개인지도", thu: "개인지도", fri: "개인지도", sat: "-" },
  { time: "16:00 ~ 17:20", tue: "정규반", wed: "정규반", thu: "정규반", fri: "정규반", sat: "-" },
  { time: "19:00 ~ 20:20", tue: "정규반", wed: "정규반", thu: "정규반", fri: "정규반", sat: "한국총회 지도자 수련" },
];

export default function ScheduleScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.subtitle}>
        현중태극권 정규 수련 시간표입니다.
      </Text>

      <View style={styles.noticeBox}>
        <Text style={styles.noticeText}>
          월요일은 연구일 및 유단자 수련이 있습니다.{"\n"}
          휴무일은 월요일·일요일·공휴일입니다.
        </Text>
      </View>

      <View style={styles.table}>
        <View style={[styles.row, styles.headerRow]}>
          <Text style={[styles.cell, styles.timeCell, styles.headerText]}>시간</Text>
          <Text style={[styles.cell, styles.headerText]}>화</Text>
          <Text style={[styles.cell, styles.headerText]}>수</Text>
          <Text style={[styles.cell, styles.headerText]}>목</Text>
          <Text style={[styles.cell, styles.headerText]}>금</Text>
          <Text style={[styles.cell, styles.headerText]}>토</Text>
        </View>

        {rows.map((row, index) => (
          <View key={index} style={styles.row}>
            <Text style={[styles.cell, styles.timeCell]}>{row.time}</Text>
            <Text style={styles.cell}>{row.tue || "-"}</Text>
            <Text style={styles.cell}>{row.wed || "-"}</Text>
            <Text style={styles.cell}>{row.thu || "-"}</Text>
            <Text style={styles.cell}>{row.fri || "-"}</Text>
            <Text style={styles.cell}>{row.sat || "-"}</Text>
          </View>
        ))}
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>안내</Text>
        <Text style={styles.infoText}>
          개인지도와 특별 수련은 도장 사정에 따라 변동될 수 있습니다.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f6f3ee",
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 28,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#2f2a24",
  },
  subtitle: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 21,
    color: "#6b6257",
  },
  noticeBox: {
    marginTop: 12,
    borderRadius: 18,
    padding: 14,
    backgroundColor: "#fff7ed",
    borderWidth: 1,
    borderColor: "#fed7aa",
  },
  noticeText: {
    fontSize: 13,
    lineHeight: 20,
    color: "#7c2d12",
    fontWeight: "700",
  },
  table: {
    marginTop: 18,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ded4c7",
    backgroundColor: "#fffdf9",
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ece4d8",
  },
  headerRow: {
    backgroundColor: "#f3ecdf",
  },
  cell: {
    flex: 1,
    minHeight: 58,
    paddingHorizontal: 5,
    paddingVertical: 10,
    textAlign: "center",
    textAlignVertical: "center",
    fontSize: 12,
    lineHeight: 17,
    color: "#3f3831",
    fontWeight: "700",
  },
  timeCell: {
    flex: 1.25,
    color: "#5f554b",
  },
  headerText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#2f2a24",
  },
  infoCard: {
    marginTop: 16,
    borderRadius: 18,
    padding: 16,
    backgroundColor: "#fffdf9",
    borderWidth: 1,
    borderColor: "#ece4d8",
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#2f2a24",
  },
  infoText: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 20,
    color: "#6b6257",
  },
});