import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Modal,
  Image,
} from "react-native";
import { router } from "expo-router";
import { colors, radius, shadow } from "../src/theme";
import ScreenHeader from "../src/components/ScreenHeader";
import { useAuth } from "../src/contexts/AuthContext";

const fonts = {
  medium: "PretendardMedium",
  semiBold: "PretendardSemiBold",
  bold: "PretendardBold",
  title: "MaruBuriBold",
  titleSemi: "MaruBuriSemiBold",
};

const HOPE_TIME_OPTIONS = ALL_TRIAL_TIME_OPTIONS;

import { submitTrialApplication } from "../src/api/member";

import {
  ALL_TRIAL_TIME_OPTIONS,
  getTrialTimeOptionsForDate,
  isTrialDateSelectable,
  validateTrialScheduleSelection,
} from "../src/features/trial/trialSchedule";

// TRIAL_APPLICATION_DATE_TIME_POLICY_V1

export default function TrialApplicationScreen() {
  const [gender, setGender] = useState("남성");
  const [hopeDate, setHopeDate] = useState("");
  const [hopeTime, setHopeTime] = useState("");
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [calendarBaseDate, setCalendarBaseDate] = useState(new Date());
  const [shoeSize, setShoeSize] = useState("");
const [height, setHeight] = useState("");
const [memo, setMemo] = useState("");

const [alertModal, setAlertModal] = useState({
  visible: false,
  title: "",
  message: "",
});
  const trialTogetherImage = require("../assets/images/trial-hero-man.png");
  const { isAuthenticated } = useAuth();

  const availableHopeTimeOptions =
    getTrialTimeOptionsForDate(
      hopeDate
    );

  const displayedHopeTimeOptions =
    hopeDate
      ? availableHopeTimeOptions
      : HOPE_TIME_OPTIONS;

  function onlyNumbers(value) {
    return String(value || "").replace(/[^0-9]/g, "");
  }

  function showAppAlert(title, message) {
  setAlertModal({
    visible: true,
    title,
    message,
  });
}

function closeAppAlert() {
  setAlertModal({
    visible: false,
    title: "",
    message: "",
  });
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
  const nextDate =
    formatDateKey(date);

  if (
    !isTrialDateSelectable(
      nextDate
    )
  ) {
    return;
  }

  const nextOptions =
    getTrialTimeOptionsForDate(
      nextDate
    );

  setHopeDate(nextDate);

  setHopeTime((current) => {
    const stillAllowed =
      nextOptions.some(
        (option) =>
          option.value === current
      );

    return stillAllowed
      ? current
      : "";
  });

  setDateModalVisible(false);
}

  async function handleSubmit() {
  if (!isAuthenticated) {
    showAppAlert("안내", "로그인 후 이용할 수 있습니다.");
    router.push("/login");
    return;
  }

  if (!hopeDate.trim()) {
    showAppAlert("안내", "희망 날짜를 선택해주세요.");
    return;
  }

  if (!hopeTime) {
    showAppAlert("안내", "희망 시간을 선택해주세요.");
    return;
  }

  const shoeSizeNumber =
    shoeSize === "" || shoeSize == null ? null : Number(shoeSize);

  if (
    shoeSize !== "" &&
    shoeSize != null &&
    (!Number.isInteger(shoeSizeNumber) ||
      shoeSizeNumber < 150 ||
      shoeSizeNumber > 350)
  ) {
    showAppAlert(
      "신발 사이즈 확인",
      "신발 사이즈는 150mm 이상 350mm 이하의 숫자로 입력해주세요."
    );
    return;
  }

  const heightNumber =
    height === "" || height == null ? null : Number(height);

  if (
    height !== "" &&
    height != null &&
    (!Number.isInteger(heightNumber) ||
      heightNumber < 80 ||
      heightNumber > 300)
  ) {
    showAppAlert(
      "키 확인",
      "키는 80cm 이상 300cm 이하의 숫자로 입력해주세요."
    );
    return;
  }

  try {

  const scheduleValidation =
    validateTrialScheduleSelection({
      hopeDate,
      hopeTime,
    });

  if (!scheduleValidation.ok) {
    showAppAlert(
      "안내",
      scheduleValidation.message
    );
    return;
  }

    await submitTrialApplication({
      gender,
      hopeDate,
      hopeTime,
      shoeSize: shoeSizeNumber,
      height: heightNumber,
      memo,
    });

    router.push({
      pathname: "/trial-application-complete",
      params: {
        gender,
        hopeDate,
        hopeTime,
        shoeSize,
        height,
        memo,
      },
    });
  } catch (error) {
    console.log("체험 신청 에러:", error?.response?.data || error);

    showAppAlert(
      "오류",
      error?.response?.data?.message ||
        error?.message ||
        "체험 신청 등록 중 오류가 발생했습니다."
    );
  }
}

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.headerLayer}>
  <ScreenHeader title="지인 체험 추천" />
</View>

      <View style={styles.hero}>
  <View style={styles.heroTextArea}>
    <Text style={styles.heroTitle}>함께{"\n"}수련해보세요</Text>
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
<Text style={styles.label}>희망 시간 *</Text>

<View style={styles.timeRow}>
  {displayedHopeTimeOptions.map((option) => (
    <Pressable
      key={option.value}
      disabled={!hopeDate}
      style={[
        styles.timeButton,
        !hopeDate && styles.timeButtonDisabled,
        hopeTime === option.value && styles.timeButtonActive,
      ]}
      onPress={() => setHopeTime(option.value)}
    >
      <Text
        style={[
          styles.timeText,
          hopeTime === option.value && styles.timeTextActive,
        ]}
      >
        {option.label}
      </Text>
    </Pressable>
  ))}
</View>
      <Text style={styles.label}>신발 사이즈 (mm)</Text>
      <TextInput
        style={styles.input}
        placeholder=" ~ 350mm 까지"
        placeholderTextColor="#A99F98"
        keyboardType="number-pad"
        value={shoeSize}
        onChangeText={(v) => setShoeSize(onlyNumbers(v))}
      />

      <Text style={styles.label}>키 (cm)</Text>
      <TextInput
        style={styles.input}
        placeholder=" ~ 300cm 까지"
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
          const unavailable =
            Boolean(dateKey) &&
            !isTrialDateSelectable(
              dateKey
            );

          return (
            <Pressable
              key={`${dateKey}-${index}`}
              style={[
                styles.dayCell,
                unavailable && styles.dayCellDisabled,
                selected && styles.dayCellSelected,
              ]}
              disabled={!date || unavailable}
              onPress={() => date && handleSelectHopeDate(date)}
            >
              <Text
                style={[
                  styles.dayText,
                  unavailable && styles.dayTextDisabled,
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
<Modal
  visible={alertModal.visible}
  transparent
  animationType="fade"
  onRequestClose={closeAppAlert}
>
  <View style={styles.modalOverlay}>
    <View style={styles.alertModalCard}>
      <Text style={styles.alertModalTitle}>{alertModal.title}</Text>

      <Text style={styles.alertModalMessage}>{alertModal.message}</Text>

      <Pressable style={styles.alertModalButton} onPress={closeAppAlert}>
        <Text style={styles.alertModalButtonText}>확인</Text>
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
  marginTop: -42,
  marginBottom: 14,
  minHeight: 280,
  paddingLeft: 4,
  paddingTop: 94,
  position: "relative",
  overflow: "visible",
  zIndex: 1,
},

heroTitle: {
  fontSize: 34,
  lineHeight: 44,
  fontFamily: fonts.title,
  color: colors.textMain,
  letterSpacing: -0.6,
},

heroDesc: {
  marginTop: 10,
  fontSize: 16,
  lineHeight: 23,
  fontFamily: fonts.medium,
  color: colors.textSub,
  letterSpacing: -0.5,
},

heroDecorImage: {
  position: "absolute",
  right: -35,
  top: 34,
  width: 220,
  height: 230,
  opacity: 0.9,
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
  fontWeight: "700",
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

dayCellDisabled: {
  opacity: 0.28,
},

dayCellSelected: {
  backgroundColor: "#241E1A",
},

dayText: {
  fontSize: 15,
  fontWeight: "700",
  color: "#3A312B",
},

dayTextDisabled: {
  color: "#C8BFB6",
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
},
timeRow: {
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 8,
},

timeButton: {
  width: "48%",
  minHeight: 50,
  borderRadius: 14,
  borderWidth: 1,
  borderColor: colors.border,
  backgroundColor: "#FFFEFC",
  alignItems: "center",
  justifyContent: "center",
  paddingHorizontal: 8,
},

timeButtonDisabled: {
  opacity: 0.42,
},

timeButtonActive: {
  backgroundColor: "#241E1A",
  borderColor: "#241E1A",
},

timeText: {
  fontSize: 13,
  fontFamily: fonts.semiBold,
  color: colors.textMain,
},

timeTextActive: {
  color: "#E9C98A",
},
alertModalCard: {
  width: "100%",
  maxWidth: 340,
  alignSelf: "center",
  borderRadius: 24,
  backgroundColor: "#FFFEFC",
  borderWidth: 1,
  borderColor: "#E8DED2",
  paddingHorizontal: 22,
  paddingTop: 24,
  paddingBottom: 18,
  shadowColor: "#000",
  shadowOpacity: 0.12,
  shadowRadius: 18,
  shadowOffset: { width: 0, height: 10 },
  elevation: 8,
},

alertModalTitle: {
  fontSize: 18,
  fontFamily: fonts.bold,
  color: colors.textMain,
  textAlign: "center",
  marginBottom: 12,
},

alertModalMessage: {
  fontSize: 14,
  lineHeight: 22,
  fontFamily: fonts.medium,
  color: colors.textSub,
  textAlign: "center",
  marginBottom: 22,
},

alertModalButton: {
  minHeight: 48,
  borderRadius: 15,
  backgroundColor: colors.warmBrown,
  alignItems: "center",
  justifyContent: "center",
},

alertModalButtonText: {
  fontSize: 15,
  fontFamily: fonts.bold,
  color: colors.white,
},
headerLayer: {
  position: "relative",
  zIndex: 50,
  elevation: 50,
},
});