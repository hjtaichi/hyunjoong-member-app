import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { colors, radius, shadow } from "../src/theme";
import ScreenHeader from "../src/components/ScreenHeader";
const fonts = {
  medium: "PretendardMedium",
  semiBold: "PretendardSemiBold",
  bold: "PretendardBold",
  title: "MaruBuriBold",
  titleSemi: "MaruBuriSemiBold",
};
import { submitPrivateTrainingRequest } from "../src/api/privateTraining";
import { Calendar, LocaleConfig } from "react-native-calendars";

LocaleConfig.locales.ko = {
  monthNames: [
    "1월", "2월", "3월", "4월", "5월", "6월",
    "7월", "8월", "9월", "10월", "11월", "12월",
  ],
  monthNamesShort: [
    "1월", "2월", "3월", "4월", "5월", "6월",
    "7월", "8월", "9월", "10월", "11월", "12월",
  ],
  dayNames: ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"],
  dayNamesShort: ["일", "월", "화", "수", "목", "금", "토"],
  today: "오늘",
};

LocaleConfig.defaultLocale = "ko";

export default function PrivateTrainingGuideScreen() {

  const [consultModalVisible, setConsultModalVisible] = React.useState(false);
  const [calendarVisible, setCalendarVisible] = React.useState(false);
  const [consultDateValue, setConsultDateValue] = React.useState("");

  const [consultContent, setConsultContent] = React.useState("");
  const [consultDate, setConsultDate] = React.useState("");
  const [consultTime, setConsultTime] = React.useState("");

const handleSubmit = async () => {
  console.log("🔥 개인지도 상담 신청 버튼 눌림", {
    consultContent,
    consultDateValue,
    consultTime,
  });

  if (!consultContent.trim()) {
    Alert.alert("안내", "필요한 개인지도 내용을 적어주세요.");
    return;
  }

  if (!consultDateValue || !consultTime.trim()) {
    Alert.alert("안내", "상담 희망 날짜와 시간을 선택해주세요.");
    return;
  }

  try {
    console.log("🔥 개인지도 API 요청 시작");

    const result = await submitPrivateTrainingRequest({
      requestContent: consultContent,
      preferredDate: consultDateValue,
      preferredTime: consultTime,
    });

    console.log("✅ 개인지도 API 요청 성공", result);

    setConsultModalVisible(false);

router.push({
  pathname: "/private-training-request-complete",
  params: {
    requestContent: consultContent,
    preferredDate: consultDateValue,
    preferredTime: consultTime,
  },
});
  } catch (error) {
    console.log("❌ 개인지도 상담 신청 에러:", error?.response?.data || error);

    Alert.alert(
      "오류",
      error?.response?.data?.message ||
        error?.message ||
        "상담 신청 중 오류가 발생했습니다."
    );
  }
};

  return (
    <View style={styles.container}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <ScreenHeader title="개인 수련 지도 안내" />
        <View style={styles.heroSection}>
  <Image
    source={require("../assets/images/private-training-hero-new.png")}
    style={styles.heroFullImage}
    resizeMode="cover"
  />

  <View style={styles.heroTextLayer}>
    <Text style={styles.kicker}>정규 수업 외 유료 과정</Text>

    <Text style={styles.heroDesc}>
      정규 수업에서{"\n"}
      더 깊이 배우고 싶은 부분을{"\n"}
      나에게 맞는 속도로{"\n"}
      1:1 지도받는 시간입니다.
    </Text>
  </View>
</View>

        <View style={styles.mainCard}>
          <Text style={styles.sectionTitle}>이런 방향으로 진행할 수 있어요</Text>

          <View style={styles.directionGrid}>
            {[
              {
                icon: require("../assets/images/private-check.png"),
                title: "투로 교정",
                desc: "학습한 투로의\n심화 점검",
              },
              {
                icon: require("../assets/images/private-deep.png"),
                title: "기본공법",
                desc: "기본공법의\n심화 교정",
              },
              {
                icon: require("../assets/images/private-path.png"),
                title: "투로 완성",
                desc: "검·도·편간·권법 등\n별도 지도",
              },
              {
                icon: require("../assets/images/private-chat.png"),
                title: "맞춤 상담",
                desc: "현재 상태에 맞춘\n수련 방향 상담",
              },
            ].map((item) => (
              <View key={item.title} style={styles.directionItem}>
  <Image source={item.icon} style={styles.directionIcon} resizeMode="contain" />
  <Text style={styles.directionTitle}>{item.title}</Text>
  <Text style={styles.directionDesc}>{item.desc}</Text>
</View>
            ))}
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>이런 분께 좋아요</Text>

          <View style={styles.personGrid}>
            {[
              "자세와 중심을\n정확히 잡고 \n싶은 분",
              "배운 투로를\n더 깊이 다듬고 싶은 분",
              "정규 수업 외\n별도 진도가 \n필요한 분",
              "현재 내 수련을\n점검받고 \n싶은 분",
            ].map((text) => (
              <View key={text} style={styles.personItem}>
                <View style={styles.personIconCircle}>
  <Image
    source={require("../assets/images/private-person.png")}
    style={styles.personIconImage}
    resizeMode="contain"
  />
</View>
                <Text style={styles.personText}>{text}</Text>
              </View>
            ))}
          </View>

          <View style={styles.lotusNotice}>
            <Image
  source={require("../assets/images/private-lotus.png")}
  style={styles.lotusIconImage}
  resizeMode="contain"
/>
            <Text style={styles.lotusText}>
              수련기간이나 유단자 여부와 관계없이, {"\n"}현중태극권 회원이라면 신청할 수 있습니다.
            </Text>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoLeft}>
              <View style={styles.infoCircle}>
                <Text style={styles.infoIcon}>i</Text>
              </View>
              <Text style={styles.infoTitle}>안내사항</Text>
            </View>

            <View style={styles.infoDivider} />

            <View style={styles.infoTextWrap}>
              <Text style={styles.infoText}>
                개인지도란? {"\n"}회원이 희망하는 수련내용을 관장이 1:1로 지도하는 수업
              </Text>
              <Text style={styles.infoText}>
                • 개인지도 신청 : 1회 1시간 기준 최소 4회 이상  (일정은 별도 협의)
              </Text>
              <Text style={styles.infoText}>• 희망 수업 예시</Text>
              <Text style={styles.infoSubText}>- 학습한 투로의 심화 교정</Text>
              <Text style={styles.infoSubText}>- 기본공법 심화 교정 학습</Text>
              <Text style={styles.infoSubText}>
                - 투로진도 완성 (편간, 검술, {"\n"}  도술, 권법, 세수경 등 기타)
              </Text>
              <Text style={styles.infoSubText}>
                → 개인지도의 투로는 유단자 유무/{"\n"}    순서와 상관없이 학습 가능
              </Text>
              <Text style={styles.infoSubText}>- 기타</Text>
              <Text style={styles.infoText}>
                • 신청 자격 : 수련기간, 유단자 유무 상관 없이 회원 누구나
              </Text>
              <Text style={styles.infoText}>• 비용</Text>
              <Text style={styles.infoSubText}>- 정 회원 : 1시간 8만원</Text>
              <Text style={styles.infoSubText}>- 비 회원 : 1시간 10만원</Text>
            </View>
          </View>

          <View style={styles.bottomNotice}>
            <View style={styles.bottomIconCircle}>
              <Text style={styles.bottomIcon}>☆</Text>
            </View>
            <Text style={styles.bottomNoticeText}>
              개인지도 과정에서는 편간, 검술, 도술, 권법, 세수경 등 희망하는 투로를
              유단자 여부나 기존 수련 순서와 관계없이 상담 후 학습할 수 있습니다.
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.ctaButton}
          activeOpacity={0.9}
          onPress={() => setConsultModalVisible(true)}
        >
          <Text style={styles.ctaText}>개인 지도 상담 신청하기</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={consultModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.consultModalCard}>
            <Text style={styles.modalTitle}>개인 지도 상담 신청</Text>
            <Text style={styles.modalDesc}>
              어떤 부분이 궁금한지와 상담 희망 시간을 남겨주세요.
            </Text>

            <Text style={styles.inputLabel}>필요한 개인지도 내용</Text>
            <TextInput
              value={consultContent}
              onChangeText={setConsultContent}
              style={styles.textArea}
              placeholder="예: 자세 점검, 대가 1로 정리, 승단 준비, 검/선 수련 상담 등"
              placeholderTextColor="#a99585"
              multiline
              textAlignVertical="top"
            />

            <Text style={styles.inputLabel}>상담 희망 날짜</Text>
            <TouchableOpacity
              style={styles.input}
              activeOpacity={0.85}
              onPress={() => setCalendarVisible(true)}
            >
              <Text style={consultDate ? styles.dateValueText : styles.datePlaceholderText}>
                {consultDate || "날짜를 선택해주세요"}
              </Text>
            </TouchableOpacity>

            <Text style={styles.inputLabel}>상담 희망 시간</Text>
            <TextInput
              value={consultTime}
              onChangeText={setConsultTime}
              style={styles.input}
              placeholder="예: 오후 3시"
              placeholderTextColor="#a99585"
            />

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setConsultModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>취소</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalSubmitButton} onPress={handleSubmit}>
                <Text style={styles.modalSubmitText}>신청하기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={calendarVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.calendarCard}>
            <Text style={styles.calendarModalTitle}>상담 날짜 선택</Text>

            <Calendar
              onDayPress={(day) => {
                const [year, month, date] = day.dateString.split("-");
                setConsultDate(`${Number(year)}년 ${Number(month)}월 ${Number(date)}일`);
                setConsultDateValue(day.dateString);
                setCalendarVisible(false);
              }}
              minDate={new Date().toISOString().slice(0, 10)}
              enableSwipeMonths
              theme={{
                backgroundColor: "#fffdf9",
                calendarBackground: "#fffdf9",
                textSectionTitleColor: "#9b8b7c",
                selectedDayBackgroundColor: "#9b7650",
                selectedDayTextColor: "#fffdf9",
                todayTextColor: "#9b7650",
                dayTextColor: "#3a2c27",
                textDisabledColor: "#d2c4b7",
                arrowColor: "#6b4f46",
                monthTextColor: "#2f2a24",
                textMonthFontWeight: "800",
                textDayFontWeight: "600",
                textDayHeaderFontWeight: "800",
              }}
            />

            <TouchableOpacity
              style={styles.calendarCloseButton}
              onPress={() => setCalendarVisible(false)}
            >
              <Text style={styles.calendarCloseText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
},

heroSection: {
  position: "relative",
  minHeight: 300,
  marginHorizontal: -16,
  marginTop: -8,
  marginBottom: -30,
  overflow: "hidden",
},

heroFullImage: {
  position: "absolute",
  right: 3,
  top: 25,
  width: 200,
  height: 210,
  zIndex: 2,
},

heroTextLayer: {
  position: "absolute",
  left: 28,
  top: 30,
  width: "50%",
  zIndex: 3,
},

  heroBackButton: {
  width: 42,
  height: 42,
  justifyContent: "center",
  marginBottom: 3,
  zIndex: 3,
},

  heroBackText: {
    fontSize: 34,
    color: "#2f2a24",
    fontWeight: "500",
  },

heroTitle: {
  display: "none",
},

kicker: {
  alignSelf: "flex-start",
  paddingHorizontal: 14,
  paddingVertical: 5,
  borderRadius: 999,
  borderWidth: 1,
  borderColor: "#C8A977",
  backgroundColor: "rgba(255,253,249,0.78)",
  color: "#8A633A",
  fontSize: 12,
  lineHeight: 18,
  fontFamily: fonts.semiBold,
  marginBottom: 12
},

heroDesc: {
  fontSize: 16,
  lineHeight: 25,
  fontFamily: fonts.titleSemi,
  color: "#2B211B",
  letterSpacing: -0.4,
},
  mainCard: {
  marginTop: -18,
  borderRadius: radius.lg,
  padding: 16,
  backgroundColor: colors.card,
  borderWidth: 1,
  borderColor: colors.border,
  ...shadow.card,
},

  sectionTitle: {
  fontSize: 20,
  lineHeight: 28,
  fontFamily: fonts.titleSemi,
  color: colors.textMain,
  marginBottom: 14,
},

  directionGrid: {
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "space-between",
  rowGap: 10,
},

directionItem: {
  width: "47%",
  minHeight: 116,
  borderRadius: 16,
  paddingVertical: 14,
  paddingHorizontal: 8,
  alignItems: "center",
  backgroundColor: colors.card,
  borderWidth: 1,
  borderColor: colors.border,
},

directionIcon: {
  width: 42,
  height: 42,
  marginBottom: 6,
  opacity: 0.85,
},

directionTextWrap: {
  flex: 1,
},

directionTitle: {
  fontSize: 16,
  fontWeight: "800",
  color: "#2f241e",
  textAlign: "center",
  marginBottom: 6,
},

directionDesc: {
  fontSize: 13,
  lineHeight: 18,
  color: "#4f4035",
  textAlign: "center",
  fontWeight: "600",
},
  divider: {
    height: 1,
    backgroundColor: "#e2cda9",
    marginVertical: 17,
  },

  personGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 16,
  },

  personItem: {
    flex: 1,
    alignItems: "center",
  },

  personIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "#e2cda9",
    backgroundColor: "rgba(255,248,239,0.9)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },

  personIcon: {
    fontSize: 25,
    color: "#5f3f22",
  },

  personText: {
fontSize: 13,
  lineHeight: 19,
  fontFamily: fonts.medium,
  color: "#2f2a24",
  textAlign: "center",
  fontWeight: "600",
  letterSpacing: -0.4,
},

  lotusNotice: {
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2cda9",
    backgroundColor: "#f8efe2",
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  lotusIconImage: {
  width: 28,
  height: 28,
  marginRight: 8,
  opacity: 0.9,
},

  lotusText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
    color: "#4f4035",
    fontWeight: "600",
  },

  infoCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e2cda9",
    backgroundColor: "rgba(255,248,239,0.75)",
    padding: 14,
    flexDirection: "row",
    marginBottom: 16,
  },

  infoLeft: {
    width: 74,
    alignItems: "center",
    justifyContent: "center",
    paddingRight: 10,
  },

  infoCircle: {
    width: 40,
    height: 40,
    borderRadius: 23,
    borderWidth: 1.5,
    borderColor: "#6b4f46",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },

  infoIcon: {
    fontSize: 20,
    fontWeight: "900",
    color: "#6b4f46",
  },

  infoTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#2f2a24",
  },

  infoDivider: {
    width: 1,
    backgroundColor: "#e2cda9",
    marginRight: 12,
  },

  infoTextWrap: {
    flex: 1,
  },
infoText: {
  fontSize: 15,
  lineHeight: 22,
  fontFamily: fonts.medium,
},

  infoSubText: {
    fontSize: 13,
    lineHeight: 22,
    color: "#2f2a24",
    fontWeight: "500",
    marginLeft: 8,
    letterSpacing:-0.2,
  },

  bottomNotice: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e2cda9",
    backgroundColor: "#f8efe2",
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  bottomIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#d2b37d",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  bottomIcon: {
    fontSize: 26,
    color: "#9b6f36",
  },

  bottomNoticeText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 23,
    color: "#3f332c",
    fontWeight: "500",
  },

  ctaButton: {
    height: 54,
    borderRadius: 18,
    backgroundColor: "#9b6f36",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
  },

  ctaText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fffdf9",
    letterSpacing: 1,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(38, 30, 24, 0.35)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  consultModalCard: {
    width: "100%",
    borderRadius: 24,
    padding: 20,
    backgroundColor: "#fffdf9",
    borderWidth: 1,
    borderColor: "#eadfce",
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#2f2a24",
    marginBottom: 6,
  },

  modalDesc: {
    fontSize: 14,
    lineHeight: 21,
    color: "#8a7a72",
    marginBottom: 18,
  },

  inputLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: "#3a2c27",
    marginBottom: 8,
  },

  input: {
    justifyContent: "center",
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#eadfce",
    backgroundColor: "#fbf6ed",
    paddingHorizontal: 14,
    fontSize: 15,
    color: "#3a2c27",
    marginBottom: 14,
  },

  textArea: {
    minHeight: 110,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#eadfce",
    backgroundColor: "#fbf6ed",
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    lineHeight: 22,
    color: "#3a2c27",
    marginBottom: 14,
  },

  modalButtonRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },

  modalCancelButton: {
    flex: 1,
    height: 50,
    borderRadius: 16,
    backgroundColor: "#efe5de",
    alignItems: "center",
    justifyContent: "center",
  },

  modalSubmitButton: {
    flex: 1,
    height: 50,
    borderRadius: 16,
    backgroundColor: "#9b7650",
    alignItems: "center",
    justifyContent: "center",
  },

  modalCancelText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#6b4f46",
  },

  modalSubmitText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#fffdf9",
  },

  dateValueText: {
    fontSize: 15,
    color: "#3a2c27",
    fontWeight: "700",
    lineHeight: 20,
  },

  datePlaceholderText: {
    fontSize: 15,
    color: "#a99585",
  },

  calendarCard: {
    width: "100%",
    borderRadius: 24,
    padding: 20,
    backgroundColor: "#fffdf9",
    borderWidth: 1,
    borderColor: "#eadfce",
  },

  calendarModalTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#2f2a24",
    marginBottom: 12,
  },

  calendarCloseButton: {
    height: 48,
    borderRadius: 16,
    backgroundColor: "#efe5de",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
  },

  calendarCloseText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#6b4f46",
  },
  backIconImage: {
  width: 26,
  height: 26,
},
personIconImage: {
  width: 24,
  height: 24,
  opacity: 0.9,
},


});