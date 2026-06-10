import React, { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Modal,
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
import { submitTrialApplication } from "../src/api/member";
import { Image } from "react-native";

export default function TrialApplicationScreen() {
  const [gender, setGender] = useState("남성");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [hopeDate, setHopeDate] = useState("");
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [calendarBaseDate, setCalendarBaseDate] = useState(new Date());
  const [shoeSize, setShoeSize] = useState("");
  const [height, setHeight] = useState("");
  const [memo, setMemo] = useState("");
  const trialTogetherImage = require("../assets/images/trial-together.png");

  function onlyNumbers(value) {
    return String(value || "").replace(/[^0-9]/g, "");
  }

  function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getMonthDays(baseDate) {
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const firstWeekday = firstDay.getDay();

  const days = [];

  for (let i = 0; i < firstWeekday; i += 1) {
    days.push(null);
  }

  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    days.push(new Date(year, month, day));
  }

  return days;
}

function moveCalendarMonth(diff) {
  setCalendarBaseDate((prev) => {
    return new Date(prev.getFullYear(), prev.getMonth() + diff, 1);
  });
}

function handleSelectHopeDate(date) {
  setHopeDate(formatDateKey(date));
  setDateModalVisible(false);
}

  async function handleSubmit() {
  try {
    if (!name.trim()) {
      Alert.alert("안내", "이름을 입력해주세요.");
      return;
    }

    if (!/^010\d{8}$/.test(onlyNumbers(phone))) {
      Alert.alert(
        "안내",
        "연락처는 010으로 시작하는 숫자 11자리로 입력해주세요."
      );
      return;
    }

    if (!hopeDate.trim()) {
      Alert.alert("안내", "희망 날짜를 입력해주세요.");
      return;
    }

    await submitTrialApplication({
      name,
      gender,
      phone: onlyNumbers(phone),
      hopeDate,
      shoeSize,
      height,
      memo,
    });

    router.push({
      pathname: "/trial-application-complete",
      params: {
        name,
        gender,
        phone,
        hopeDate,
        shoeSize,
        height,
        memo,
      },
    });
  } catch (error) {
  console.log("체험 신청 에러:", error?.response?.data || error);

  Alert.alert(
    "오류",
    error?.response?.data?.message ||
      error?.message ||
      "체험 신청 등록 중 오류가 발생했습니다."
  );
}
}

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <ScreenHeader title="지인 체험 신청" />

      <View style={styles.hero}>
  <View style={styles.heroTextArea}>
    <Text style={styles.heroTitle}>함께 수련해보세요</Text>
    <Text style={styles.heroDesc}>
      소중한 분의 건강한 변화를{"\n"}
      현중태극권이 함께하겠습니다.
    </Text>
  </View>

  <Image
    source={trialTogetherImage}
    style={styles.heroDecorImage}
    resizeMode="contain"
  />
</View>

      <Text style={styles.sectionTitle}>체험 신청자 정보</Text>

      <Text style={styles.label}>성별 *</Text>
      <View style={styles.genderRow}>
        {["남성", "여성"].map((item) => (
          <Pressable
            key={item}
            style={[
              styles.genderButton,
              gender === item && styles.genderButtonActive,
            ]}
            onPress={() => setGender(item)}
          >
            <Text
              style={[
                styles.genderText,
                gender === item && styles.genderTextActive,
              ]}
            >
              {item}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>이름 *</Text>
      <TextInput
        style={styles.input}
        placeholder="체험 신청자 이름을 입력해주세요."
        placeholderTextColor="#A99F98"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>연락처 *</Text>
      <TextInput
        style={styles.input}
        placeholder="010-1234-5678 형식으로 입력해주세요."
        placeholderTextColor="#A99F98"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />

      <Text style={styles.label}>희망 날짜 *</Text>

<Pressable
  style={styles.dateInputButton}
  onPress={() => setDateModalVisible(true)}
>
  <Text
    style={[
      styles.dateInputText,
      !hopeDate && styles.dateInputPlaceholder,
    ]}
  >
    {hopeDate || "날짜를 선택해주세요."}
  </Text>
</Pressable>

      <Text style={styles.label}>신발 사이즈 (mm)</Text>
      <TextInput
        style={styles.input}
        placeholder="예) 265"
        placeholderTextColor="#A99F98"
        keyboardType="number-pad"
        value={shoeSize}
        onChangeText={(v) => setShoeSize(onlyNumbers(v))}
      />

      <Text style={styles.label}>키 (cm)</Text>
      <TextInput
        style={styles.input}
        placeholder="예) 175"
        placeholderTextColor="#A99F98"
        keyboardType="number-pad"
        value={height}
        onChangeText={(v) => setHeight(onlyNumbers(v))}
      />

      <Text style={styles.label}>간단한 메모</Text>
      <TextInput
        style={[styles.input, styles.memoInput]}
        placeholder="특이사항이나 참고할 내용을 입력해주세요."
        placeholderTextColor="#A99F98"
        multiline
        maxLength={200}
        value={memo}
        onChangeText={setMemo}
      />

      <View style={styles.noticeBox}>
        <Text style={styles.noticeText}>
          체험용 도복과 수련 준비를 위해 미리 정보를 받고 있습니다.
        </Text>
      </View>

      <Pressable style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>신청하기</Text>
      </Pressable>
      <Modal
  visible={dateModalVisible}
  transparent
  animationType="fade"
  onRequestClose={() => setDateModalVisible(false)}
>
  <View style={styles.modalOverlay}>
    <View style={styles.calendarModalCard}>
      <View style={styles.calendarHeader}>
        <Pressable onPress={() => moveCalendarMonth(-1)}>
          <Text style={styles.calendarNavText}>‹</Text>
        </Pressable>

        <Text style={styles.calendarTitle}>
          {calendarBaseDate.getFullYear()}년 {calendarBaseDate.getMonth() + 1}월
        </Text>

        <Pressable onPress={() => moveCalendarMonth(1)}>
          <Text style={styles.calendarNavText}>›</Text>
        </Pressable>
      </View>

      <View style={styles.weekRow}>
        {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
          <Text key={day} style={styles.weekText}>
            {day}
          </Text>
        ))}
      </View>

      <View style={styles.calendarGrid}>
        {getMonthDays(calendarBaseDate).map((date, index) => {
          const dateKey = date ? formatDateKey(date) : "";
          const selected = dateKey && hopeDate === dateKey;

          return (
            <Pressable
              key={`${dateKey}-${index}`}
              style={[
                styles.dayCell,
                selected && styles.dayCellSelected,
              ]}
              disabled={!date}
              onPress={() => date && handleSelectHopeDate(date)}
            >
              <Text
                style={[
                  styles.dayText,
                  selected && styles.dayTextSelected,
                ]}
              >
                {date ? date.getDate() : ""}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        style={styles.calendarCloseButton}
        onPress={() => setDateModalVisible(false)}
      >
        <Text style={styles.calendarCloseButtonText}>닫기</Text>
      </Pressable>
    </View>
  </View>
</Modal>
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
  paddingBottom: 120,
  width: "100%",
  maxWidth: 430,
  alignSelf: "center",
},
  header: {
    height: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backText: {
    fontSize: 34,
    color: "#241E1A",
    fontWeight: "300",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#241E1A",
  },
  hero: {
  marginTop: 18,
  marginBottom: 26,
  minHeight: 148,
  paddingLeft: 4,
  paddingRight: 128,
  paddingTop: 26,
  paddingBottom: 16,
  overflow: "visible",
  position: "relative",
  backgroundColor: "transparent",
  borderWidth: 0,
},

heroTitle: {
  fontSize: 28,
  fontFamily: fonts.title,
  color: colors.textMain,
},

heroDesc: {
  marginTop: 14,
  fontSize: 14,
  lineHeight: 23,
  fontFamily: fonts.medium,
  color: colors.textSub,
},

heroDecorImage: {
  position: "absolute",
  right: -22,
  top: 8,
  width: 180,
  height: 150,
  opacity: 0.72,
},
label: {
  marginTop: 14,
  marginBottom: 7,
  fontSize: 13,
  fontFamily: fonts.semiBold,
  color: colors.textMain,
},
  genderRow: {
    flexDirection: "row",
    gap: 10,
  },
  genderButton: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E3D8CC",
    backgroundColor: "#FFFEFC",
    alignItems: "center",
    justifyContent: "center",
  },
  genderButtonActive: {
    backgroundColor: "#E8DED0",
    borderColor: "#D7C7B6",
  },
  genderText: {
  fontSize: 14,
  fontFamily: fonts.semiBold,
  color: colors.textMain,
},

genderTextActive: {
  color: colors.textMain,
},
  input: {
    minHeight: 54,
    borderRadius: radius.lg,
    borderColor: colors.border,
    borderWidth: 1,
    backgroundColor: "#FFFEFC",
    paddingHorizontal: 15,
    paddingVertical: 13,
    fontSize: 15,
    color: "#241E1A",
  },
  memoInput: {
    minHeight: 110,
    textAlignVertical: "top",
  },
  noticeBox: {
    marginTop: 18,
    borderRadius: 18,
    backgroundColor: "#F4E6D0",
    borderWidth: 1,
    borderColor: "#E8D6BD",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  noticeText: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "700",
    color: "#8C6330",
  },
  submitButton: {
  marginTop: 24,
  minHeight: 54,
  borderRadius: 16,
  backgroundColor: colors.warmBrown,
  alignItems: "center",
  justifyContent: "center",
},

submitButtonText: {
  fontSize: 16,
  fontFamily: fonts.bold,
  color: colors.white,
},
  dateInputButton: {
  minHeight: 54,
  borderRadius: radius.lg,
  borderWidth: 1,
  borderColor: colors.border,
  backgroundColor: colors.card,
  paddingHorizontal: 15,
  justifyContent: "center",
},

dateInputText: {
  fontSize: 15,
  color: "#241E1A",
},

dateInputPlaceholder: {
  color: "#A99F98",
},

modalOverlay: {
  flex: 1,
  backgroundColor: "rgba(43, 37, 34, 0.38)",
  justifyContent: "center",
  paddingHorizontal: 22,
},

calendarModalCard: {
  borderRadius: 28,
  backgroundColor: "#FFFEFC",
  borderWidth: 1,
  borderColor: "#E8DED2",
  padding: 18,
},

calendarHeader: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 16,
},

calendarTitle: {
  fontSize: 19,
  fontWeight: "900",
  color: "#241E1A",
},

calendarNavText: {
  fontSize: 34,
  fontWeight: "300",
  color: "#8C6330",
  paddingHorizontal: 8,
},

weekRow: {
  flexDirection: "row",
  marginBottom: 8,
},

weekText: {
  flex: 1,
  textAlign: "center",
  fontSize: 12,
  fontWeight: "900",
  color: "#9A8F81",
},

calendarGrid: {
  flexDirection: "row",
  flexWrap: "wrap",
},

dayCell: {
  width: `${100 / 7}%`,
  aspectRatio: 1,
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 999,
},

dayCellSelected: {
  backgroundColor: "#241E1A",
},

dayText: {
  fontSize: 15,
  fontWeight: "800",
  color: "#3A312B",
},

dayTextSelected: {
  color: "#E9C98A",
},

calendarCloseButton: {
  marginTop: 18,
  minHeight: 50,
  borderRadius: 16,
  backgroundColor: "#F4E6D0",
  alignItems: "center",
  justifyContent: "center",
},

calendarCloseButtonText: {
  fontSize: 15,
  fontWeight: "900",
  color: "#8C6330",
},
sectionTitle: {
  fontSize: 22,
  fontFamily: fonts.titleSemi,
  color: colors.textMain,
  marginBottom: 12,
}
});