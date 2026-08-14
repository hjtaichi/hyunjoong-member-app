import React, { useEffect, useMemo, useState } from "react";
import {
  ImageBackground,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

const WUSHU_IMAGE = require(
  "../../../assets/images/certificates/korea-wushu-certificate.png"
);

const TAICHI_IMAGE = require(
  "../../../assets/images/certificates/korea-taichi-certificate.png"
);

const WUSHU_RATIO = 1275 / 865;
const TAICHI_RATIO = 1275 / 865;

function getDateParts(value) {
  if (!value) {
    return { year: "", month: "", day: "" };
  }

  const raw = String(value);

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const [year, month, day] = raw.split("-");

    return {
      year,
      month: String(Number(month)),
      day: String(Number(day)),
    };
  }

  const date = new Date(raw);

  if (Number.isNaN(date.getTime())) {
    return { year: "", month: "", day: "" };
  }

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts.map((part) => [
      part.type,
      part.value,
    ])
  );

  return {
    year: values.year || "",
    month: values.month || "",
    day: values.day || "",
  };
}

function formatDate(value) {
  const { year, month, day } = getDateParts(value);

  if (!year || !month || !day) {
    return "-";
  }

  return `${year}.${String(month).padStart(2, "0")}.${String(day).padStart(2, "0")}`;
}

function hasAnyCertificateData({
  certificateNo,
  issuedAt,
  instructorName,
}) {
  return Boolean(certificateNo || issuedAt || instructorName);
}

function FieldText({
  children,
  style,
  fontSize,
  bold = false,
  align = "left",
}) {
  if (!children) {
    return null;
  }

  return (
    <Text
      numberOfLines={1}
      adjustsFontSizeToFit
      minimumFontScale={0.6}
      style={[
        styles.overlayText,
        {
          fontSize,
          lineHeight: fontSize * 1.12,
          textAlign: align,
        },
        bold && styles.overlayTextBold,
        style,
      ]}
    >
      {children}
    </Text>
  );
}

function CertificateEmpty() {
  return (
    <View style={styles.emptyBox}>
      <Text style={styles.emptyTitle}>
        단증 정보가 아직 등록되지 않았습니다.
      </Text>
      <Text style={styles.emptyDescription}>
        관리자가 단증번호·발급일·지도자를 등록하면 여기에 표시됩니다.
      </Text>
    </View>
  );
}

function CertificateFooter({
  certificateNo,
  issuedAt,
  instructorName,
}) {
  return (
    <View style={styles.footerInfo}>
      <View style={styles.footerRow}>
        <Text style={styles.footerLabel}>단증번호</Text>
        <Text style={styles.footerValue}>{certificateNo || "-"}</Text>
      </View>

      <View style={styles.footerRow}>
        <Text style={styles.footerLabel}>발급일</Text>
        <Text style={styles.footerValue}>{formatDate(issuedAt)}</Text>
      </View>

      <View style={styles.footerRow}>
        <Text style={styles.footerLabel}>지도자</Text>
        <Text style={styles.footerValue}>{instructorName || "-"}</Text>
      </View>
    </View>
  );
}

function WushuCertificate({
  width,
  member,
  promotion,
}) {
  const certificateNo =
    promotion?.koreaWushuAssociationCertificateNo;

  const issuedAt =
    promotion?.koreaWushuAssociationIssuedAt;

  const instructorName =
    promotion?.koreaWushuAssociationInstructorName;

  const available = hasAnyCertificateData({
    certificateNo,
    issuedAt,
    instructorName,
  });

  if (!available) {
    return <CertificateEmpty />;
  }

  const height = width / WUSHU_RATIO;
  const scale = width / 1275;

  const birth = formatDate(member?.birthDate);
  const issue = getDateParts(issuedAt);

  return (
    <>
      <ImageBackground
        source={WUSHU_IMAGE}
        resizeMode="contain"
        style={{ width, height }}
      >
        <FieldText
          fontSize={Math.max(8, 45 * scale)}
          style={styles.wushuNumber}
        >
          {certificateNo || ""}
        </FieldText>

        <FieldText
          fontSize={Math.max(9, 50 * scale)}
          bold
          align="center"
          style={styles.wushuNameKo}
        >
          {member?.name || ""}
        </FieldText>

        <FieldText
          fontSize={Math.max(8, 50 * scale)}
          bold
          align="center"
          style={styles.wushuNameEn}
        >
          {promotion?.koreaWushuAssociationEnglishName || ""}
        </FieldText>

        <FieldText
          fontSize={Math.max(8, 45 * scale)}
          style={styles.wushuBirth}
        >
          {birth === "-" ? "" : birth}
        </FieldText>

        <FieldText
          fontSize={Math.max(8, 50 * scale)}
          style={styles.wushuInstructor}
        >
          {instructorName || ""}
        </FieldText>

        <FieldText
          fontSize={Math.max(9, 50 * scale)}
          align="center"
          style={styles.wushuRank}
        >
          {promotion?.danRank ? String(promotion.danRank) : ""}
        </FieldText>

        <FieldText
          fontSize={Math.max(9, 40 * scale)}
          bold
          align="center"
          style={styles.wushuIssueYear}
        >
          {issue.year}
        </FieldText>

        <FieldText
          fontSize={Math.max(9, 40 * scale)}
          bold
          align="center"
          style={styles.wushuIssueMonth}
        >
          {issue.month}
        </FieldText>

        <FieldText
          fontSize={Math.max(9, 40 * scale)}
          bold
          align="center"
          style={styles.wushuIssueDay}
        >
          {issue.day}
        </FieldText>
      </ImageBackground>

      <CertificateFooter
        certificateNo={certificateNo}
        issuedAt={issuedAt}
        instructorName={instructorName}
      />
    </>
  );
}

function TaichiCertificate({
  width,
  member,
  promotion,
}) {
  const certificateNo =
    promotion?.koreaTaichiFederationCertificateNo;

  const issuedAt =
    promotion?.koreaTaichiFederationIssuedAt;

  const instructorName =
    promotion?.koreaTaichiFederationInstructorName;

  const available = hasAnyCertificateData({
    certificateNo,
    issuedAt,
    instructorName,
  });

  if (!available) {
    return <CertificateEmpty />;
  }

  const height = width / TAICHI_RATIO;
  const scale = width / 1275;

  const birth = formatDate(member?.birthDate);
  const issue = getDateParts(issuedAt);

  return (
    <>
      <ImageBackground
        source={TAICHI_IMAGE}
        resizeMode="contain"
        style={{ width, height }}
      >
        <FieldText
          fontSize={Math.max(8, 48 * scale)}
          style={styles.taichiNumber}
        >
          {certificateNo || ""}
        </FieldText>

        <FieldText
          fontSize={Math.max(10, 48 * scale)}
          bold
          style={styles.taichiName}
        >
          {member?.name || ""}
        </FieldText>

        <FieldText
          fontSize={Math.max(8, 48 * scale)}
          style={styles.taichiBirth}
        >
          {birth === "-" ? "" : birth}
        </FieldText>

        <FieldText
          fontSize={Math.max(9, 52 * scale)}
          bold
          align="center"
          style={styles.taichiRank}
        >
          {promotion?.danRank ? String(promotion.danRank) : ""}
        </FieldText>

        <FieldText
          fontSize={Math.max(9, 40 * scale)}
          bold
          align="center"
          style={styles.taichiIssueYear}
        >
          {issue.year}
        </FieldText>

        <FieldText
          fontSize={Math.max(9, 40 * scale)}
          bold
          align="center"
          style={styles.taichiIssueMonth}
        >
          {issue.month}
        </FieldText>

        <FieldText
          fontSize={Math.max(9, 40 * scale)}
          bold
          align="center"
          style={styles.taichiIssueDay}
        >
          {issue.day}
        </FieldText>
      </ImageBackground>

      <CertificateFooter
        certificateNo={certificateNo}
        issuedAt={issuedAt}
        instructorName={instructorName}
      />
    </>
  );
}

export default function DanCertificateModal({
  visible,
  promotion,
  member,
  onClose,
}) {
  const [tab, setTab] = useState("wushu");
  const { width: screenWidth } = useWindowDimensions();

  useEffect(() => {
    if (visible) {
      setTab("wushu");
    }
  }, [visible, promotion?.id]);

  const modalWidth = useMemo(
    () => Math.min(Math.max(screenWidth - 24, 280), 860),
    [screenWidth]
  );

  const certificateWidth = Math.max(248, modalWidth - 32);

  const danTitle = promotion?.danRank
    ? `${promotion.danRank}단 단증`
    : "단증";

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable
          style={StyleSheet.absoluteFillObject}
          onPress={onClose}
        />

        <View
          style={[
            styles.modalCard,
            { width: modalWidth },
          ]}
        >
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>{danTitle}</Text>
              <Text style={styles.subtitle}>
                {promotion?.promotedAt
                  ? `${formatDate(promotion.promotedAt)} 승단`
                  : ""}
              </Text>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="단증 닫기"
              hitSlop={12}
              onPress={onClose}
              style={styles.closeButton}
            >
              <Text style={styles.closeText}>×</Text>
            </Pressable>
          </View>

          <View style={styles.tabs}>
            <Pressable
              onPress={() => setTab("wushu")}
              style={[
                styles.tab,
                tab === "wushu" && styles.tabActive,
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  tab === "wushu" && styles.tabTextActive,
                ]}
              >
                대한우슈협회
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setTab("taichi")}
              style={[
                styles.tab,
                tab === "taichi" && styles.tabActive,
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  tab === "taichi" && styles.tabTextActive,
                ]}
              >
                대한태극권연맹
              </Text>
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {tab === "wushu" ? (
              <WushuCertificate
                width={certificateWidth}
                member={member}
                promotion={promotion}
              />
            ) : (
              <TaichiCertificate
                width={certificateWidth}
                member={member}
                promotion={promotion}
              />
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    backgroundColor: "rgba(15, 18, 24, 0.72)",
  },

  modalCard: {
    maxHeight: "94%",
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: "#f8f6f1",
  },

  header: {
    minHeight: 72,
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  title: {
    fontFamily: "MaruBuriSemiBold",
    fontSize: 20,
    color: "#211d19",
  },

  subtitle: {
    marginTop: 4,
    fontFamily: "PretendardMedium",
    fontSize: 12,
    color: "#776d64",
  },

  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ebe6dd",
  },

  closeText: {
    marginTop: -2,
    fontSize: 28,
    lineHeight: 30,
    color: "#4c443d",
  },

  tabs: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 4,
    borderRadius: 13,
    flexDirection: "row",
    backgroundColor: "#e9e4dc",
  },

  tab: {
    flex: 1,
    minHeight: 38,
    paddingHorizontal: 6,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  tabActive: {
    backgroundColor: "#ffffff",
  },

  tabText: {
    fontFamily: "PretendardSemiBold",
    fontSize: 12,
    color: "#756b63",
  },

  tabTextActive: {
    color: "#201c18",
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    alignItems: "center",
  },

  overlayText: {
    position: "absolute",
    color: "#111111",
    fontFamily: "PretendardMedium",
  },

  overlayTextBold: {
    fontFamily: "PretendardBold",
  },

  wushuNumber: {
    left: "12%",
    top: "8%",
    maxWidth: "18%",
  },

  wushuNameKo: {
    left: "7.5%",
    top: "16.5%",
    width: "18%",
  },

  wushuNameEn: {
    left: "36.5%",
    top: "16.5%",
    width: "43%",
  },

  wushuBirth: {
    left: "42.6%",
    top: "24.6%",
    maxWidth: "34%",
  },

  wushuInstructor: {
    left: "24.2%",
    top: "46.8%",
    maxWidth: "27%",
  },

  wushuRank: {
    left: "33.8%",
    top: "59.2%",
    width: "3.2%",
  },

  wushuIssueYear: {
    left: "65.9%",
    top: "87.7%",
    width: "9.8%",
  },

  wushuIssueMonth: {
    left: "78.2%",
    top: "87.7%",
    width: "5.8%",
  },

  wushuIssueDay: {
    left: "86.8%",
    top: "87.7%",
    width: "5.4%",
  },

  taichiNumber: {
    left: "40.3%",
    top: "31.2%",
    maxWidth: "22%",
  },

  taichiName: {
    left: "40.3%",
    top: "38.1%",
    maxWidth: "20%",
  },

  taichiBirth: {
    left: "40.3%",
    top: "44.6%",
    maxWidth: "22%",
  },

  taichiRank: {
    left: "65.9%",
    top: "53.7%",
    width: "6.5%",
  },

  taichiIssueYear: {
    left: "35.7%",
    top: "72.8%",
    width: "8%",
  },

  taichiIssueMonth: {
    left: "47.5%",
    top: "72.8%",
    width: "6%",
  },

  taichiIssueDay: {
    left: "56.2%",
    top: "72.8%",
    width: "6%",
  },

  footerInfo: {
    alignSelf: "stretch",
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#d8d1c8",
    borderRadius: 12,
    backgroundColor: "#ffffff",
  },

  footerRow: {
    minHeight: 27,
    flexDirection: "row",
    alignItems: "center",
  },

  footerLabel: {
    width: 74,
    fontFamily: "PretendardSemiBold",
    fontSize: 12,
    color: "#766d66",
  },

  footerValue: {
    flex: 1,
    fontFamily: "PretendardMedium",
    fontSize: 13,
    color: "#25211e",
  },

  emptyBox: {
    alignSelf: "stretch",
    minHeight: 180,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: "#eeeae4",
  },

  emptyTitle: {
    fontFamily: "PretendardSemiBold",
    fontSize: 15,
    textAlign: "center",
    color: "#3c3631",
  },

  emptyDescription: {
    marginTop: 8,
    fontFamily: "PretendardMedium",
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    color: "#7b7169",
  },
});
