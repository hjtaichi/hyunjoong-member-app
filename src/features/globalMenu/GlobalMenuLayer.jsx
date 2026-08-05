import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, usePathname } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "../../contexts/AuthContext";
import { getMemberHome } from "../../api/memberHome";
import { getMyPrivateLessons } from "../../api/privateLessons";
import { getProfileImageSource } from "../home/homeImages";
import {
  GLOBAL_MENU_DRAWER_RATIO,
  filterGlobalMenuSections,
} from "./globalMenuConfig";

const TAB_ROUTE_PATTERNS = [
  /^\/(?:\(tabs\)\/)?home(?:\/|$)/,
  /^\/(?:\(tabs\)\/)?taegukwon(?:\/|$)/,
  /^\/(?:\(tabs\)\/)?schedule(?:\/|$)/,
  /^\/(?:\(tabs\)\/)?inquiry(?:\/|$)/,
  /^\/(?:\(tabs\)\/)?mypage(?:\/|$)/,
];

function isTabRoute(pathname) {
  const value = String(pathname || "");
  return TAB_ROUTE_PATTERNS.some((pattern) => pattern.test(value));
}

function getPrivateLessonAccess(data) {
  return (
    data?.isActive === true ||
    data?.hasHistory === true ||
    Boolean(data?.currentPackage)
  );
}

export default function GlobalMenuLayer() {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { token, user, isAuthenticated, isBootLoading, logout } = useAuth();

  const [visible, setVisible] = useState(false);
  const [activeSectionKey, setActiveSectionKey] = useState(null);
  const [permissionLoading, setPermissionLoading] = useState(false);
  const [menuProfile, setMenuProfile] = useState(null);
  const [canAccessYudanja, setCanAccessYudanja] = useState(false);
  const [hasPrivateLessonAccess, setHasPrivateLessonAccess] = useState(false);

  const drawerWidth = Math.round(width * GLOBAL_MENU_DRAWER_RATIO);
  const slideX = useRef(new Animated.Value(-drawerWidth)).current;
  const permissionRequestIdRef = useRef(0);

  const memberStatus = user?.memberStatus || user?.status;
  const isPausedMember = memberStatus === "paused";
  const shouldShowButton =
    !isBootLoading && isAuthenticated && isTabRoute(pathname);

  const sections = useMemo(
    () =>
      filterGlobalMenuSections({
        canAccessYudanja,
        hasPrivateLessonAccess,
        isPausedMember,
      }),
    [canAccessYudanja, hasPrivateLessonAccess, isPausedMember]
  );

  const activeSection = useMemo(
    () => sections.find((section) => section.key === activeSectionKey) || null,
    [sections, activeSectionKey]
  );

  useEffect(() => {
    slideX.setValue(-drawerWidth);
  }, [drawerWidth, slideX]);

  useEffect(() => {
    if (!shouldShowButton && visible) {
      setVisible(false);
      setActiveSectionKey(null);
    }
  }, [shouldShowButton, visible]);

  const loadMenuAccess = useCallback(async () => {
    if (!token || isPausedMember) return;

    const requestId = permissionRequestIdRef.current + 1;
    permissionRequestIdRef.current = requestId;
    setPermissionLoading(true);

    try {
      const [homeResult, privateLessonResult] = await Promise.all([
        getMemberHome(token).catch(() => null),
        getMyPrivateLessons(token).catch(() => null),
      ]);

      if (permissionRequestIdRef.current !== requestId) return;

      const homeMember = homeResult?.member || {};
      setMenuProfile({
  name:
    homeMember?.name ||
    user?.name ||
    "회원",

  rankLevel: Number(
    homeMember?.rankLevel ??
      user?.rankLevel ??
      0
  ),

  profileAvatar:
    homeMember?.profileAvatar ??
    user?.profileAvatar ??
    null,

  profileImageUpdatedAt:
    homeMember?.profileImageUpdatedAt ||
    homeMember?.updatedAt ||
    user?.profileImageUpdatedAt ||
    user?.updatedAt ||
    "",
});
      setCanAccessYudanja(
        homeMember?.canAccessYudanjaClass === true ||
          user?.canAccessYudanjaClass === true
      );
      setHasPrivateLessonAccess(getPrivateLessonAccess(privateLessonResult));
    } finally {
      if (permissionRequestIdRef.current === requestId) {
        setPermissionLoading(false);
      }
    }
  }, [token, user, isPausedMember]);

  const openMenu = useCallback(() => {
    setActiveSectionKey(null);
    setVisible(true);
    slideX.setValue(-drawerWidth);
    requestAnimationFrame(() => {
      Animated.timing(slideX, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }).start();
    });
    void loadMenuAccess();
  }, [drawerWidth, loadMenuAccess, slideX]);

  const closeMenu = useCallback(
    (afterClose) => {
      Animated.timing(slideX, {
        toValue: -drawerWidth,
        duration: 180,
        useNativeDriver: true,
      }).start(() => {
        setVisible(false);
        setActiveSectionKey(null);
        if (typeof afterClose === "function") {
          requestAnimationFrame(afterClose);
        }
      });
    },
    [drawerWidth, slideX]
  );

  const handleItemPress = useCallback(
    (item) => {
      if (item.locked) {
        if (item.permission === "yudanja") {
          Alert.alert(
            "이용 안내",
            "유단자 전용 콘텐츠입니다.\n유단자 회원만 이용할 수 있습니다."
          );
          return;
        }

        Alert.alert(
          "이용 안내",
          "개인지도 이용 회원 전용입니다.\n개인지도 등록 후 이용할 수 있습니다."
        );
        return;
      }

      closeMenu(() => {
        if (item.params) {
          router.push({ pathname: item.pathname, params: item.params });
          return;
        }

        router.push(item.pathname);
      });
    },
    [closeMenu]
  );

  const handleLogout = useCallback(() => {
    Alert.alert("로그아웃", "로그아웃하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "로그아웃",
        style: "destructive",
        onPress: () => {
          closeMenu(async () => {
            await logout();
            router.replace("/login");
          });
        },
      },
    ]);
  }, [closeMenu, logout]);

  if (!shouldShowButton) return null;

const displayName =
  menuProfile?.name ||
  user?.name ||
  "회원";

const rankLevel = Number(
  menuProfile?.rankLevel ??
    user?.rankLevel ??
    0
);

const rankLabel =
  rankLevel > 0
    ? `${rankLevel}단`
    : "일반회원";

const profileImageSource =
  getProfileImageSource(
    menuProfile?.profileAvatar ??
      user?.profileAvatar,
    menuProfile?.profileImageUpdatedAt ||
      user?.profileImageUpdatedAt ||
      user?.updatedAt ||
      ""
  );

const floatingBottom =
    (Platform.OS === "web" ? 82 : 98) + Math.max(0, insets.bottom - 4);

  return (
    <>
      {!visible ? (
        <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="전체 메뉴 열기"
            onPress={openMenu}
            style={({ pressed }) => [
              styles.floatingButton,
              { bottom: floatingBottom },
              pressed && styles.floatingButtonPressed,
            ]}
          >
            <Ionicons name="menu-outline" size={22} color="#5A3B29" />
            <Text style={styles.floatingButtonText}>전체 메뉴</Text>
          </Pressable>
        </View>
      ) : null}

      <Modal
        visible={visible}
        transparent
        animationType="none"
        statusBarTranslucent
        navigationBarTranslucent
        onRequestClose={() => closeMenu()}
      >
        <View style={styles.modalRoot}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="전체 메뉴 닫기"
            style={styles.backdrop}
            onPress={() => closeMenu()}
          />

          <Animated.View
            style={[
              styles.drawer,
              {
                width: drawerWidth,
                paddingTop: Math.max(insets.top, 12),
                paddingBottom: Math.max(insets.bottom, 14),
                transform: [{ translateX: slideX }],
              },
            ]}
          >
            <View style={styles.headerRow}>
              {activeSection ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="전체 메뉴 목록으로 돌아가기"
                  hitSlop={8}
                  onPress={() => setActiveSectionKey(null)}
                  style={styles.headerButton}
                >
                  <Ionicons name="chevron-back" size={25} color="#3E2E25" />
                </Pressable>
              ) : (
                <View style={styles.headerButtonPlaceholder} />
              )}

              <Text style={styles.headerTitle} numberOfLines={1}>
                {activeSection?.label || "전체 메뉴"}
              </Text>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="전체 메뉴 닫기"
                hitSlop={8}
                onPress={() => closeMenu()}
                style={styles.headerButton}
              >
                <Ionicons name="close" size={26} color="#3E2E25" />
              </Pressable>
            </View>

            {!activeSection ? (
              <View style={styles.profileBox}>
                <View style={styles.profileIcon}>
  {profileImageSource ? (
    <Image
      source={profileImageSource}
      style={styles.profileImage}
      resizeMode="cover"
    />
  ) : (
    <Ionicons
      name="person"
      size={22}
      color="#7B5944"
    />
  )}
</View>
                <View style={styles.profileTextWrap}>
                  <Text style={styles.profileName} numberOfLines={1}>
                    {displayName}님
                  </Text>
                  <Text style={styles.profileRank}>{rankLabel}</Text>
                </View>
                {permissionLoading ? (
                  <Ionicons name="sync" size={17} color="#9A8477" />
                ) : null}
              </View>
            ) : null}

            <ScrollView
              style={styles.menuScroll}
              contentContainerStyle={styles.menuContent}
              showsVerticalScrollIndicator={false}
            >
              {!activeSection
                ? sections.map((section) => (
                    <Pressable
                      key={section.key}
                      accessibilityRole="button"
                      onPress={() => setActiveSectionKey(section.key)}
                      style={({ pressed }) => [
                        styles.sectionRow,
                        pressed && styles.rowPressed,
                      ]}
                    >
                      <Ionicons
                        name={section.icon}
                        size={22}
                        color="#7B5944"
                        style={styles.sectionIcon}
                      />
                      <Text style={styles.sectionLabel}>{section.label}</Text>
                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color="#9B8578"
                      />
                    </Pressable>
                  ))
                : activeSection.items.map((item) => (
                    <Pressable
                      key={item.key}
                      accessibilityRole="button"
                      accessibilityState={{ disabled: item.locked }}
                      onPress={() => handleItemPress(item)}
                      style={({ pressed }) => [
                        styles.itemRow,
                        item.locked && styles.itemRowLocked,
                        pressed && !item.locked && styles.rowPressed,
                      ]}
                    >
                      <Text
                        style={[
                          styles.itemLabel,
                          item.locked && styles.itemLabelLocked,
                        ]}
                      >
                        {item.label}
                      </Text>

                      {item.locked ? (
                        <Ionicons
                          name="lock-closed"
                          size={16}
                          color="#9A8477"
                        />
                      ) : (
                        <Ionicons
                          name="chevron-forward"
                          size={18}
                          color="#B19A8B"
                        />
                      )}
                    </Pressable>
                  ))}

              {!activeSection ? (
                <>
                  <View style={styles.divider} />
                  <Pressable
                    accessibilityRole="button"
                    onPress={() =>
                      closeMenu(() => router.push("/member-notifications"))
                    }
                    style={({ pressed }) => [
                      styles.utilityRow,
                      pressed && styles.rowPressed,
                    ]}
                  >
                    <Ionicons
                      name="notifications-outline"
                      size={21}
                      color="#7B5944"
                    />
                    <Text style={styles.utilityLabel}>알림센터</Text>
                  </Pressable>

                  <Pressable
                    accessibilityRole="button"
                    onPress={handleLogout}
                    style={({ pressed }) => [
                      styles.utilityRow,
                      pressed && styles.rowPressed,
                    ]}
                  >
                    <Ionicons
                      name="log-out-outline"
                      size={21}
                      color="#8B5D4D"
                    />
                    <Text style={[styles.utilityLabel, styles.logoutLabel]}>
                      로그아웃
                    </Text>
                  </Pressable>
                </>
              ) : null}
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "rgba(42, 31, 25, 0.34)",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  drawer: {
    height: "100%",
    backgroundColor: "#FFFDF8",
    borderRightWidth: 1,
    borderRightColor: "#E8DED4",
    shadowColor: "#2C211B",
    shadowOffset: { width: 5, height: 0 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 18,
    zIndex: 2,
  },
  floatingButton: {
    position: "absolute",
    left: 14,
    minWidth: 122,
    height: 46,
    paddingHorizontal: 15,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: "#D7C6B8",
    backgroundColor: "#FFFDF8",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    shadowColor: "#4B372B",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.16,
    shadowRadius: 7,
    elevation: 8,
    zIndex: 999,
  },
  floatingButtonPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }],
  },
  floatingButtonText: {
    fontSize: 16,
    lineHeight: 21,
    fontFamily: "PretendardBold",
    color: "#5A3B29",
  },
  headerRow: {
    minHeight: 58,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#EEE5DC",
  },
  headerButton: {
    width: 38,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  headerButtonPlaceholder: {
    width: 38,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 20,
    lineHeight: 26,
    fontFamily: "PretendardBold",
    color: "#352820",
  },
  profileBox: {
    marginHorizontal: 13,
    marginTop: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: "#F7F0E8",
    flexDirection: "row",
    alignItems: "center",
  },
profileIcon: {
  width: 38,
  height: 38,
  borderRadius: 19,
  backgroundColor: "#EADFD3",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
},
  profileImage: {
  width: "100%",
  height: "100%",
},
  profileTextWrap: {
    flex: 1,
    marginLeft: 10,
  },
  profileName: {
    fontSize: 17,
    lineHeight: 22,
    fontFamily: "PretendardBold",
    color: "#3F3027",
  },
  profileRank: {
    marginTop: 2,
    fontSize: 14,
    lineHeight: 19,
    fontFamily: "PretendardMedium",
    color: "#806C60",
  },
  menuScroll: {
    flex: 1,
  },
  menuContent: {
    paddingHorizontal: 10,
    paddingTop: 12,
    paddingBottom: 24,
  },
  sectionRow: {
    minHeight: 56,
    paddingHorizontal: 10,
    borderRadius: 13,
    flexDirection: "row",
    alignItems: "center",
  },
  sectionIcon: {
    width: 30,
  },
  sectionLabel: {
    flex: 1,
    fontSize: 18,
    lineHeight: 24,
    fontFamily: "PretendardBold",
    color: "#3A2C24",
  },
  itemRow: {
    minHeight: 56,
    paddingHorizontal: 9,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F0E8E0",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  itemRowLocked: {
    backgroundColor: "#FBF8F4",
  },
  itemLabel: {
    flex: 1,
    fontSize: 17,
    lineHeight: 24,
    fontFamily: "PretendardSemiBold",
    color: "#43342B",
  },
  itemLabelLocked: {
    color: "#8E7C70",
  },
  rowPressed: {
    backgroundColor: "#F2E9E0",
  },
  divider: {
    height: 1,
    backgroundColor: "#E6DCD2",
    marginVertical: 12,
    marginHorizontal: 5,
  },
  utilityRow: {
    minHeight: 52,
    paddingHorizontal: 10,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  utilityLabel: {
    flex: 1,
    fontSize: 16.5,
    lineHeight: 23,
    fontFamily: "PretendardSemiBold",
    color: "#4B3A30",
  },
  logoutLabel: {
    color: "#8B5D4D",
  },
});
