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
import { colors } from "../src/theme/colors";
import { API_BASE_URL } from "../src/config/env";
import { useAuth } from "../src/contexts/AuthContext";
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
const { token } = useAuth();
const [consultModalVisible, setConsultModalVisible] = React.useState(false);
const [calendarVisible, setCalendarVisible] = React.useState(false);
const [consultDateValue, setConsultDateValue] = React.useState("");

const [consultContent, setConsultContent] = React.useState("");
const [consultDate, setConsultDate] = React.useState("");
const [consultTime, setConsultTime] = React.useState("");
  return (
  <View style={styles.container}>
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
  <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
    <Text style={styles.backText}>←</Text>
  </TouchableOpacity>

  <Text style={styles.headerTitle}>개별 수련 지도 안내</Text>
</View>


      <View style={styles.heroSection}>
  <Image
    source={require("../assets/images/private-guide-mountain-bg.png")}
    style={styles.mountainBg}
    resizeMode="cover"
  />

  <Text style={styles.kicker}>정규 수업 외 유료 과정</Text>

  <Text style={styles.desc}>
    점검부터 심화 수련까지,{'\n'}
    내게 맞게 배우고 싶을 때
  </Text>

  <Image
    source={require("../assets/images/private-training-hero.png")}
    style={styles.heroImage}
    resizeMode="contain"
  />
</View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>이런 방향으로 진행할 수 있어요</Text>

        <View style={styles.grid}>
  {[
    {
      icon: require("../assets/images/private-check.png"),
      title: "수련 점검",
      desc: "자세와 흐름 확인",
    },
    {
      icon: require("../assets/images/private-deep.png"),
      title: "심화 수련",
      desc: "더 깊이 배우기",
    },
    {
      icon: require("../assets/images/private-path.png"),
      title: "별도 과정",
      desc: "다른 투로 배우기",
    },
    {
      icon: require("../assets/images/private-chat.png"),
      title: "수련 상담",
      desc: "목표와 방향 상담",
    },
  ].map((item) => (
    <View key={item.title} style={styles.gridItem}>
      <Image
        source={item.icon}
        style={styles.gridIcon}
        resizeMode="contain"
      />

      <View>
        <Text style={styles.gridTitle}>{item.title}</Text>
        <Text style={styles.gridDesc}>{item.desc}</Text>
      </View>
    </View>
  ))}
</View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>이런 분께 좋아요</Text>
        <Text style={styles.listText}>• 자세와 중심이 궁금한 분</Text>
        <Text style={styles.listText}>• 조금 더 깊이 배우고 싶은 분</Text>
        <Text style={styles.listText}>• 다른 투로나 무기를 배우고 싶은 분</Text>
        <Text style={styles.listText}>• 승단 준비를 앞둔 분</Text>
      </View>

      <View style={styles.noticeBox}>
        <Text style={styles.noticeText}>
          개별 수련 지도는 정규 수업과 별도로 진행되는 유료 과정입니다.
          진행 내용, 시간, 비용은 상담 후 안내됩니다.
        </Text>
      </View>

      <TouchableOpacity
  style={styles.ctaButton}
  activeOpacity={0.9}
  onPress={() => setConsultModalVisible(true)}
>
  <Text style={styles.ctaText}>상담 신청하기</Text>
</TouchableOpacity>
    </ScrollView>

     <Modal visible={consultModalVisible} transparent animationType="fade">
  <View style={styles.modalOverlay}>
    <View style={styles.consultModalCard}>
      <Text style={styles.modalTitle}>개별 지도 상담 신청</Text>
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

        <TouchableOpacity
          style={styles.modalSubmitButton}
          onPress={async () => {
  if (!consultContent.trim()) {
    window.alert("필요한 개인지도 내용을 적어주세요.");
    return;
  }

  if (!consultDateValue || !consultTime.trim()) {
    window.alert("상담 희망 날짜와 시간을 선택해주세요.");
    return;
  }

  const ok = window.confirm("개별 지도 상담 신청을 보내시겠습니까?");
  if (!ok) return;

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/member/me/private-training-requests`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
  requestContent: consultContent,
  preferredDate: consultDateValue,
  preferredTime: consultTime,
}),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "신청 등록 실패");
    }

    window.alert("상담 신청이 접수되었습니다.");
    setConsultModalVisible(false);
    setConsultContent("");
    setConsultDate("");
    setConsultDateValue("");
    setConsultTime("");
  } catch (error) {
    window.alert(error.message || "상담 신청 중 오류가 발생했습니다.");
  }
}}
        >
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
          setConsultDate(
  `${Number(year)}년 ${Number(month)}월 ${Number(date)}일`
);
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
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingTop: 56, paddingBottom: 40 },
  backButton: { marginBottom: 20 },
  backText: { fontSize: 28, color: colors.textMain },
  kicker: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#d8c5a8",
    color: "#7c5c36",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 14,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.textMain,
    marginBottom: 10,
  },
  desc: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textSub,
    marginBottom: 18,
  },
  heroSection: {
  position: "relative",
  minHeight: 250,
  marginHorizontal: -20,
  paddingHorizontal: 20,
  paddingTop: 2,
  marginBottom: -75,
  overflow: "hidden",
},

mountainBg: {
  position: "absolute",
  left: 0,
  right: 0,
  top: 30,
  width: "100%",
  height: 170,
  opacity: 0.4,
},

heroImage: {
  position: "absolute",
  right: 25,
  bottom: 92,
  width: 190,
  height: 160,
  opacity: 0.7,
},
  card: {
    backgroundColor: "#fffdf9",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#eadfce",
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.textMain,
    marginBottom: 14,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  gridItem: {
    width: "47%",
    borderRadius: 16,
    padding: 14,
    backgroundColor: "#fbf6ed",
    borderWidth: 1,
    borderColor: "#eadfce",
  },
  gridTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.textMain,
    marginBottom: 6,
  },
  gridDesc: {
    fontSize: 12,
    lineHeight: 17,
    color: colors.textSub,
  },
  listText: {
    fontSize: 15,
    lineHeight: 26,
    color: colors.textMain,
  },
  noticeBox: {
    borderRadius: 18,
    padding: 16,
    backgroundColor: "#f8efe2",
    borderWidth: 1,
    borderColor: "#dfc8a6",
    marginBottom: 18,
  },
  noticeText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#5f4a36",
    fontWeight: "600",
  },
  ctaButton: {
    height: 56,
    borderRadius: 18,
    backgroundColor: "#9b7650",
    alignItems: "center",
    justifyContent: "center",
  },
  ctaText: {
    fontSize: 17,
    fontWeight: "800",
    color: "#fffdf9",
  },
  headerRow: {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 26,
},

backButton: {
  width: 34,
  height: 34,
  alignItems: "flex-start",
  justifyContent: "center",
  marginRight: 6,
},

backText: {
  fontSize: 24,
  color: "#2f2a24",
  fontWeight: "600",
},

headerTitle: {
  fontSize: 17,
  fontWeight: "800",
  color: "#2f2a24",
},

kicker: {
  alignSelf: "flex-start",
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 999,
  borderWidth: 1,
  borderColor: "#d8c5a8",
  color: "#7c5c36",
  fontSize: 13,
  fontWeight: "700",
  marginBottom: 14,
},

desc: {
  fontSize: 17,
  lineHeight: 26,
  color: "#6b4f46",
  marginBottom: 14,
  fontWeight: "500",
},

grid: {
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 10,
},

gridItem: {
  width: "48%",
  minHeight: 82,
  borderRadius: 16,
  paddingHorizontal: 12,
  paddingVertical: 12,
  backgroundColor: "#fbf6ed",
  borderWidth: 1,
  borderColor: "#eadfce",
  flexDirection: "row",
  alignItems: "center",
  gap: 10,
},

gridIcon: {
  width: 38,
  height: 38,
  opacity: 0.88,
},

gridTitle: {
  fontSize: 15,
  fontWeight: "800",
  color: "#2f2a24",
  marginBottom: 4,
},

gridDesc: {
  fontSize: 12,
  lineHeight: 17,
  color: "#8a7a72",
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

});