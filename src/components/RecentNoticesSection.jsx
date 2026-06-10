import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { colors, radius, shadow } from "../theme";
import { useAuth } from "../contexts/AuthContext";
import { getMemberNoticeList } from "../api/memberNotice";

const PAGE_SIZE = 5;
const fonts = {
  regular: "PretendardRegular",
  medium: "PretendardMedium",
  semiBold: "PretendardSemiBold",
  bold: "PretendardBold",
  title: "MaruBuriBold",
  titleSemi: "MaruBuriSemiBold",
};
function formatDate(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");

  return `${y}.${m}.${d}`;
}

function openNotice(id) {
  router.push({
    pathname: "/notice/[noticeId]",
    params: { noticeId: String(id) },
  });
}

export default function RecentNoticesSection() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [notices, setNotices] = useState([]);
  const [page, setPage] = useState(1);

  const mainNotice = notices.find(
  (notice) =>
    notice.isImportant === true ||
    notice.isImportant === "true" ||
    notice.isImportant === 1
);

  const totalPages = Math.max(1, Math.ceil(notices.length / PAGE_SIZE));

  const pagedNotices = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    
    return notices.slice(start, start + PAGE_SIZE);
  }, [notices, page]);

  const loadNotices = useCallback(async () => {
  if (!token) return;

  try {
    setLoading(true);

    const result = await getMemberNoticeList(token);

    console.log("🔥 notices =", JSON.stringify(result, null, 2));

    setNotices(Array.isArray(result) ? result : []);
    setPage(1);
  } catch (error) {
    console.log("공지 조회 실패:", error?.message);
    setNotices([]);
  } finally {
    setLoading(false);
  }
}, [token]);

  useEffect(() => {
    loadNotices();
  }, [loadNotices]);

  if (loading) {
    return (
      <View style={styles.noticeCard}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="small" />
          <Text style={styles.loadingText}>공지 불러오는 중...</Text>
        </View>
      </View>
    );
  }


  return (
  <View>
    {mainNotice ? (
      <Pressable
        style={styles.mainCard}
        onPress={() => openNotice(mainNotice.id)}
      >
        <View style={styles.popupBadge}>
          <Text style={styles.popupBadgeText}>중요</Text>
        </View>

        <Text style={styles.mainTitle} numberOfLines={1}>
          {mainNotice.title}
        </Text>

        <Text style={styles.mainContent} numberOfLines={2}>
          {mainNotice.content}
        </Text>

        <Text style={styles.mainDate}>
          {formatDate(mainNotice.publishedAt)}
        </Text>
      </Pressable>
    ) : (
      <View style={styles.mainCard}>
        <Text style={styles.mainTitle}>중요 공지가 없습니다</Text>
        <Text style={styles.mainContent}>
          현재 꼭 확인해야 할 중요 공지는 없습니다.
        </Text>
      </View>
    )}

      <View style={styles.noticeCard}>
        <View style={styles.noticeHeader}>
          <Text style={styles.noticeHeaderTitle}>전체 공지</Text>
          <Text style={styles.noticeCount}>공지 {notices.length}개</Text>
        </View>

        <View style={styles.headerDivider} />

        {pagedNotices.map((item, index) => (
          <Pressable
            key={item.id}
            style={[
              styles.noticeRow,
              index !== pagedNotices.length - 1 && styles.noticeRowBorder,
            ]}
            onPress={() => openNotice(item.id)}
          >
            <Text style={styles.noticeTitle} numberOfLines={1}>
              {item.title}
            </Text>

            <View style={styles.noticeRight}>
              <Text style={styles.noticeDate}>
                {formatDate(item.publishedAt)}
              </Text>
              <Text style={styles.arrow}>›</Text>
            </View>
          </Pressable>
        ))}

        {totalPages > 1 ? (
          <View style={styles.pagination}>
            <Pressable
              style={styles.pageArrowButton}
              onPress={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1}
            >
              <Text
                style={[
                  styles.pageArrow,
                  page === 1 && styles.pageArrowDisabled,
                ]}
              >
                ‹
              </Text>
            </Pressable>

            {Array.from({ length: totalPages }).map((_, index) => {
              const pageNumber = index + 1;
              const selected = pageNumber === page;

              return (
                <Pressable
                  key={pageNumber}
                  style={[styles.pageButton, selected && styles.pageActive]}
                  onPress={() => setPage(pageNumber)}
                >
                  <Text
                    style={[
                      styles.pageText,
                      selected && styles.pageTextActive,
                    ]}
                  >
                    {pageNumber}
                  </Text>
                </Pressable>
              );
            })}

            <Pressable
              style={styles.pageArrowButton}
              onPress={() =>
                setPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={page === totalPages}
            >
              <Text
                style={[
                  styles.pageArrow,
                  page === totalPages && styles.pageArrowDisabled,
                ]}
              >
                ›
              </Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainCard: {
  position: "relative",
  backgroundColor: colors.card,
  borderRadius: radius.lg,
  paddingHorizontal: 18,
  paddingTop: 16,
  paddingBottom: 14,
  borderWidth: 1,
  borderColor: colors.border,
  marginBottom: 14,
  minHeight: 118,
  ...shadow.card,
},

popupBadge: {
  position: "absolute",
  top: 16,
  right: 16,
  paddingHorizontal: 13,
  paddingVertical: 7,
  borderRadius: 999,
  backgroundColor: colors.blushBeige,
},

popupBadgeText: {
  fontSize: 12,
  fontFamily: fonts.bold,
  color: colors.warmBrown,
},

  mainTitle: {
  paddingRight: 76,
  fontSize: 18,
  fontFamily: fonts.bold,
  color: colors.textMain,
  lineHeight: 25,
  marginBottom: 6,
},

mainContent: {
  fontSize: 14,
  fontFamily: fonts.medium,
  lineHeight: 21,
  color: colors.textSub,
  marginBottom: 8,
},

mainDate: {
  fontSize: 13,
  fontFamily: fonts.medium,
  color: colors.textMuted,
  letterSpacing: 0.3,
},

  noticeCard: {
  backgroundColor: colors.card,
  borderRadius: radius.lg,
  paddingHorizontal: 18,
  paddingTop: 16,
  paddingBottom: 10,
  borderWidth: 1,
  borderColor: colors.border,
  ...shadow.card,
},

  noticeHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  noticeHeaderTitle: {
  fontSize: 22,
  fontFamily: fonts.titleSemi,
  color: colors.textMain,
},

  noticeCount: {
  fontSize: 14,
  fontFamily: fonts.semiBold,
  color: colors.textSub,
},

  headerDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginTop: 16,
    marginBottom: 8,
  },

  noticeRow: {
  minHeight: 50,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
},
  noticeRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  noticeTitle: {
  flex: 1,
  fontSize: 15,
  fontFamily: fonts.semiBold,
  color: colors.textMain,
},

  noticeRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

noticeDate: {
  fontSize: 11,
  fontFamily: fonts.medium,
  color: colors.textMuted,
},

  arrow: {
    fontSize: 10,
    color: colors.softBrown,
    marginTop: -2,
  },

  pagination: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 14,
  },

  pageArrowButton: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },

  pageArrow: {
    fontSize: 30,
    color: colors.warmBrown,
  },

  pageArrowDisabled: {
    color: "#d1c5bb",
  },

  pageButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  pageActive: {
    backgroundColor: colors.warmBrown,
  },

  pageText: {
  fontSize: 16,
  fontFamily: fonts.bold,
  color: colors.textSub,
},

  pageTextActive: {
    color: colors.white,
  },

  loadingWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
  },

  loadingText: {
  fontSize: 13,
  fontFamily: fonts.medium,
  color: colors.textSub,
},

emptyText: {
  fontSize: 14,
  fontFamily: fonts.medium,
  color: colors.textSub,
  lineHeight: 21,
},
  });