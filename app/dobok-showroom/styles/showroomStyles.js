import { StyleSheet } from "react-native";
import { colors } from "../../../src/theme";
const BROWN = "#875B42";
const DARK = "#30251F";
const CREAM = "#FFFCFA";
const BORDER = "#E7DDD3";

const showroomStyles = StyleSheet.create({
screen: {
  flex: 1,
  backgroundColor: "#FFFCFA",
},

page: {
  width: "100%",
  maxWidth: 430,
  alignSelf: "center",
  paddingHorizontal: 16,
  paddingTop: 24,
  paddingBottom: 48,
  backgroundColor: "#FFFCFA",
},
  sectionHint: {
    marginTop: 5,
    color: "#8A7D73",
    fontSize: 12,
    lineHeight: 14
  },
  disabled: {
    opacity: 0.35
  },
  twoColumns: {
    marginTop: 8,
    flexDirection: "row",
    gap: 8
  },
  optionCard: {
    minHeight: 78,
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 11,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E7D8C9",
    borderRadius: 15,
    backgroundColor: "#FFF"
  },
  lockedCard: {
    backgroundColor: "#F3EFEB"
  },
  optionCardText: {
    flex: 1,
    minWidth: 0
  },
  optionTitle: {
    color: "#4E3426",
    fontSize: 12,
    fontWeight: "800"
  },
  optionSubtitle: {
    marginTop: 3,
    color: "#7D7066",
    fontSize: 11,
  },
  chevron: {
    marginLeft: 4,
    color: BROWN,
    fontSize: 20
  },
  lockImage: {
    width: 22,
    height: 22,
    marginLeft: 6,
    opacity: 0.82
  },
  noticeBadgeIcon: {
    width: 34,
    height: 34,
    flexShrink: 0
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(30,24,20,0.42)"
  },
  sheet: {
    height: "86%",
    paddingTop: 10,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    backgroundColor: "#FFFDFC"
  },
  smallSheet: {
    height: "58%"
  },
  sheetHandle: {
    width: 36,
    height: 4,
    alignSelf: "center",
    marginBottom: 13,
    borderRadius: 3,
    backgroundColor: "#D2CBC5"
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start"
  },
  sheetTitle: {
    color: DARK,
    fontSize: 20,
    fontWeight: "700"
  },
  sheetSub: {
    marginTop: 4,
    color: "#87796F",
    fontSize: 13,
  },
  close: {
    color: DARK,
    fontSize: 29,
    lineHeight: 29
  },
  search: {
    marginTop: 13,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 13,
    color: DARK,
    backgroundColor: "#FFF"
  },
  selectedColor: {
    marginTop: 11,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DABF9B",
    borderRadius: 14,
    backgroundColor: "#FFF9F1"
  },
  selectedCircle: {
    width: 38,
    height: 38,
    marginRight: 10,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: "#CDBFAE"
  },
  selectedLabel: {
    color: "#9A887A",
    fontSize: 9,
    fontWeight: "800"
  },
  selectedName: {
    marginTop: 2,
    color: DARK,
    fontSize: 13,
    fontWeight: "900"
  },
  check: {
    color: BROWN,
    fontSize: 21,
    fontWeight: "900"
  },
  colorScroll: {
    flex: 1,
    marginTop: 2
  },
  colorGrid: {
    paddingTop: 10,
    paddingBottom: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 8
  },
  colorTile: {
    position: "relative",
    width: "23.5%",
    padding: 5,
    borderWidth: 1,
    borderColor: "#EEE7E1",
    borderRadius: 10,
    backgroundColor: "#FFF"
  },
  colorTileActive: {
    borderColor: BROWN,
    borderWidth: 2,
    backgroundColor: "#FFF8ED"
  },
  colorBlock: {
    height: 36,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)"
  },
  colorCode: {
    marginTop: 5,
    color: "#4B4038",
    fontSize: 10,
    fontWeight: "900",
    textAlign: "center"
  },
  miniCheck: {
    position: "absolute",
    right: 2,
    bottom: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: BROWN
  },
  miniCheckText: {
    color: "#FFF",
    fontSize: 9,
    lineHeight: 16,
    textAlign: "center"
  },
  embroideryGrid: {
    marginTop: 18,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 15
  },
  embroideryItem: {
    width: "29%",
    alignItems: "center"
  },
  embroideryRing: {
    width: 50,
    height: 50,
    padding: 4,
    borderWidth: 2,
    borderColor: "transparent",
    borderRadius: 25
  },
  embroideryRingActive: {
    borderColor: BROWN
  },
  embroideryDot: {
    flex: 1,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: "#D0C5BB"
  },
  embroideryLabel: {
    marginTop: 5,
    color: "#5A4B41",
    fontSize: 10,
    fontWeight: "800"
  },
  primaryButton: {
    marginTop: 10,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 13,
    backgroundColor: BROWN
  },
  primaryButtonText: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "900"
  },
  favoriteList: {
    flex: 1,
    marginTop: 12
  },
  favoriteListContent: {
    paddingBottom: 10,
    gap: 10
  },
  favoriteCard: {
    overflow: "hidden",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 16,
    backgroundColor: "#FFF"
  },
  favoriteCardCurrent: {
    borderColor: BROWN,
    borderWidth: 2,
    backgroundColor: "#FFF9F2"
  },
  favoriteApplyArea: {
    minHeight: 132,
    padding: 10,
    flexDirection: "row",
    alignItems: "center"
  },
  favoritePreviewWrap: {
    width: 88,
    height: 132,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "flex-start",
    borderRadius: 12,
    backgroundColor: "#F3EFE9"
  },
  favoriteInfo: {
    flex: 1,
    minWidth: 0,
    marginLeft: 12
  },
  favoriteNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7
  },
  favoriteName: {
    flexShrink: 1,
    color: DARK,
    fontSize: 17,
    fontWeight: "700"
  },
  currentBadge: {
    paddingHorizontal: 7,
    paddingVertical: 4,
    overflow: "hidden",
    borderRadius: 11,
    color: "#FFF",
    backgroundColor: BROWN,
    fontSize: 11,
    fontWeight: "700"
  },
  favoriteMeta: {
    marginTop: 5,
    color: "#74675D",
    fontSize: 13,
    fontWeight: "700"
  },
  favoriteApplyText: {
    marginTop: 10,
    color: BROWN,
    fontSize: 13,
    fontWeight: "900"
  },
  favoriteActions: {
    minHeight: 42,
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: BORDER
  },
  favoriteActionButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  favoriteActionText: {
    color: "#6F5C4F",
    fontSize: 14,
    fontWeight: "700"
  },
  deleteText: {
    color: "#B44D49"
  },
  emptyFavorites: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30
  },
  emptyStarIcon: {
    width: 58,
    height: 58,
    opacity: 0.75
  },
  emptyFavoriteTitle: {
    marginTop: 14,
    color: DARK,
    fontSize: 15,
    fontWeight: "900"
  },
  emptyFavoriteText: {
    marginTop: 7,
    color: "#897B70",
    fontSize: 11,
    lineHeight: 17,
    textAlign: "center"
  },
  disabledButton: {
    opacity: 0.45
  },
  nameModalBackdrop: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(30,24,20,0.48)"
  },
  nameDialog: {
    width: "100%",
    maxWidth: 380,
    padding: 20,
    borderRadius: 20,
    backgroundColor: "#FFFDFC"
  },
  nameDialogTitle: {
    color: DARK,
    fontSize: 18,
    fontWeight: "900"
  },
  nameDialogHint: {
    marginTop: 6,
    color: "#85776D",
    fontSize: 11
  },
  nameInput: {
    height: 48,
    marginTop: 16,
    paddingHorizontal: 13,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 13,
    color: DARK,
    fontSize: 13,
    backgroundColor: "#FFF"
  },
  nameDialogActions: {
    marginTop: 16,
    flexDirection: "row",
    gap: 8
  },
  nameDialogButton: {
    minHeight: 44,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12
  },
  nameCancelButton: {
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: "#FFF"
  },
  nameSaveButton: {
    backgroundColor: BROWN
  },
  nameCancelText: {
    color: "#6E5E53",
    fontWeight: "900"
  },
  nameSaveText: {
    color: "#FFF",
    fontWeight: "900"
  },
  savedListIconBox: {
    width: 23,
    height: 23,
    marginRight: 7,
    alignItems: "center",
    justifyContent: "center"
  },
  savedListIcon: {
    width: 21,
    height: 21,
    opacity: 0.78
  },
  savedListArrow: {
    marginLeft: 8,
    marginTop: -2,
    color: "#6F4934",
    fontSize: 25,
    fontWeight: "400"
  },
  sectionTitle: {
    color: "#513526",
    fontSize: 15,
    fontWeight: "900"
  },
  sectionDescription: {
    marginTop: 5,
    color: "#8B7464",
    fontSize: 10,
    lineHeight: 15,
    fontWeight: "600"
  },
  noticeTitle: {
    color: "#4F372B",
    fontSize: 16,
    fontWeight: "800"
  },
  noticeText: {
    marginTop: 5,
    color: "#806E61",
    fontSize: 13,
    lineHeight: 15,
    fontWeight: "600"
  },
  saveStarIcon: {
    width: 24,
    height: 24,
    marginRight: 10
  },
  saveButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "700"
  },
  saveLimitText: {
    position: "absolute",
    right: 28,
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700"
  },
  favoriteSheet: {
    height: "86%",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28
  },
  optionSwatch: {
    width: 42,
    height: 42,
    marginLeft: 6,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: "rgba(64,45,35,0.12)"
  },
  notice: {
    marginTop: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    minHeight: 92,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 23,
    backgroundColor: "#F3EDE4"
  },
  saveButton: {
    width: "100%",
    minHeight: 62,
    marginTop: 16,
    marginBottom: 30,
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: "#6B452F"
  },
  introRow: {
    minHeight: 34,
    justifyContent: "center",
    marginTop: -15,
    marginBottom: 15,
    paddingHorizontal: 40
  },
  subtitle: {
    color: "#8B786A",
    fontSize: 13,
    lineHeight: 15,
    textAlign: "center"
  },
  topActions: {
    width: "100%",
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
genderTabs: {
  width: 164,
  minHeight: 48,
  flexDirection: "row",
  gap: 5,
},
  genderSegment: {
    minHeight: 48,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E5D3BD",
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.9)"
  },
  genderSegmentText: {
    color: "#664737",
    fontSize: 14,
    fontWeight: "700"
  },
  genderSegmentTextActive: {
    color: "#563522",
    fontWeight: "900"
  },
savedListButton: {
  width: 160,
  minHeight: 48,
  marginLeft: "auto",
  paddingHorizontal: 14,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  borderWidth: 1,
  borderColor: "#E5D3BD",
  borderRadius: 18,
  backgroundColor: "rgba(255,255,255,0.92)",
},
  savedListText: {
    color: "#5A3B2B",
    fontSize: 14,
    fontWeight: "700"
  },
  previewSummaryMain: {
    color: "#4E3426",
    fontSize: 14,
    fontWeight: "800",
    textAlign: "center"
  },
  previewSummarySub: {
    marginTop: 5,
    color: "#735A49",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center"
  },
  sectionCard: {
    width: "100%",
    marginTop: 11,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E8D9C8",
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.9)"
  },
  sectionNumber: {
    color: "#4B3123",
    fontWeight: "900",
    fontSize: 12
  },
  sectionSpacing: {
    marginTop: 11
  },
  rowWrap: {
    marginTop: 7,
    flexDirection: "row",
    flexWrap: "nowrap",
    gap: 7
  },
  segment: {
    position: "relative",
    minHeight: 42,
    flexGrow: 1,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E7D7C5",
    borderRadius: 13,
    backgroundColor: "#FFFDF9"
  },
  segmentText: {
    color: "#654738",
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center"
  },
  segmentTextActive: {
    color: "#543421",
    fontWeight: "800"
  },
  fabricRow: {
    width: "100%",
    paddingTop: 10,
    paddingBottom: 2,
    gap: 9
  },
  fabricCard: {
    position: "relative",
    width: 130,
    minHeight: 62,
    paddingHorizontal: 14,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E8DACA",
    borderRadius: 16,
    backgroundColor: "#FFFDF9"
  },
  fabricCardContent: {
    alignItems: "center",
    justifyContent: "center"
  },
  fabricLabel: {
    marginTop: 0,
    color: "#563829",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center"
  },
  fabricCount: {
    marginTop: 3,
    color: "#806A5A",
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center"
  },
  segmentActive: {
    borderColor: "#C98A3E",
    backgroundColor: "#FFF1DD"
  },
  genderSegmentActive: {
    borderColor: "#C98A3E",
    backgroundColor: "#FFF1DD"
  },
  fabricCardActive: {
    borderColor: "#C98A3E",
    borderWidth: 2,
    backgroundColor: "#FFF1DD"
  },
  previewCard: {
    width: "100%",
    marginTop: 12,
    overflow: "hidden",
    borderWidth: 0,
    borderRadius: 0,
    backgroundColor: "#F8F4ED"
  },
  previewLandscape: {
    position: "relative",
    width: "100%",
    minHeight: 500,
    alignItems: "center",
    justifyContent: "flex-start",
    overflow: "hidden",
    backgroundColor: "#F8F4ED"
  },
  previewLandscapeBackground: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 180,
    width: "100%",
    height: 430,
    zIndex: 0,
    opacity: 0.92
  },
  previewModelLayer: {
    position: "relative",
    zIndex: 1,
    width: "100%",
    minHeight: 430,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 4,
    backgroundColor: "transparent"
  },
  previewSummary: {
    position: "relative",
    zIndex: 2,
    width: "92%",
    minHeight: 64,
    marginTop: -8,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.72)"
  },
  sectionHeadingRow: {
    minHeight: 30,
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  sectionHeadingIcon: {
    width: 36,
    height: 36,
  },
  sectionHeadingText: {
    color: "#4B3123",
    fontSize: 15,
    fontWeight: "800"
  },
  subsectionLabel: {
    marginTop: 10,
    color: "#5C4030",
    fontSize: 13,
    fontWeight: "900"
  },
  detailSection: {
    width: "100%",
    marginTop: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E8D9C8",
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.9)"
  },
  detailToggle: {
    minHeight: 64,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  detailToggleTextWrap: {
    flex: 1,
    minWidth: 0,
    paddingRight: 12
  },
  detailToggleTitle: {
    color: "#4B3123",
    fontSize: 14,
    fontWeight: "800"
  },
  detailToggleHint: {
    marginTop: 3,
    color: "#8A7D73",
    fontSize: 11,
    lineHeight: 15
  },
  detailToggleArrow: {
    color: "#875B42",
    fontSize: 22,
    fontWeight: "800"
  },
  detailPanel: {
    paddingHorizontal: 12,
    paddingBottom: 13,
    borderTopWidth: 1,
    borderTopColor: "#EFE5DB"
  },
  detailResetRow: {
    marginTop: 8,
    flexDirection: "row",
    gap: 8
  },
  detailResetButton: {
    minHeight: 34,
    flex: 1,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#D9B787",
    borderRadius: 11,
    backgroundColor: "#FFF8EE"
  },
  detailResetButtonDisabled: {
    borderColor: "#E9E1D9",
    backgroundColor: "#F5F1ED"
  },
  detailResetText: {
    color: "#70492F",
    fontSize: 10,
    fontWeight: "800",
    textAlign: "center"
  },
  detailResetTextDisabled: {
    color: "#A3978D"
  },
  optionIcon: {
    width: 28,
    height: 28,
    marginRight: 8,
    flexShrink: 0
  }
});

export default showroomStyles;
