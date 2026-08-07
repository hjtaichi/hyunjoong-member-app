import { Platform, StyleSheet } from "react-native";
import { colors, spacing, radius, shadow, readability } from "../../theme";

const isWeb = Platform.OS === "web";
const fonts = {
  regular: "PretendardRegular",
  medium: "PretendardMedium",
  semiBold: "PretendardSemiBold",
  bold: "PretendardBold",

  title: "MaruBuriBold",
  titleSemi: "MaruBuriSemiBold",
  titleRegular: "MaruBuriRegular",

  handwriting: "KyoboHandwriting2025lyb",
  brush: "SimKyungha",
};
const styles = StyleSheet.create({
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

  center: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSub,
  },

  homeHeader: {
  minHeight: isWeb ? 136 : 160,
  paddingHorizontal: 4,
  paddingTop: isWeb ? 6 : 12,
  paddingBottom: isWeb ? 42 : 54,
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "flex-start",
  position: "relative",
  overflow: "visible",
},

homeHeaderTextBlock: {
  paddingLeft: 9,
},
  homeMountainBg: {
  position: "absolute",
  left: -95,
  right: -40,
  bottom: -54,
  height: 190,
  opacity: 0.72,
  transform: [{ scale: 0.82 }],
},

  homeGreeting: {
  fontSize: 16,
  fontFamily: fonts.semiBold,
  lineHeight: isWeb ? 20 : 20,
  color: colors.textSub,
  marginTop: 14,
  marginBottom: 4,
},

homeNameRow: {
  flexDirection: "row",
  alignItems: "center",
  flexWrap: "wrap",
  gap: 8,
  marginBottom: 7,
},

homeName: {
  flexShrink: 1,
  fontSize: isWeb ? 35 : 38,
  fontFamily: fonts.title,
  letterSpacing: 0.1,
  color: colors.textMain,
},

  homeBadgeRow: {
    marginTop: -2,
    flexDirection: "row",
    gap: 7,
    flexWrap: "wrap",
  },

  homeBadge: {
  minHeight: isWeb ? 26 : 30,
  paddingHorizontal: isWeb ? 9 : 11,
  paddingVertical: isWeb ? 4 : 5,
  borderRadius: 999,
  backgroundColor: colors.blushBeige,
  alignItems: "center",
  justifyContent: "center",
},


  homeBadgeText: {
  fontSize: readability.metadata.fontSize,
  lineHeight: readability.metadata.lineHeight,
  fontFamily: fonts.bold,
  color: colors.warmBrown,
},

homeRankBadgeInline: {
  minHeight: isWeb ? 24 : 27,
  paddingHorizontal: isWeb ? 8 : 9,
  paddingVertical: isWeb ? 3 : 4,
},

homeMemberBadgeRow: {
  flexDirection: "row",
  alignItems: "center",
  flexWrap: "wrap",
  gap: isWeb ? 5 : 6,
  minHeight: isWeb ? 40 : 38,
  marginBottom: -5,
},

homeMemberBadgeButton: {
  width: isWeb ? 34 : 36,
  height: isWeb ? 34 : 36,
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 999,
},

homeMemberBadgeButtonPressed: {
  opacity: 0.72,
  transform: [{ scale: 0.95 }],
},

homeMemberBadgeIcon: {
  width: "100%",
  height: "100%",
},

// HJTAICHI_HOME_MEMBER_BADGE_STYLES_V1

homeBadgeYudanja: {
  backgroundColor: "#6A4B3F",
  borderWidth: 1,
  borderColor: "#D8B06A",
},

homeBadgeTextYudanja: {
  color: "#FFF6E4",
},

 todayTrainingCard: {
  marginTop: isWeb ? -24 : -28,
  backgroundColor: colors.card,
  borderRadius: radius.lg,
  borderWidth: 1,
  borderColor: colors.bronzeGold,
  paddingTop: isWeb ? 14 : 16,
  paddingBottom: isWeb ? 14 : 16,
  paddingHorizontal: spacing.lg,
  overflow: "hidden",
  ...shadow.card,
},

todayTrainingHeader: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: isWeb ? 10 : 14,
  marginLeft: isWeb ? 2 : 8,
  zIndex: 5,
},

todayTrainingLabel: {
  marginTop: 3,
  fontSize: isWeb ? 16 : 18,
  fontFamily: fonts.title,
  lineHeight: 24,
  color: colors.textMain,
},

todayTrainingMore: {
  fontSize: readability.actionText.fontSize,
  lineHeight: readability.actionText.lineHeight,
  fontFamily: fonts.semiBold,
  marginTop: -8,
  color: colors.textSubStrong,
},

todayTrainingTitle: {
  fontSize: isWeb ? 24 : 28,
  fontFamily: fonts.title,
  letterSpacing: -0.6,
  lineHeight: isWeb ? 31 : 34,
  color: colors.textMain,
  marginTop: 6,
  marginLeft: isWeb ? 2 : 8,
  maxWidth: "76%",
  zIndex: 5,
},

todayTrainingStep: {
  fontSize: isWeb ? 15 : 16,
  fontFamily: fonts.semiBold,
  lineHeight: isWeb ? 19 : 21,
  color: colors.warmBrown,
  marginTop: 7,
  marginBottom: isWeb ? 24 : 32,
  marginLeft: isWeb ? 4 : 8,
  maxWidth: "76%",
  zIndex: 5,
},

todayTrainingButton: {
  height: isWeb ? 43 : 47,
  borderRadius: 14,
  backgroundColor: colors.warmBrown,
  alignItems: "center",
  justifyContent: "center",
  marginTop: 3,
  zIndex: 5,
},

todayTrainingButtonText: {
  fontSize: isWeb ? 15 : 17,
  fontFamily: fonts.bold,
  color: colors.white,
},

card: {
  backgroundColor: colors.card,
  borderRadius: radius.lg,
  paddingHorizontal: spacing.lg,
  paddingTop: spacing.lg,
  paddingBottom: spacing.lg,
  borderWidth: 1,
  borderColor: colors.border,
  ...shadow.card,
},

  miniCalendarHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  miniCalendarTitle: {
  fontSize: isWeb ? 19 : 22,
  fontFamily: fonts.title,
  letterSpacing: -0.3,
  lineHeight: 28,
  color: colors.textMain,
},

miniCalendarMore: {
  fontSize: readability.actionText.fontSize,
  lineHeight: readability.actionText.lineHeight,
  fontFamily: fonts.semiBold,
  color: colors.textSubStrong,
},

  weekHeader: {
    flexDirection: "row",
    marginTop: 2,
    marginBottom: 4,
  },

  weekHeaderText: {
  flex: 1,
  textAlign: "center",
  fontSize: readability.metadataStrong.fontSize,
  lineHeight: readability.metadataStrong.lineHeight,
  fontFamily: fonts.bold,
  color: colors.textMeta,
},

  weekHeaderTextSunday: {
    color: "#C45A2A",
  },

  weekRow: {
    flexDirection: "row",
    marginTop: 1,
  },

  dayCell: {
  flex: 1,
  height: 34,
  marginHorizontal: 2,
  borderRadius: 999,
  backgroundColor: "transparent",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
  overflow: "visible",
},

  dayCellSelected: {
    borderWidth: 0.8,
    borderColor: colors.roseTaupe,
    backgroundColor: colors.card,
  },

  dayCellToday: {
    borderWidth: 1,
    borderColor: colors.roseTaupe,
    backgroundColor: colors.card,
  },

  dayNumber: {
  fontSize: readability.body.fontSize,
  lineHeight: readability.body.lineHeight,
  fontFamily: fonts.bold,
  color: colors.textMain,
  zIndex: 5,
},

  dayNumberSelected: {
    color: "#325B7A",
  },

  dayNumberSunday: {
    color: "#C45A2A",
  },

  dayNumberEvent: {
    color: "#059669",
  },

  dayStatusDotPresent: {
    position: "absolute",
    bottom: 4,
    width: 5,
    height: 5,
    borderRadius: 999,
    backgroundColor: colors.present,
  },

  dayStatusDotReserved: {
    position: "absolute",
    bottom: 4,
    width: 5,
    height: 5,
    borderRadius: 999,
    backgroundColor: colors.bronzeGold,
  },

  eventDot: {
    position: "absolute",
    bottom: 4,
    width: 5,
    height: 5,
    borderRadius: 999,
    zIndex: 20,
  },

  eventDotClosed: {
    backgroundColor: colors.danger,
  },

  eventDotOpen: {
    backgroundColor: "#10B981",
  },

  noticeSummaryCard: {
    backgroundColor: colors.card,
    borderRadius: 22,
    borderWidth: 0.4,
    borderColor: colors.border,
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginBottom: -8,
  },

  noticeSummaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  noticeSummaryTitle: {
  fontSize: isWeb ? 19 : 22,
  fontFamily: fonts.title,
  color: colors.textMain,
},

noticeSummaryMore: {
  fontSize: readability.actionText.fontSize,
  lineHeight: readability.actionText.lineHeight,
  fontFamily: fonts.bold,
  color: colors.textSubStrong,
},

  noticeSummaryItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  },

  noticeSummaryBullet: {
    width: 16,
    fontSize: 16,
    fontWeight: "800",
    color: colors.warmBrown,
  },

  noticeSummaryText: {
  flex: 1,
  fontSize: readability.body.fontSize,
  lineHeight: readability.body.lineHeight,
  fontFamily: fonts.semiBold,
  color: colors.textMain,
},

noticeSummaryDate: {
  marginLeft: 10,
  fontSize: readability.metadata.fontSize,
  lineHeight: readability.metadata.lineHeight,
  fontFamily: fonts.semiBold,
  color: colors.textMeta,
},

  noticeSummaryEmpty: {
    fontSize: readability.metadataStrong.fontSize,
    lineHeight: readability.metadataStrong.lineHeight,
    fontWeight: "600",
    color: colors.textSubStrong,
    paddingVertical: 6,
  },

  sheetOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(43,37,34,0.25)",
  },

  sheetBackdrop: {
    flex: 1,
  },

  sheetContainer: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "72%",
    paddingTop: 10,
    paddingHorizontal: 18,
    paddingBottom: 22,
  },

  sheetHandle: {
    alignSelf: "center",
    width: 48,
    height: 5,
    borderRadius: 999,
    backgroundColor: colors.roseTaupe,
    marginBottom: 14,
  },

  sheetHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  sheetTitle: {
    fontSize: 23,
    fontWeight: "800",
    color: colors.textMain,
  },

  sheetCloseButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  sheetCloseButtonText: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.textSub,
  },

  sheetContent: {
    paddingBottom: 45,
    gap: 0,
  },

  emptySheetBox: {
    paddingVertical: 28,
    alignItems: "center",
  },

  emptySheetText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textSub,
  },

  selectedEventNotice: {
    marginBottom: 12,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
  },

  selectedEventNoticeOpen: {
    backgroundColor: "#FFF7ED",
    borderColor: "#FED7AA",
  },

  selectedEventNoticeClosed: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
  },

  selectedEventNoticeTitle: {
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 4,
  },

  selectedEventNoticeTitleOpen: {
    color: "#C2410C",
  },

  selectedEventNoticeTitleClosed: {
    color: "#B91C1C",
  },

  selectedEventNoticeText: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.textMain,
  },

  selectedEventNoticeSubText: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "600",
    color: "#7F1D1D",
  },

  compactScheduleCard: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.card,
  },

  compactScheduleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  compactScheduleLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 7,
  },

  compactScheduleTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.textMain,
  },

  compactRecurringBadge: {
    backgroundColor: colors.blushBeige,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },

  compactRecurringBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.warmBrown,
  },

  compactStatusChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },

  compactStatusChipText: {
    fontSize: 11,
    fontWeight: "800",
  },

  compactHelperText: {
    marginTop: 10,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "600",
    color: colors.textSub,
  },

  compactActionButton: {
    minWidth: 96,
    height: 46,
    paddingHorizontal: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.warmBrown,
  },

  compactActionButtonPrimary: {
    backgroundColor: colors.warmBrown,
  },

  compactActionButtonSecondary: {
    backgroundColor: colors.blushBeige,
  },

  compactActionButtonText: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.white,
  },

  compactActionButtonTextSecondary: {
    color: colors.warmBrown,
  },

  scheduleCardAvailable: {
    backgroundColor: colors.card,
    borderColor: colors.border,
  },

  scheduleCardReserved: {
    backgroundColor: colors.card,
    borderColor: colors.border,
  },

  scheduleCardDone: {
    backgroundColor: colors.card,
    borderColor: colors.border,
  },

  scheduleCardCancelled: {
    backgroundColor: colors.card,
    borderColor: colors.border,
  },

  scheduleCardDisabled: {
    backgroundColor: colors.card,
    borderColor: colors.border,
  },

  scheduleStatusChipAvailable: {
    backgroundColor: colors.blushBeige,
  },

  scheduleStatusChipReserved: {
    backgroundColor: colors.reserved,
  },

  scheduleStatusChipDone: {
    backgroundColor: colors.closed,
  },

  scheduleStatusChipCancelled: {
    backgroundColor: colors.closed,
  },

  scheduleStatusChipDisabled: {
    backgroundColor: colors.closed,
  },

  scheduleStatusChipTextAvailable: {
    color: colors.warmBrown,
  },

  scheduleStatusChipTextReserved: {
    color: "#9A7448",
  },

  scheduleStatusChipTextDone: {
    color: colors.warmBrown,
  },

  scheduleStatusChipTextCancelled: {
    color: colors.textSub,
  },

  scheduleStatusChipTextDisabled: {
    color: colors.textSub,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(43,37,34,0.35)",
    justifyContent: "center",
    padding: 20,
  },

  noticeModalCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 20,
    maxHeight: "72%",
    borderWidth: 1,
    borderColor: colors.border,
  },

  noticeModalLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textSub,
  },

  noticeModalTitle: {
    marginTop: 8,
    fontSize: 22,
    fontWeight: "700",
    color: colors.textMain,
  },

  noticeModalBody: {
    marginTop: 14,
    maxHeight: 260,
  },

  noticeModalContent: {
    fontSize: 15,
    lineHeight: 24,
    color: colors.textSub,
  },

  noticeButtonRow: {
    flexDirection: "row",
    marginTop: 18,
    gap: 8,
  },

  noticeButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },

  noticeButtonPrimary: {
    backgroundColor: colors.warmBrown,
  },

  noticeButtonSecondary: {
    backgroundColor: colors.blushBeige,
    borderWidth: 1,
    borderColor: colors.border,
  },

  noticeButtonPrimaryText: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.white,
  },

  noticeButtonSecondaryText: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.warmBrown,
  },

  noticeDetailButton: {
    marginTop: 10,
    minHeight: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },

  noticeDetailButtonText: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.warmBrown,
  },
  homeMountainFade: {
  position: "absolute",
  left: 0,
  right: 0,
  bottom: -54,
  height: 100,
},

calendarLegend: {
  flexDirection: "row",
  justifyContent: "center",
  gap: 18,
  marginTop: 14,
},

legendItem: {
  flexDirection: "row",
  alignItems: "center",
},

legendDotPresent: {
  width: 7,
  height: 7,
  borderRadius: 999,
  backgroundColor: colors.present,
  marginRight: 6,
},

legendDotReserved: {
  width: 7,
  height: 7,
  borderRadius: 999,
  backgroundColor: colors.bronzeGold,
  marginRight: 6,
},

legendText: {
  fontSize: readability.metadata.fontSize,
  lineHeight: readability.metadata.lineHeight,
  fontFamily: fonts.medium,
  color: colors.textSubStrong,
},
todaySilhouette: {
  position: "absolute",
  right: -20,
  top: 18,
  width: 190,
  height: 150,
  opacity: 0.65,
  zIndex: 1,
},
dayStampPresent: {
  width: 28,
  height: 28,
  borderRadius: 14,
  backgroundColor: colors.present,
  alignItems: "center",
  justifyContent: "center",
},

dayStampPresentTwo: {
  backgroundColor: colors.warmBrown,
},

dayStampPresentThree: {
  backgroundColor:  colors.ink,
},

dayStampReserved: {
  width: 28,
  height: 28,
  borderRadius: 14,
  backgroundColor: colors.reserved,
  alignItems: "center",
  justifyContent: "center",
},

dayStampTextPresent: {
  fontSize: 14,
  fontFamily: fonts.bold,
  color: colors.white,
},

dayStampTextReserved: {
  fontSize: 14,
  fontFamily: fonts.bold,
  color: colors.warmBrown,
},
moreLinkRow: {
  flexDirection: "row",
  alignItems: "center",
  gap: 3,
},

moreLinkArrow: {
  fontSize: 6,
  fontWeight: "700",
  color: colors.textSub,
  marginTop: -1,
},
homeNoticeBell: {
  position: "absolute",
  top: -10,
  right: 4,
  width: 28,
  height: 28,
  borderRadius: 14,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "transparent",
  zIndex: 10,
},

homeNoticeBellIcon: {
  width: 23,
  height: 23,
  opacity: 0.9,
},

homeNoticeDot: {
  position: "absolute",
  top: 5,
  right: 6,
  width: 6,
  height: 6,
  borderRadius: 999,
  backgroundColor: "#D9534F",
},
todayTrainingCardYudanja: {
  borderWidth: 0,
  backgroundColor: "transparent",
},

todayTrainingStepYudanja: {
  color: "#7A5737",
},

todayTrainingButtonYudanja: {
  backgroundColor: "#25211C",
  borderWidth: 1,
  borderColor: "rgba(214, 168, 78, 0.75)",
  shadowColor: "#D6A84E",
  shadowOpacity: 0.18,
  shadowRadius: 7,
  shadowOffset: {
    width: 0,
    height: 3,
  },
  elevation: 3,
},

todayTrainingButtonTextYudanja: {
  color: "#F4D27A",
},

todaySilhouetteYudanja: {
  opacity: 0.45,
  right: -16,
  top: 25,
  width: 180,
  height: 125,
},

yudanjaGoldGlow: {
  display: "none",
},

yudanjaFlowLine: {
  display: "none",
},
homeProfileWrap: {
  width: isWeb ? 145 : 104,
  height: isWeb ? 145 : 104,
  marginTop: isWeb ? 20 : 28,
  marginRight: isWeb ? -7 : 8,
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
},

homeProfileWrapYudanja: {
  width: isWeb ? 145 : 132,
  height: isWeb ? 145 : 132,
  marginTop: isWeb ? 20 : 18,
  marginRight: isWeb ? -7 : -2,
  marginBottom: isWeb ? -10 : 18,
},

homeProfileCircle: {
  width: isWeb ? 110  : 90,
  height: isWeb ? 110 : 90,
  borderRadius: 999,
  overflow: "hidden",
  backgroundColor: "#F7EFE8",
},

homeProfileCircleYudanja: {
  width: isWeb ? 98 : 98,
  height: isWeb ? 98 : 98,
   transform: [
    { translateX: isWeb ? -4 : 0 },
    { translateY: isWeb ? -22 : 0 },
  ],
},
homeProfileInnerCircle: {
  width: 105,
  height: 105,
  borderRadius: 56,
  backgroundColor: colors.blushBeige,
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
  borderWidth: 1,
  borderColor: colors.border,
},

homeProfileImage: {
  width: "100%",
  height: "100%",
},

homeYudanjaEmblemFrame: {
  position: "absolute",
  width: isWeb ? 135 : 138,
  height: isWeb ? 135 : 138,
  top: isWeb ? -7 : -20,
  left: isWeb ? 1 : -20,
},


yudanjaSoftLight: {
  position: "absolute",
  right: -45,
  bottom: -45,
  width: 150,
  height: 150,
  borderRadius: 999,
  backgroundColor: "rgba(255, 218, 120, 0.18)",
  zIndex: 1,
},
todayYudanjaBgImage: {
  position: "absolute",
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  width: "100%",
  height: "100%",
  opacity: 0.9,
},
homeAttendanceSummary: {
  marginTop: 12,
  marginLeft: 2,

  fontSize: readability.body.fontSize,
  lineHeight: readability.body.lineHeight,

  fontFamily: fonts.medium,
  color: colors.textSubStrong,

  letterSpacing: -0.3,
},
trainingRecordBanner: {
  minHeight: 62,
  borderRadius: 20,
  borderWidth: 1,
  borderColor: "#E8D7C4",
  backgroundColor: "#FFFDF9",
  paddingHorizontal: 16,
  paddingVertical: 12,
  flexDirection: "row",
  alignItems: "center",
  overflow: "hidden",
  position: "relative",
},

trainingRecordBannerIcon: {
  width: 38,
  height: 38,
  marginRight: 12,
  opacity: 0.82,
},

trainingRecordBannerBrush: {
  position: "absolute",
  right: -18,
  top: -22,
  width: 92,
  height: 92,
  opacity: 0.18,
},

trainingRecordBannerTextBlock: {
  flex: 1,
  zIndex: 2,
},

trainingRecordBannerTitle: {
  fontSize: 19,
  fontFamily: fonts.title,
  color: colors.textMain,
},

trainingRecordBannerSub: {
  marginTop: 3,
  fontSize: readability.body.fontSize,
  lineHeight: readability.body.lineHeight,
  fontFamily: fonts.medium,
  color: colors.textSubStrong,
},

trainingRecordBannerArrow: {
  fontSize: 12,
  fontFamily: fonts.bold,
  color: colors.warmBrown,
  zIndex: 2,
},
recordSelectCard: {
  backgroundColor: colors.card,
  borderRadius: 24,
  padding: 20,
  borderWidth: 1,
  borderColor: colors.border,
},

recordSelectTitle: {
  fontSize: 22,
  fontFamily: fonts.title,
  color: colors.textMain,
  marginBottom: 14,
},

recordSelectItem: {
  paddingVertical: 15,
  borderBottomWidth: 1,
  borderBottomColor: colors.border,
},

recordSelectItemTitle: {
  fontSize: 17,
  fontFamily: fonts.title,
  color: colors.textMain,
},

recordSelectItemSub: {
  marginTop: 4,
  fontSize: readability.metadataStrong.fontSize,
  lineHeight: readability.metadataStrong.lineHeight,
  fontFamily: fonts.medium,
  color: colors.textSubStrong,
},

recordSelectCancel: {
  marginTop: 16,
  height: 46,
  borderRadius: 14,
  backgroundColor: colors.warmBrown,
  alignItems: "center",
  justifyContent: "center",
},

recordSelectCancelText: {
  fontSize: 14,
  fontFamily: fonts.bold,
  color: colors.white,
},

recordSelectClose: {
  position: "absolute",
  top: 10,
  right: 12,
  width: 28,
  height: 28,
  alignItems: "center",
  justifyContent: "center",
  zIndex: 5,
},

recordSelectCloseText: {
  fontSize: 22,
  fontFamily: fonts.medium,
  color: colors.softBrown,
},

recordSelectCardThin: {
  backgroundColor: "#FFFDF9",
  borderRadius: 22,
  paddingHorizontal: 18,
  paddingTop: 5,
  paddingBottom: 5,
  borderWidth: 1,
  borderColor: "#E8D7C4",
},

recordSelectThinRow: {
  flexDirection: "row",
  alignItems: "center",
  minHeight: 32,
},

recordSelectThinItem: {
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
  paddingVertical: 10,
},

recordSelectThinText: {
  fontSize: 17,
  fontFamily: fonts.title,
  color: colors.textMain,
},

recordSelectDivider: {
  width: 1,
  height: 24,
  backgroundColor: "#E8D7C4",
},

recordSelectClose: {
  position: "absolute",
  top: 8,
  right: 10,
  width: 28,
  height: 28,
  alignItems: "center",
  justifyContent: "center",
  zIndex: 5,
},

recordSelectCloseText: {
  fontSize: 21,
  fontFamily: fonts.medium,
  color: colors.softBrown,
},
todayTrainingButtonDone: {
  backgroundColor: "#9A8A80",
  opacity: 0.85,
},
weeklyGoalMiniButton: {
  marginTop: 3,
  minHeight: 28,
  alignSelf: "flex-start",
  flexDirection: "row",
  alignItems: "center",
  gap: 5,
  paddingLeft: 2,
  paddingRight: 4,
  borderRadius: 10,
},

weeklyGoalMiniButtonPressed: {
  opacity: 0.62,
},

weeklyGoalMiniText: {
  fontSize: 16,
  lineHeight: 16,
  fontFamily: fonts.medium,
  color: "#7A634D",
},

weeklyGoalMiniValue: {
  fontSize: 15,
  lineHeight: 18,
  fontFamily: fonts.bold,
  color: "#A76518",
},

weeklyGoalMiniArrow: {
  marginTop: -3,
  fontSize: 20,
  lineHeight: 20,
  fontFamily: fonts.medium,
  color: "#9A7651",
},

weeklyGoalOverlay: {
  flex: 1,
  justifyContent: "flex-end",
  backgroundColor: "rgba(43,37,34,0.38)",
},

weeklyGoalSheet: {
  width: "100%",
  maxWidth: 430,
  alignSelf: "center",
  paddingHorizontal: 20,
  paddingTop: 10,
  paddingBottom: isWeb ? 24 : 34,
  borderTopLeftRadius: 26,
  borderTopRightRadius: 26,
  backgroundColor: "#FFFDF9",
  borderWidth: 1,
  borderBottomWidth: 0,
  borderColor: "#E7D6C4",
},

weeklyGoalHandle: {
  width: 42,
  height: 4,
  alignSelf: "center",
  marginBottom: 16,
  borderRadius: 999,
  backgroundColor: "#D7C5B3",
},

weeklyGoalTitleRow: {
  flexDirection: "row",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 12,
},

weeklyGoalTitleBlock: {
  flex: 1,
},

weeklyGoalTitle: {
  fontSize: 22,
  lineHeight: 28,
  fontFamily: fonts.title,
  color: colors.textMain,
},

weeklyGoalDescription: {
  marginTop: 7,
  fontSize: 16,
  lineHeight: 21,
  fontFamily: fonts.medium,
  color: colors.textSubStrong,
},

weeklyGoalExclusionText: {
  marginTop: 2,
  fontSize: 14,
  lineHeight: 18,
  fontFamily: fonts.medium,
  color: "#9A6C4A",
},

weeklyGoalCloseButton: {
  width: 34,
  height: 34,
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 999,
  backgroundColor: "#F5ECE4",
},

weeklyGoalCloseText: {
  marginTop: -2,
  fontSize: 23,
  lineHeight: 26,
  fontFamily: fonts.medium,
  color: colors.softBrown,
},

weeklyGoalLoading: {
  minHeight: 180,
  alignItems: "center",
  justifyContent: "center",
},

weeklyGoalSection: {
  marginTop: 20,
},

weeklyGoalSectionTitle: {
  marginBottom: 10,
  fontSize: 17,
  lineHeight: 21,
  fontFamily: fonts.bold,
  color: colors.textMain,
},

weeklyGoalSectionHelperStrong: {
  fontSize: 15,
  lineHeight: 20,
  fontFamily: fonts.semiBold,
  color: colors.textMain,
},

weeklyGoalSectionHelper: {
  marginTop: 3,
  fontSize: 14,
  lineHeight: 19,
  fontFamily: fonts.medium,
  color: colors.textSub,
},

weeklyGoalNumberRow: {
  width: 206,
  maxWidth: "100%",
  alignSelf: "center",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginTop: 14,
},

weeklyGoalStepButton: {
  width: 48,
  height: 48,
  flexGrow: 0,
  flexShrink: 0,
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 14,
  borderWidth: 1,
  borderColor: "#DCC7B3",
  backgroundColor: "#FFF9F3",
},

weeklyGoalStepButtonDisabled: {
  borderColor: "#E7DED5",
  backgroundColor: "#F3EFEB",
},

weeklyGoalStepButtonText: {
  marginTop: -2,
  fontSize: 27,
  lineHeight: 30,
  fontFamily: fonts.medium,
  color: "#76563B",
},

weeklyGoalStepButtonTextDisabled: {
  color: "#B9AEA5",
},

weeklyGoalNumberInputWrap: {
  width: 86,
  minWidth: 0,
  maxWidth: 86,
  height: 48,
  flexGrow: 0,
  flexShrink: 0,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  paddingHorizontal: 10,
  borderRadius: 14,
  borderWidth: 1,
  borderColor: "#CFAE8F",
  backgroundColor: colors.white,
},

weeklyGoalNumberInput: {
  width: 42,
  minWidth: 0,
  maxWidth: 42,
  flexGrow: 0,
  flexShrink: 0,
  paddingVertical: 0,
  paddingHorizontal: 0,
  fontSize: 21,
  lineHeight: 25,
  textAlign: "right",
  fontFamily: fonts.bold,
  color: colors.textMain,
},

weeklyGoalNumberSuffix: {
  width: 18,
  marginLeft: 2,
  fontSize: 17,
  lineHeight: 21,
  fontFamily: fonts.bold,
  color: "#76563B",
},

weeklyGoalInputError: {
  marginTop: 8,
  fontSize: 13,
  lineHeight: 18,
  fontFamily: fonts.medium,
  color: "#B34A3C",
},

weeklyGoalOptionRow: {
  flexDirection: "row",
  gap: 7,
},

weeklyGoalOptionButton: {
    marginTop: 18,
  flex: 1,
  minWidth: 0,
  minHeight: 42,
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 13,
  borderWidth: 1,
  borderColor: "#DECAB6",
  backgroundColor: "#FFF9F3",
},

weeklyGoalOptionButtonSelected: {
  borderColor: "#A96B2E",
  backgroundColor: "#A96B2E",
},

weeklyGoalOptionButtonDisabled: {
  borderColor: "#E7DED5",
  backgroundColor: "#F3EFEB",
},

weeklyGoalOptionButtonPressed: {
  opacity: 0.72,
},

weeklyGoalOptionText: {
  fontSize: 17,
  lineHeight: 19,
  fontFamily: fonts.bold,
  color: "#76563B",
},

weeklyGoalOptionTextSelected: {
  color: colors.white,
},

weeklyGoalOptionTextDisabled: {
  color: "#B9AEA5",
},

weeklyGoalRestButton: {
  minHeight: 43,
  marginTop: 10,
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 13,
  borderWidth: 1,
  borderColor: "#DCC7B3",
  backgroundColor: "#F8F1EA",
},

weeklyGoalRestButtonSelected: {
  borderColor: "#886B54",
  backgroundColor: "#886B54",
},

weeklyGoalRestButtonDisabled: {
  borderColor: "#E7DED5",
  backgroundColor: "#F3EFEB",
},

weeklyGoalRestButtonText: {
  fontSize: 16,
  lineHeight: 19,
  fontFamily: fonts.bold,
  color: "#76563B",
},

weeklyGoalRestButtonTextSelected: {
  color: colors.white,
},

weeklyGoalRuleText: {
  marginTop: 9,
  fontSize: 14,
  lineHeight: 18,
  fontFamily: fonts.medium,
  color: colors.textSub,
},

weeklyGoalPendingText: {
  marginTop: 9,
  fontSize: 14,
  lineHeight: 18,
  fontFamily: fonts.semiBold,
  color: "#A76518",
},

weeklyGoalDivider: {
  height: 1,
  marginTop: 20,
  backgroundColor: "#EADDD2",
},

weeklyGoalActionArea: {
  marginTop: 22,
},

weeklyGoalSaveButton: {
  minHeight: 48,
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 14,
  backgroundColor: "#8A5D3B",
},

weeklyGoalSaveButtonDisabled: {
  backgroundColor: "#E8E0D9",
},

weeklyGoalSaveButtonPressed: {
  opacity: 0.78,
},

weeklyGoalSaveButtonText: {
  fontSize: 16,
  lineHeight: 21,
  fontFamily: fonts.bold,
  color: colors.white,
},

weeklyGoalSaveButtonTextDisabled: {
  color: "#B3A79D",
},
});

export { styles, fonts, isWeb };