import { Platform, StyleSheet } from "react-native";
import { colors, radius, shadow, readability } from "../../theme";

const fonts = {
  regular: "PretendardRegular",
  medium: "PretendardMedium",
  semiBold: "PretendardSemiBold",
  bold: "PretendardBold",
  title: "MaruBuriBold",
  titleSemi: "MaruBuriSemiBold",
};

const isWeb = Platform.OS === "web";

export const styles = StyleSheet.create({
  screen: {
  flex: 1,
  backgroundColor: colors.background,
},
content: {
  paddingHorizontal: 16,
  paddingTop: 32,
  paddingBottom: isWeb ? 10 : 130,
  gap: 14,
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
    color: "#666",
  },
  header: {
    marginBottom: 2,
  },
  title: {
  fontSize: 28,
  fontFamily: fonts.title,
  color: colors.textMain,
},
  subtitle: {
  fontSize: readability.body.fontSize,
  fontFamily: fonts.medium,
  color: colors.textSubStrong,
  marginTop: -8,
  marginBottom: 10,
  marginLeft: 4,
  lineHeight: readability.body.lineHeight,
},
  profileCard: {
    backgroundColor: "#F8F5EF",
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: "#E8E1D6",
  },
    card: {
    backgroundColor: "#FFFEFC",
    borderRadius: 28,
    paddingHorizontal: 18,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: "#ECE7DE",
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1F1A17",
  },
  cardText: {
    fontSize: 14,
    lineHeight: 21,
    color: "#5F554B",
  },
  cardHint: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 19,
    color: "#9A8F81",
  },
  paymentMain: {
    fontSize: 24,
    fontWeight: "800",
    color: "#7C4F21",
    marginBottom: 6,
  },
  recurringMain: {
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 23,
    color: "#314E67",
  },
  softBadge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#F6F1E8",
  },
  softBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#7B7164",
  },
  linkText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#8C6330",
  },
  settingRow: {
    marginTop: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2A2624",
  },
  settingDesc: {
    marginTop: 3,
    fontSize: 13,
    color: "#8A8177",
  },
  readyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "#F3F4F6",
  },
  readyBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
  },
  logoutButton: {
  marginTop: 2,
  marginBottom: 20,
  minHeight: 50,
  borderRadius: 16,
  backgroundColor: colors.warmBrown,
  alignItems: "center",
  justifyContent: "center",
},
  logoutButtonText: {
  fontSize: 16,
  fontFamily: fonts.bold,
  color: colors.white,
},
  profileNameWrap: {
  flex: 1,
},

profileNameLine: {
  flexDirection: "row",
  alignItems: "center",
  flexWrap: "wrap",
  gap: 10,
},

profileEditButton: {
  paddingHorizontal: 10,
  paddingVertical: 7,
  borderRadius: 999,
  backgroundColor: "#F6F1E8",
  borderWidth: 1,
  borderColor: "#DED4C7",
},

profileEditButtonText: {
  fontSize: 12,
  fontWeight: "800",
  color: "#8C6330",
},

profileName: {
  fontSize: 26,
  fontWeight: "800",
  color: "#161311",
},

profileBadge: {
  paddingHorizontal: 10,
  paddingVertical: 5,
  borderRadius: 999,
  backgroundColor: "#F1ECE3",
  borderWidth: 1,
  borderColor: "#DED4C7",
},

profileBadgeText: {
  fontSize: 12,
  fontWeight: "800",
  color: "#5F554B",
},

profileEmail: {
  marginTop: 8,
  fontSize: 14,
  color: "#7A7168",
},

profileDivider: {
  height: 1,
  backgroundColor: "#E8E1D6",
  marginVertical: 16,
},

tuitionRow: {
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
},

tuitionLabel: {
  fontSize: 14,
  fontWeight: "700",
  color: "#5F554B",
},

tuitionBadge: {
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 999,
  backgroundColor: "#F6F1E8",
},

tuitionBadgeText: {
  fontSize: 11,
  fontWeight: "800",
  color: "#7C4F21",
},

tuitionDays: {
  marginTop: 8,
  fontSize: 15,
  fontWeight: "800",
  color: "#7C4F21",
},

tuitionDue: {
  marginTop: 4,
  fontSize: 13,
  color: "#7A7168",
},
input: {
  marginTop: 16,
  minHeight: 52,
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: radius.md,
  paddingHorizontal: 14,
  paddingVertical: 13,
  fontSize: 15,
  fontFamily: fonts.medium,
  backgroundColor: colors.card,
  color: colors.textMain,
},

accountActionRow: {
  minHeight: 58,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
},

accountActionArrow: {
  fontSize: 28,
  fontWeight: "300",
  color: "#9A8F81",
},

innerDivider: {
  height: 1,
  backgroundColor: "#ECE7DE",
  marginVertical: 8,
},

modalOverlay: {
  flex: 1,
  backgroundColor: "rgba(58, 44, 39, 0.34)",
  justifyContent: "center",
  paddingHorizontal: 22,
},

modalCard: {
  backgroundColor: colors.card,
  borderRadius: radius.lg,
  paddingHorizontal: 20,
  paddingVertical: 22,
  borderWidth: 1,
  borderColor: colors.border,
  ...shadow.card,
},

modalTitle: {
  fontSize: 22,
  lineHeight: 30,
  fontFamily: fonts.titleSemi,
  color: colors.textMain,
},

modalDesc: {
  marginTop: 10,
  fontSize: 14,
  lineHeight: 22,
  fontFamily: fonts.medium,
  color: colors.textSub,
},

modalButtonRow: {
  flexDirection: "row",
  gap: 10,
  marginTop: 18,
},

modalButton: {
  flex: 1,
  minHeight: 52,
  borderRadius: radius.md,
  alignItems: "center",
  justifyContent: "center",
},

modalCancelButton: {
  backgroundColor: "#F8F1EA",
  borderWidth: 1,
  borderColor: colors.border,
},

modalPrimaryButton: {
  backgroundColor: colors.warmBrown,
},

modalCancelButtonText: {
  fontSize: 15,
  fontFamily: fonts.bold,
  color: colors.warmBrown,
},

modalPrimaryButtonText: {
  fontSize: 15,
  fontFamily: fonts.bold,
  color: colors.white,
},
headerRow: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 0,
  marginLeft: 4,
},

headerEditButton: {
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 999,
  backgroundColor: "#F6F1E8",
  borderWidth: 1,
  borderColor: "#DED4C7",
},

headerEditButtonText: {
  fontSize: 12,
  fontWeight: "800",
  color: "#8C6330",
},
goalBlock: {
  marginTop: 14,
},

goalLabel: {
  fontSize: 13,
  fontWeight: "800",
  color: "#7A7168",
},

goalMain: {
  marginTop: 5,
  fontSize: 16,
  fontWeight: "900",
  color: "#1F1A17",
},

goalSub: {
  marginTop: 4,
  fontSize: 13,
  lineHeight: 18,
  color: "#7A7168",
},

goalDivider: {
  marginTop: 14,
  height: 1,
  backgroundColor: "#ECE7DE",
},
tuitionLeft: {
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
  flex: 1,
},

paymentButton: {
  paddingHorizontal: 12,
  paddingVertical: 7,
  borderRadius: 999,
  backgroundColor: colors.warmBrown,
},

paymentButtonText: {
  fontSize: 12,
  fontWeight: "900",
  color: colors.white,
},
paymentModalCard: {
  width: "100%",
  maxHeight: "86%",
  backgroundColor: colors.card,
  borderRadius: radius.lg,
  paddingHorizontal: 18,
  paddingTop: 26,
  paddingBottom: 18,
  borderWidth: 1,
  borderColor: colors.border,
  ...shadow.card,
},

paymentModalTitle: {
  fontSize: 26,
  lineHeight: 34,
  fontFamily: fonts.titleSemi,
  color: colors.textMain,
  textAlign: "center",
},
paymentModalCloseIcon: {
  position: "absolute",
  top: 16,
  right: 16,
  width: 36,
  height: 36,
  borderRadius: 18,
  backgroundColor: "#F6EFE8",
  borderWidth: 1,
  borderColor: colors.border,
  alignItems: "center",
  justifyContent: "center",
  zIndex: 10,
},

paymentModalCloseIconText: {
  fontSize: 30,
  lineHeight: 32,
  fontWeight: "300",
  color: colors.warmBrown,
},

paymentModalContent: {
  paddingTop: 8,
  paddingBottom: 2,
},

paymentModalDesc: {
  marginTop: 8,
  marginBottom: 8,
  fontSize: 15,
  lineHeight: 23,
  fontFamily: fonts.medium,
  color: colors.textSub,
  textAlign: "center",
},

paymentMethodBox: {
  marginTop: 12,
  borderRadius: radius.md,
  borderWidth: 1,
  borderColor: colors.border,
  backgroundColor: colors.card,
  paddingHorizontal: 14,
  paddingVertical: 14,
},

paymentMethodRow: {
  flexDirection: "row",
  alignItems: "center",
  gap: 18,
},

paymentIconCircle: {
  width: 54,
  height: 54,
  borderRadius: 27,
  marginLeft: 2,
  backgroundColor: "#F8F1EA",
  alignItems: "center",
  justifyContent: "center",
  borderWidth: 1,
  borderColor: colors.border,
},

paymentIconText: {
  fontSize: 15,
  fontWeight: "900",
  color: colors.warmBrown,
},

paymentIconTextSmall: {
  fontSize: 13,
  fontWeight: "900",
  color: colors.warmBrown,
},

paymentMethodBody: {
  flex: 1,
},

paymentMethodTitle: {
  fontSize: 17,
  lineHeight: 24,
  fontFamily: fonts.bold,
  color: colors.textMain,
},

paymentMethodText: {
  marginTop: 6,
  fontSize: 14,
  lineHeight: 22,
  fontFamily: fonts.medium,
  color: colors.textSub,
},

paymentMethodButton: {
  marginTop: 12,
  minHeight: 44,
  width: "100%",
  borderRadius: radius.md,
  backgroundColor: "#F8F1EA",
  borderWidth: 1,
  borderColor: colors.border,
  alignItems: "center",
  justifyContent: "center",
},

paymentMethodButtonText: {
  fontSize: 14,
  lineHeight: 20,
  fontFamily: fonts.bold,
  color: colors.warmBrown,
},

paymentCloseButton: {
  marginTop: 14,
  minHeight: 52,
  borderRadius: radius.md,
  backgroundColor: "#F8F1EA",
  borderWidth: 1,
  borderColor: colors.border,
  alignItems: "center",
  justifyContent: "center",
},

paymentCloseButtonText: {
  fontSize: 16,
  lineHeight: 23,
  fontFamily: fonts.bold,
  color: colors.warmBrown,
},

avatarPickerCard: {
  backgroundColor: "#FFFFFF",
  borderRadius: 28,
  paddingHorizontal: 18,
  paddingVertical: 18,
  borderWidth: 1,
  borderColor: "#EFE5DE",
},

avatarPickerTitle: {
  fontSize: 17,
  fontWeight: "800",
  color: "#2B2522",
  marginBottom: 14,
},

avatarGrid: {
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 12,
},

avatarOption: {
  width: 64,
  height: 64,
  borderRadius: 32,
  overflow: "hidden",
  borderWidth: 2,
  borderColor: "transparent",
  backgroundColor: "#F5EAE4",
},

avatarOptionSelected: {
  borderColor: "#6B4F46",
},

avatarOptionImage: {
  width: "100%",
  height: "100%",
},

avatarSaveButton: {
  marginTop: 16,
  height: 48,
  borderRadius: 14,
  backgroundColor: "#6B4F46",
  alignItems: "center",
  justifyContent: "center",
},

avatarSaveButtonText: {
  fontSize: 15,
  fontWeight: "800",
  color: "#FFFFFF",
},
heroCard: {
  backgroundColor: colors.card,
  borderRadius: radius.lg,
  paddingHorizontal: 18,
  paddingVertical: 18,
  borderWidth: 1,
  borderColor: colors.border,
  ...shadow.card,
},

heroCardYudanja: {
  backgroundColor: "transparent",
  borderWidth: 0,
  borderColor: "transparent",

  // 카드 안쪽 여백 조절
  paddingHorizontal: 15,
  paddingVertical: 15,

  shadowColor: "#C9962A",
  shadowOpacity: 0.14,
  shadowRadius: 18,
  shadowOffset: { width: 0, height: 8 },
  elevation: 6,
  overflow: "hidden",
},

heroGoldGlow: {
  position: "absolute",
  right: -80,
  top: -85,
  width: 230,
  height: 230,
  borderRadius: 115,
  backgroundColor: "rgba(231, 188, 85, 0.16)",
},
heroProfileRow: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 14,
},

heroTextWrap: {
  flex: 1,
},

heroNameRow: {
  flexDirection: "row",
  alignItems: "center",
  flexWrap: "wrap",
  gap: 8,
},

heroName: {
  fontSize: 26,
  lineHeight: 32,
  fontFamily: fonts.titleSemi,
  color: colors.textMain,
},

heroLevelBadge: {
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 999,
  backgroundColor: colors.blushBeige,
  borderWidth: 1,
  borderColor: colors.roseTaupe,
},

heroLevelBadgeText: {
  fontSize: readability.statusLabel.fontSize,
  lineHeight: readability.statusLabel.lineHeight,
  fontWeight: "900",
  color: colors.warmBrown,
},

heroSubText: {
  marginTop: 8,
  fontSize: readability.metadataStrong.fontSize,
  lineHeight: readability.metadataStrong.lineHeight,
  color: colors.textSubStrong,
},

heroAvatarButton: {
  width: 80,
  height: 80,
  borderRadius: 36,
  backgroundColor: "#F5EAE4",
  borderWidth: 1,
  borderColor: "#EFE5DE",
  alignItems: "center",
  justifyContent: "center",
},

heroAvatarImage: {
  width: 80,
  height: 80,
  borderRadius: 33,
},

cameraBadge: {
  position: "absolute",
  right: -2,
  bottom: 0,
  width: 26,
  height: 26,
  borderRadius: 13,
  backgroundColor: "#FFFFFF",
  borderWidth: 2,
  borderColor: "#FFFEFC",
  alignItems: "center",
  justifyContent: "center",

  // ✅ 추가
  zIndex: 20,
  elevation: 20,

  overflow: "hidden",
},
cameraIcon: {
  width: 26,
  height: 26,
},
cameraBadgeText: {
  fontSize: 12,
  fontWeight: "900",
  color: "#FFFFFF",
},
heroAvatarButtonYudanja: {
  width: 112,
  height: 112,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "transparent",
  borderWidth: 0,
},

heroYudanjaFrame: {
  position: "absolute",
  width: 100,
  height: 100,
  zIndex: 2,
  marginBottom: -5,
},

heroAvatarImageYudanja: {
  width: 76,
  height: 76,
  borderRadius: 38,
  borderWidth: 1,
  borderColor: "rgba(220, 177, 79, 0.55)",
},
cameraBadgeYudanja: {
  right: 8,
  bottom: 9,
  backgroundColor: "#231E1B",
  borderColor: "#E0BC65",
  borderWidth: 1,

  // ✅ 추가
  zIndex: 30,
  elevation: 30,
},
heroDivider: {
  height: 1,
  backgroundColor: "rgba(224, 188, 101, 0.28)",
  marginVertical: 10,
},

heroPaymentRow: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
},

heroSmallLabel: {
  fontSize: readability.metadata.fontSize,
  lineHeight: readability.metadata.lineHeight,
  fontWeight: "800",
  color: colors.textMeta,
  marginBottom: 6,
},

heroPaymentBadge: {
  alignSelf: "flex-start",
  paddingHorizontal: 10,
  paddingVertical: 5,
  borderRadius: 999,
  backgroundColor: "#F5EAE4",
},

heroPaymentBadgeText: {
  fontSize: readability.metadata.fontSize,
  lineHeight: readability.metadata.lineHeight,
  fontWeight: "900",
  color: "#6B4F46",
},

heroPayButton: {
  minHeight: 44,
  paddingHorizontal: 16,
  paddingVertical: 9,
  borderRadius: 999,
  backgroundColor: "#2B2522",
},

heroPayButtonText: {
  fontSize: readability.metadata.fontSize,
  lineHeight: readability.metadata.lineHeight,
  fontWeight: "900",
  color: "#FFFFFF",
},

yudanjaCard: {
  flex: 1,
  borderRadius: 26,
  paddingLeft: 22,
  paddingRight: 18,
  paddingVertical: 12,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  overflow: "hidden",
  position: "relative",
},

yudanjaCardBgImage: {
  width: "110%",
  height: "110%",
  borderRadius: 26,
},

yudanjaOverlay: {
  ...StyleSheet.absoluteFillObject,
  backgroundColor: "rgba(60, 0, 10, 0.08)",
},

yudanjaBackImage: {
  width: "100%",
  height: "100%",
  borderRadius: 26,
},
yudanjaTextWrap: {
  flex: 1,
  paddingLeft: 2,
},

yudanjaYear: {
  fontSize: 12,
  fontWeight: "700",
  color: "#F8E8C8",
  opacity: 0.9,
},

yudanjaTitle: {
  marginTop: 2,
  fontSize: 22,
  fontWeight: "900",
  color: "#FFFFFF",
},

yudanjaMemberNo: {
  marginTop: 3,
  fontSize: 13,
  fontWeight: "700",
  color: "#E6C27A",
  letterSpacing: 0.5,
},

yudanjaMark: {
  width: 64,
  height: 64,
  alignItems: "center",
  justifyContent: "center",
},
yudanjaIconImage: {
  width: 70,
  height: 70,
  marginRight: 17,
},
yudanjaMarkText: {
  fontSize: 28,
  fontWeight: "900",
  color: "#C89E6A",
},

menuSection: {
  backgroundColor: "#FFFEFC",
  borderRadius: 26,
  borderWidth: 1,
  borderColor: "#EFE5DE",
  overflow: "hidden",
},

menuRow: {
  minHeight: readability.comfortableRow.minHeight,
  paddingHorizontal: 18,
  paddingVertical: readability.comfortableRow.paddingVertical,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
},

menuRowPressed: {
  backgroundColor: "#FFF9F6",
},

menuRowDisabled: {
  opacity: 0.55,
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

menuDescription: {
  marginTop: 3,
  fontSize: readability.listDescription.fontSize,
  lineHeight: readability.listDescription.lineHeight,
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

menuDivider: {
  height: 1,
  backgroundColor: "#EFE5DE",
  marginLeft: 18,
},
avatarModalCard: {
  width: "100%",
  backgroundColor: "#FFFDF9",
  borderRadius: 26,
  padding: 20,
  borderWidth: 1,
  borderColor: "#ECE7DE",
},
heroYudanjaBadge: {
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 999,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#2B2521",
  borderWidth: 1,
  borderColor: "#D9AF55",
},
heroYudanjaBadgeText: {
  fontSize: 11,
  color: "#F7D782",
  fontWeight: "800",
},

heroMetaText: {
  marginTop: 4,
  fontSize: readability.metadataStrong.fontSize,
  lineHeight: readability.metadataStrong.lineHeight,
  color: colors.textSubStrong,
},

heroPaymentInfo: {
  flex: 1,
},

heroPaymentDueText: {
  marginTop: 8,
  fontSize: readability.metadataStrong.fontSize,
  lineHeight: readability.metadataStrong.lineHeight,
  color: colors.textSubStrong,
},
noAvatarCircle: {
  width: 66,
  height: 66,
  borderRadius: 33,
  backgroundColor: "#F3ECE2",
  borderWidth: 1,
  borderColor: "#E2D7C6",
  alignItems: "center",
  justifyContent: "center",
},

noAvatarText: {
  fontSize: 24,
  fontWeight: "900",
  color: "#6B4F46",
},

profilePreviewBox: {
  marginTop: 18,
  alignItems: "center",
  justifyContent: "center",
},

profilePreviewImage: {
  width: 96,
  height: 96,
  borderRadius: 48,
  backgroundColor: "#F5EAE4",
  borderWidth: 1,
  borderColor: "#EFE5DE",
},

profilePreviewEmpty: {
  width: 96,
  height: 96,
  borderRadius: 48,
  backgroundColor: "#F3ECE2",
  borderWidth: 1,
  borderColor: "#E2D7C6",
  alignItems: "center",
  justifyContent: "center",
},

profilePreviewEmptyText: {
  fontSize: 34,
  fontWeight: "900",
  color: "#6B4F46",
},

avatarActionList: {
  marginTop: 18,
  gap: 10,
},

avatarActionButton: {
  borderRadius: 18,
  borderWidth: 1,
  borderColor: "#ECE7DE",
  backgroundColor: "#FFFEFC",
  paddingHorizontal: 16,
  paddingVertical: 14,
},

avatarActionTitle: {
  fontSize: 15,
  fontWeight: "900",
  color: "#2B2522",
},

avatarActionDesc: {
  marginTop: 4,
  fontSize: 12,
  lineHeight: 17,
  color: "#7D746D",
},

avatarActionDanger: {
  backgroundColor: "#FBF3F1",
  borderColor: "#E8D2CC",
},

avatarActionDangerTitle: {
  fontSize: 15,
  fontWeight: "900",
  color: "#7B1E2B",
},

avatarCloseButton: {
  marginTop: 18,
  minHeight: 50,
  borderRadius: 16,
  backgroundColor: "#2B2522",
  alignItems: "center",
  justifyContent: "center",
},

avatarCloseButtonText: {
  fontSize: 15,
  fontWeight: "900",
  color: "#FFFFFF",
},
defaultAvatarSection: {
  marginTop: 4,
  paddingVertical: 12,
  paddingHorizontal: 12,
  borderRadius: 18,
  backgroundColor: "#F8F3EA",
  borderWidth: 1,
  borderColor: "#E5D8C8",
},

defaultAvatarTitle: {
  marginBottom: 10,
  fontSize: 13,
  fontWeight: "800",
  color: "#5A4636",
},

defaultAvatarGrid: {
  marginTop: 18,
  marginBottom: 18,
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "flex-start",
  gap: 14,
},

defaultAvatarOption: {
  width: 54,
  height: 54,
  borderRadius: 999,
  padding: 3,
  backgroundColor: "#EFE6D8",
  borderWidth: 1,
  borderColor: "#D8C8B6",
  position: "relative",
},

defaultAvatarOptionActive: {
  borderWidth: 2,
  borderColor: "#A97C36",
  backgroundColor: "#FFF7E8",
},

defaultAvatarImage: {
  width: "100%",
  height: "100%",
  borderRadius: 999,
},

defaultAvatarCheck: {
  position: "absolute",
  right: -2,
  bottom: -2,
  width: 18,
  height: 18,
  borderRadius: 999,
  backgroundColor: "#7B1E2B",
  alignItems: "center",
  justifyContent: "center",
  borderWidth: 1,
  borderColor: "#F8F3EA",
},

defaultAvatarCheckText: {
  fontSize: 11,
  fontWeight: "900",
  color: "#F6D58A",
},
avatarMenuOverlay: {
  flex: 1,
  backgroundColor: "rgba(0, 0, 0, 0.28)",
},

avatarSmallMenu: {
  position: "absolute",
  top: 220,
  right: 38,
  width: 190,
  paddingVertical: 14,
  backgroundColor: "#FFFEFC",
  borderRadius: 22,
  borderWidth: 1,
  borderColor: "#E8DED2",
  shadowColor: "#000",
  shadowOpacity: 0.16,
  shadowRadius: 18,
  shadowOffset: { width: 0, height: 8 },
  elevation: 8,
},

avatarSmallMenuItem: {
  paddingHorizontal: 23,
  paddingVertical: 14,
},

avatarSmallMenuText: {
  fontSize: 15,
  fontWeight: "550",
  color: "#241E1A",
},

avatarSmallMenuDanger: {
  color: "#8F1D2C",
},

defaultAvatarModalCard: {
  width: "88%",
  maxWidth: 420,
  borderRadius: 30,
  backgroundColor: "#FFFEFC",
  paddingHorizontal: 22,
  paddingTop: 26,
  paddingBottom: 20,
  borderWidth: 1,
  borderColor: "#E8DED2",
},

defaultAvatarButton: {
  width: "23%",
  aspectRatio: 1,
  borderRadius: 999,
  padding: 3,
  backgroundColor: "#F4EEE5",
  borderWidth: 2,
  borderColor: "#E4D8C8",
},

defaultAvatarButtonSelected: {
  borderColor: "#8B5A2B",
  backgroundColor: "#EFE3D2",
},

defaultAvatarImage: {
  width: "100%",
  height: "100%",
  borderRadius: 999,
},
yudanjaFlipWrap: {
  width: "100%",
  borderRadius: 26,
  overflow: "hidden",
  marginTop: 0,
  marginBottom: 0,
},

yudanjaFlipWrapFront: {
  height: 128,
},

yudanjaFlipWrapBack: {
  aspectRatio: 1.586,
},

yudanjaFlipFace: {
  position: "absolute",
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  backfaceVisibility: "hidden",
},

yudanjaFrontFace: {
  zIndex: 2,
},

yudanjaBackFace: {
  zIndex: 1,
},

yudanjaBackImageRadius: {
  borderRadius: 26,
},
screenYudanja: {
  backgroundColor: colors.background,
},
titleYudanja: {
  color: "#1F1A14",
},

headerEditButtonYudanja: {
  backgroundColor: "#FFF7E4",
  borderColor: "#E5BE62",
},

headerEditButtonTextYudanja: {
  color: "#8A5D16",
},
heroGoldLine: {
  position: "absolute",
  left: -40,
  right: -40,
  bottom: 0,
  height: 2,
  backgroundColor: "rgba(224, 188, 101, 0.55)",
},
menuSectionYudanja: {
  borderColor: "rgba(224, 188, 101, 0.45)",
  backgroundColor: "#FFFDF8",
},
heroCardBgImage: {
  ...StyleSheet.absoluteFillObject,
  left: 0,
  top: 0,
  right: 0,
  bottom: 0,
  width: "100%",
  height: "100%",
  borderRadius: radius.lg,
  opacity: 1,
},

heroCardBgSoftOverlay: {
  ...StyleSheet.absoluteFillObject,
  backgroundColor: "rgba(255, 253, 247, 0.10)",
},
headerIconButton: {
  width: 26,
  height: 26,
  borderRadius: 23,
  alignItems: "center",
  justifyContent: "center",
},

headerIconImage: {
  width: 26,
  height: 26,
  resizeMode: "contain",
},
paymentIconImage: {
  width: 34,
  height: 34,
},

historyTopRow: {
  flexDirection: "row",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 12,
},

historyLabel: {
  fontSize: 13,
  fontWeight: "900",
  color: "#9A6A33",
  marginBottom: 6,
},


historyDdayBadge: {
  minWidth: 58,
  height: 58,
  borderRadius: 29,
  backgroundColor: "#F6EFE5",
  borderWidth: 1,
  borderColor: "#E5D5C2",
  alignItems: "center",
  justifyContent: "center",
},

historyDdayText: {
  fontSize: 14,
  fontWeight: "900",
  color: "#8C6330",
},

historyStatRow: {
  marginTop: 15,
  flexDirection: "row",
  gap: 10,
},

historyStatBox: {
  flex: 1,
  borderRadius: 18,
  backgroundColor: "#F8F3EA",
  borderWidth: 1,
  borderColor: "#ECE1D3",
  paddingVertical: 12,
  alignItems: "center",
},

historyStatValue: {
  fontSize: 18,
  fontWeight: "900",
  color: "#2B2522",
},

historyStatLabel: {
  marginTop: 4,
  fontSize: 12,
  fontWeight: "700",
  color: "#8A8177",
},
paymentMethodTextWrap: {
  paddingLeft: 20,
},
avatarTabRow: {
  flexDirection: "row",
  gap: 8,
  marginTop: 16,
},

avatarTabButton: {
  flex: 1,
  height: 38,
  borderRadius: 999,
  backgroundColor: "#F4EEE5",
  borderWidth: 1,
  borderColor: "#E4D8C8",
  alignItems: "center",
  justifyContent: "center",
},

avatarTabButtonActive: {
  backgroundColor: "#2B2522",
  borderColor: "#2B2522",
},

avatarTabText: {
  fontSize: 14,
  fontFamily: fonts.bold,
  color: "#7D746D",
},

avatarTabTextActive: {
  color: "#FFFFFF",
},
copyCompleteText: {
  marginTop: 8,
  fontSize: 13,
  lineHeight: 18,
  fontFamily: fonts.semiBold,
  color: colors.warmBrown,
  textAlign: "center",
},
appInfoBox: {
  alignItems: "center",
  marginTop: 20,
  marginBottom: 20,
},

appInfoTitle: {
  fontSize: 11,
  color: "#8A7A70",
},

appInfoVersion: {
  marginTop: 7,
  fontSize: 12,
  color: "#B0A39A",
},
});