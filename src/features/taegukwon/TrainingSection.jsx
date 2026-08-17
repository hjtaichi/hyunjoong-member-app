import React from "react";
import { Alert, Image, Text, TouchableOpacity, View } from "react-native";
import { Modal, ScrollView } from "react-native";
import { router } from "expo-router";

// HJTAICHI_TRAINING_TIP_HISTORY_V1
const TIP_HISTORY_PAGE_SIZE = 5;

function formatTrainingTipDate(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}.${month}.${day}`;
}

const tipHistoryStyles = {
  historyButton: {
    alignSelf: "flex-end",
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  historyButtonText: {
    fontSize: 12,
    lineHeight: 18,
    color: "#8A7052",
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(24, 19, 14, 0.38)",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 28,
  },
  modalCard: {
    width: "100%",
    maxWidth: 520,
    maxHeight: "82%",
    alignSelf: "center",
    borderRadius: 20,
    backgroundColor: "#FFFCF8",
    borderWidth: 1,
    borderColor: "#E8D8BE",
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.14,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "800",
    color: "#3E342B",
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F4EBDD",
  },
  closeButtonText: {
    fontSize: 22,
    lineHeight: 24,
    color: "#6E5B49",
    fontWeight: "500",
  },
  scroll: {
    width: "100%",
  },
  scrollContent: {
    paddingBottom: 4,
  },
  item: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EFE4D4",
  },
  itemLast: {
    borderBottomWidth: 0,
  },
  // HJTAICHI_TRAINING_TIP_DATE_RIGHT_V1
  itemTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  itemDate: {
    flexShrink: 0,
    minWidth: 78,
    paddingTop: 2,
    fontSize: 12,
    lineHeight: 17,
    color: "#9A8772",
    fontWeight: "700",
    textAlign: "right",
  },
  itemText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 23,
    color: "#40362D",
  },
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 14,
  },
  pageButton: {
    minWidth: 32,
    height: 32,
    paddingHorizontal: 7,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E4D5C1",
    backgroundColor: "#FFFDFC",
  },
  pageButtonActive: {
    backgroundColor: "#8A7052",
    borderColor: "#8A7052",
  },
  pageButtonDisabled: {
    opacity: 0.34,
  },
  pageButtonText: {
    fontSize: 13,
    color: "#6C5946",
    fontWeight: "700",
  },
  pageButtonTextActive: {
    color: "#FFFFFF",
  },
};
export default function TrainingSection({
  styles,
  personalProgress,
  personalProgressPercent,
  isYudanjaMember,
  hasPrivateLessonMenu,
  privateLessonMenuTitle,
  privateLessonMenuDesc,
}) {
  const [tipHistoryVisible, setTipHistoryVisible] = React.useState(false);
  const [tipHistoryPage, setTipHistoryPage] = React.useState(1);

  const tipHistory = Array.isArray(personalProgress?.recentAdminMemos)
    ? personalProgress.recentAdminMemos
    : [];

  const tipHistoryPageCount = Math.max(
    1,
    Math.ceil(tipHistory.length / TIP_HISTORY_PAGE_SIZE)
  );

  const safeTipHistoryPage = Math.min(
    Math.max(tipHistoryPage, 1),
    tipHistoryPageCount
  );

  const tipHistoryPageItems = tipHistory.slice(
    (safeTipHistoryPage - 1) * TIP_HISTORY_PAGE_SIZE,
    safeTipHistoryPage * TIP_HISTORY_PAGE_SIZE
  );

  const tipHistoryPageWindowStart =
    tipHistoryPageCount <= 5
      ? 1
      : Math.min(
          Math.max(safeTipHistoryPage - 2, 1),
          tipHistoryPageCount - 4
        );

  const tipHistoryPageNumbers = Array.from(
    { length: Math.min(5, tipHistoryPageCount) },
    (_, index) => tipHistoryPageWindowStart + index
  );
  const trainingTipExcluded =
    personalProgress?.trainingTipExcluded === true;

  return (
    <View style={styles.trainingSection}>
      <Text style={styles.sectionLabel}>현재 수련</Text>

      <View style={[styles.coachingInlineBox, trainingTipExcluded && { display: "none" }]}>
        <Image
          source={require("../../../assets/images/training-tip-title.png")}
          style={styles.coachingTipTitleImage}
          resizeMode="contain"
        />

        <Text style={styles.coachingInlineText}>
          {personalProgress?.recentAdminMemos?.[0]?.content ||
            "아직 등록된 수련 Tip이 없습니다."}
        </Text>
        {tipHistory.length > 1 ? (
          <TouchableOpacity
            style={[
              tipHistoryStyles.historyButton,
              trainingTipExcluded && { display: "none" },
            ]}
            disabled={trainingTipExcluded}
            activeOpacity={0.82}
            onPress={() => {
              setTipHistoryPage(1);
              setTipHistoryVisible(true);
            }}
            accessibilityRole="button"
            accessibilityLabel="지난 수련 Tip 보기"
          >
            <Text style={tipHistoryStyles.historyButtonText}>
              지난 수련 Tip 보기 〉
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={[styles.card, styles.trainingCard]}>
        <View style={styles.cardTopActionRow}>
          <TouchableOpacity
            style={styles.detailButton}
            activeOpacity={0.85}
            onPress={() => {
              if (!personalProgress?.curriculumId) {
                Alert.alert("안내", "아직 등록된 개인 진도 정보가 없습니다.");
                return;
              }

              router.push({
                pathname: "/taegukwon/[curriculumId]",
                params: {
                  curriculumId: personalProgress.curriculumId,
                  name: personalProgress.curriculumName || "수련 과정",
                  currentStep: String(personalProgress.currentStep || 0),
                  totalSteps: String(personalProgress.totalSteps || 0),
                  source: "personal",
                },
              });
            }}
          >
            <Text style={styles.detailTextButton}>자세히 보기 </Text>
          </TouchableOpacity>
        </View>

        {personalProgress ? (
          <View style={styles.trainingHeroRow}>
            <View style={styles.trainingHeroLeft}>
              <Text style={styles.personalName}>
                {personalProgress.curriculumName || "등록된 투로 없음"}
              </Text>

              <Text style={styles.bigProgressText}>
                {personalProgress.currentStep || 0} /{" "}
                {personalProgress.totalSteps || 0}식
              </Text>

              <View style={styles.progressSection}>
                <Text style={styles.progressLabel}>진행률</Text>

                <View style={styles.progressBarRow}>
                  <View style={styles.progressTrackInline}>
                    <View
                      style={[
                        styles.progressFillPersonal,
                        { width: `${personalProgressPercent}%` },
                      ]}
                    />
                  </View>

                  <Text style={styles.progressPercentInline}>
                    {personalProgressPercent}%
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.trainingSilhouetteWrap}>
              <Image
                source={require("../../../assets/images/taichi-silhouette2.png")}
                style={styles.trainingSilhouette}
                resizeMode="contain"
              />
            </View>
          </View>
        ) : (
          <>
            <Text style={styles.cardText}>
              아직 등록된 개인 진도 정보가 없습니다.
            </Text>
            <Text style={styles.cardText}>
              개인 진도가 입력되면 여기에 표시됩니다.
            </Text>
          </>
        )}
      </View>

      <View style={[styles.card, styles.menuCard]}>
        <TouchableOpacity
          style={styles.menuRow}
          activeOpacity={0.85}
          onPress={() => router.push("/training-journey")}
        >
          <Image
            source={require("../../../assets/images/menu-curriculum.png")}
            style={styles.menuIcon}
            resizeMode="contain"
          />

          <View style={styles.menuTextWrap}>
            <Text style={styles.menuTitle}>수련 과정</Text>
            <Text style={styles.menuDesc}>커리큘럼 보기</Text>
          </View>

          <Text style={styles.menuArrow}>〉</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuRow}
          activeOpacity={0.85}
          onPress={() => router.push("/coaching-videos")}
        >
          <Image
            source={require("../../../assets/images/menu-video.png")}
            style={styles.menuIcon}
            resizeMode="contain"
          />

          <View style={styles.menuTextWrap}>
            <Text style={styles.menuTitle}>내 수련 영상 올리기</Text>
            <Text style={styles.menuDesc}>실전 코칭</Text>
          </View>

          <Text style={styles.menuArrow}>〉</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuRow}
          activeOpacity={0.85}
          onPress={() => router.push("/movement-dictionary")}
        >
          <Image
            source={require("../../../assets/images/menu-dictionary.png")}
            style={styles.menuIcon}
            resizeMode="contain"
          />

          <View style={styles.menuTextWrap}>
            <Text style={styles.menuTitle}>투로명이 궁금해요</Text>
            <Text style={styles.menuDesc}>동작 설명 및 포인트</Text>
          </View>

          <Text style={styles.menuArrow}>〉</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuRow, !isYudanjaMember && styles.menuRowLocked]}
          activeOpacity={0.85}
          onPress={() => {
            if (!isYudanjaMember) {
              Alert.alert("안내", "유단자 전용 콘텐츠입니다.");
              return;
            }

            router.push("/yudanja");
          }}
        >
          <Image
            source={require("../../../assets/images/menu-yudanja.png")}
            style={[styles.menuIcon, styles.menuYudanjaIcon]}
            resizeMode="contain"
          />

          <View style={styles.menuTextWrap}>
            <Text style={styles.menuTitle}>유단자 전용</Text>
            <Text style={styles.menuDesc}>유단자 전용 콘텐츠</Text>
          </View>

          {isYudanjaMember ? (
            <Text style={styles.menuArrow}>〉</Text>
          ) : (
            <Image
              source={require("../../../assets/images/menu-lock.png")}
              style={styles.menuLockIcon}
              resizeMode="contain"
            />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.menuRow,
            styles.menuRowLast,
            !hasPrivateLessonMenu && styles.menuRowLocked,
          ]}
          activeOpacity={0.85}
          onPress={() => {
            if (!hasPrivateLessonMenu) return;
            router.push("/private-lessons");
          }}
        >
          <Image
            source={require("../../../assets/images/menu-private-training.png")}
            style={styles.menuIcon}
            resizeMode="contain"
          />

          <View style={styles.menuTextWrap}>
            <Text style={styles.menuTitle}>{privateLessonMenuTitle}</Text>
            <Text style={styles.menuDesc}>
              {hasPrivateLessonMenu
                ? privateLessonMenuDesc
                : "개인지도 이용 회원 전용"}
            </Text>
          </View>

          {hasPrivateLessonMenu ? (
            <Text style={styles.menuArrow}>〉</Text>
          ) : (
            <Image
              source={require("../../../assets/images/menu-lock.png")}
              style={styles.menuLockIcon}
              resizeMode="contain"
            />
          )}
        </TouchableOpacity>

      </View>

      <TouchableOpacity
        style={styles.privateGuideBanner}
        activeOpacity={0.88}
        onPress={() => router.push("/private-training-guide")}
      >
        <View>
          <Text style={styles.privateGuideBannerTitle}>개인지도 안내</Text>
          <Text style={styles.privateGuideBannerDesc}>
            1:1 자세교정과 심화 수련이 필요하다면 확인해보세요.
          </Text>
        </View>

        <Text style={styles.privateGuideBannerArrow}>〉</Text>
      </TouchableOpacity>

      <Modal
        visible={tipHistoryVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setTipHistoryVisible(false)}
      >
        <View style={tipHistoryStyles.modalOverlay}>
          <View style={tipHistoryStyles.modalCard}>
            <View style={tipHistoryStyles.modalHeader}>
              <Text style={tipHistoryStyles.modalTitle}>수련 Tip 기록</Text>

              <TouchableOpacity
                style={tipHistoryStyles.closeButton}
                activeOpacity={0.82}
                onPress={() => setTipHistoryVisible(false)}
                accessibilityRole="button"
                accessibilityLabel="수련 Tip 기록 닫기"
              >
                <Text style={tipHistoryStyles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={tipHistoryStyles.scroll}
              contentContainerStyle={tipHistoryStyles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {tipHistoryPageItems.map((memo, index) => (
                <View
                  key={memo.id || `${memo.createdAt || "tip"}-${index}`}
                  style={[
                    tipHistoryStyles.item,
                    index === tipHistoryPageItems.length - 1
                      ? tipHistoryStyles.itemLast
                      : null,
                  ]}
                >
                  <View style={tipHistoryStyles.itemTopRow}>
                    <Text style={tipHistoryStyles.itemText}>
                      {memo.content}
                    </Text>

                    <Text style={tipHistoryStyles.itemDate}>
                      {formatTrainingTipDate(
                        memo.createdAt || memo.created_at
                      )}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>

            {tipHistoryPageCount > 1 ? (
              <View style={tipHistoryStyles.pagination}>
                <TouchableOpacity
                  style={[
                    tipHistoryStyles.pageButton,
                    safeTipHistoryPage <= 1
                      ? tipHistoryStyles.pageButtonDisabled
                      : null,
                  ]}
                  disabled={safeTipHistoryPage <= 1}
                  activeOpacity={0.82}
                  onPress={() =>
                    setTipHistoryPage((page) => Math.max(1, page - 1))
                  }
                  accessibilityRole="button"
                  accessibilityLabel="이전 수련 Tip 페이지"
                >
                  <Text style={tipHistoryStyles.pageButtonText}>‹</Text>
                </TouchableOpacity>

                {tipHistoryPageNumbers.map((page) => {
                  const isActive = page === safeTipHistoryPage;

                  return (
                    <TouchableOpacity
                      key={page}
                      style={[
                        tipHistoryStyles.pageButton,
                        isActive ? tipHistoryStyles.pageButtonActive : null,
                      ]}
                      activeOpacity={0.82}
                      onPress={() => setTipHistoryPage(page)}
                      accessibilityRole="button"
                      accessibilityLabel={`수련 Tip ${page}페이지`}
                      accessibilityState={{ selected: isActive }}
                    >
                      <Text
                        style={[
                          tipHistoryStyles.pageButtonText,
                          isActive
                            ? tipHistoryStyles.pageButtonTextActive
                            : null,
                        ]}
                      >
                        {page}
                      </Text>
                    </TouchableOpacity>
                  );
                })}

                <TouchableOpacity
                  style={[
                    tipHistoryStyles.pageButton,
                    safeTipHistoryPage >= tipHistoryPageCount
                      ? tipHistoryStyles.pageButtonDisabled
                      : null,
                  ]}
                  disabled={safeTipHistoryPage >= tipHistoryPageCount}
                  activeOpacity={0.82}
                  onPress={() =>
                    setTipHistoryPage((page) =>
                      Math.min(tipHistoryPageCount, page + 1)
                    )
                  }
                  accessibilityRole="button"
                  accessibilityLabel="다음 수련 Tip 페이지"
                >
                  <Text style={tipHistoryStyles.pageButtonText}>›</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        </View>
      </Modal>    </View>
  );
}