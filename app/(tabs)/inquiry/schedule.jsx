import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, radius, shadow } from "../../../src/theme";
import ScreenHeader from "../../../src/components/ScreenHeader";

const fonts = {
  medium: "PretendardMedium",
  semiBold: "PretendardSemiBold",
  bold: "PretendardBold",
  titleSemi: "MaruBuriSemiBold",
};

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
  <ScreenHeader title="수련 시간표" />

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
  backgroundColor: colors.background,
},

content: {
  paddingHorizontal: 16,
  paddingTop: 24,
  paddingBottom: 110,
  width: "100%",
  maxWidth: 430,
  alignSelf: "center",
},subtitle: {
  fontSize: 14,
  lineHeight: 22,
  fontFamily: fonts.medium,
  color: colors.textSub,
  marginBottom: 12,
},

noticeBox: {
  borderRadius: radius.md,
  paddingHorizontal: 14,
  paddingVertical: 12,
  backgroundColor: "#F8F1EA",
  borderWidth: 1,
  borderColor: colors.border,
},

noticeText: {
  fontSize: 13,
  lineHeight: 20,
  fontFamily: fonts.semiBold,
  color: colors.warmBrown,
},

table: {
  marginTop: 16,
  borderRadius: radius.lg,
  overflow: "hidden",
  borderWidth: 1,
  borderColor: colors.border,
  backgroundColor: colors.card,
  ...shadow.card,
},
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ece4d8",
  },
  headerRow: {
  backgroundColor: "#F5EDE3",
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
  fontFamily: fonts.semiBold,
  color: colors.textMain,
},

timeCell: {
  flex: 1.25,
  color: colors.textSub,
},

headerText: {
  fontSize: 12,
  fontFamily: fonts.bold,
  color: colors.textMain,
},

infoCard: {
  marginTop: 16,
  borderRadius: radius.lg,
  padding: 16,
  backgroundColor: colors.card,
  borderWidth: 1,
  borderColor: colors.border,
  ...shadow.card,
},

infoTitle: {
  fontSize: 16,
  fontFamily: fonts.titleSemi,
  color: colors.textMain,
},

infoText: {
  marginTop: 6,
  fontSize: 14,
  lineHeight: 22,
  fontFamily: fonts.medium,
  color: colors.textSub,
},
});