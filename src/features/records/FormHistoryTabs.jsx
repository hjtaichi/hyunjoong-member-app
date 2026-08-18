import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { colors } from "../../theme";

const TABS = [
  {
    key: "date",
    label: "날짜별",
    path: "/form-activity-by-date",
  },
  {
    key: "form",
    label: "투로별",
    path: "/form-activity-by-form",
  },
  {
    key: "completed",
    label: "완료기록",
    path: "/form-record-history",
  },
];

export default function FormHistoryTabs({
  activeTab,
}) {
  return (
    <View style={styles.wrap}>
      {TABS.map((tab) => {
        const active =
          activeTab === tab.key;

        return (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              active && styles.tabActive,
            ]}
            activeOpacity={0.82}
            onPress={() => {
              if (!active) {
                router.replace(tab.path);
              }
            }}
          >
            <Text
              style={[
                styles.tabText,
                active && styles.tabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
    minHeight: 42,
    marginBottom: 14,
    padding: 3,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    flexDirection: "row",
    alignItems: "center",
  },
  tab: {
    flex: 1,
    minHeight: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  tabActive: {
    backgroundColor: colors.warmBrown,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textSub,
  },
  tabTextActive: {
    color: "#FFFFFF",
  },
});