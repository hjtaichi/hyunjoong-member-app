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
  handwriting: "KyoboHandwriting2025lyb",
};


export const styles = StyleSheet.create({
  container: {
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
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.background,
},
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6b6257",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#2f2a24",
    marginBottom: 8,
    marginLeft: 4,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: "#6b6257",
    marginBottom: 16,
  },
  card: {
  backgroundColor: colors.card,
  borderRadius: radius.lg,
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.lg,
  marginBottom: 0,
  borderWidth: 1,
  borderColor: colors.border,
  ...shadow.card,
},
  overviewHeaderRow: {
    marginBottom: 10,
  },
  headerTitleInlineRow: {
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
  marginBottom: 10,
},

cardTitleNoMargin: {
  fontSize: 18,
  fontWeight: "800",
  color: "#2f2a24",
},

levelTextBadge: {
  paddingHorizontal: 8,
  paddingVertical: 3,
  borderRadius: 999,
  backgroundColor: "#f3ecdf",
  alignSelf: "center",
},

levelTextBadgeText: {
  fontSize: 11,
  fontWeight: "700",
  color: "#7b6650",
},
  cardTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#2f2a24",
    marginBottom: 6,
  },
  cardSubText: {
    fontSize: 13,
    lineHeight: 19,
    color: "#7a6f61",
    marginBottom: 12,
  },
  curriculumRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 8,
  },
  personalName: {
  flex: 1,
  fontSize: isWeb ? 24 : 28,
  fontFamily: fonts.title,
  color: colors.textMain,
  lineHeight: isWeb ? 33 : 35,
  marginBottom: 3,
  marginTop: -13,
},
  completedBadgeInline: {
    backgroundColor: "#dfead9",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    alignSelf: "flex-start",
    marginTop: 2,
  },
  completedBadgeText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#4f7144",
  },
  bigProgressText: {
  fontSize: 18,
  fontFamily: fonts.titleSemi,
  color: colors.warmBrown,
  marginBottom: 10,
},
  cardText: {
    fontSize: 14,
    lineHeight: 21,
    color: "#4c4339",
    marginBottom: 6,
  },
  progressTrack: {
  height: 10,
  backgroundColor: "#ede6db",
  borderRadius: 999,
  overflow: "hidden",
  marginTop: 8,
},
  progressFillPersonal: {
  height: "100%",
  backgroundColor: colors.bronzeGold,
  borderRadius: 999,
},
  progressPercent: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: "700",
    color: "#6b6257",
  },
  memoSectionTitle: {
    marginTop: 10,
    marginBottom: 4,
    fontSize: 13,
    fontWeight: "800",
    color: "#5b5147",
  },
  memoText: {
    fontSize: 14,
    lineHeight: 21,
    color: "#4c4339",
  },
  coachingPointCard: {
  marginTop: 8,
  marginBottom: 6,
  padding: 16,
  borderRadius: 16,
  backgroundColor: "#f7efe2",
  borderWidth: 1,
  borderColor: "#e8d7bb",
},
  coachingPointHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 10,
  },
  coachingPointBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#8c6330",
  },
  coachingPointBadgeText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#fffdf9",
  },
  coachingPointDate: {
    fontSize: 12,
    fontWeight: "700",
    color: "#8a7f72",
  },
  coachingPointText: {
    fontSize: 15,
    lineHeight: 24,
    color: "#3e3428",
    fontWeight: "600",
  },
  recentMemoSection: {
  marginTop: 0,
  marginBottom: 2,
},
  inlineToggleButton: {
  paddingVertical: 6,
  flexDirection: "row",
  alignItems: "center",
  gap: 6,
},
  inlineToggleButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#6a563f",
  },
  memoListSection: {
    marginTop: 2,
  },
  memoHistoryItem: {
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ece4d8",
  },
  memoHistoryDate: {
    fontSize: 12,
    fontWeight: "700",
    color: "#8a7f72",
    marginBottom: 4,
  },
  roadmapItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee7dc",
  },
  roadmapItemLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  stepBadge: {
    width: 32,
    height: 32,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ece4d8",
    marginRight: 12,
    marginTop: 2,
  },
  stepBadgeDone: {
    backgroundColor: "#dfead9",
  },
  stepBadgeCurrent: {
    backgroundColor: "#f1dfbf",
  },
  stepBadgeLocked: {
    backgroundColor: "#e8e8e8",
  },
  stepBadgeText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#6b6257",
  },
  stepBadgeTextDone: {
    color: "#4f7144",
  },
  stepBadgeTextCurrent: {
    color: "#8a5a21",
  },
  stepBadgeTextLocked: {
    color: "#888888",
  },
  roadmapTextWrap: {
    flex: 1,
  },
  roadmapTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  roadmapName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: "#2f2a24",
    lineHeight: 22,
  },
  roadmapDescription: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 19,
    color: "#7b7266",
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#f0ece5",
  },
  statusPillDone: {
    backgroundColor: "#e1eddb",
  },
  statusPillCurrent: {
    backgroundColor: "#f6e5c8",
  },
  statusPillLocked: {
    backgroundColor: "#ededed",
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6b6257",
  },
  statusPillTextDone: {
    color: "#4f7144",
  },
  statusPillTextCurrent: {
    color: "#8a5a21",
  },
  statusPillTextLocked: {
    color: "#888888",
  },
  collapsedPreviewText: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 22,
    color: "#6b6257",
  },
  bottomToggleButton: {
  marginTop: 8,
  paddingTop: 10,
  paddingBottom: 1,
  alignItems: "center",
  justifyContent: "center",
  borderTopWidth: 1,
  borderTopColor: "#ece4d8",
},
  bottomToggleButtonText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#6a563f",
  },
  editWrap: {
    marginTop: 4,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#5b5147",
    marginBottom: 8,
    marginTop: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e1d8ca",
    borderRadius: 12,
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#2f2a24",
    marginBottom: 12,
  },
  textArea: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: "#e1d8ca",
    borderRadius: 12,
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#2f2a24",
    textAlignVertical: "top",
    marginBottom: 14,
  },
  editButtonRow: {
    flexDirection: "row",
    gap: 10,
  },
  primaryButton: {
    marginTop: 4,
    backgroundColor: "#8c6330",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryButtonInline: {
    flex: 1,
    backgroundColor: "#8c6330",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fffdf9",
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: "#e8e0d2",
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#5d5146",
  },
  emptyCurriculumText: {
    fontSize: 13,
    lineHeight: 20,
    color: "#9a8f81",
  },
  inlineToggleButton: {
  paddingVertical: 10,
  flexDirection: "row",
  alignItems: "center",
  gap: 6,
},

inlineToggleButtonText: {
  fontSize: 14,
  fontWeight: "700",
  color: "#6a563f",
},

inlineToggleArrow: {
  fontSize: 11,
  fontWeight: "700",
  color: "#7b6650",
  marginTop: 1,
},

bottomToggleButtonInner: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
},

bottomToggleArrow: {
  fontSize: 11,
  fontWeight: "700",
  color: "#7b6650",
  marginTop: 1,
},
memoHeaderRow: {
  marginTop: 10,
  marginBottom: 6,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
},

memoSectionTitleNoMargin: {
  fontSize: 13,
  fontWeight: "800",
  color: "#5b5147",
},

memoSmallActionButton: {
  paddingHorizontal: 10,
  paddingVertical: 5,
  borderRadius: 999,
  borderWidth: 1,
  borderColor: "#d7c9b3",
  backgroundColor: "#fffaf2",
},

memoSmallActionButtonText: {
  fontSize: 12,
  fontWeight: "700",
  color: "#7c4f21",
},

memoInlineEditWrap: {
  marginTop: 2,
  marginBottom: 8,
},

textAreaCompact: {
  minHeight: 88,
  borderWidth: 1,
  borderColor: "#e1d8ca",
  borderRadius: 12,
  backgroundColor: "#fff",
  paddingHorizontal: 14,
  paddingVertical: 12,
  fontSize: 14,
  color: "#2f2a24",
  textAlignVertical: "top",
  marginBottom: 10,
},

memoSaveButton: {
  alignSelf: "flex-end",
  backgroundColor: "#8c6330",
  borderRadius: 10,
  paddingHorizontal: 16,
  paddingVertical: 10,
},

memoSaveButtonText: {
  fontSize: 13,
  fontWeight: "700",
  color: "#fffdf9",
},

progressSummaryText: {
  fontSize: 13,
  fontWeight: "700",
  color: "#6b6257",
  marginTop: -2,
  marginBottom: 8,
},

progressTrackCompact: {
  height: 10,
  backgroundColor: "#ede6db",
  borderRadius: 999,
  overflow: "hidden",
  marginBottom: 14,
},
curriculumSelectBox: {
  borderWidth: 1,
  borderColor: "#e1d8ca",
  borderRadius: 14,
  backgroundColor: "#fff",
  paddingHorizontal: 14,
  paddingVertical: 14,
  marginBottom: 10,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
},

curriculumSelectTextWrap: {
  flex: 1,
},

curriculumSelectLabel: {
  fontSize: 12,
  fontWeight: "700",
  color: "#8a7f72",
  marginBottom: 4,
},

curriculumSelectValue: {
  fontSize: 15,
  fontWeight: "700",
  color: "#2f2a24",
  lineHeight: 22,
},

curriculumSelectArrow: {
  fontSize: 6,
  fontWeight: "700",
  color: "#7b6650",
},

curriculumDropdownList: {
  borderWidth: 1,
  borderColor: "#e6ddd0",
  borderRadius: 14,
  backgroundColor: "#fffdf9",
  overflow: "hidden",
  marginBottom: 10,
},

curriculumDropdownItem: {
  paddingHorizontal: 14,
  paddingVertical: 14,
  borderBottomWidth: 1,
  borderBottomColor: "#eee7dc",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
},

curriculumDropdownItemSelected: {
  backgroundColor: "#f7efe2",
},

curriculumDropdownTextWrap: {
  flex: 1,
},

curriculumDropdownTitle: {
  fontSize: 14,
  fontWeight: "700",
  color: "#2f2a24",
  marginBottom: 4,
},

curriculumDropdownTitleSelected: {
  color: "#7c4f21",
},

curriculumDropdownMeta: {
  fontSize: 12,
  color: "#7a6f61",
},

curriculumDropdownMetaSelected: {
  color: "#8a5a21",
},

curriculumDropdownCheck: {
  fontSize: 12,
  fontWeight: "700",
  color: "#8a5a21",
},
statusPillPressable: {
  minWidth: 68,
  alignItems: "center",
},

roadmapMemoText: {
  marginTop: 8,
  fontSize: 13,
  lineHeight: 19,
  color: "#6f665c",
},
gongbeopHeaderRow: {
  flexDirection: "row",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 12,
  marginBottom: 4,
},

gongbeopHeaderTextWrap: {
  flex: 1,
},

gongbeopActionButton: {
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 999,
  borderWidth: 1,
  borderColor: "#d7c9b3",
  backgroundColor: "#fffaf2",
},

gongbeopActionButtonText: {
  fontSize: 12,
  fontWeight: "700",
  color: "#7c4f21",
},

gongbeopSummaryWrap: {
  marginTop: 2,
  marginBottom: 6,
  gap: 8,
},

gongbeopSummaryRow: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
  paddingVertical: 2,
},

gongbeopName: {
  fontSize: 17,
  fontWeight: "800",
  color: "#2f241d",

  marginTop: 8,
  marginBottom: 10,
},
gongbeopRecordText: {
  fontSize: 13,
  fontWeight: "700",
  color: "#6b4f46",

  marginBottom: 6,
},
gongbeopPercentText: {
  fontSize: 11,
  fontWeight: "700",
  color: "#b19a83",
},
gongbeopValue: {
  fontSize: 14,
  fontWeight: "700",
  color: "#7c4f21",
},

gongbeopEmptyText: {
  marginTop: 8,
  fontSize: 13,
  lineHeight: 19,
  color: "#8a7f72",
},

gongbeopEditWrap: {
  marginTop: 4,
  marginBottom: 6,
},

gongbeopSaveButton: {
  marginTop: 4,
  alignSelf: "flex-end",
  backgroundColor: "#8c6330",
  borderRadius: 10,
  paddingHorizontal: 16,
  paddingVertical: 10,
},

gongbeopSaveButtonText: {
  fontSize: 13,
  fontWeight: "700",
  color: "#fffdf9",
},

gongbeopInfoWrap: {
  marginTop: 6,
  paddingTop: 4,
},

gongbeopInfoItem: {
  marginBottom: 10,
},

gongbeopInfoTitle: {
  fontSize: 13,
  fontWeight: "800",
  color: "#5b5147",
  marginBottom: 4,
},

gongbeopInfoDesc: {
  fontSize: 12,
  lineHeight: 18,
  color: "#7a6f61",
},
topCoachingBanner: {
  marginBottom: 18,
  paddingHorizontal: 14,
  paddingVertical: 12,
  borderRadius: 14,
  backgroundColor: "#f7efe2",
  borderWidth: 1,
  borderColor: "#e8d7bb",
},

topCoachingLabel: {
  fontSize: 12,
  fontWeight: "800",
  color: "#8c6330",
  marginBottom: 4,
},

topCoachingText: {
  fontSize: 14,
  lineHeight: 21,
  color: "#4a3d31",
  fontWeight: "600",
},
memoHistorySection: {
  marginTop: 8,
},

memoHistoryList: {
  marginTop: 6,
  gap: 8,
},

memoHistoryItemBox: {
  paddingHorizontal: 12,
  paddingVertical: 10,
  borderRadius: 12,
  backgroundColor: "#f7efe2",
  borderWidth: 1,
  borderColor: "#eadcc8",
},

memoHistoryDateText: {
  fontSize: 13,
  fontWeight: "700",
  color: "#8a7f72",
  marginBottom: 4,
},

memoHistoryContentText: {
  fontSize: 15,
  lineHeight: 19,
  color: "#4c4339",
},
topTabWrap: {
  flexDirection: "row",
  backgroundColor: colors.card,
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: radius.md,
  padding: 3,
  marginTop: 0,
  marginBottom: spacing.md,
},

topTabButton: {
  flex: 1,
  height: 40,
  borderRadius: 10,
  alignItems: "center",
  justifyContent: "center",
},

topTabButtonActive: {
  backgroundColor: colors.warmBrown,
},

topTabText: {
  fontSize: 15,
  lineHeight: 21,
  fontFamily: fonts.semiBold,
  color: colors.softBrown,
},

topTabTextActive: {
  color: colors.white,
},

currentTrainingLabel: {
  fontSize: 11,
  fontWeight: "800",
  letterSpacing: 1.2,
  color: "#9b866e",
  marginBottom: 8,
},

currentStepDescription: {
  marginTop: -2,
  marginBottom: 12,
  fontSize: readability.metadataStrong.fontSize,
  lineHeight: readability.metadataStrong.lineHeight,
  color: colors.textSubStrong,
  fontWeight: "600",
},
trainingHeroRow: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 6,
},

trainingHeroLeft: {
  flex: 1,
  paddingRight: 12,
},

trainingSilhouetteWrap: {
  width: 110,
  height: 110,
  alignItems: "center",
  justifyContent: "center",
  opacity: 0.9,
},

trainingSilhouette: {
  width: 150,
  height: 150,
  marginTop: -20,
  marginBottom: -25,
},

progressSection: {
  marginTop: 10,
  marginBottom: 4,
},

progressLabel: {
  fontSize: readability.metadataStrong.fontSize,
  lineHeight: readability.metadataStrong.lineHeight,
  fontFamily: fonts.bold,
  color: colors.textMain,
  marginBottom: 4,
},

progressBarRow: {
  flexDirection: "row",
  alignItems: "center",
  gap: 12,
},

progressTrackInline: {
  flex: 1,
  height: 9,
  backgroundColor: colors.border,
  borderRadius: 999,
  overflow: "hidden",
},

progressPercentInline: {
  width: 44,
  fontSize: readability.metadataStrong.fontSize,
  lineHeight: readability.metadataStrong.lineHeight,
  fontFamily: fonts.bold,
  color: colors.textMain,
},

progressHeaderRow: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 8,
},

progressPercentText: {
  fontSize: 13,
  fontWeight: "800",
  color: "#9b866e",
},
currentCardHeaderRow: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  marginBottom: 16,
},
detailButton: {
  paddingHorizontal: 12,
  paddingVertical: 8,
},
detailTextButton: {
  fontSize: readability.actionText.fontSize,
  lineHeight: readability.actionText.lineHeight,
  fontWeight: "700",
  color: colors.textSubStrong,
  marginTop: 2,
},

trainingSection: {
  width: "100%",
  gap: 12,
},
sectionLabel: {
  fontSize: 20,
  lineHeight: 28,
  fontFamily: fonts.title,
  color: colors.textMain,
  marginTop: 0,
  marginBottom: 0,
  marginLeft: 4,
},

cardTopActionRow: {
  flexDirection: "row",
  justifyContent: "flex-end",
  marginBottom: 2,
},
coachingInlineBox: {
  marginTop: 0,
  marginBottom: 0,
  paddingHorizontal: 16,
  paddingVertical: 13,
  borderRadius: 18,
  backgroundColor: "#F7EFE2",
  borderWidth: 1,
  borderColor: "#E6D5BA",
  transform: [{ rotate: "-0.3deg" }],
},

coachingInlineLabel: {
  fontSize: 12,
  fontWeight: "700",
  color: "#8c6330",
  marginBottom: 4,
},

coachingInlineText: {  
  fontSize: 21,
  lineHeight: 24,
  color: colors.ink,
  marginTop: -3,
  marginLeft: 18,
  fontFamily: fonts.handwriting,
},
trainingCard: {
  paddingTop: 8,
  paddingBottom: 10,
  paddingHorizontal: 16,
  backgroundColor: "#FFFCF8",
  borderColor: "#E8D8BE",
},
menuCard: {
  paddingTop: 4,
  paddingBottom: 4,
},

menuRow: {
  minHeight: readability.comfortableRow.minHeight,
  paddingVertical: readability.comfortableRow.paddingVertical,
  borderBottomWidth: 1,
  borderBottomColor: "#f0e8dc",
  flexDirection: "row",
  alignItems: "center",
  gap: 14,
},

menuRowLast: {
  borderBottomWidth: 0,
},

menuIcon: {
  width: 30,
  height: 30,
  opacity: 0.82,
},

menuTextWrap: {
  flex: 1,
},

menuTitle: {
  fontSize: readability.listTitle.fontSize,
  lineHeight: readability.listTitle.lineHeight,
  fontFamily: fonts.semiBold,
  color: colors.textMain,
},

menuDesc: {
  marginTop: 3,
  fontSize: readability.listDescription.fontSize,
  lineHeight: readability.listDescription.lineHeight,
  fontFamily: fonts.medium,
  color: colors.textSubStrong,
},

menuArrow: {
  width: 20,
  textAlign: "center",
  fontSize: 16,
  lineHeight: 22,
  color: colors.navInactive,
  fontWeight: "300",
  marginRight: 2,
},

menuLock: {
  fontSize: 20,
  marginRight: 2,
},

menuRowLocked: {
  opacity: 0.65,
},
menuLockIcon: {
  width: 26,
  height: 26,
  marginRight: 2,
  opacity: 0.9,
},
menuYudanjaIcon: {
  width: 36,
  height: 36,
  marginLeft: -5,
  marginRight: -5,
},
flowSection: {
  position: "relative",
  width: "100%",
  height: 455,
  marginTop: 4,
  marginBottom: 0,
  overflow: "hidden",
},

flowBackground: {
  width: "100%",
  height: "108%",
},

flowBottomFade: {
  position: "absolute",
  left: 0,
  right: 0,
  bottom: 0,
  height: 130,
  zIndex: 3,
},

recordActionRow: {
  flexDirection: "row",
  justifyContent: "flex-end",
  marginTop: -4,
  marginBottom: 8,
},

todayRecordButton: {
  paddingVertical: 4,
  paddingHorizontal: 2,
},

todayRecordButtonText: {
  fontSize: 12,
  fontWeight: "800",
  color: "#6b4f46",
},
flowTodayRecord: {
  position: "absolute",
  top: 0,
  right: 10,
  paddingHorizontal: 8,
  paddingVertical: 5,
  borderRadius: 15,
  borderWidth: 1,
  borderColor: "rgba(123, 86, 72, 0.24)",
  backgroundColor: "rgba(255,248,240,0.42)",
  alignItems: "center",
  zIndex: 20,
},

flowTodayRecordText: {
  fontSize: 11,
  fontWeight: "800",
  color: "#6F4D3F",
  textAlign: "center",
},

recordOverlay: {
  position: "absolute",
  zIndex: 20,
  elevation: 20,
},

recordOverlayValue: {
  fontSize: 18,
  fontWeight: "700",
  color: "#5b3f30",
},

recordOverlayGoal: {
  fontSize: 12,
  fontWeight: "800",
  color: "#8a7f72",
},

animatedCircleWrap: {
  width: 42,
  height: 42,
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 0,
  position: "relative",
  opacity: 0.8,
},

recordPercentText: {
  position: "absolute",
  left: 2,
  right: 0,
  top: 13,
  textAlign: "center",
  fontSize: 12,
  fontWeight: "700",
  color: "#5b3f30",
},

recordOverlayOne: {
  top: 80,
  left: 140,
},

recordOverlayTwo: {
  top: 200,
  left: 210,
},

recordOverlayThree: {
  top: 267,
  left: 120,
},

recordOverlayFour: {
  top: 350,
  left: 168,
},
recordOverlayPercent: {
  marginTop: 4,
  fontSize: 12,
  fontWeight: "800",
  color: "#9b7650",
},
gongbeopEditCard: {
  backgroundColor: "#fffdf9",
  borderRadius: 20,
  padding: 16,
  marginBottom: 12,
  borderWidth: 1,
  borderColor: "#ece4d8",
},

gongbeopEditTitle: {
  fontSize: 17,
  fontWeight: "800",
  color: "#2f2a24",
  marginBottom: 12,
},

gongbeopInputGrid: {
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 10,
},

gongbeopInputBox: {
  width: "48%",
},

gongbeopInputLabel: {
  fontSize: 12,
  fontWeight: "800",
  color: "#7c4f21",
  marginBottom: 6,
},

gongbeopInput: {
  borderWidth: 1,
  borderColor: "#e1d8ca",
  borderRadius: 12,
  backgroundColor: "#fff",
  paddingHorizontal: 12,
  paddingVertical: 10,
  fontSize: 14,
  color: "#2f2a24",
},

gongbeopEditButtonRow: {
  flexDirection: "row",
  gap: 10,
  marginTop: 14,
},

gongbeopCancelButton: {
  flex: 1,
  borderRadius: 12,
  paddingVertical: 12,
  alignItems: "center",
  backgroundColor: "#e8e0d2",
},

gongbeopCancelButtonText: {
  fontSize: 13,
  fontWeight: "800",
  color: "#5d5146",
},

gongbeopSaveButton: {
  flex: 1,
  borderRadius: 12,
  paddingVertical: 12,
  alignItems: "center",
  backgroundColor: "#8c6330",
},

gongbeopSaveButtonText: {
  fontSize: 13,
  fontWeight: "800",
  color: "#fffdf9",
},
recordModalOverlay: {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.28)",
  justifyContent: "center",
  alignItems: "center",
},

recordCancelText: {
  color: "#6B564C",
  fontSize: 16,
  fontWeight: "700",
},

recordSaveText: {
  color: "#FFFFFF",
  fontSize: 16,
  fontWeight: "700",
},

lastRecordText: {
  position: "absolute",
  top: 30,
  right: 10,
  fontSize: 9,
  color: "#9A867A",
  textAlign: "right",
  zIndex: 20,
},

recordModalOverlay: {
  flex: 1,
  backgroundColor: "rgba(47, 42, 36, 0.32)",
  justifyContent: "center",
  alignItems: "center",
},

recordModalCard: {
  width: "86%",
  backgroundColor: "#fffdf8",
  borderRadius: 26,
  paddingHorizontal: 22,
  paddingTop: 24,
  paddingBottom: 20,
  borderWidth: 1,
  borderColor: "#eadfce",
},

recordModalTitle: {
  fontSize: 24,
  fontWeight: "800",
  color: "#4A3427",
  marginBottom: 18,
  textAlign: "center",
},

recordInputGrid: {
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "space-between",
  rowGap: 12,
},

recordInputBox: {
  width: "48%",
},

recordInputLabel: {
  fontSize: 12,
  fontWeight: "800",
  color: "#7c5a42",
  marginBottom: 5,
},

recordInputLabel: {
  fontSize: 12,
  fontWeight: "800",
  color: "#7c5a42",
  marginBottom: 5,
},

recordInput: {
  height: 44,
  borderRadius: 14,
  backgroundColor: "#fffaf2",
  borderWidth: 1,
  borderColor: "#eadfce",
  paddingHorizontal: 14,
  fontSize: 15,
  color: "#4A3427",
},

recordButtonRow: {
  flexDirection: "row",
  marginTop: 18,
  gap: 10,
},

recordCancelButton: {
  flex: 1,
  height: 46,
  borderRadius: 15,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "#e9dfd2",
},

recordSaveButton: {
  flex: 1,
  height: 46,
  borderRadius: 15,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "#7B5648",
},
goalCard: {
  backgroundColor: "rgba(255,253,249,0.92)",
  borderRadius: 20,
  padding: 16,
  marginTop: -10,
  marginBottom: 2,
  borderWidth: 1,
  borderColor: "#ece4d8",
},

goalHeaderRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: 12,
},

goalTitle: {
  fontFamily: "ChosunCentennial",
  fontSize: 18,
  color: "#5b3f30",
   transform: [{ scaleX: 0.9 }],
},
goalTitleRow: {
  flexDirection: "row",
  alignItems: "flex-end",
  gap: 8,
  flex: 1,
},
goalSubtitle: {
  flex: 1,
  fontSize: 11,
  color: "#7a6f61",
  marginBottom: 3,
},

goalValueBrown: {
  color: "#9b7650",
},

goalValueGreen: {
  color: "#6f805e",
},

goalValueGold: {
  color: "#c48a42",
},

goalValueBlue: {
  color: "#5f8490",
},

goalGrid: {
  flexDirection: "row",
  gap: 8,
},

goalItem: {
  flex: 1,
  paddingHorizontal: 8,
  paddingVertical: 10,
  borderRadius: 14,
  borderWidth: 1,
  borderColor: "#eee4d7",
  backgroundColor: "rgba(255,255,255,0.55)",
  alignItems: "center",
},

goalItemTitle: {
  fontSize: 12,
  fontWeight: "800",
  color: "#4a3d31",
  marginBottom: 0,
},
goalGoalValue: {
  fontSize: 17,
  fontWeight: "800",
  textAlign: "center",
  includeFontPadding: false,
  maxWidth: "100%",
},

goalSettingIconButton: {
  width: 16,
  height: 16,
  borderRadius: 16,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "rgba(255,250,242,0.65)",
},

goalSettingIconImage: {
  width: 23,
  height: 23,
  opacity: 0.9,
},

goalSettingIcon: {
  fontSize: 17,
  color: "#5b3f30",
},

goalSubValue: {
  marginTop: 2,
  fontSize: 12,
  color: "#5f5147",
},
imageModalCard: {
  width: "92%",
  aspectRatio: 1680 / 750,
  position: "relative",
},

imageModalBg: {
  position: "absolute",
  width: "100%",
  height: "115%",
},

imageModalInput: {
  position: "absolute",
  width: "18%",
  height: 34,
  textAlign: "center",
  fontSize: 13,
  color: "#5b3f30",
  fontFamily: "ChosunCentennial",
  backgroundColor: "transparent",
  padding: 0,
},

modalInputOne: {
  left: "7%",
  top: "51%",
},

modalInputTwo: {
  left: "30%",
  top: "51%",
},

modalInputThree: {
  left: "52%",
  top: "51%",
},

modalInputFour: {
  left: "75%",
  top: "51%",
},

modalCloseHotspot: {
  position: "absolute",
  top: -4,
  right: 20,
  width: 45,
  height: 45,
},

modalCancelHotspot: {
  position: "absolute",
  left: "33%",
  bottom: -10,
  width: "15%",
  height: 35,
},

modalSaveHotspot: {
  position: "absolute",
  left: "51%",
  bottom: -10,
  width: "22%",
  height: 35,
},
memoImageCard: {
  position: "relative",
  height: 130,
  marginBottom: 12,
},

memoCardBg: {
  position: "absolute",
  width: "100%",
  height: "100%",
},

memoPreviewText: {
  position: "absolute",
  left: 28,
  right: 78,
  top: 58,
  fontSize: 14.5,
  lineHeight: 19,
  color: "#4c3a31",
},

memoEditHotspot: {
  position: "absolute",
  right: 26,
  top: 28,
  width: 54,
  height: 54,
},

memoDetailButton: {
  position: "absolute",
  left: 130,
  top: 25,
},

memoDetailButtonText: {
  fontSize: 11,
  fontWeight: "600",
  color: "#7a6254",
  top: 6,
  fontFamily: "ChosunCentennial",
  opacity:0.7,
  marginLeft: 7,
},

memoHistoryModalCard: {
  width: "88%",
  maxHeight: "72%",
  backgroundColor: "#fffdf9",
  borderRadius: 24,
  padding: 20,
  borderWidth: 1,
  borderColor: "#eadfce",
},

memoHistoryModalTitle: {
  fontSize: 20,
  fontWeight: "700",
  color: "#5b3f30",
  marginBottom: 4,
  arginTop: 16,
  fontFamily: "ChosunCentennial",
},

memoHistoryCloseButton: {
  position: "absolute",
  right: 18,
  top: 14,
  width: 36,
  height: 36,
  alignItems: "center",
  justifyContent: "center",
},

memoHistoryCloseText: {
  fontSize: 30,
  color: "#8a7a6f",
},

memoHistoryScroll: {
  marginTop: 8,
  maxHeight: 300,
},

memoHistoryScrollContent: {
  paddingBottom: 12,
},

memoHistoryModalItem: {
  paddingVertical: 12,
  borderBottomWidth: 1,
  borderBottomColor: "#eee4d7",
},

memoHistoryModalItemHeader: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  marginBottom: 4,
},

memoHistoryDeleteButton: {
  minWidth: 52,
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 999,
  borderWidth: 1,
  borderColor: "#d6c3ad",
  backgroundColor: "#fff8ef",
  alignItems: "center",
  justifyContent: "center",
},

memoHistoryDeleteButtonDisabled: {
  opacity: 0.5,
},

memoHistoryDeleteText: {
  fontSize: 12,
  fontWeight: "700",
  color: "#9a4f43",
},

memoEditModalCard: {
  width: "88%",
  backgroundColor: "#fffdf9",
  borderRadius: 24,
  padding: 20,
  borderWidth: 1,
  borderColor: "#eadfce",
},

memoEditModalInput: {
  minHeight: 150,
  marginTop: 10,
  padding: 14,
  borderRadius: 16,
  borderWidth: 1,
  borderColor: "#eadfce",
  backgroundColor: "rgba(255,255,255,0.72)",
  fontSize: 20,
  lineHeight: 22,
  color: "#4c3a31",
},

memoEditModalButtonRow: {
  marginTop: 16,
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  gap: 18,
},

memoEditCancelButton: {
  paddingHorizontal: 18,
  paddingVertical: 10,
},

memoEditCancelText: {
  fontSize: 15,
  fontWeight: "800",
  color: "#5b3f30",
  fontFamily: "ChosunCentennial",
},

memoEditSaveButton: {
  paddingHorizontal: 28,
  paddingVertical: 10,
  borderRadius: 999,
  backgroundColor: "#9b8676",
},

memoEditSaveText: {
  fontSize: 15,
  fontWeight: "800",
  color: "#fffdf9",
  fontFamily: "ChosunCentennial",
},
riverGlow: {
  position: "absolute",
  left: "39%",
  top: 120,
  width: "15%",
  height: 190,
  borderRadius: 999,
  backgroundColor: "rgba(255, 244, 211, 0.22)",
  zIndex: 6,
  elevation: 6,
},
riverHighlight: {
  position: "absolute",
  left: -320,
  top: 95,

  width: 390,
  height: 440,

  zIndex: 4,
  elevation: 4,

  resizeMode: "stretch",
},
coachingTipTitleImage: {
  width: 130,
  height: 50,
  marginBottom: 3,
  marginTop: -7,
},
formRecordSection: {
  gap: 12,
},

formPeriodRow: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 2,
},

formPeriodTitle: {
  fontSize: 22,
  fontFamily: fonts.title,
  color: colors.textMain,
},

formPeriodSub: {
  marginTop: 3,
  fontSize: 13,
  fontFamily: fonts.medium,
  color: colors.textSub,
},

formPeriodButton: {
  paddingHorizontal: 14,
  paddingVertical: 8,
  borderRadius: 999,
  borderWidth: 1,
  borderColor: colors.border,
  backgroundColor: colors.card,
},

formPeriodButtonText: {
  fontSize: 12,
  fontFamily: fonts.semiBold,
  color: colors.warmBrown,
},

formTipCard: {
  paddingHorizontal: 16,
  paddingVertical: 14,
  borderRadius: 18,
  backgroundColor: "#F7EFE2",
  borderWidth: 1,
  borderColor: "#E6D5BA",
},

formTipTitle: {
  fontSize: 14,
  fontFamily: fonts.titleSemi,
  color: colors.warmBrown,
  marginBottom: 5,
},

formTipText: {
  fontSize: 14,
  lineHeight: 22,
  fontFamily: fonts.medium,
  color: colors.textMain,
},

formSectionHeaderRow: {
  marginTop: 6,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
},

formSectionTitle: {
  fontSize: 18,
  fontFamily: fonts.title,
  color: colors.textMain,
},

formSmallButton: {
  paddingHorizontal: 12,
  paddingVertical: 7,
  borderRadius: 999,
  borderWidth: 1,
  borderColor: "#d7c9b3",
  backgroundColor: "#fffaf2",
},

formSmallButtonText: {
  fontSize: 12,
  fontFamily: fonts.semiBold,
  color: colors.warmBrown,
},

formRecordCard: {
  backgroundColor: "#FFFCF8",
  borderRadius: 20,
  padding: 16,
  borderWidth: 1,
  borderColor: "#E8D8BE",
  ...shadow.card,
},

formRecordTopRow: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
},

formRecordTextWrap: {
  flex: 1,
},

formRecordName: {
  fontSize: 24,
  fontFamily: fonts.title,
  color: colors.textMain,
  marginBottom: 8,
},

formRecordGoal: {
  fontSize: 13,
  fontFamily: fonts.medium,
  color: colors.textSub,
},

formProgressRow: {
  marginTop: 8,
  flexDirection: "row",
  alignItems: "flex-end",
  justifyContent: "space-between",
  gap: 10,
},

formCountText: {
  fontSize: 17,
  fontFamily: fonts.bold,
  color: colors.textMain,
},

formRemainText: {
  fontSize: 12,
  fontFamily: fonts.medium,
  color: colors.textSub,
},

formProgressTrack: {
  marginTop: 9,
  height: 9,
  borderRadius: 999,
  overflow: "hidden",
  backgroundColor: colors.border,
},

formProgressFill: {
  height: "100%",
  borderRadius: 999,
  backgroundColor: "#6f805e",
},

formRecordButton: {
  marginTop: 14,
  height: 46,
  borderRadius: 14,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.warmBrown,
},

formRecordButtonText: {
  fontSize: 15,
  fontFamily: fonts.bold,
  color: colors.white,
},

moreFormToggle: {
  paddingVertical: 13,
  alignItems: "center",
  borderTopWidth: 1,
  borderTopColor: "#ece4d8",
},

moreFormToggleText: {
  fontSize: 14,
  fontFamily: fonts.bold,
  color: colors.warmBrown,
},

inactiveFormCard: {
  paddingHorizontal: 16,
  paddingVertical: 14,
  borderRadius: 16,
  backgroundColor: colors.card,
  borderWidth: 1,
  borderColor: colors.border,
},

inactiveFormName: {
  fontSize: 16,
  fontFamily: fonts.titleSemi,
  color: colors.textMain,
  marginBottom: 5,
},

inactiveFormText: {
  fontSize: 12,
  fontFamily: fonts.medium,
  color: colors.textSub,
},

formRecordModalCard: {
  width: "90%",
  maxWidth: 360,
  maxHeight: "86%",
  borderRadius: 24,
  backgroundColor: "#FFFDF9",
  paddingHorizontal: 18,
  paddingTop: 24,
  paddingBottom: 20,
},

formModalTitle: {
  fontSize: 20,
  fontFamily: fonts.title,
  color: colors.textMain,
  marginBottom: 6,
  textAlign: "center",
},

formModalClose: {
  position: "absolute",
  top: 14,
  right: 16,
  width: 32,
  height: 32,
  alignItems: "center",
  justifyContent: "center",
},

formModalCloseText: {
  fontSize: 24,
  color: colors.softBrown,
},

formModalName: {
  fontSize: 24,
  fontFamily: fonts.title,
  color: colors.textMain,
  textAlign: "center",
  marginBottom: 8,
},

formModalDesc: {
  fontSize: 14.5,
  fontFamily: fonts.medium,
  color: colors.textSub,
  textAlign: "center",
  marginBottom: 18,
},

formCountStepper: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  marginBottom: 14,
},

formStepperButton: {
  width: 44,
  height: 44,
  borderRadius: 999,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#F7EFE2",
  borderWidth: 1,
  borderColor: "#E6D5BA",
},

formStepperText: {
  fontSize: 22,
  fontFamily: fonts.bold,
  color: colors.warmBrown,
},

formCountInput: {
  width: 86,
  height: 52,
  borderRadius: 14,
  borderWidth: 1,
  borderColor: "#E1D8CA",
  backgroundColor: "#FFFDF9",
  textAlign: "center",
  fontSize: 24,
  fontFamily: fonts.bold,
  color: colors.textMain,
},

quickCountRow: {
  flexDirection: "row",
  justifyContent: "center",
  gap: 8,
  marginBottom: 22,
},

quickCountButton: {
  paddingHorizontal: 13,
  paddingVertical: 8,
  borderRadius: 999,
  backgroundColor: "#FFF7EC",
  borderWidth: 1,
  borderColor: "#E4D1B6",
},

quickCountText: {
  fontSize: 13,
  fontFamily: fonts.semiBold,
  color: colors.warmBrown,
},

formGoalModalScroll: {
  flexShrink: 1,
  minHeight: 0,
},

formGoalModalScrollContent: {
  paddingBottom: 2,
},
formModalButtonRow: {
  flexDirection: "row",
  gap: 10,
},

formModalCancelButton: {
  flex: 1,
  height: 46,
  borderRadius: 14,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#E8E0D2",
},

formModalCancelText: {
  fontSize: 14,
  fontFamily: fonts.bold,
  color: "#5D5146",
},

formModalSaveButton: {
  flex: 1,
  height: 46,
  borderRadius: 14,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.warmBrown,
},

formModalSaveText: {
  fontSize: 14,
  fontFamily: fonts.bold,
  color: colors.white,
},
formPeriodTextButton: {
  paddingVertical: 6,
  paddingHorizontal: 2,
},

formPeriodTextButtonLabel: {
  fontSize: 14,
  fontFamily: fonts.semiBold,
  color: colors.warmBrown,
},

formTipCardNew: {
  minHeight: 74,
  borderRadius: 18,
  borderWidth: 1,
  borderColor: "#E5D5C7",
  backgroundColor: "#FFF8ED",
  paddingHorizontal: 18,
  paddingVertical: 14,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  overflow: "hidden",
},

formTipTitleNew: {
  fontSize: 17,
  fontFamily: fonts.titleSemi,
  color: colors.warmBrown,
  marginBottom: 6,
},

formTipTextNew: {
  fontSize: 15,
  lineHeight: 19,
  fontFamily: fonts.medium,
  color: colors.textMain,
},

formSectionHeaderRowNew: {
  marginTop: 18,
  marginBottom: 10,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
},

formSectionTitleNew: {
  fontSize: 21,
  fontFamily: fonts.titleSemi,
  color: colors.textMain,
},

formGoalTextButton: {
  fontSize: 15,
  fontFamily: fonts.semiBold,
  color: colors.warmBrown,
},

featuredFormCard: {
  position: "relative",
  minHeight: 276,
  borderRadius: 22,
  borderWidth: 1,
  borderColor: "#E2D3C5",
  backgroundColor: "rgba(255,252,247,0.96)",
  padding: 20,
  overflow: "hidden",
},

featuredFormContent: {
  position: "relative",
  zIndex: 3,
  width: "62%",
},

featuredFormImage: {
  position: "absolute",
  right: 5,
  bottom: 90,
  width: 147,
  height: 147,
  opacity: 0.85,
  zIndex: 2,
},

featuredFormTitle: {
  fontSize: 23,
  lineHeight: 34,
  fontFamily: fonts.title,
  color: colors.textMain,
  marginBottom: 3,
},

featuredFormCategory: {
  fontSize: 13,
  fontFamily: fonts.medium,
  color: colors.textSub,
  marginBottom: 16,
},

featuredFormCount: {
  fontSize: 17,
  lineHeight: 25,
  fontFamily: fonts.titleSemi,
  color: colors.warmBrown,
  marginBottom: 3,
},

featuredFormRemain: {
  fontSize: 12,
  lineHeight: 20,
  fontFamily: fonts.medium,
  color: colors.textSub,
  marginBottom: 12,
},

featuredProgressTrack: {
  width: 155,
  height: 7,
  borderRadius: 999,
  backgroundColor: "#EFE6DC",
  overflow: "hidden",
  marginBottom: 8,
},

featuredProgressFill: {
  height: "100%",
  borderRadius: 999,
  backgroundColor: colors.warmBrown,
},

featuredPercentText: {
  fontSize: 15,
  fontFamily: fonts.semiBold,
  color: colors.warmBrown,
  marginBottom: 18,
},

featuredRecordButton: {
  height: 45,
  borderRadius: 16,
  backgroundColor: colors.warmBrown,
  alignItems: "center",
  justifyContent: "center",
  width: "85%",
},

featuredRecordButtonText: {
  fontSize: 16,
  fontFamily: fonts.bold,
  color: "#FFFDF9",
},

otherFormTitleRow: {
  marginTop: 22,
  marginBottom: 12,
  flexDirection: "row",
  alignItems: "center",
  gap: 12,
},

otherFormTitle: {
  fontSize: 21,
  fontFamily: fonts.titleSemi,
  color: colors.textMain,
},

otherFormLine: {
  flex: 1,
  height: 1,
  backgroundColor: "#DED0C3",
},

otherFormScrollContent: {
  gap: 10,
  paddingRight: 16,
},

otherFormCard: {
  width: 136,
  height: 132,
  borderRadius: 18,
  borderWidth: 1,
  borderColor: "#E2D3C5",
  backgroundColor: "rgba(255,252,247,0.96)",
  padding: 14,
  overflow: "hidden",
  position: "relative",
},

otherFormName: {
  fontSize: 16,
  fontFamily: fonts.titleSemi,
  color: colors.textMain,
  marginBottom: 4,
  zIndex: 2,
},

otherFormCount: {
  fontSize: 12.5,
  fontFamily: fonts.medium,
  color: colors.textSub,
  zIndex: 2,
},

otherFormImage: {
  position: "absolute",
  right: -2,
  bottom: 5,
  width: 85,
  height: 85,
  opacity: 0.85,
},

otherFormArrow: {
  position: "absolute",
  right: 12,
  top: 52,
  fontSize: 26,
  color: "rgba(118,86,75,0.72)",
},

emptyFormCard: {
  borderRadius: 20,
  borderWidth: 1,
  borderColor: "#E2D3C5",
  backgroundColor: "#FFFDF9",
  padding: 20,
},

emptyFormTitle: {
  fontSize: 18,
  fontFamily: fonts.titleSemi,
  color: colors.textMain,
  marginBottom: 6,
},

emptyFormText: {
  fontSize: 14,
  lineHeight: 21,
  fontFamily: fonts.medium,
  color: colors.textSub,
},
goalInputSection: {
  marginTop: 4,
  marginBottom: 18,
  alignItems: "center",
},

goalInputLabel: {
  fontSize: 13,
  fontFamily: fonts.medium,
  color: colors.textSub,
  marginBottom: 8,
},

goalInputHint: {
  marginTop: -4,
  marginBottom: 8,
  fontSize: 12,
  color: "#9B8D84",
  textAlign: "center",
  fontWeight: "600",
},

goalInputBox: {
  width: "100%",
  height: 54,
  borderRadius: 16,
  borderWidth: 1,
  borderColor: "#E2D3C5",
  backgroundColor: "#FFFDF9",
  justifyContent: "center",
  position: "relative",
},

goalCountInput: {
  width: "100%",
  height: "100%",
  paddingHorizontal: 48,
  textAlign: "center",
  fontSize: 22,
  fontFamily: fonts.titleSemi,
  color: colors.warmBrown,
  outlineStyle: "none",
},

goalInputUnit: {
  position: "absolute",
  right: 18,
  top: 16,
  fontSize: 15,
  fontFamily: fonts.semiBold,
  color: colors.textSub,
},

featuredInkCircleImage: {
  position: "absolute",
  right: -10,
  top: 25,
  width: 180,
  height: 180,
  opacity: 0.35,
  zIndex: 1,
},

formTipFlower: {
  position: "absolute",
  right: -2,
  top: -12,
  width: 100,
  height: 78,
  opacity: 0.5,
},
goalFormSelectCard: {
  minHeight: 56,
  borderRadius: 14,
  borderWidth: 1,
  borderColor: "#E8DDD3",
  backgroundColor: "#FFFDF9",
  paddingLeft: 14,
  paddingRight: 10,
  paddingVertical: 11,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
},

goalFormSelectCardSelected: {
  borderColor: colors.warmBrown,
  backgroundColor: "#FFF7EC",
},

goalFormSelectTextWrap: {
  flex: 1,
  paddingRight: 8,
},

goalFormSelectName: {
  fontSize: 16,
  fontFamily: fonts.semiBold,
  color: colors.textMain,
  marginBottom: 4,
},

goalFormSelectMeta: {
  fontSize: 13,
  fontFamily: fonts.medium,
  color: colors.textSub,
},

featuredStarButton: {
  width: 34,
  height: 34,
  borderRadius: 999,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#F3ECE4",
},

featuredStarButtonActive: {
  backgroundColor: colors.warmBrown,
},

featuredStarText: {
  fontSize: 18,
  color: "#B8A99D",
  lineHeight: 22,
},

featuredStarTextActive: {
  color: "#FFFDF9",
},
otherFormCardLocked: {
  opacity: 0.42,
},

lockBadge: {
  position: "absolute",
  right: 9,
  top: 9,
  width: 26,
  height: 26,
  borderRadius: 999,
  backgroundColor: "rgba(118,86,75,0.16)",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 5,
},

lockBadgeText: {
  fontSize: 13,
},
completionModalCard: {
  width: "86%",
  maxWidth: 340,
  borderRadius: 24,
  backgroundColor: "#FFFDF9",
  borderWidth: 1,
  borderColor: "#E7D8CB",
  paddingHorizontal: 22,
  paddingTop: 26,
  paddingBottom: 18,
},

completionTitle: {
  fontSize: 23,
  fontFamily: fonts.title,
  color: colors.textMain,
  textAlign: "center",
  marginBottom: 14,
},

completionText: {
  fontSize: 16,
  lineHeight: 24,
  fontFamily: fonts.semiBold,
  color: colors.warmBrown,
  textAlign: "center",
},

completionSubText: {
  marginTop: 8,
  fontSize: 13,
  lineHeight: 20,
  fontFamily: fonts.medium,
  color: colors.textSub,
  textAlign: "center",
},

completionButtonRow: {
  marginTop: 22,
  flexDirection: "row",
  gap: 10,
},

completionCancelButton: {
  flex: 1,
  height: 46,
  borderRadius: 14,
  backgroundColor: "#EDE4D6",
  alignItems: "center",
  justifyContent: "center",
},

completionSaveButton: {
  flex: 1,
  height: 46,
  borderRadius: 14,
  backgroundColor: colors.warmBrown,
  alignItems: "center",
  justifyContent: "center",
},

completionCancelText: {
  fontSize: 14,
  fontFamily: fonts.semiBold,
  color: colors.warmBrown,
},

completionSaveText: {
  fontSize: 14,
  fontFamily: fonts.semiBold,
  color: "#FFFDF9",
},
awardEntryMiniCard: {
  marginHorizontal: 0,
  marginTop: 12,
  paddingVertical: 13,
  paddingHorizontal: 14,
  borderRadius: 18,
  backgroundColor: "#FFF8EC",
  borderWidth: 1,
  borderColor: "#E7D2A9",
  flexDirection: "row",
  alignItems: "center",
  ...shadow.card,
},
awardEntryIcon: {
  width: 34,
  height: 34,
  marginRight: 12,
  opacity: 0.9,
},
awardEntryTextBox: {
  flex: 1,
},
awardEntryEyebrow: {
  fontSize: 11,
  fontWeight: "800",
  color: colors.bronzeGold,
  marginBottom: 3,
},
awardEntryTitle: {
  fontSize: 16,
  fontWeight: "700",
  color: colors.textMain,
},
awardEntryDesc: {
  marginTop: 3,
  fontSize: 12,
  lineHeight: 17,
  color: colors.textSub,
},
awardEntryArrow: {
  fontSize: 24,
  color: colors.bronzeGold,
  marginLeft: 8,
},
memoLimitText: {
  marginTop: 8,
  marginBottom: 10,
  fontSize: 12,
  fontFamily: fonts.medium,
  color: "#9A8578",
  textAlign: "right",
},
privateGuideBanner: {
  marginTop: 0,
  paddingVertical: 14,
  paddingHorizontal: 16,
  borderRadius: 18,
  borderWidth: 1,
  borderColor: "rgba(200,158,106,0.35)",
  backgroundColor: "rgba(255,248,235,0.8)",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
},

privateGuideBannerTitle: {
  fontSize: 15,
  fontFamily: "PretendardSemiBold",
  color: "#3A2C27",
},

privateGuideBannerDesc: {
  marginTop: 7,
  fontSize: 13,
  fontFamily: "PretendardMedium",
  color: "#8A7568",
},

privateGuideBannerArrow: {
  fontSize: 22,
  color: "#C89E6A",
},
debugBox: {
  marginTop: 20,
  marginHorizontal: 16,
  padding: 12,
  borderRadius: 12,
  backgroundColor: "#111",
},

debugTitle: {
  color: "#fff",
  fontSize: 13,
  fontWeight: "700",
  marginBottom: 8,
},

debugText: {
  color: "#00ff7f",
  fontSize: 11,
  lineHeight: 16,
},
});