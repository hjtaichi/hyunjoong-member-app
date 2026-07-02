import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import ScreenHeader from "../src/components/ScreenHeader";
import {
  getNotificationSettings,
  updateNotificationSettings,
} from "../src/api/notificationSettings";
import { colors, radius, shadow } from "../src/theme";

const fonts = {
  medium: "PretendardMedium",
  semiBold: "PretendardSemiBold",
  bold: "PretendardBold",
  titleSemi: "MaruBuriSemiBold",
};

const DEFAULT_SETTINGS = {
  noticeAlertEnabled: true,
  attendanceAlertEnabled: true,
  paymentAlertEnabled: true,
  inquiryAlertEnabled: true,
  shopAlertEnabled: true,
};

export default function NotificationSettingsScreen() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState(null);

const allEnabled = useMemo(() => {
  return (
    settings.noticeAlertEnabled &&
    settings.attendanceAlertEnabled &&
    settings.paymentAlertEnabled &&
    settings.inquiryAlertEnabled &&
    settings.shopAlertEnabled
  );
}, [settings]);

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getNotificationSettings();
      setSettings({
        ...DEFAULT_SETTINGS,
        ...result,
      });
    } catch (error) {
      Alert.alert("오류", error.message || "알림 설정을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  async function toggleOne(key, value) {
  const prev = settings;

  const next = {
    ...settings,
    [key]: value,
  };

  try {
    setSavingKey(key);
    setSettings(next);

    await updateNotificationSettings({
      [key]: value,
    });

    setSettings(next);
  } catch (error) {
    setSettings(prev);
    Alert.alert("오류", error.message || "알림 설정 저장에 실패했습니다.");
  } finally {
    setSavingKey(null);
  }
}

  async function toggleAll(value) {
  const prev = settings;

  const next = {
    ...settings,
    noticeAlertEnabled: value,
    attendanceAlertEnabled: value,
    paymentAlertEnabled: value,
    inquiryAlertEnabled: value,
    shopAlertEnabled: value,
  };

  try {
    setSavingKey("all");
    setSettings(next);

    await updateNotificationSettings(next);

    // 서버 응답으로 다시 덮지 말고, 방금 누른 값 그대로 유지
    setSettings(next);
  } catch (error) {
    setSettings(prev);
    Alert.alert("오류", error.message || "알림 설정 저장에 실패했습니다.");
  } finally {
    setSavingKey(null);
  }
}

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={styles.loadingText}>알림 설정을 불러오는 중입니다.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <ScreenHeader title="알림 설정" />

      <Text style={styles.title}>알림 설정</Text>
      <Text style={styles.subtitle}>
        받고 싶은 알림만 켜두고, 필요 없는 알림은 끌 수 있어요.
      </Text>

      <View style={styles.card}>
    <SettingRow
  title="전체 알림"
  description="모든 알림을 한 번에 켜거나 끕니다."
  value={allEnabled}
  disabled={false}
  onValueChange={toggleAll}
  strong
/>
      </View>

      <View style={styles.card}>
        <SettingRow
          title="공지 알림"
          description="도장 공지와 팝업 안내"
          value={settings.noticeAlertEnabled}
          disabled={savingKey === "noticeAlertEnabled"}
          onValueChange={(value) => toggleOne("noticeAlertEnabled", value)}
        />

        <Divider />

        <SettingRow
          title="출석 알림"
          description="출석, 예약, 수업 관련 안내"
          value={settings.attendanceAlertEnabled}
          disabled={savingKey === "attendanceAlertEnabled"}
          onValueChange={(value) => toggleOne("attendanceAlertEnabled", value)}
        />

        <Divider />

        <SettingRow
          title="회비 알림"
          description="회비 결제일과 미납 안내"
          value={settings.paymentAlertEnabled}
          disabled={savingKey === "paymentAlertEnabled"}
          onValueChange={(value) => toggleOne("paymentAlertEnabled", value)}
        />

        <Divider />

        <SettingRow
          title="문의 답변 알림"
          description="문의 답변과 대화방 알림"
          value={settings.inquiryAlertEnabled}
          disabled={savingKey === "inquiryAlertEnabled"}
          onValueChange={(value) => toggleOne("inquiryAlertEnabled", value)}
        />

        <Divider />

        <SettingRow
          title="Shop 주문 알림"
          description="상품 주문 요청과 상태 안내"
          value={settings.shopAlertEnabled}
          disabled={savingKey === "shopAlertEnabled"}
          onValueChange={(value) => toggleOne("shopAlertEnabled", value)}
        />

      </View>

      <Text style={styles.notice}>
        ※ 필수 운영 안내는 알림 설정과 관계없이 앱 내 알림센터에 표시될 수 있습니다.
      </Text>
    </ScrollView>
  );
}

function SettingRow({
  title,
  description,
  value,
  onValueChange,
  disabled,
  strong = false,
}) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingTextWrap}>
        <Text style={[styles.settingTitle, strong && styles.settingTitleStrong]}>
          {title}
        </Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>

<Switch
  value={!!value}
  onValueChange={onValueChange}
  disabled={false}
        trackColor={{
          false: "#DED2C8",
          true: "#D9B67A",
        }}
        thumbColor={value ? "#8A5A2B" : "#FFFFFF"}
      />
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background || "#FFFCFA",
  },
  content: {
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
    paddingHorizontal: 18,
    paddingTop: 24,
    paddingBottom: 110,
  },
  center: {
    flex: 1,
    backgroundColor: colors.background || "#FFFCFA",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: colors.textSub,
    fontFamily: fonts.medium,
  },
  title: {
    marginTop: 18,
    fontSize: 25,
    lineHeight: 34,
    color: colors.textMain,
    fontFamily: fonts.titleSemi,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 22,
    color: colors.textSub,
    fontFamily: fonts.medium,
  },
  card: {
    marginTop: 18,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    ...shadow.card,
  },
  settingRow: {
    minHeight: 76,
    paddingHorizontal: 17,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
  },
  settingTextWrap: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    lineHeight: 23,
    color: colors.textMain,
    fontFamily: fonts.semiBold,
  },
  settingTitleStrong: {
    fontFamily: fonts.bold,
  },
  settingDescription: {
    marginTop: 3,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSub,
    fontFamily: fonts.medium,
  },
  divider: {
    height: 1,
    backgroundColor: "#EFE4DA",
    marginLeft: 17,
  },
  notice: {
    marginTop: 14,
    fontSize: 12,
    lineHeight: 18,
    color: "#8A7A70",
    fontFamily: fonts.medium,
  },
});