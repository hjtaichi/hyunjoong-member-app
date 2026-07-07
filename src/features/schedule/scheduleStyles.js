import { Platform, StyleSheet } from "react-native";
import { colors, spacing, radius, shadow } from "../../theme";

const isWeb = Platform.OS === "web";

export const fonts = {
  regular: "PretendardRegular",
  medium: "PretendardMedium",
  semiBold: "PretendardSemiBold",
  bold: "PretendardBold",
  title: "MaruBuriBold",
  titleSemi: "MaruBuriSemiBold",
};

export const styles = StyleSheet.create({
  screen: {
  flex: 1,
  backgroundColor: colors.background,
},

content: {
  paddingHorizontal: isWeb ? 12 : 16,
  paddingTop: isWeb ? 24 : 44,
  paddingBottom: isWeb ? 30 : 18,
  gap: isWeb ? 10 : 14,
  width: "100%",
  maxWidth: 430,
  alignSelf: "center",
},

calendarSection: {
  paddingHorizontal: 0,
},

calendarHeader: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginTop: 2,
  marginBottom: 15,
},

selectedScheduleSummaryCard: {
  marginTop: 10,
  backgroundColor: colors.card,
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: radius.lg,
  paddingHorizontal: 14,
  paddingTop: 14,
  paddingBottom: 14,
  ...shadow.card,
},

selectedScheduleSummaryHeader: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 4,
},

selectedScheduleSummaryTitle: {
  fontSize: 18,
  fontFamily: fonts.title,
  color: colors.textMain,
},

selectedScheduleSummaryItem: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingTop: 10,
  paddingBottom: 8,
  borderTopWidth: 1,
  borderTopColor: colors.border,
},

selectedScheduleTime: {
  fontSize: 13,
  fontFamily: fonts.medium,
  color: colors.textSub,
  marginBottom: 6,
  marginTop: 6,
},

selectedScheduleName: {
  fontSize: 16,
  fontFamily: fonts.bold,
  color: colors.textMain,
},

selectedScheduleStatusChip: {
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 8,
  backgroundColor: "#F7EEDC",
},

selectedScheduleStatusText: {
  fontSize: 10,
  fontWeight: "700",
  color: "#9A7448",
},

schedulePageHeader: {
  marginBottom: -10,
},

schedulePageTitle: {
  fontSize: 28,
  fontWeight: "800",
  color: "#2B2522",
  marginBottom: 8,
},

schedulePageDescription: {
  fontSize: 14,
  lineHeight: 20,
  color: "#8A8176",
},

scheduleViewToggle: {
  flexDirection: "row",
  backgroundColor: colors.card,
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: radius.md,
  padding: 3,
  marginTop: 0,
  marginBottom: spacing.md,
},

scheduleToggleButton: {
  flex: 1,
  height: 40,
  borderRadius: 10,
  alignItems: "center",
  justifyContent: "center",
},

scheduleToggleActive: {
  backgroundColor: colors.warmBrown,
},

scheduleToggleText: {
  fontSize: 14,
  fontFamily: fonts.semiBold,
  color: colors.softBrown,
},

scheduleToggleTextActive: {
  color: colors.white,
},

monthButton: {
  width: 20,
  height: 20,
  borderRadius: 8,
  backgroundColor: "transparent",
  alignItems: "center",
  justifyContent: "center",
},

monthButtonText: {
  fontSize: 20,
  fontWeight: "800",
  color: "#8D7F76",
  marginTop: -1,
},

monthTitle: {
  fontSize: 16,
  fontFamily: fonts.title,
  color: colors.textMain,
},
weekHeader: {
  flexDirection: "row",
  marginBottom: 6,
},

weekRow: {
  flexDirection: "row",
  marginTop: 4,
},
dayCell: {
  flex: 1,
  aspectRatio: 1,
  marginHorizontal: 3,
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
},

dayInner: {
  width: 43,
  height: 43,
  borderRadius: 19,
  alignItems: "center",
  justifyContent: "center",
},

dayInnerSelected: {
  borderWidth: 1,
  borderColor: "#BCA99F",
},

dayInnerToday: {
  borderWidth: 1,
  borderColor: "#D8CFC4",
},
center: {
    flex: 1,
    backgroundColor: "#FFFCF8",
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "#7D746D",
  },
  
selectedScheduleSummaryMore: {
  fontSize: 12,
  fontWeight: "600",
  color: "#8A8176",
},

weekHeaderText: {
    flex: 1,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
    color: "#9A8F81",
  },

  weekHeaderTextSunday: {
    color: "#C45A2A",
  },

dayNumber: {
  fontSize: 15,
  fontWeight: "600",
  color: "#2B2522",
},

dayNumberSelected: {
  color: "#6B4F46",
  fontFamily: fonts.bold,
},

  dayNumberSunday: {
    color: "#C45A2A",
  },

  dayNumberEvent: {
    color: "#7A8D63",
  },

  eventDot: {
    width: 5,
    height: 5,
    borderRadius: 999,
    marginTop: 3,
    zIndex: 20,
  },

  eventDotClosed: {
    backgroundColor: "#C45A2A",
  },

  eventDotOpen: {
    backgroundColor: "#9AA874",
  },

  selectedScheduleEmptyText: {
    fontSize: 15,
    color: "#7D746D",
    paddingVertical: 18,
  },

sheetOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(43,37,34,0.22)",
  },

  sheetBackdrop: {
    flex: 1,
  },

  sheetContainer: {
  backgroundColor: "#FFFEFC",
  borderTopLeftRadius: 28,
  borderTopRightRadius: 28,
  maxHeight: "68%",
  paddingTop: 10,
  paddingHorizontal: 18,
  paddingBottom: 22,
},

  sheetHandle: {
    alignSelf: "center",
    width: 46,
    height: 5,
    borderRadius: 999,
    backgroundColor: "#DCC6BE",
    marginBottom: 16,
  },

  sheetHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  sheetTitle: {
  fontSize: 21,
  fontFamily: fonts.title,
  color: colors.textMain,
},

  sheetCloseButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  sheetCloseButtonText: {
  fontSize: 14,
  fontFamily: fonts.semiBold,
  color: colors.textSub,
},

  sheetContent: {
    paddingBottom: 45,
    gap: 0,
  },

  emptySheetBox: {
    paddingVertical: 32,
    alignItems: "center",
  },

  emptySheetText: {
    fontSize: 15,
    color: "#7D746D",
  },

  selectedEventNotice: {
    marginBottom: 12,
    borderRadius: 18,
    paddingHorizontal: 15,
    paddingVertical: 13,
    borderWidth: 1,
  },

  selectedEventNoticeOpen: {
    backgroundColor: "#FFF8EF",
    borderColor: "#F1D7B9",
  },

  selectedEventNoticeClosed: {
    backgroundColor: "#FFF5F2",
    borderColor: "#EBCBC2",
  },

  selectedEventNoticeTitle: {
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 4,
  },

  selectedEventNoticeTitleOpen: {
    color: "#9A7448",
  },

  selectedEventNoticeTitleClosed: {
    color: "#B45B45",
  },

  selectedEventNoticeText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2B2522",
  },

  selectedEventNoticeSubText: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "500",
    color: "#8A5B50",
  },

  compactScheduleCard: {
  paddingVertical: 12,
  borderBottomWidth: 1,
  borderBottomColor: "#F1E8E0",
},

compactScheduleRow: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
},

compactScheduleLeft: {
  flex: 1,
  paddingRight: 8,
},
compactTitleRow: {
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
  flexWrap: "wrap",
},

compactStatusChip: {
  alignSelf: "center",
  paddingHorizontal: 8,
  paddingVertical: 3,
  borderRadius: 999,
  marginBottom: 0,
  marginTop: 2,
},

compactRecurringBadge: {
  backgroundColor: "#F7EEDC",
  paddingHorizontal: 8,
  paddingVertical: 3,
  borderRadius: 999,
},
compactScheduleTitle: {
  fontSize: 17,
  fontWeight: "700",
  color: "#2B2522",
  marginBottom: 4,
},

  compactRecurringBadge: {
    backgroundColor: "#F7EEDC",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },

  compactRecurringBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#8A684A",
  },


compactStatusChipText: {
  fontSize: 10,
  fontWeight: "700",
},

compactHelperText: {
  marginTop: 2,
  fontSize: 12,
  lineHeight: 17,
  color: "#8A8176",
},

compactActionButton: {
  minWidth: 72,
  height: 36,
  paddingHorizontal: 10,
  borderRadius: 12,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#6B4F46",
},

compactActionButtonText: {
  fontSize: 12,
  fontWeight: "700",
  color: "#FFFFFF",
},

  compactActionButtonPrimary: {
    backgroundColor: "#6B4F46",
  },

  compactActionButtonSecondary: {
    backgroundColor: "#F3ECE5",
    borderWidth: 1,
    borderColor: "#DED4C8",
  },

  compactActionButtonTextSecondary: {
    color: "#6B4F46",
  },

  compactCancelButton: {
    marginTop: 10,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#F3ECE5",
    borderWidth: 1,
    borderColor: "#DED4C8",
  },

  compactCancelButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6B4F46",
  },

  scheduleCardAvailable: {
  backgroundColor: "transparent",
  borderColor: "transparent",
},

scheduleCardReserved: {
  backgroundColor: "transparent",
  borderColor: "transparent",
},

scheduleCardDone: {
  backgroundColor: "transparent",
  borderColor: "transparent",
},

  scheduleCardCancelled: {
    backgroundColor: "#FFF8EF",
    borderColor: "#F1D7B9",
  },

  scheduleCardDisabled: {
  backgroundColor: "transparent",
  borderColor: "transparent",
},

  scheduleStatusChipAvailable: {
    backgroundColor: "#F8F2ED",
  },

  scheduleStatusChipTextAvailable: {
    color: "#9A7B67",
  },

  scheduleStatusChipReserved: {
    backgroundColor: "#F3E4D2",
  },

  scheduleStatusChipTextReserved: {
    color: "#8A684A",
  },

  scheduleStatusChipDone: {
    backgroundColor: "#E9E1DA",
  },

  scheduleStatusChipTextDone: {
    color: "#6B4F46",
  },

  scheduleStatusChipCancelled: {
    backgroundColor: "#FFF1E6",
  },

  scheduleStatusChipTextCancelled: {
    color: "#9A7448",
  },

  scheduleStatusChipDisabled: {
    backgroundColor: "#EDE8E3",
  },

  scheduleStatusChipTextDisabled: {
    color: "#7D746D",
  },
  
weekListCard: {
  backgroundColor: colors.card,
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: radius.lg,
  paddingHorizontal: 14,
  paddingTop: 14,
  paddingBottom: 6,
  ...shadow.card,
},

weekListTitle: {
  fontSize: 18,
  fontFamily: fonts.title,
  color: colors.textMain,
  marginBottom: 10,
},

weekDaySection: {
  paddingVertical: 8,
  borderTopWidth: 1,
  borderTopColor: colors.border,
},

weekDayTitle: {
  fontSize: 13,
  fontWeight: "700",
  color: "#6B4F46",
  marginBottom: 8,
},

weekEmptyText: {
  fontSize: 12,
  color: "#A78D83",
},

weekScheduleRow: {
  flexDirection: "row",
  alignItems: "center",
  paddingVertical: 5,
  gap: 8,
},

weekScheduleTime: {
  width: 70,
  fontSize: 12,
  fontWeight: "500",
  color: "#8A8176",
},

weekScheduleName: {
  flex: 1,
  fontSize: 13,
  fontWeight: "600",
  color: "#2B2522",
},

weekScheduleStatusChip: {
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 999,
  backgroundColor: "#F7EEDC",
},

weekScheduleStatusText: {
  fontSize: 10,
  fontWeight: "700",
  color: "#9A7448",
},
weekScheduleStatusChipDone: {
  backgroundColor: "#E9E1DA",
},

weekScheduleStatusTextDone: {
  color: "#6B4F46",
},

weekScheduleStatusChipReserved: {
  backgroundColor: "#F7EEDC",
},

weekScheduleStatusTextReserved: {
  color: "#9A7448",
},
recurringInfoBox: {
  marginTop: 10,
  paddingLeft: 14,
  paddingRight: 8,
  paddingVertical: 9,
  borderRadius: radius.md,
  backgroundColor: "#F8F1EA",
  borderWidth: 1,
  borderColor: colors.border,
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
},

recurringInfoLabel: {
  fontSize: 14,
  fontFamily: fonts.bold,
  color: colors.warmBrown,
},

recurringInfoText: {
  flex: 1,
  fontSize: 13,
  fontFamily: fonts.semiBold,
  color: colors.textSub,
},

recurringSettingButton: {
  width: 28,
  height: 28,
  borderRadius: 999,
  alignItems: "center",
  justifyContent: "center",
},

recurringSettingIcon: {
  width: 18,
  height: 18,
  opacity: 0.75,
},
dayStampPresent: {
  width: 34,
  height: 34,
  borderRadius: 17,
  backgroundColor: colors.present,
  alignItems: "center",
  justifyContent: "center",
},

dayStampReserved: {
  width: 34,
  height: 34,
  borderRadius: 17,
  backgroundColor: colors.reserved,
  alignItems: "center",
  justifyContent: "center",
},

dayStampTextPresent: {
  fontSize: 15,
  fontFamily: fonts.bold,
  color: colors.white,
},

dayStampTextReserved: {
  fontSize: 15,
  fontFamily: fonts.bold,
  color: colors.warmBrown,
},
});